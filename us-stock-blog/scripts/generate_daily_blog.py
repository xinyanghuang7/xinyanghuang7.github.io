#!/usr/bin/env python3
"""
每日博客生成器 - 自动提取股票代码并添加投资评级
"""

import re
import os
import sys
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Set

# 添加脚本目录到路径
sys.path.insert(0, str(Path(__file__).parent))

from get_stock_ratings import (
    get_stock_rating, 
    get_stock_ratings_batch,
    rating_to_dict,
    format_rating_for_blog
)

# 常见股票代码映射（用于识别）
STOCK_ALIASES = {
    # 科技巨头
    "AAPL": ["Apple", "苹果", "苹果公司"],
    "MSFT": ["Microsoft", "微软"],
    "GOOGL": ["Google", "Alphabet", "谷歌"],
    "GOOG": ["Google", "Alphabet", "谷歌"],
    "AMZN": ["Amazon", "亚马逊"],
    "META": ["Meta", "Facebook", "脸书"],
    "NVDA": ["NVIDIA", "英伟达"],
    "TSLA": ["Tesla", "特斯拉"],
    "NFLX": ["Netflix", "奈飞"],
    
    # 半导体
    "AMD": ["AMD", "超微半导体"],
    "INTC": ["Intel", "英特尔"],
    "TSM": ["TSMC", "台积电"],
    "QCOM": ["Qualcomm", "高通"],
    "AVGO": ["Broadcom", "博通"],
    
    # 金融
    "JPM": ["JPMorgan", "摩根大通"],
    "BAC": ["Bank of America", "美国银行", "美银"],
    "GS": ["Goldman Sachs", "高盛"],
    
    # 能源
    "VST": ["Vistra", "Vistra Corp"],
    "NEE": ["NextEra Energy", "新纪元能源"],
    "XOM": ["Exxon Mobil", "埃克森美孚"],
    
    # 其他热门
    "PLTR": ["Palantir"],
    "COIN": ["Coinbase"],
    "HOOD": ["Robinhood"],
    "NBIS": ["Nebius"],
}

# 交易所映射
EXCHANGE_MAP = {
    "AAPL": "NASDAQ", "MSFT": "NASDAQ", "GOOGL": "NASDAQ", "GOOG": "NASDAQ",
    "AMZN": "NASDAQ", "META": "NASDAQ", "NVDA": "NASDAQ", "TSLA": "NASDAQ",
    "NFLX": "NASDAQ", "AMD": "NASDAQ", "INTC": "NASDAQ", "QCOM": "NASDAQ",
    "AVGO": "NASDAQ", "PLTR": "NASDAQ", "COIN": "NASDAQ", "HOOD": "NASDAQ",
    "NBIS": "NASDAQ",
    "TSM": "NYSE", "JPM": "NYSE", "BAC": "NYSE", "GS": "NYSE",
    "VST": "NYSE", "NEE": "NYSE", "XOM": "NYSE",
}


def extract_stock_symbols(text: str) -> Set[str]:
    """
    从博客文本中提取股票代码
    
    策略:
    1. 匹配大写的 1-5 字母股票代码（通常格式）
    2. 匹配已知公司名称并映射到代码
    """
    symbols = set()
    
    # 方法1: 正则匹配常见股票代码格式
    # 匹配空格或括号后的 1-5 个大写字母，后面可能是数字或空格
    pattern = r'[\s\(]([A-Z]{1,5})[\s\)]'
    matches = re.findall(pattern, text)
    
    for match in matches:
        # 过滤掉常见非股票的大写单词
        if match not in ['CEO', 'CFO', 'USA', 'AI', 'API', 'IPO', 'EPS', 'PE', 'ETF', 'THE', 'AND', 'FOR']:
            if len(match) >= 1 and len(match) <= 5:
                symbols.add(match)
    
    # 方法2: 匹配已知公司名称
    text_upper = text.upper()
    for symbol, aliases in STOCK_ALIASES.items():
        for alias in aliases:
            if alias.upper() in text_upper:
                symbols.add(symbol)
                break
    
    return symbols


def get_exchange(symbol: str) -> str:
    """获取股票所在交易所"""
    return EXCHANGE_MAP.get(symbol, "NASDAQ")  # 默认为 NASDAQ


