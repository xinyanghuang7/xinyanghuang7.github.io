from __future__ import annotations

import html
import json
import os
import re
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Iterable
from urllib.parse import quote

SITE_ROOT = Path(__file__).resolve().parent.parent
MANIFEST_PATH = SITE_ROOT / "options" / "course-manifest.json"
INDEX_TEMPLATE_PATH = SITE_ROOT / "template" / "options-course-index.html"
CHAPTER_TEMPLATE_PATH = SITE_ROOT / "template" / "options-chapter.html"
HOMEPAGE_PATH = SITE_ROOT / "index.html"
SITE_BASE_URL = "https://4fire.qzz.io"
COURSE_TITLE = "美股期权教材"
COURSE_URL = f"{SITE_BASE_URL}/options/"
OG_IMAGE_URL = f"{SITE_BASE_URL}/images/hero-bg.jpg"
REQUIRED_PUBLISHED_FIELDS = ("section_label", "summary", "source_path", "output_path")
CALL_OUT_LABELS = {
    "定义": "definition",
    "definition": "definition",
    "例子": "example",
    "example": "example",
    "示例": "example",
    "warning": "warning",
    "警告": "warning",
    "提醒": "warning",
    "注意": "warning",
}


@dataclass
class Chapter:
    id: str
    title: str
    summary: str
    section_label: str
    batch: str
    status: str
    source_path: str
    output_path: str
    nav_label: str
    update_order: int


class BuildError(RuntimeError):
    pass


INLINE_CODE_RE = re.compile(r"`([^`]+)`")
BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
ITALIC_RE = re.compile(r"(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)")
LINK_RE = re.compile(r"\[([^\]]+)\]\((https?://[^)\s]+)\)")
BARE_URL_RE = re.compile(r"(?<![\">])(https?://[\w\-./?%&=+#~:;,]+)")


def resolve_workspace_root() -> Path:
    candidates: list[Path] = []
    for key in ("OPENCLAW_WORKSPACE_ROOT", "OPENCLAW_WORKSPACE", "WORKSPACE_ROOT"):
        value = os.environ.get(key)
        if value:
            candidates.append(Path(value).expanduser())

    repo = SITE_ROOT.resolve()
    candidates.extend(repo.parents)
    candidates.append(Path.home() / ".openclaw" / "workspace")

    seen: set[Path] = set()
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        if (resolved / "stock_option_class" / "chapters").exists():
            return resolved

    raise BuildError(
        "Could not resolve workspace root containing stock_option_class/chapters. "
        "Tried environment hints and standard OpenClaw workspace locations."
    )


def load_manifest(path: Path) -> list[Chapter]:
    items = json.loads(path.read_text(encoding="utf-8-sig"))
    chapters: list[Chapter] = []
    for raw in items:
        if raw.get("status") == "published":
            missing = [field for field in REQUIRED_PUBLISHED_FIELDS if not raw.get(field)]
            if missing:
                raise BuildError(f"Published chapter {raw.get('id', '<unknown>')} is missing required fields: {', '.join(missing)}")
        chapters.append(Chapter(
            id=str(raw["id"]),
            title=raw["title"],
            summary=raw.get("summary", ""),
            section_label=raw.get("section_label", ""),
            batch=raw.get("batch", "Unbatched"),
            status=raw.get("status", "draft"),
            source_path=raw.get("source_path", ""),
            output_path=raw.get("output_path", ""),
            nav_label=raw.get("nav_label", raw["title"]),
            update_order=int(raw.get("update_order", 0)),
        ))
    return chapters


def chapter_absolute_url(output_path: str) -> str:
    return f"{SITE_BASE_URL}/{output_path.replace(os.sep, '/')}"


