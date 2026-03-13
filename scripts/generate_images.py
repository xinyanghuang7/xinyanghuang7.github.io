#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
生成 AI 配图（使用 ModelScope API）
"""

import os
import base64
import requests
import time
from datetime import datetime
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
IMAGES_DIR = BASE_DIR / "images"

def ensure_images_dir():
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def generate_image(prompt, output_file, model="Qwen/Qwen-Image"):
    """调用 ModelScope API 生成图片"""
    
    token = os.environ.get('MODELSCOPE_TOKEN')
    if not token:
        print(f"错误: 未设置 MODELSCOPE_TOKEN 环境变量")
        print(f"请设置: export MODELSCOPE_TOKEN='your_token'")
        return False
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    print(f"生成图片: {output_file.name}")
    print(f"  Prompt: {prompt[:80]}...")
    
    # Step 1: 提交异步生成任务
    body = {
        "model": model,
        "prompt": prompt
    }
    
    try:
        resp = requests.post(
            "https://api-inference.modelscope.cn/v1/images/generations",
            headers=headers,
            json=body,
            timeout=30
        )
        resp.raise_for_status()
        task_id = resp.json()["task_id"]
        print(f"  任务ID: {task_id}")
    except Exception as e:
        print(f"  提交失败: {e}")
        return False
    
    # Step 2: 轮询等待结果（最多30次，每次5秒）
    poll_headers = {
        'Authorization': f'Bearer {token}',
        'X-ModelScope-Task-Type': 'image_generation'
    }
    
    for i in range(1, 31):
        time.sleep(5)
        try:
            resp = requests.get(
                f"https://api-inference.modelscope.cn/v1/tasks/{task_id}",
                headers=poll_headers,
                timeout=10
            )
            resp.raise_for_status()
            status = resp.json()["task_status"]
            print(f"  轮询 {i}/30: 状态={status}", end="\r")
            
            if status == "SUCCEED":
                image_url = resp.json()["output_images"][0]
                # 下载图片
                img_resp = requests.get(image_url, timeout=30)
                img_resp.raise_for_status()
                
                with open(output_file, 'wb') as f:
                    f.write(img_resp.content)
                
                file_size = output_file.stat().st_size
                print(f"\n  ✓ 图片已保存: {output_file.name} ({file_size:,} bytes)")
                return True
                
            elif status in ["FAILED", "CANCELED"]:
                print(f"\n  ✗ 任务失败: {status}")
                return False
                
        except Exception as e:
            print(f"\n  轮询错误: {e}")
            continue
    
    print("\n  ✗ 超时未完成")
    return False

def generate_all_images(date):
    """生成一对图片"""
    
    ensure_images_dir()
    
    date_str = str(date)
    
    prompts = {
        IMAGES_DIR / f"{date_str}-value.jpg": 
            "Professional financial investment concept, vintage leather ledger with gold pen, "
            "golden calculator, warm golden hour lighting, dark wood desk, "
            "luxury gold and deep navy blue color scheme, editorial magazine photography style",
        
        IMAGES_DIR / f"{date_str}-tech.jpg":
            "Modern AI tech infrastructure visualization, holographic data charts floating in dark space, "
            "glowing blue energy flows merging with power grid, futuristic neon accents, "
            "high-tech financial data center atmosphere, dark navy background with golden particles"
    }
    
    success = 0
    for img_path, prompt in prompts.items():
        if img_path.exists():
            print(f"跳过已存在: {img_path.name}")
            success += 1
            continue
        
        if generate_image(prompt, img_path):
            success += 1
        else:
            print(f"失败: {img_path.name}")
    
    print(f"\n完成: {success}/{len(prompts)} 张图片生成成功")
    return success == len(prompts)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', default=datetime.now().strftime('%Y-%m-%d'))
    args = parser.parse_args()
    
    generate_all_images(args.date)
