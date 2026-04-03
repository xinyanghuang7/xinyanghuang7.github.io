from __future__ import annotations

import importlib.util
import re
import sys
from functools import lru_cache
from pathlib import Path
import os

PAYOFF_TOKEN_HTML_RE = re.compile(r"<p>\s*\[payoff-chart:([A-Za-z0-9._-]+)\]\s*</p>")


def _resolve_workspace_root() -> Path:
    candidates: list[Path] = []
    for key in ("OPENCLAW_WORKSPACE_ROOT", "OPENCLAW_WORKSPACE", "WORKSPACE_ROOT"):
        value = os.environ.get(key)
        if value:
            candidates.append(Path(value).expanduser())

    repo = Path(__file__).resolve()
    candidates.extend(repo.parents)
    candidates.append(Path.home() / ".openclaw" / "workspace")

    seen: set[Path] = set()
    for candidate in candidates:
        resolved = candidate.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        if (resolved / "skills" / "options-payoff-diagrams" / "scripts" / "render_payoff_chart.py").exists():
            return resolved

    return (Path.home() / ".openclaw" / "workspace").resolve()


@lru_cache(maxsize=1)
def _load_renderer():
    workspace_root = _resolve_workspace_root()
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
        Path(__file__).resolve().parent.parent / "scripts" / "payoff-specs" / f"{token}.json",
        workspace_root / "skills" / "options-payoff-diagrams" / "assets" / "specs" / f"{token}.json",
        _resolve_workspace_root() / "skills" / "options-payoff-diagrams" / "assets" / "specs" / f"{token}.json",
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
