from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("build-options-course.py")
spec = importlib.util.spec_from_file_location("build_options_course", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mod
assert spec.loader is not None
spec.loader.exec_module(mod)


class BuildOptionsCourseTests(unittest.TestCase):
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


if __name__ == "__main__":
    unittest.main()
