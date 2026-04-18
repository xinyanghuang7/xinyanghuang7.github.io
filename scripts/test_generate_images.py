#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import importlib.util
import tempfile
import unittest
from pathlib import Path
from unittest.mock import MagicMock, patch

MODULE_PATH = Path(__file__).with_name("generate_images.py")
spec = importlib.util.spec_from_file_location("generate_images", MODULE_PATH)
gm = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gm)


class GenerateImagesTests(unittest.TestCase):
    def test_submit_generation_task_adds_async_header(self):
        response = MagicMock()
        response.status_code = 200
        response.json.return_value = {"task_id": "abc123"}
        response.raise_for_status.return_value = None

        with patch.object(gm.requests, "post", return_value=response) as mock_post:
            task_id = gm.submit_generation_task("demo", "Qwen/Qwen-Image", "token-123")

        self.assertEqual(task_id, "abc123")
        _, kwargs = mock_post.call_args
        self.assertEqual(kwargs["headers"]["X-ModelScope-Async-Mode"], "true")
        self.assertEqual(kwargs["headers"]["Authorization"], "Bearer token-123")

    def test_generate_all_images_falls_back_to_posts_dir_when_auth_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            images_dir = tmp_path / "images"
            post_dir = images_dir / "posts"
            images_dir.mkdir(parents=True)
            post_dir.mkdir(parents=True)

            value_src = images_dir / "value-investing.jpg"
            tech_src = images_dir / "tech-analysis.jpg"
            value_src.write_bytes(b"value-fallback")
            tech_src.write_bytes(b"tech-fallback")

            with patch.object(gm, "IMAGES_DIR", images_dir), \
                 patch.object(gm, "POST_IMAGES_DIR", post_dir), \
                 patch.object(gm, "DEFAULT_FALLBACKS", {"value": value_src, "tech": tech_src}), \
                 patch.object(gm, "generate_image", side_effect=gm.ModelScopeAuthError("bad token")) as mock_generate:
                ok = gm.generate_all_images("2026-04-14", allow_fallback=True)

            self.assertTrue(ok)
            self.assertEqual(mock_generate.call_count, 1, "auth failure should short-circuit later API attempts")
            self.assertEqual((post_dir / "2026-04-14-value.jpg").read_bytes(), b"value-fallback")
            self.assertEqual((post_dir / "2026-04-14-tech.jpg").read_bytes(), b"tech-fallback")


if __name__ == "__main__":
    unittest.main()
