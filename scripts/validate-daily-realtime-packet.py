#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Validate Daily Realtime Input Packet freshness coverage."""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REQUIRED_HOLDINGS = {"META", "NVDA", "NBIS", "BOXX"}
REQUIRED_WATCHLIST = {"TSM", "MSFT", "GOOG", "KO", "MCD", "AAPL", "JPM", "AXP", "AMZN", "PG", "JNJ", "V", "NFLX", "CEG", "FTNT"}


def fail(issues: list[str]) -> int:
    print("Daily realtime packet validation failed:")
    for i in issues:
        print(f"- {i}")
    return 1


def main() -> int:
    if len(sys.argv) < 2:
        print("Usage: validate-daily-realtime-packet.py packet.json [post.html]", file=sys.stderr)
        return 2
    packet_path = Path(sys.argv[1])
    post_path = Path(sys.argv[2]) if len(sys.argv) > 2 else None
    packet = json.loads(packet_path.read_text(encoding="utf-8-sig"))
    issues: list[str] = []

    if packet.get("schema") != "daily-realtime-input.v1":
        issues.append("schema must be daily-realtime-input.v1")
    date = packet.get("date")
    if not re.match(r"^\d{4}-\d{2}-\d{2}$", str(date)):
        issues.append("date must be YYYY-MM-DD")

    holdings = {x.get("ticker"): x for x in packet.get("holdings", [])}
    watchlist = {x.get("ticker"): x for x in packet.get("watchlist", [])}
    missing_holdings = REQUIRED_HOLDINGS - set(holdings)
    if missing_holdings:
        issues.append(f"missing holdings: {sorted(missing_holdings)}")
    missing_watchlist = REQUIRED_WATCHLIST - set(watchlist)
    if missing_watchlist:
        issues.append(f"missing watchlist tickers: {sorted(missing_watchlist)}")

    for group_name, group in [("holding", holdings), ("watchlist", watchlist)]:
        for ticker, item in sorted(group.items()):
            if item.get("retrieval_status") != "checked":
                issues.append(f"{group_name} {ticker}: retrieval_status not checked")
            price = item.get("price_snapshot", {})
            if ticker != "BOXX" and price.get("status") not in {"ok", "failed"}:
                issues.append(f"{group_name} {ticker}: price snapshot retrieval status missing")
            if ticker != "BOXX" and price.get("status") == "failed" and not price.get("error"):
                issues.append(f"{group_name} {ticker}: failed price retrieval missing error")
            nodes = item.get("news_nodes", [])
            if ticker == "BOXX" and not nodes:
                # BOXX is a cash-management position; source role is enough.
                continue
            if not nodes:
                issues.append(f"{group_name} {ticker}: missing news/source retrieval node")
            for node in nodes:
                if not node.get("source") or not node.get("retrieved_at") or not node.get("freshness_status"):
                    issues.append(f"{group_name} {ticker}: source node missing source/retrieved_at/freshness_status")
            if not item.get("daily_blog_stub", {}).get("status"):
                issues.append(f"{group_name} {ticker}: missing daily_blog_stub status")
            csp = item.get("csp_status", {})
            if ticker != "BOXX" and not csp.get("status"):
                issues.append(f"{group_name} {ticker}: missing csp status")
            if csp.get("status") == "screened" and not isinstance(csp.get("contracts"), list):
                issues.append(f"{group_name} {ticker}: screened csp status missing contracts list")
            if group_name == "watchlist" and not item.get("blog_requirements"):
                issues.append(f"watchlist {ticker}: missing blog requirements")

    creators = packet.get("creators", [])
    if len(creators) < 3:
        issues.append("creator packet must include 3 fixed sources")
    for c in creators:
        name = c.get("name")
        status = c.get("status")
        if not status or not c.get("retrieved_at"):
            issues.append(f"creator {name}: missing status/retrieved_at")
            continue
        if isinstance(status, str) and status.startswith("channel_probe_"):
            issues.append(f"creator {name}: legacy shallow channel_probe status is no longer allowed; must use real recent-video probe")
        if not str(c.get("url", "")).startswith("local:"):
            recent = c.get("recent_probe")
            if not isinstance(recent, dict):
                issues.append(f"creator {name}: missing recent_probe from real channel fetch")
                continue
            recent_status = recent.get("status")
            if recent_status not in {"channel_recent_ok", "channel_recent_empty", "channel_recent_failed", "channel_recent_error", "channel_recent_script_missing"}:
                issues.append(f"creator {name}: unexpected recent_probe status {recent_status}")
            if recent_status in {"channel_recent_failed", "channel_recent_error", "channel_recent_script_missing"} and not recent.get("error"):
                issues.append(f"creator {name}: failed recent_probe missing explicit error")

    if post_path and post_path.exists():
        html = post_path.read_text(encoding="utf-8-sig")
        if date and date.replace("-", "/") not in html and date not in html:
            issues.append("post does not visibly include packet date")
        for ticker in REQUIRED_WATCHLIST:
            if f"<td>{ticker}</td>" not in html:
                issues.append(f"post missing independent watchlist row for {ticker}")

    if issues:
        return fail(issues)
    print("Daily realtime packet validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
