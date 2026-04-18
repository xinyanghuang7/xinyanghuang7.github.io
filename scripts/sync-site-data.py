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
CANONICAL_RE = re.compile(r'<link\s+rel="canonical"\s+href="([^"]+)"', re.IGNORECASE)
JSONLD_BLOCK_RE = re.compile(
    r'(?P<indent>[ \t]*)<script\s+type="application/ld\+json">\s*(?P<payload>.*?)\s*</script>',
    re.IGNORECASE | re.DOTALL,
)


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


def resolve_relative_post_url(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        marker = "posts"
        parts = list(path.parts)
        if marker in parts:
            idx = parts.index(marker)
            return "/".join(parts[idx:])
        return path.name


def extract_post(path: Path) -> dict:
    text = path.read_text(encoding="utf-8-sig")
    relative_url = resolve_relative_post_url(path)
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


def build_jsonld_payload(path: Path, text: str) -> dict:
    relative_url = resolve_relative_post_url(path)
    year, month, day = path.parts[-3], path.parts[-2], path.stem
    date = f"{year}-{month}-{day}"
    default_canonical = f"https://4fire.qzz.io/{relative_url}"
    default_image = f"https://4fire.qzz.io/images/posts/{date}-value.jpg"

    title = extract_first(TITLE_RE, text) or f"{year}年{int(month)}月{int(day)}日美股分析"
    description = extract_first(meta_pattern("description"), text) or "点击查看详细分析"
    canonical = extract_first(CANONICAL_RE, text) or default_canonical
    image = extract_first(meta_pattern("og:image", kind="property"), text) or default_image

    jsonld_type = "Article"
    date_modified = date

    jsonld_match = JSONLD_BLOCK_RE.search(text)
    if jsonld_match:
        try:
            existing = json.loads(jsonld_match.group("payload"))
            if isinstance(existing, dict):
                existing_type = existing.get("@type")
                existing_date_modified = existing.get("dateModified")
                if isinstance(existing_type, str) and existing_type.strip():
                    jsonld_type = existing_type.strip()
                if isinstance(existing_date_modified, str) and existing_date_modified.strip():
                    date_modified = clean_text(existing_date_modified)
        except json.JSONDecodeError:
            pass

    return {
        "@context": "https://schema.org",
        "@type": jsonld_type,
        "headline": title,
        "description": description,
        "author": {
            "@type": "Person",
            "name": "ValueInvest",
        },
        "publisher": {
            "@type": "Organization",
            "name": "ValueInvest Blog",
        },
        "datePublished": date,
        "dateModified": date_modified,
        "mainEntityOfPage": canonical,
        "image": [image],
    }


def sync_post_jsonld(path: Path) -> bool:
    text = path.read_text(encoding="utf-8-sig")
    match = JSONLD_BLOCK_RE.search(text)
    if not match:
        return False

    payload = build_jsonld_payload(path, text)
    indent = match.group("indent")
    payload_lines = json.dumps(payload, ensure_ascii=False, indent=4).splitlines()
    replacement = "\n".join(
        [f"{indent}<script type=\"application/ld+json\">"]
        + [f"{indent}{line}" for line in payload_lines]
        + [f"{indent}</script>"]
    )
    updated = text[: match.start()] + replacement + text[match.end() :]
    if updated == text:
        return False

    path.write_text(updated, encoding="utf-8")
    return True


def load_posts() -> tuple[list[dict], int]:
    posts: list[dict] = []
    repaired = 0
    for path in POSTS_DIR.rglob("*.html"):
        if sync_post_jsonld(path):
            repaired += 1
        posts.append(extract_post(path))
    posts.sort(key=lambda item: item["date"], reverse=True)
    return posts, repaired


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
    INDEX_FILE.write_text(replaced, encoding="utf-8")


def sync_posts_data(posts: list[dict]) -> None:
    payload = "// Auto-generated from posts/**/*.html. Do not edit by hand.\n"
    payload += "window.__POSTS__ = "
    payload += json.dumps(posts, ensure_ascii=False, indent=2)
    payload += ";\n"
    POSTS_DATA_FILE.write_text(payload, encoding="utf-8")


def main() -> int:
    posts, repaired = load_posts()
    if not posts:
        raise SystemExit("No posts found under posts/")

    sync_index(posts)
    sync_posts_data(posts)

    if repaired:
        print(f"Repaired {repaired} JSON-LD block(s)")
    print(f"Synced {len(posts)} posts -> index.html + js/posts-data.js")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
