#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成博客配图（优先使用 ModelScope API；失败时自动回退到本地保底图）
"""

from __future__ import annotations

import os
import shutil
import time
from datetime import datetime
from pathlib import Path

import requests
from PIL import Image, ImageOps

BASE_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = BASE_DIR / "images"
POST_IMAGES_DIR = IMAGES_DIR / "posts"
DEFAULT_FALLBACKS = {
    "value": IMAGES_DIR / "value-investing.jpg",
    "tech": IMAGES_DIR / "tech-analysis.jpg",
}

PROMPTS = {
    "value": (
        "Professional financial investment concept, vintage leather ledger with gold pen, "
        "golden calculator, warm golden hour lighting, dark wood desk, "
        "luxury gold and deep navy blue color scheme, editorial magazine photography style"
    ),
    "tech": (
        "Modern AI tech infrastructure visualization, holographic data charts floating in dark space, "
        "glowing blue energy flows merging with power grid, futuristic neon accents, "
        "high-tech financial data center atmosphere, dark navy background with golden particles"
    ),
}


class ModelScopeAuthError(RuntimeError):
    """Raised when MODELSCOPE_TOKEN is missing or invalid."""


class ModelScopeRequestError(RuntimeError):
    """Raised when ModelScope API returns an unexpected response."""


def ensure_images_dir() -> None:
    POST_IMAGES_DIR.mkdir(parents=True, exist_ok=True)


def get_output_path(date_str: str, kind: str) -> Path:
    return POST_IMAGES_DIR / f"{date_str}-{kind}.jpg"


def get_modelscope_token() -> str:
    token = (os.environ.get("MODELSCOPE_TOKEN") or "").strip()
    if not token:
        raise ModelScopeAuthError("未设置 MODELSCOPE_TOKEN 环境变量")
    return token


def submit_generation_task(prompt: str, model: str, token: str) -> str:
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "X-ModelScope-Async-Mode": "true",
    }
    body = {"model": model, "prompt": prompt}

    resp = requests.post(
        "https://api-inference.modelscope.cn/v1/images/generations",
        headers=headers,
        json=body,
        timeout=30,
    )

    if resp.status_code == 401:
        raise ModelScopeAuthError("MODELSCOPE_TOKEN 无效、过期，或当前账户无权调用该接口")

    try:
        resp.raise_for_status()
    except requests.HTTPError as exc:
        raise ModelScopeRequestError(f"提交任务失败: {exc}; body={resp.text[:400]}") from exc

    payload = resp.json()
    task_id = payload.get("task_id")
    if not task_id:
        raise ModelScopeRequestError(f"提交任务成功但未返回 task_id: {payload}")
    return str(task_id)


def poll_generation_result(task_id: str, token: str, output_file: Path) -> bool:
    headers = {
        "Authorization": f"Bearer {token}",
        "X-ModelScope-Task-Type": "image_generation",
    }

    for i in range(1, 31):
        time.sleep(5)
        resp = requests.get(
            f"https://api-inference.modelscope.cn/v1/tasks/{task_id}",
            headers=headers,
            timeout=10,
        )

        if resp.status_code == 401:
            raise ModelScopeAuthError("轮询任务时鉴权失败：MODELSCOPE_TOKEN 已失效或权限不足")

        try:
            resp.raise_for_status()
        except requests.HTTPError as exc:
            raise ModelScopeRequestError(f"轮询任务失败: {exc}; body={resp.text[:400]}") from exc

        payload = resp.json()
        status = payload.get("task_status")
        print(f"  轮询 {i}/30: 状态={status}", end="\r")

        if status == "SUCCEED":
            output_images = payload.get("output_images") or []
            if not output_images:
                raise ModelScopeRequestError(f"任务成功但未返回 output_images: {payload}")

            image_url = output_images[0]
            img_resp = requests.get(image_url, timeout=30)
            img_resp.raise_for_status()
            output_file.write_bytes(img_resp.content)
            file_size = output_file.stat().st_size
            print(f"\n  [OK] 图片已保存: {output_file.name} ({file_size:,} bytes)")
            return True

        if status in {"FAILED", "CANCELED"}:
            print(f"\n  [FAIL] 任务失败: {status}")
            return False

    print("\n  [FAIL] 超时未完成")
    return False


def optimize_output_image(output_file: Path, max_width: int = 1200, quality: int = 82) -> None:
    """统一把输出图片规范成真实 JPEG，并尽量压缩到更适合网页分发的体积。"""
    with Image.open(output_file) as img:
        img = ImageOps.exif_transpose(img)
        if img.width > max_width:
            ratio = max_width / float(img.width)
            resized_height = max(1, round(img.height * ratio))
            img = img.resize((max_width, resized_height), Image.Resampling.LANCZOS)

        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        elif img.mode == "L":
            img = img.convert("RGB")

        temp_path = output_file.with_suffix(output_file.suffix + ".tmp")
        img.save(temp_path, format="JPEG", quality=quality, optimize=True, progressive=True)
        temp_path.replace(output_file)


def generate_image(prompt: str, output_file: Path, model: str = "Qwen/Qwen-Image") -> bool:
    """调用 ModelScope API 生成单张图片。"""
    token = get_modelscope_token()

    print(f"生成图片: {output_file.name}")
    print(f"  Prompt: {prompt[:80]}...")
    task_id = submit_generation_task(prompt, model, token)
    print(f"  任务ID: {task_id}")
    ok = poll_generation_result(task_id, token, output_file)
    if ok:
        optimize_output_image(output_file)
    return ok


def copy_fallback_image(kind: str, output_file: Path) -> bool:
    fallback = DEFAULT_FALLBACKS.get(kind)
    if not fallback or not fallback.exists():
        print(f"  [FAIL] 回退失败: 未找到保底图 {fallback}")
        return False

    shutil.copyfile(fallback, output_file)
    optimize_output_image(output_file)
    file_size = output_file.stat().st_size
    print(f"  [FALLBACK] 已回退到保底图: {output_file.name} ({file_size:,} bytes)")
    return True


def generate_all_images(date: str, allow_fallback: bool = True) -> bool:
    """生成两张博客配图；若 API 不可用则自动回退到稳定保底图。"""
    ensure_images_dir()
    date_str = str(date)

    success = 0
    auth_blocked = False

    for kind, prompt in PROMPTS.items():
        output_file = get_output_path(date_str, kind)

        if output_file.exists():
            print(f"跳过已存在: {output_file.name}")
            success += 1
            continue

        try:
            if auth_blocked:
                raise ModelScopeAuthError("前一次请求已确认鉴权失效，直接使用保底图")
            if generate_image(prompt, output_file):
                success += 1
                continue
        except ModelScopeAuthError as exc:
            auth_blocked = True
            print(f"  ! 鉴权不可用: {exc}")
        except Exception as exc:
            print(f"  ! 生成失败: {exc}")

        if allow_fallback and copy_fallback_image(kind, output_file):
            success += 1
        else:
            print(f"失败: {output_file.name}")

    print(f"\n完成: {success}/{len(PROMPTS)} 张图片准备成功")
    return success == len(PROMPTS)


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=datetime.now().strftime("%Y-%m-%d"))
    parser.add_argument("--no-fallback", action="store_true", help="禁用保底图回退")
    args = parser.parse_args()

    ok = generate_all_images(args.date, allow_fallback=not args.no_fallback)
    raise SystemExit(0 if ok else 1)