def generate_daily_blog_with_ratings(
    blog_content: str,
    symbols: Optional[Set[str]] = None,
    title: str = "美股每日财经博客",
    date: Optional[str] = None
) -> str:
    """
    生成带投资评级的博客内容
    
    Args:
        blog_content: 原始博客内容
        symbols: 指定股票代码（可选，如不指定则自动提取）
        title: 博客标题
        date: 日期（默认今天）
    
    Returns:
        完整的博客 HTML
    """
    if date is None:
        date = datetime.now().strftime("%Y年%m月%d日")
    
    # 如果没有指定股票代码，自动提取
    if symbols is None:
        symbols = extract_stock_symbols(blog_content)
    
    print(f"🔍 识别到股票代码: {', '.join(sorted(symbols))}")
    
    # 获取评级
    ratings = []
    if symbols:
        stock_list = [
            {"symbol": s, "exchange": get_exchange(s)}
            for s in symbols
        ]
        ratings = get_stock_ratings_batch(stock_list)
    
    # 生成评级汇总 HTML
    ratings_html = generate_ratings_summary(ratings)
    
    # 组装完整博客
    full_blog = f"""{blog_content}

<!-- 投资评级汇总 - 自动生成 -->
<section class="section" id="ratings-summary">
    <div class="section-header">
        <div class="section-number">★</div>
        <h2 class="section-title">本文提及标的投资评级汇总</h2>
        <div class="section-date">{date}</div>
    </div>
    
    <div style="background: linear-gradient(135deg, #faf8f5 0%, #f0ebe3 100%); padding: 30px; border-radius: 12px; border: 1px solid var(--color-border);">
        <p style="margin-bottom: 20px; color: var(--color-text-light);">
            以下评级基于 <strong>TradingView 技术指标</strong> (40% 权重) + <strong>Yahoo Finance 分析师评级</strong> (60% 权重) 综合计算。
            数据仅供参考，不构成投资建议。
        </p>
        
        {ratings_html}
        
        <div style="margin-top: 25px; padding: 15px; background: var(--color-dark); color: white; border-radius: 8px; font-size: 13px;">
            <p style="margin: 0;">💡 <strong>评级说明：</strong> 🚀强烈买入(+2) → 📈买入(+1) → ➖中性(0) → 📉卖出(-1) → 🔻强烈卖出(-2) | 置信度: 高=双数据源 / 中=单数据源</p>
        </div>
    </div>
</section>
"""
    
    return full_blog


def generate_ratings_summary(ratings: List) -> str:
    """生成评级汇总表格 HTML"""
    if not ratings:
        return "<p>未识别到可评级的股票代码。</p>"
    
    rows = []
    for r in ratings:
        badge_class = f"rating-{r.composite_rating.replace(' ', '-')}"
        emoji = {"强烈买入": "🚀", "买入": "📈", "中性": "➖", "卖出": "📉", "强烈卖出": "🔻"}.get(r.composite_rating, "➖")
        
        # 技术面信息
        tech_info = "-"
        if r.technical:
            tech_info = f"{r.technical.recommendation.replace('_', ' ')} ({r.technical.buy_count}/{r.technical.sell_count}/{r.technical.neutral_count})"
        
        # 分析师信息
        analyst_info = "-"
        if r.analyst:
            upside = f"{r.analyst.upside_potential:+.1f}%" if r.analyst.upside_potential else "N/A"
            analyst_info = f"{r.analyst.recommendation} | 目标{upside}"
        
        rows.append(f"""
        <tr style="border-bottom: 1px solid var(--color-border);">
            <td style="padding: 15px; font-weight: 600;">{r.symbol}</td>
            <td style="padding: 15px;">
                <span class="rating-badge {badge_class}" style="padding: 6px 12px; border-radius: 20px; font-size: 13px; color: white;">{emoji} {r.composite_rating}</span>
            </td>
            <td style="padding: 15px; color: var(--color-text-light); font-size: 14px;">{r.composite_score:+.2f}</td>
            <td style="padding: 15px; color: var(--color-text-light); font-size: 14px;">{r.confidence}</td>
            <td style="padding: 15px; color: var(--color-text-light); font-size: 13px;">{tech_info}</td>
            <td style="padding: 15px; color: var(--color-text-light); font-size: 13px;">{analyst_info}</td>
        </tr>
        """)
    
    return f"""
    <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--color-dark); color: white;">
                    <th style="padding: 12px 15px; text-align: left; font-weight: 600;">代码</th>
                    <th style="padding: 12px 15px; text-align: left; font-weight: 600;">综合评级</th>
                    <th style="padding: 12px 15px; text-align: left; font-weight: 600;">分数</th>
                    <th style="padding: 12px 15px; text-align: left; font-weight: 600;">置信度</th>
                    <th style="padding: 12px 15px; text-align: left; font-weight: 600;">技术面</th>
                    <th style="padding: 12px 15px; text-align: left; font-weight: 600;">分析师</th>
                </tr>
            </thead>
            <tbody>
                {''.join(rows)}
            </tbody>
        </table>
    </div>
    """


def main():
    """命令行入口"""
    import argparse
    
    parser = argparse.ArgumentParser(description="每日博客生成器 - 自动添加投资评级")
    parser.add_argument("--input", "-i", help="输入博客内容文件路径")
    parser.add_argument("--output", "-o", help="输出文件路径")
    parser.add_argument("--symbols", "-s", help="指定股票代码（逗号分隔，如 AAPL,MSFT,NVDA）")
    parser.add_argument("--title", "-t", default="美股每日财经博客", help="博客标题")
    
    args = parser.parse_args()
    
    # 读取输入
    if args.input:
        with open(args.input, 'r', encoding='utf-8') as f:
            content = f.read()
    else:
        print("请使用 --input 指定博客内容文件，或直接输入内容（Ctrl+D 结束）：")
        content = sys.stdin.read()
    
    # 解析指定股票代码
    symbols = None
    if args.symbols:
        symbols = set(s.strip().upper() for s in args.symbols.split(','))
    
    # 生成带评级的博客
    print("\n📝 正在生成博客内容...")
    blog_with_ratings = generate_daily_blog_with_ratings(
        blog_content=content,
        symbols=symbols,
        title=args.title
    )
    
    # 输出
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(blog_with_ratings)
        print(f"\n✅ 已保存到: {args.output}")
    else:
        print("\n" + "="*60)
        print("生成的博客内容:")
        print("="*60)
        print(blog_with_ratings)


if __name__ == "__main__":
    main()
