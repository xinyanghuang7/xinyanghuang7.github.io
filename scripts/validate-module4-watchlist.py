#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate daily blog Module 4 watchlist quality.

Checks intended to prevent a weak Module 4:
- each watchlist ticker appears independently, not only in merged rows;
- watchlist radar has explicit fact-node language;
- 4.1 / 4.2 use subordinate heading levels.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

WATCHLIST = ["TSM","MSFT","AMZN","GOOG","AAPL","JPM","AXP","V","KO","MCD","PG","JNJ","NFLX","CEG","FTNT"]
MERGED_PATTERNS = ["GOOG / AAPL", "JPM / AXP / V", "KO / MCD", "PG / JNJ", "NFLX / CEG / FTNT"]


def text_between(html: str, start_marker: str, end_marker: str) -> str:
    start = html.find(start_marker)
    if start < 0:
        raise AssertionError(f"missing marker: {start_marker}")
    end = html.find(end_marker, start)
    if end < 0:
        raise AssertionError(f"missing end marker: {end_marker}")
    return html[start:end]


def main() -> int:
    if len(sys.argv) != 2:
        print("Usage: validate-module4-watchlist.py posts/YYYY/MM/DD.html", file=sys.stderr)
        return 2
    path = Path(sys.argv[1])
    html = path.read_text(encoding="utf-8-sig")

    issues: list[str] = []

    if '<h4>4.1 ' not in html:
        issues.append("4.1 should use h4 subordinate heading")
    if '<h3>4.2 ' not in html:
        issues.append("4.2 CSP should use h3 subordinate heading, not h2")
    if '<a class="post-home-link post-home-link-hero"' not in html:
        issues.append("missing hero-visible return-home link")

    try:
        module4 = text_between(html, '<section class="article-section" id="market">', '<section class="article-section" id="csp-yield-radar">')
    except AssertionError as exc:
        issues.append(str(exc))
        module4 = ""

    for pat in MERGED_PATTERNS:
        if pat in module4:
            issues.append(f"merged watchlist row still present: {pat}")

    for ticker in WATCHLIST:
        # Require the ticker as its own table cell, not just inside prose.
        if f'<td>{ticker}</td>' not in module4:
            issues.append(f"watchlist ticker missing independent row: {ticker}")

    if module4.count("事实节点") < 2:
        issues.append("Module 4 should explicitly mention fact nodes for holdings/watchlist")
    for label in ["事实节点 1", "事实节点 1 / 2 / 3", "下一观察点"]:
        if label not in module4:
            issues.append(f"Module 4 missing label: {label}")

    if issues:
        print("Module 4 validation failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print("Module 4 watchlist validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