def render_inline(text: str) -> str:
    escaped = html.escape(text.strip())
    escaped = LINK_RE.sub(lambda m: f'<a href="{html.escape(m.group(2), quote=True)}">{m.group(1)}</a>', escaped)
    escaped = BARE_URL_RE.sub(lambda m: f'<a href="{m.group(1)}">{m.group(1)}</a>', escaped)
    escaped = INLINE_CODE_RE.sub(lambda m: f"<code>{m.group(1)}</code>", escaped)
    escaped = BOLD_RE.sub(lambda m: f"<strong>{m.group(1)}</strong>", escaped)
    escaped = ITALIC_RE.sub(lambda m: f"<em>{m.group(1)}</em>", escaped)
    return escaped


def is_table_divider(line: str) -> bool:
    cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell or "") for cell in cells)


def split_table_row(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def detect_callout(paragraph: str) -> tuple[str, str] | None:
    for marker in ("**", "__"):
        if paragraph.startswith(marker) and marker in paragraph[2:]:
            end = paragraph.find(marker, 2)
            label = paragraph[2:end].strip().strip(":：").lower()
            callout_type = CALL_OUT_LABELS.get(label)
            if callout_type:
                body = paragraph[end + 2:].lstrip(" ：:")
                return callout_type, body
    match = re.match(r"^(定义|Definition|例子|Example|示例|警告|Warning|提醒|注意)\s*[：:.-]\s*(.+)$", paragraph, re.IGNORECASE)
    if match:
        callout_type = CALL_OUT_LABELS[match.group(1).lower()]
        return callout_type, match.group(2)
    return None


def status_label(status: str) -> str:
    return {
        "published": "已发布",
        "syncing": "同步中",
        "coming-soon": "即将上线",
    }.get(status, status)


def next_unpublished_batch(chapters: list[Chapter]) -> str:
    for chapter in chapters:
        if chapter.status != "published":
            return chapter.batch
    return "待定"


def last_sync_label(workspace_root: Path, published: list[Chapter]) -> str:
    if not published:
        return "尚未发布"

    latest_mtime = max(
        (workspace_root / chapter.source_path).stat().st_mtime
        for chapter in published
        if (workspace_root / chapter.source_path).exists()
    )
    return datetime.fromtimestamp(latest_mtime).strftime("%Y-%m-%d")


def render_markdown(markdown_text: str) -> str:
    text = markdown_text.replace("\r\n", "\n").replace("\ufeff", "")
    lines = text.split("\n")
    out: list[str] = []
    paragraph_lines: list[str] = []
    bullet_items: list[str] = []
    blockquote_lines: list[str] = []
    i = 0

    def flush_paragraph() -> None:
        nonlocal paragraph_lines
        if not paragraph_lines:
            return
        paragraph = " ".join(line.strip() for line in paragraph_lines).strip()
        if paragraph:
            callout = detect_callout(paragraph)
            if callout:
                callout_type, body = callout
                out.append(
                    f'<aside class="course-callout course-callout-{callout_type}">' 
                    f'<div class="course-callout-label">{html.escape(callout_type.title())}</div>'
                    f'<p>{render_inline(body)}</p></aside>'
                )
            else:
                out.append(f"<p>{render_inline(paragraph)}</p>")
        paragraph_lines = []

    def flush_bullets() -> None:
        nonlocal bullet_items
        if bullet_items:
            out.append("<ul>" + "".join(f"<li>{render_inline(item)}</li>" for item in bullet_items) + "</ul>")
            bullet_items = []

    def flush_blockquote() -> None:
        nonlocal blockquote_lines
        if not blockquote_lines:
            return
        quote_markdown = "\n".join(line.rstrip() for line in blockquote_lines).strip()
        quote_text = " ".join(line.strip() for line in blockquote_lines).strip()
        callout = detect_callout(quote_text)
        if callout:
            callout_type, body = callout
            out.append(
                f'<aside class="course-callout course-callout-{callout_type}">' 
                f'<div class="course-callout-label">{html.escape(callout_type.title())}</div>'
                f'<p>{render_inline(body)}</p></aside>'
            )
        else:
            quote_html = render_markdown(quote_markdown)
            out.append(f"<blockquote>{quote_html}</blockquote>")
        blockquote_lines = []

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            flush_paragraph(); flush_bullets(); flush_blockquote()
            i += 1
            continue

        table_ahead = "|" in stripped and i + 1 < len(lines) and is_table_divider(lines[i + 1])
        if table_ahead:
            flush_paragraph(); flush_bullets(); flush_blockquote()
            headers = split_table_row(lines[i])
            rows: list[list[str]] = []
            i += 2
            while i < len(lines) and "|" in lines[i].strip():
                rows.append(split_table_row(lines[i]))
                i += 1
            thead = "".join(f"<th>{render_inline(cell)}</th>" for cell in headers)
            tbody_rows = []
            for row in rows:
                cells = "".join(f"<td>{render_inline(cell)}</td>" for cell in row)
                tbody_rows.append(f"<tr>{cells}</tr>")
            out.append(
                '<div class="course-table-wrap"><table><thead><tr>' + thead +
                '</tr></thead><tbody>' + ''.join(tbody_rows) + '</tbody></table></div>'
            )
            continue

        heading_match = re.match(r"^(#{1,6})\s+(.*)$", stripped)
        if heading_match:
            flush_paragraph(); flush_bullets(); flush_blockquote()
            level = len(heading_match.group(1))
            heading_text = render_inline(heading_match.group(2))
            out.append(f"<h{level}>{heading_text}</h{level}>")
            i += 1
            continue

        if re.fullmatch(r"-{3,}|\*{3,}", stripped):
            flush_paragraph(); flush_bullets(); flush_blockquote()
            out.append("<hr>")
            i += 1
            continue

        bullet_match = re.match(r"^[-*+]\s+(.*)$", stripped)
        if bullet_match:
            flush_paragraph(); flush_blockquote()
            bullet_items.append(bullet_match.group(1))
            i += 1
            continue

        if stripped.startswith(">"):
            flush_paragraph(); flush_bullets()
            blockquote_lines.append(stripped[1:].strip())
            i += 1
            continue

        flush_bullets(); flush_blockquote()
        paragraph_lines.append(stripped)
        i += 1

    flush_paragraph(); flush_bullets(); flush_blockquote()
    return "\n".join(out)


def build_navigation(published: list[Chapter]) -> dict[str, dict[str, Chapter | None]]:
    nav: dict[str, dict[str, Chapter | None]] = {}
    for index, chapter in enumerate(published):
        nav[chapter.id] = {
            "previous": published[index - 1] if index > 0 else None,
            "next": published[index + 1] if index + 1 < len(published) else None,
        }
    return nav


def render_stats(chapters: list[Chapter], published: list[Chapter]) -> str:
    stats = [
        ("总章节数", str(len(chapters))),
        ("已发布", str(len(published))),
        ("同步中", str(sum(ch.status == "syncing" for ch in chapters))),
        ("下一批次", next_unpublished_batch(chapters)),
    ]
    blocks = []
    for label, value in stats:
        blocks.append(f'<div class="course-grid-card"><div class="course-stat-label">{label}</div><div class="course-stat-value">{value}</div></div>')
    return "\n".join(blocks)


def group_by(items: Iterable[Chapter], key: str) -> dict[str, list[Chapter]]:
    grouped: dict[str, list[Chapter]] = defaultdict(list)
    for item in items:
        grouped[getattr(item, key)].append(item)
    return dict(grouped)


def render_learning_paths(chapters: list[Chapter]) -> str:
    blocks = []
    for section, section_chapters in group_by(chapters, "section_label").items():
        items = []
        for chapter in section_chapters:
            items.append(f"<li>第 {chapter.id} 章 · {render_inline(chapter.title)} · {status_label(chapter.status)}</li>")

        batches = []
        for chapter in section_chapters:
            if chapter.batch not in batches:
                batches.append(chapter.batch)
        if len(batches) == 1:
            coverage_label = batches[0]
        else:
            coverage_label = f"{batches[0]} 至 {batches[-1]}"

        if all(chapter.status == "published" for chapter in section_chapters):
            desc = f"共 {len(section_chapters)} 章，覆盖 {coverage_label}，现已全部发布。"
        else:
            desc = f"共 {len(section_chapters)} 章，覆盖 {coverage_label}，按批次持续扩展。"

        blocks.append(
            f'<article class="course-grid-card"><div class="course-card-kicker">{html.escape(section)}</div>'
            f'<h3 class="course-card-title">{html.escape(section)}</h3>'
            f'<p class="course-card-desc">{html.escape(desc)}</p>'
            f'<ul class="course-card-list">{"".join(items)}</ul></article>'
        )
    return "\n".join(blocks)


def render_directory_cards(chapters: list[Chapter]) -> str:
    cards = []
    for chapter in chapters:
        if chapter.status == "published":
            action = f'<a class="course-action-link" href="./{Path(chapter.output_path).name}">阅读本章 →</a>'
        else:
            action = f'<span class="course-action-link" aria-disabled="true">{html.escape(status_label(chapter.status))}</span>'
        cards.append(
            f'<article class="course-grid-card"><div class="course-card-kicker">第 {chapter.id} 章 · {html.escape(chapter.section_label)}</div>'
            f'<h3 class="course-card-title">{html.escape(chapter.title)}</h3>'
            f'<p class="course-card-desc">{html.escape(chapter.summary)}</p>'
            f'<div class="course-directory-meta"><span class="course-directory-pill">{html.escape(chapter.batch)}</span>'
            f'<span class="course-directory-pill">状态：{html.escape(status_label(chapter.status))}</span></div>'
            f'<div class="course-card-actions">{action}</div></article>'
        )
    return "\n".join(cards)


def render_sync_progress(chapters: list[Chapter]) -> str:
    cards = []
    for batch, batch_chapters in group_by(chapters, "batch").items():
        published_count = sum(ch.status == "published" for ch in batch_chapters)
        items = "".join(f"<li>第 {ch.id} 章 · {html.escape(ch.title)} · {html.escape(status_label(ch.status))}</li>" for ch in batch_chapters)
        cards.append(
            f'<article class="course-update-card"><div class="course-card-kicker">{html.escape(batch)}</div>'
            f'<h3 class="course-card-title">已发布 {published_count} / {len(batch_chapters)}</h3>'
            f'<ul class="course-update-list">{items}</ul></article>'
        )
    return "\n".join(cards)


def render_recent_updates(published: list[Chapter]) -> str:
    cards = []
    for chapter in sorted(published, key=lambda item: item.update_order, reverse=True):
        cards.append(
            f'<article class="course-update-card"><div class="course-update-date">更新序号 #{chapter.update_order}</div>'
            f'<h3 class="course-update-title">第 {chapter.id} 章 · {html.escape(chapter.title)}</h3>'
            f'<p class="course-update-desc">{html.escape(chapter.summary)}</p>'
            f'<div class="course-card-actions"><a class="course-action-link" href="./{Path(chapter.output_path).name}">打开章节 →</a></div></article>'
        )
    return "\n".join(cards)


def fill_template(template: str, replacements: dict[str, str]) -> str:
    output = template
    for key, value in replacements.items():
        output = output.replace(f"{{{{{key}}}}}", value)

    leftover = sorted(set(re.findall(r"\{\{[^}]+\}\}", output)))
    if leftover:
        raise BuildError(f"Template placeholders were not fully replaced: {', '.join(leftover)}")
    return output


def build_index_page(workspace_root: Path, chapters: list[Chapter], published: list[Chapter]) -> str:
    template = INDEX_TEMPLATE_PATH.read_text(encoding="utf-8")
    page_description = "系统梳理美股期权的基础概念、交易操作、风险结构与常见策略，按章节持续更新。"
    replacements = {
        "PAGE_TITLE": COURSE_TITLE,
        "PAGE_DESCRIPTION": page_description,
        "CANONICAL_URL": COURSE_URL,
        "OG_IMAGE_URL": OG_IMAGE_URL,
        "NAV_DATE": last_sync_label(workspace_root, published),
        "HERO_EYEBROW": "Options Course",
        "HERO_TITLE": COURSE_TITLE,
        "HERO_TAGLINE": "从概念入门到策略结构，把分散的期权知识整理成一套可连续阅读的课程。",
        "HERO_DESCRIPTION": "这里集中展示已上线章节、学习路径与更新节奏，方便按顺序学习，也方便按主题回看。",
        "COURSE_INTRO": "这套课程面向刚接触美股期权、但希望系统建立框架的读者。内容从合同本质、下单与盈亏结构讲起，再逐步进入定价、波动率与组合策略。",
        "TARGET_AUDIENCE": "期权新手 / 想系统复习的人",
        "LEARNING_CADENCE": "先读 01-04，再按 batch 继续推进",
        "LAST_SYNC_LABEL": f"已发布至第 {published[-1].id} 章" if published else "尚未发布",
        "COURSE_SUMMARY_STATS": render_stats(chapters, published),
        "LEARNING_PATH_BLOCKS": render_learning_paths(chapters),
        "CHAPTER_DIRECTORY_CARDS": render_directory_cards(chapters),
        "SYNC_PROGRESS_BLOCKS": render_sync_progress(chapters),
        "RECENT_UPDATES_BLOCKS": render_recent_updates(published),
    }
    return fill_template(template, replacements)


def homepage_next_batch_copy(chapters: list[Chapter]) -> str:
    next_batch = next_unpublished_batch(chapters)
    if next_batch == "待定":
        return "已全部上线"
    remaining = sum(ch.status != "published" and ch.batch == next_batch for ch in chapters)
    return f"{next_batch} 待上线 · {remaining} 章"


def sync_homepage_course_entry(chapters: list[Chapter], published: list[Chapter]) -> Path | None:
    if not HOMEPAGE_PATH.exists():
        return None

    homepage = HOMEPAGE_PATH.read_text(encoding="utf-8")
    replacement = (
        '            <div class="homepage-course-entry">\n'
        '                <div class="course-card-kicker">Options Course</div>\n'
        '                <h3 class="course-entry-card-title">期权教材</h3>\n'
        '                <p class="course-entry-card-desc">把美股期权的概念、操作、风险结构和策略框架拆成可回看、可持续更新的课程区。</p>\n'
        '                <div class="course-directory-meta" aria-label="课程进度快照">\n'
        f'                    <span class="course-directory-pill">总计 {len(chapters)} 章</span>\n'
        f'                    <span class="course-status-pill course-status-published">已发布 {len(published)} 章</span>\n'
        f'                    <span class="course-status-pill course-status-syncing">{homepage_next_batch_copy(chapters)}</span>\n'
        f'                    <span class="course-directory-pill">下一批次：{next_unpublished_batch(chapters)}</span>\n'
        '                </div>\n'
        '                <div class="course-card-actions">\n'
        '                    <a href="options/" class="course-action-link" aria-label="进入期权教材">进入教材 <span aria-hidden="true">→</span></a>\n'
        '                </div>\n'
        '            </div>'
    )

    start_token = '            <div class="homepage-course-entry">'
    section_end_token = '\n        </section>'
    start = homepage.find(start_token)
    if start == -1:
        raise BuildError("Could not locate homepage course entry start block to sync.")

    end = homepage.find(section_end_token, start)
    if end == -1:
        raise BuildError("Could not locate homepage course entry section end to sync.")

    updated = homepage[:start] + replacement + homepage[end:]
    HOMEPAGE_PATH.write_text(updated, encoding="utf-8", newline="\n")
    return HOMEPAGE_PATH


def chapter_nav_slot(chapter: Chapter | None, fallback_label: str, helper: str) -> tuple[str, str, str]:
    if chapter is None:
        return "./index.html", fallback_label, helper
    return f"./{Path(chapter.output_path).name}", f"第 {chapter.id} 章 · {chapter.nav_label}", html.escape(chapter.summary)


def build_chapter_page(chapter: Chapter, body_html: str, nav: dict[str, Chapter | None]) -> str:
    template = CHAPTER_TEMPLATE_PATH.read_text(encoding="utf-8")
    prev_url, prev_label, prev_helper = chapter_nav_slot(nav.get("previous"), "回到课程首页", "这是第一篇已发布章节。")
    next_fallback_label = "回到课程首页" if nav.get("next") is None else "更多章节同步中"
    next_fallback_helper = "这是当前最后一篇已发布章节。" if nav.get("next") is None else "下一篇发布后会自动出现在这里。"
    next_url, next_label, next_helper = chapter_nav_slot(nav.get("next"), next_fallback_label, next_fallback_helper)
    replacements = {
        "CHAPTER_TITLE": chapter.title,
        "COURSE_TITLE": COURSE_TITLE,
        "CHAPTER_DESCRIPTION": chapter.summary,
        "CANONICAL_URL": chapter_absolute_url(chapter.output_path),
        "OG_IMAGE_URL": OG_IMAGE_URL,
        "COURSE_URL": COURSE_URL,
        "COURSE_RELATIVE_URL": "./index.html",
        "CHAPTER_NUMBER_LABEL": f"第 {chapter.id} 章",
        "SECTION_LABEL": chapter.section_label,
        "CHAPTER_NUMBER": chapter.id,
        "CHAPTER_TAGLINE": f"{chapter.section_label} · {chapter.batch}",
        "CHAPTER_SUMMARY": chapter.summary,
        "BATCH_LABEL": f"{chapter.batch} · {status_label(chapter.status)}",
        "CHAPTER_BODY_HTML": body_html,
        "PREV_CHAPTER_URL": prev_url,
        "PREV_CHAPTER_LABEL": prev_label,
        "PREV_CHAPTER_HELPER": prev_helper,
        "RETURN_TO_COURSE_LABEL": f"{COURSE_TITLE} 目录",
        "COURSE_RETURN_HELPER": "返回课程目录，按 section 和 batch 查看全局进度。",
        "NEXT_CHAPTER_URL": next_url,
        "NEXT_CHAPTER_LABEL": next_label,
        "NEXT_CHAPTER_HELPER": next_helper,
    }
    return fill_template(template, replacements)


def cleanup_stale_outputs(published: list[Chapter]) -> list[Path]:
    options_dir = SITE_ROOT / "options"
    expected = {Path(chapter.output_path).name for chapter in published}
    expected.add("index.html")
    removed: list[Path] = []
    for candidate in options_dir.glob("*.html"):
        if candidate.name not in expected:
            candidate.unlink()
            removed.append(candidate)
    return removed


def build_site() -> list[Path]:
    workspace_root = resolve_workspace_root()
    chapters = load_manifest(MANIFEST_PATH)
    published = [chapter for chapter in chapters if chapter.status == "published"]
    nav = build_navigation(published)
    outputs: list[Path] = []

    cleanup_stale_outputs(published)

    index_html = build_index_page(workspace_root, chapters, published)
    index_path = SITE_ROOT / "options" / "index.html"
    index_path.write_text(index_html, encoding="utf-8", newline="\n")
    outputs.append(index_path)

    for chapter in published:
        source_path = workspace_root / chapter.source_path
        if not source_path.exists():
            raise BuildError(f"Source chapter does not exist: {source_path}")
        body_html = render_markdown(source_path.read_text(encoding="utf-8-sig"))
        page_html = build_chapter_page(chapter, body_html, nav[chapter.id])
        output_path = SITE_ROOT / chapter.output_path
        output_path.write_text(page_html, encoding="utf-8", newline="\n")
        outputs.append(output_path)

    homepage_path = sync_homepage_course_entry(chapters, published)
    if homepage_path is not None:
        outputs.append(homepage_path)

    return outputs


def main() -> None:
    outputs = build_site()
    for output in outputs:
        print(f"generated {output.relative_to(SITE_ROOT)}")


if __name__ == "__main__":
    main()
