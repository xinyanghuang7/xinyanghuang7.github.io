from __future__ import annotations

import html
import re
import shutil
from pathlib import Path
from typing import Iterable

IMAGE_LIST_RE = re.compile(r"<ul>(?P<body>.*?)</ul>", re.S)
IMAGE_ITEM_RE = re.compile(
    r"<li><code>renamed/(?P<file>img\d+\.(?:jpg|jpeg|png|webp|gif))</code>\s*[：:]\s*(?P<desc>.*?)</li>",
    re.I | re.S,
)
LIST_ITEM_RE = re.compile(r"<li>.*?</li>", re.S)
TAG_RE = re.compile(r"<[^>]+>")


def strip_tags(value: str) -> str:
    return re.sub(r"\s+", " ", TAG_RE.sub(" ", value)).strip()


def public_image_href(filename: str) -> str:
    return f"../images/options/source/{filename}"


def expand_source_figure_lists(rendered_html: str) -> tuple[str, set[str]]:
    referenced_files: set[str] = set()

    def replace(match: re.Match[str]) -> str:
        body = match.group("body")
        all_items = LIST_ITEM_RE.findall(body)
        image_items = list(IMAGE_ITEM_RE.finditer(body))
        if not image_items or len(all_items) != len(image_items):
            return match.group(0)

        cards: list[str] = []
        for item in image_items:
            filename = item.group("file")
            desc_html = item.group("desc").strip()
            desc_text = strip_tags(desc_html)
            referenced_files.add(filename)
            href = public_image_href(filename)
            alt = html.escape(desc_text or filename, quote=True)
            cards.append(
                "<figure class=\"source-figure-card\">"
                f"<a class=\"source-figure-link\" href=\"{href}\" target=\"_blank\" rel=\"noopener noreferrer\">"
                f"<div class=\"source-figure-media\"><img class=\"source-figure-image\" src=\"{href}\" alt=\"{alt}\" loading=\"lazy\"></div>"
                f"<figcaption class=\"source-figure-caption\">{desc_html}</figcaption>"
                "</a>"
                "</figure>"
            )

        return '<div class="source-figure-grid">' + ''.join(cards) + '</div>'

    return IMAGE_LIST_RE.sub(replace, rendered_html), referenced_files


def sync_source_figure_images(workspace_root: Path, filenames: Iterable[str], site_root: Path) -> None:
    source_dir = workspace_root / "stock_option_class" / "renamed"
    target_dir = site_root / "images" / "options" / "source"
    target_dir.mkdir(parents=True, exist_ok=True)

    for filename in sorted(set(filenames)):
        source_path = source_dir / filename
        if not source_path.exists():
            raise FileNotFoundError(f"Source figure image not found: {source_path}")
        shutil.copy2(source_path, target_dir / filename)
