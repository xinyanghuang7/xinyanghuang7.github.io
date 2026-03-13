#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
读取 Portfolio Tracker 持仓数据
输出格式供其他脚本使用
"""

import json
import sys
from pathlib import Path

# Portfolio Tracker 安装在 ~/.openclaw/skills/portfolio-tracker/
PORTFOLIO_FILE = Path.home() / ".openclaw" / "skills" / "portfolio-tracker" / "data" / "portfolio.json"

def load_portfolio():
    """读取并返回持仓数据"""
    if not PORTFOLIO_FILE.exists():
        print(f"错误: 未找到持仓文件 {PORTFOLIO_FILE}", file=sys.stderr)
        return None
    
    with open(PORTFOLIO_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    return data

def get_holdings_list():
    """获取简化的持仓列表"""
    data = load_portfolio()
    if not data:
        return []
    
    holdings = []
    for h in data.get("holdings", []):
        holdings.append({
            "code": h["code"],
            "name": h["name"],
            "shares": h["shares"],
            "avg_cost": h["avg_cost"],
            "total_cost": h["total_cost"]
        })
    return holdings

def get_holdings_codes():
    """获取持仓代码列表"""
    return [h["code"] for h in get_holdings_list()]

def print_portfolio_summary():
    """打印持仓摘要"""
    data = load_portfolio()
    if not data:
        print("无持仓数据")
        return
    
    holdings = data.get("holdings", [])
    summary = data.get("summary", {})
    
    print(f"持仓标的数: {len(holdings)}")
    print(f"总资产: ${summary.get('total_assets', 0):,.2f}")
    print(f"总成本: ${summary.get('total_cost', 0):,.2f}")
    print()
    print("持仓明细:")
    for h in holdings:
        print(f"  {h['code']}: {h['shares']}股 @ ${h['avg_cost']:.2f} (总成本 ${h['total_cost']:.2f})")

if __name__ == '__main__':
    print_portfolio_summary()
