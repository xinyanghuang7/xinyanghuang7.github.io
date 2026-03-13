#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Sync homepage archive and client-side search data from published post files."""

from __future__ import annotations

import json
import re
from collections import defaultdict
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
POSTS_DIR = ROOT / "posts"
INDEX_FILE = ROOT / "index.html"
POSTS_DATA_FILE = ROOT / "js" / "posts-data.js"

TITLE_RE = re.compile(r"<title>(.*?)\s*\|", re.IGNORECASE | re.DOTALL)
META_RE_TEMPLATE = r'<meta\s+{kind}="{name}"\s+content="([^"]*)"'
TICKER_RE = re.compile(r'class="stock-ticker"[^>]*>([A-Z]{1,5})<', re.IGNORECASE)


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def extract_first(pattern: re.Pattern[str], text: str) -> str:
    match = pattern.search(text)
    return clean_text(match.group(1)) if match else ""


def meta_pattern(name: str, *, kind: str = "name") -> re.Pattern[str]:
    return re.compile(META_RE_TEMPLATE.format(kind=kind, name=re.escape(name)), re.IGNORECASE)


def split_keywords(value: str) -> list[str]:
    raw_parts = re.split(r"[,，/]", value)
    seen: set[str] = set()
    result: list[str] = []
    for part in raw_parts:
        item = clean_text(part)
        if item and item not in seen:
            seen.add(item)
            result.append(item)
    return result


def extract_post(path: Path) -> dict:
    text = path.read_text(encoding="utf-8-sig")
    relative_url = path.relative_to(ROOT).as_posix()
    year, month, day = path.parts[-3], path.parts[-2], path.stem
    date = f"{year}-{month}-{day}"

    title = extract_first(TITLE_RE, text) or f"{year}年{int(month)}月{int(day)}日美股分析"
    description = extract_first(meta_pattern("description"), text) or "点击查看详细分析"
    keywords = split_keywords(extract_first(meta_pattern("keywords"), text))

    for match in TICKER_RE.finditer(text):
        ticker = match.group(1).upper()
        if ticker not in keywords:
            keywords.append(ticker)

    return {
        "date": date,
        "title": title,
        "desc": description,
        "url": relative_url,
        "keywords": keywords,
    }


def load_posts() -> list[dict]:
    posts = [extract_post(path) for path in POSTS_DIR.rglob("*.html")]
    posts.sort(key=lambda item: item["date"], reverse=True)
    return posts


def shorten(value: str, limit: int = 60) -> str:
    value = clean_text(value)
    if len(value) <= limit:
        return value
    return value[: limit - 1].rstrip() + "…"


def build_archive_html(posts: list[dict]) -> str:
    grouped: dict[str, dict[str, list[dict]]] = defaultdict(lambda: defaultdict(list))
    for post in posts:
        year, month, _ = post["date"].split("-")
        grouped[year][month].append(post)

    chunks: list[str] = []
    for year in sorted(grouped.keys(), reverse=True):
        chunks.append('                <div class="archive-year">')
        chunks.append(f'                    <h3 class="archive-year-title">{year}年</h3>')
        for month in sorted(grouped[year].keys(), reverse=True):
            month_label = f"{int(month)}月"
            chunks.append('                    <div class="archive-month">')
            chunks.append(f'                        <div class="archive-month-title">{month_label}</div>')
            chunks.append('                        <div class="archive-items">')
            for post in grouped[year][month]:
                day = post["date"].split("-")[-1]
                title = escape(post["title"])
                desc = escape(shorten(post["desc"]))
                url = escape(post["url"], quote=True)
                chunks.extend(
                    [
                        f'                            <a href="{url}" class="archive-item">',
                        f'                                <div class="archive-item-date">{day}</div>',
                        '                                <div class="archive-item-content">',
                        f'                                    <div class="archive-item-title">{title}</div>',
                        f'                                    <div class="archive-item-desc">{desc}</div>',
                        '                                </div>',
                        '                                <div class="archive-item-arrow">→</div>',
                        '                            </a>',
                    ]
                )
            chunks.append('                        </div>')
            chunks.append('                    </div>')
        chunks.append('                </div>')
    return "\n".join(chunks)


def sync_index(posts: list[dict]) -> None:
    content = INDEX_FILE.read_text(encoding="utf-8-sig")
    archive_html = build_archive_html(posts)
    pattern = re.compile(r"(<!-- ARCHIVE_ITEMS_START -->)(.*?)(<!-- ARCHIVE_ITEMS_END -->)", re.DOTALL)
    if not pattern.search(content):
        raise SystemExit("index.html missing ARCHIVE_ITEMS markers")
    replaced = pattern.sub(rf"\1\n{archive_html}\n                            \3", content)
    INDEX_FILE.write_text(replaced, encoding="utf-8-sig")


def sync_posts_data(posts: list[dict]) -> None:
    payload = "// Auto-generated from posts/**/*.html. Do not edit by hand.\n"
    payload += "window.__POSTS__ = "
    payload += json.dumps(posts, ensure_ascii=False, indent=2)
    payload += ";\n"
    POSTS_DATA_FILE.write_text(payload, encoding="utf-8")


def main() -> int:
    posts = load_posts()
    if not posts:
        raise SystemExit("No posts found under posts/")

    sync_index(posts)
    sync_posts_data(posts)

    print(f"Synced {len(posts)} posts -> index.html + js/posts-data.js")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
