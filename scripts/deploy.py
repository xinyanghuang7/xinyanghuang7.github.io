#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GitHub 部署脚本 - 修复 UTF-8 BOM 编码问题
用法: python deploy.py --date 2026-03-08
"""

import os
import base64
import json
import argparse
import requests
from pathlib import Path

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', default=None, help='博客日期，格式 YYYY-MM-DD')
    args = parser.parse_args()

    if args.date is None:
        args.date = input("请输入日期 (YYYY-MM-DD): ").strip()

    year, month, day = args.date.split('-')

    token = os.environ.get('GITHUB_TOKEN')
    if not token:
        print("错误: 未设置 GITHUB_TOKEN 环境变量")
        print("请设置: export GITHUB_TOKEN='your_token' 或 $env:GITHUB_TOKEN='your_token'")
        return 1

    owner = "xinyanghuang7"
    repo = "xinyanghuang7.github.io"
    base_dir = Path(__file__).parent.parent

    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json'
    }

    print(f"开始部署 {args.date} 的博客...")
    print(f"仓库: {owner}/{repo}")

    files = [
        (f"posts/{year}/{month}/{day}.html", f"posts/{year}/{month}/{day}.html"),
        (f"images/posts/{args.date}-value.jpg", f"images/posts/{args.date}-value.jpg"),
        (f"images/posts/{args.date}-tech.jpg", f"images/posts/{args.date}-tech.jpg")
    ]

    success = 0
    failed = 0

    for remote_path, local_rel_path in files:
        local_path = base_dir / local_rel_path

        if not local_path.exists():
            print(f"跳过: {local_rel_path} (文件不存在)")
            continue

        print(f"推送: {remote_path} ...", end=" ")

        try:
            # 检查文件是否已存在，获取 SHA
            sha = None
            resp = requests.get(f"https://api.github.com/repos/{owner}/{repo}/contents/{remote_path}",
                              headers=headers)
            if resp.status_code == 200:
                sha = resp.json().get('sha')
            elif resp.status_code != 404:
                resp.raise_for_status()

            # 读取文件内容（保持原始字节，包括 BOM）
            with open(local_path, 'rb') as f:
                content_bytes = f.read()

            # 转为 base64
            content_b64 = base64.b64encode(content_bytes).decode('utf-8')

            body = {
                'message': f'feat: update {remote_path} - {args.date}',
                'content': content_b64
            }
            if sha:
                body['sha'] = sha

            resp = requests.put(f"https://api.github.com/repos/{owner}/{repo}/contents/{remote_path}",
                               headers=headers,
                               data=json.dumps(body))

            resp.raise_for_status()
            result = resp.json()
            sha_short = result['content']['sha'][:7]
            print(f"OK (SHA: {sha_short})")
            success += 1

        except requests.RequestException as e:
            print(f"FAIL")
            print(f"  错误: {e}")
            failed += 1

    print()
    print("部署完成")
    print(f"  成功: {success}")
    print(f"  失败: {failed}")

    if success > 0:
        print()
        print("访问地址:")
        print(f"  https://{owner}.github.io/posts/{year}/{month}/{day}.html")

    return 0 if failed == 0 else 1

if __name__ == '__main__':
    exit(main())
