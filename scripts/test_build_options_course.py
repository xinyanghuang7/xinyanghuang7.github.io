from __future__ import annotations

import importlib.util
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("build-options-course.py")
MANIFEST_PATH = MODULE_PATH.parent.parent / "options" / "course-manifest.json"
spec = importlib.util.spec_from_file_location("build_options_course", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mod
assert spec.loader is not None
spec.loader.exec_module(mod)


class BuildOptionsCourseTests(unittest.TestCase):
    def build_site_in_temp(self) -> tuple[list[Path], Path]:
        temp_dir_ctx = tempfile.TemporaryDirectory()
        self.addCleanup(temp_dir_ctx.cleanup)
        temp_root = Path(temp_dir_ctx.name)
        (temp_root / "options").mkdir()

        original_site_root = mod.SITE_ROOT
        original_manifest_path = mod.MANIFEST_PATH
        original_index_template_path = mod.INDEX_TEMPLATE_PATH
        original_chapter_template_path = mod.CHAPTER_TEMPLATE_PATH

        mod.SITE_ROOT = temp_root
        mod.MANIFEST_PATH = MANIFEST_PATH
        mod.INDEX_TEMPLATE_PATH = original_index_template_path
        mod.CHAPTER_TEMPLATE_PATH = original_chapter_template_path
        self.addCleanup(setattr, mod, "SITE_ROOT", original_site_root)
        self.addCleanup(setattr, mod, "MANIFEST_PATH", original_manifest_path)
        self.addCleanup(setattr, mod, "INDEX_TEMPLATE_PATH", original_index_template_path)
        self.addCleanup(setattr, mod, "CHAPTER_TEMPLATE_PATH", original_chapter_template_path)

        return mod.build_site(), temp_root

    def test_published_chapter_missing_required_fields_raises(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            manifest_path = Path(temp_dir) / "manifest.json"
            manifest_path.write_text(json.dumps([
                {
                    "id": "01",
                    "title": "Missing summary",
                    "status": "published",
                    "section_label": "基础认知篇",
                    "source_path": "stock_option_class/chapters/01.md",
                    "output_path": "options/01.html"
                }
            ], ensure_ascii=False), encoding="utf-8")

            with self.assertRaises(mod.BuildError) as ctx:
                mod.load_manifest(manifest_path)

            self.assertIn("summary", str(ctx.exception))

    def test_render_markdown_supports_core_blocks_and_callouts(self) -> None:
        markdown = """# 标题\n\n> **定义：** 期权是一份合同。\n\n- 第一条\n- 第二条\n\n| 词 | 含义 |\n| --- | --- |\n| Call | 看涨 |\n\n---\n\n普通段落，含 **加粗** 和 https://example.com\n"""
        html = mod.render_markdown(markdown)
        self.assertIn("<h1>标题</h1>", html)
        self.assertIn('course-callout-definition', html)
        self.assertIn("<ul><li>第一条</li><li>第二条</li></ul>", html)
        self.assertIn("<table>", html)
        self.assertIn("<hr>", html)
        self.assertIn("<strong>加粗</strong>", html)
        self.assertIn('<a href="https://example.com">https://example.com</a>', html)

    def test_build_navigation_links_neighbors(self) -> None:
        chapters = [
            mod.Chapter("01", "一", "s1", "A", "Batch 1", "published", "a.md", "options/01.html", "一", 1),
            mod.Chapter("02", "二", "s2", "A", "Batch 1", "published", "b.md", "options/02.html", "二", 2),
            mod.Chapter("03", "三", "s3", "A", "Batch 1", "published", "c.md", "options/03.html", "三", 3),
        ]
        nav = mod.build_navigation(chapters)
        self.assertIsNone(nav["01"]["previous"])
        self.assertEqual(nav["01"]["next"].id, "02")
        self.assertEqual(nav["02"]["previous"].id, "01")
        self.assertEqual(nav["02"]["next"].id, "03")
        self.assertIsNone(nav["03"]["next"])

    def test_render_markdown_promotes_h5_to_real_heading(self) -> None:
        html = mod.render_markdown("##### 例子 A\n\n正文")
        self.assertIn("<h5>例子 A</h5>", html)
        self.assertNotIn("<p>##### 例子 A</p>", html)

    def test_render_markdown_preserves_blockquote_lists(self) -> None:
        markdown = "> 引用前言\n> - 第一条\n> - 第二条"
        html = mod.render_markdown(markdown)
        self.assertIn("<blockquote>", html)
        self.assertIn("<p>引用前言</p>", html)
        self.assertIn("<ul><li>第一条</li><li>第二条</li></ul>", html)

    def test_render_stats_uses_next_unpublished_batch(self) -> None:
        chapters = [
            mod.Chapter("01", "一", "s1", "A", "Batch 1", "published", "a.md", "options/01.html", "一", 1),
            mod.Chapter("02", "二", "s2", "A", "Batch 1", "published", "b.md", "options/02.html", "二", 2),
            mod.Chapter("05", "五", "s5", "B", "Batch 2", "syncing", "e.md", "options/05.html", "五", 5),
            mod.Chapter("09", "九", "s9", "C", "Batch 3", "coming-soon", "i.md", "options/09.html", "九", 9),
        ]
        published = [chapter for chapter in chapters if chapter.status == "published"]

        html = mod.render_stats(chapters, published)

        self.assertIn("下一批次", html)
        self.assertIn("Batch 2", html)
        self.assertNotIn("<div class=\"course-stat-value\">Batch 1</div>", html)

    def test_published_manifest_entries_resolve_to_real_workspace_chapters(self) -> None:
        chapters = mod.load_manifest(MANIFEST_PATH)
        workspace_root = mod.resolve_workspace_root()

        missing = [
            chapter.source_path
            for chapter in chapters
            if chapter.status == "published" and not (workspace_root / chapter.source_path).exists()
        ]

        self.assertEqual(missing, [])

    def test_generated_pages_use_official_canonical_links_and_leave_no_placeholders(self) -> None:
        _, temp_root = self.build_site_in_temp()
        index_html = (temp_root / "options" / "index.html").read_text(encoding="utf-8")
        chapter_html = (temp_root / "options" / "01.html").read_text(encoding="utf-8")

        self.assertIn('<link rel="canonical" href="https://4fire.qzz.io/options/">', index_html)
        self.assertIn('<meta property="og:url" content="https://4fire.qzz.io/options/">', index_html)
        self.assertIn('<link rel="canonical" href="https://4fire.qzz.io/options/01.html">', chapter_html)
        self.assertIn('<meta property="og:url" content="https://4fire.qzz.io/options/01.html">', chapter_html)
        self.assertIn('sameAs": "https://4fire.qzz.io/"', index_html)
        self.assertIn('sameAs": "https://4fire.qzz.io/"', chapter_html)
        self.assertNotRegex(index_html, r"\{\{[^}]+\}\}")
        self.assertNotRegex(chapter_html, r"\{\{[^}]+\}\}")
        self.assertNotIn("课程首页只负责课程", index_html)

    def test_generated_chapters_keep_navigation_slots_and_index_published_count_in_sync(self) -> None:
        _, temp_root = self.build_site_in_temp()
        chapters = mod.load_manifest(MANIFEST_PATH)
        published = [chapter for chapter in chapters if chapter.status == "published"]
        index_html = (temp_root / "options" / "index.html").read_text(encoding="utf-8")

        published_count_match = re.search(
            r'<div class="course-stat-label">已发布</div><div class="course-stat-value">(\d+)</div>',
            index_html,
        )
        self.assertIsNotNone(published_count_match)
        self.assertEqual(int(published_count_match.group(1)), len(published))

        for chapter in published:
            chapter_html = (temp_root / chapter.output_path).read_text(encoding="utf-8")
            self.assertIn('<div class="chapter-nav-label">上一章</div>', chapter_html)
            self.assertIn('<div class="chapter-nav-label">返回课程</div>', chapter_html)
            self.assertIn('<div class="chapter-nav-label">下一章</div>', chapter_html)
            self.assertEqual(chapter_html.count('class="chapter-nav-slot"'), 3)


if __name__ == "__main__":
    unittest.main()
