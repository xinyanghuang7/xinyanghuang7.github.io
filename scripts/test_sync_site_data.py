from __future__ import annotations

import importlib.util
import json
import re
import sys
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).with_name("sync-site-data.py")
spec = importlib.util.spec_from_file_location("sync_site_data", MODULE_PATH)
mod = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mod
assert spec.loader is not None
spec.loader.exec_module(mod)

JSONLD_RE = re.compile(r'<script\s+type="application/ld\+json">(.*?)</script>', re.IGNORECASE | re.DOTALL)


class SyncSiteDataTests(unittest.TestCase):
    def test_sync_post_jsonld_rewrites_invalid_multiline_jsonld_to_valid_json(self) -> None:
        html = """<!DOCTYPE html>
<html lang=\"zh-CN\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"description\" content=\"第一行描述 第二行描述\">
    <meta property=\"og:image\" content=\"https://4fire.qzz.io/images/posts/2026-04-12-value.jpg\">
    <title>2026年4月12日美股复盘 | 美股价值投资笔记</title>
    <link rel=\"canonical\" href=\"https://4fire.qzz.io/posts/2026/04/12.html\">
    <script type=\"application/ld+json\">
    {
        \"@context\": \"https://schema.org\",
        \"@type\": \"Article\",
        \"headline\": \"2026年4月12日美股复盘\",
        \"description\": \"第一行描述
第二行描述\",
        \"datePublished\": \"2026-04-12\"
    }
    </script>
</head>
<body></body>
</html>
"""

        with tempfile.TemporaryDirectory() as temp_dir:
            post_path = Path(temp_dir) / "posts" / "2026" / "04" / "12.html"
            post_path.parent.mkdir(parents=True, exist_ok=True)
            post_path.write_text(html, encoding="utf-8")

            changed = mod.sync_post_jsonld(post_path)
            self.assertTrue(changed)

            updated = post_path.read_text(encoding="utf-8")
            match = JSONLD_RE.search(updated)
            self.assertIsNotNone(match)

            payload = json.loads(match.group(1))
            self.assertEqual(payload["headline"], "2026年4月12日美股复盘")
            self.assertEqual(payload["description"], "第一行描述 第二行描述")
            self.assertEqual(payload["datePublished"], "2026-04-12")
            self.assertEqual(payload["dateModified"], "2026-04-12")
            self.assertEqual(payload["mainEntityOfPage"], "https://4fire.qzz.io/posts/2026/04/12.html")
            self.assertEqual(payload["image"], ["https://4fire.qzz.io/images/posts/2026-04-12-value.jpg"])


if __name__ == "__main__":
    unittest.main()
