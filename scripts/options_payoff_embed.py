from __future__ import annotations

import importlib.util
import re
import sys
from functools import lru_cache
from pathlib import Path

PAYOFF_TOKEN_HTML_RE = re.compile(r"<p>\s*\[payoff-chart:([A-Za-z0-9._-]+)\]\s*</p>")


@lru_cache(maxsize=1)
def _load_renderer():
    workspace_root = Path(__file__).resolve().parents[2]
    module_path = workspace_root / "skills" / "options-payoff-diagrams" / "scripts" / "render_payoff_chart.py"
    spec = importlib.util.spec_from_file_location("options_payoff_chart_renderer", module_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Could not load payoff chart renderer from {module_path}")
    module = importlib.util.module_from_spec(spec)
    sys.modules.setdefault(spec.name, module)
    spec.loader.exec_module(module)
    return module


def spec_path_for_token(workspace_root: Path, token: str) -> Path:
    candidates = [
        workspace_root / "skills" / "options-payoff-diagrams" / "assets" / "specs" / f"{token}.json",
        Path(__file__).resolve().parents[2] / "skills" / "options-payoff-diagrams" / "assets" / "specs" / f"{token}.json",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return candidates[0]


def expand_payoff_chart_tokens(rendered_html: str, workspace_root: Path) -> str:
    renderer = _load_renderer()

    def replace(match: re.Match[str]) -> str:
        token = match.group(1)
        spec_path = spec_path_for_token(workspace_root, token)
        if not spec_path.exists():
            raise FileNotFoundError(f"Payoff chart spec not found for token '{token}': {spec_path}")
        spec = renderer.load_spec(spec_path)
        return renderer.html_fragment(spec)

    return PAYOFF_TOKEN_HTML_RE.sub(replace, rendered_html)
