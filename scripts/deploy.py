#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GitHub deployment script for site-wide shared files and optional date-specific post assets."""

from __future__ import annotations

import argparse
import base64
import json
import os
from pathlib import Path

import requests

OWNER = "xinyanghuang7"
REPO = "xinyanghuang7.github.io"
BASE_DIR = Path(__file__).resolve().parent.parent

SHARED_FILES = [
    "index.html",
    "css/style.css",
    "js/main.js",
    "js/posts-data.js",
    "sitemap.xml",
    "favicon.svg",
    "robots.txt",
    "CNAME",
    "images/hero-bg.jpg",
    "images/hero-pattern.svg",
    "images/value-investing.jpg",
    "images/tech-analysis.jpg",
]


def get_headers(token: str) -> dict[str, str]:
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
    }


def push_file(headers: dict[str, str], remote_path: str, local_path: Path) -> tuple[bool, str]:
    sha = None
    lookup = requests.get(
        f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{remote_path}",
        headers=headers,
        timeout=30,
    )
    if lookup.status_code == 200:
        sha = lookup.json().get("sha")
    elif lookup.status_code != 404:
        lookup.raise_for_status()

    with open(local_path, "rb") as handle:
        content_b64 = base64.b64encode(handle.read()).decode("utf-8")

    body = {
        "message": f"feat: update {remote_path}",
        "content": content_b64,
    }
    if sha:
        body["sha"] = sha

    resp = requests.put(
        f"https://api.github.com/repos/{OWNER}/{REPO}/contents/{remote_path}",
        headers=headers,
        data=json.dumps(body),
        timeout=60,
    )
    resp.raise_for_status()
    result = resp.json()
    return True, result["content"]["sha"][:7]


def collect_files(date: str | None, extra_paths: list[str] | None = None) -> list[tuple[str, Path]]:
    files: list[tuple[str, Path]] = []
    seen: set[str] = set()

    def add(rel: str) -> None:
        if rel in seen:
            return
        path = BASE_DIR / rel
        if path.exists():
            files.append((rel, path))
            seen.add(rel)

    for rel in SHARED_FILES:
        add(rel)

    if date:
        year, month, day = date.split("-")
        for rel in [
            f"posts/{year}/{month}/{day}.html",
            f"images/posts/{date}-value.jpg",
            f"images/posts/{date}-tech.jpg",
        ]:
            add(rel)

    for rel in extra_paths or []:
        add(rel)

    return files


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--date", default=None, help="博客日期，格式 YYYY-MM-DD；提供后会额外推送当日文章与配图")
    parser.add_argument("--path", action="append", dest="paths", default=[], help="额外推送的仓库相对路径，可重复使用")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("错误: 未设置 GITHUB_TOKEN 环境变量")
        print("请设置: export GITHUB_TOKEN='your_token' 或 $env:GITHUB_TOKEN='your_token'")
        return 1

    headers = get_headers(token)
    files = collect_files(args.date, args.paths)
    if not files:
        print("错误: 没有找到可部署的文件")
        return 1

    print("开始部署站点文件...")
    print(f"仓库: {OWNER}/{REPO}")
    if args.date:
        print(f"日期上下文: {args.date}")

    success = 0
    failed = 0

    for remote_path, local_path in files:
        print(f"推送: {remote_path} ...", end=" ")
        try:
            _, sha_short = push_file(headers, remote_path, local_path)
            print(f"OK (SHA: {sha_short})")
            success += 1
        except requests.RequestException as exc:
            print("FAIL")
            print(f"  错误: {exc}")
            failed += 1

    print()
    print("部署完成")
    print(f"  成功: {success}")
    print(f"  失败: {failed}")
    print()
    print("线上地址:")
    print("  https://4fire.qzz.io/")
    if args.date:
        year, month, day = args.date.split("-")
        print(f"  https://4fire.qzz.io/posts/{year}/{month}/{day}.html")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
