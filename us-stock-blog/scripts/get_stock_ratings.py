#!/usr/bin/env python3
"""
股票交易评级获取模块
整合 TradingView 技术指标 + Yahoo Finance 分析师评级
"""

import asyncio
import json
import os
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List
from datetime import datetime, timedelta

# 尝试导入依赖，如果未安装则给出提示
try:
    from tradingview_ta import TA_Handler, Interval
    TRADINGVIEW_AVAILABLE = True
except ImportError:
    TRADINGVIEW_AVAILABLE = False
    print("[WARN] tradingview-ta not installed. Run: pip install tradingview-ta")

try:
    import yfinance as yf
    YFINANCE_AVAILABLE = True
except ImportError:
    YFINANCE_AVAILABLE = False
    print("[WARN] yfinance not installed. Run: pip install yfinance")


@dataclass
class TechnicalRating:
    """TradingView 技术指标评级"""
    recommendation: str  # STRONG_BUY, BUY, NEUTRAL, SELL, STRONG_SELL
    buy_count: int
    sell_count: int
    neutral_count: int
    score: float  # -2 到 +2 的标准化分数
    indicators: Dict[str, float]  # 具体指标数值
    timestamp: str


@dataclass
class AnalystRating:
    """Yahoo Finance 分析师评级"""
    recommendation: str  # 标准化后的推荐
    raw_recommendation: str  # 原始评级
    target_mean: Optional[float]
    target_high: Optional[float]
    target_low: Optional[float]
    current_price: Optional[float]
    upside_potential: Optional[float]  # 上涨潜力 %
    score: float  # -2 到 +2 的标准化分数
    total_ratings: int
    timestamp: str


@dataclass
class StockRating:
    """综合股票评级"""
    symbol: str
    company_name: str
    technical: Optional[TechnicalRating]
    analyst: Optional[AnalystRating]
    composite_score: float  # 综合评分 -2 到 +2
    composite_rating: str  # 最终评级
    confidence: str  # 高/中/低 - 基于数据完整度
    summary: str  # 一句话总结


# 评级映射字典：将各种文本描述标准化为 -2 到 +2 的分数
RATING_MAP = {
    # TradingView 标准
    "STRONG_BUY": 2,
    "BUY": 1,
    "NEUTRAL": 0,
    "SELL": -1,
    "STRONG_SELL": -2,
    # Yahoo Finance / 分析师评级变体
    "Strong Buy": 2,
    "Buy": 1,
    "Overweight": 1,
    "Outperform": 1,
    "Moderate Buy": 1,
    "Accumulate": 1,
    "Hold": 0,
    "Neutral": 0,
    "Market Perform": 0,
    "Equal-Weight": 0,
    "Underweight": -1,
    "Underperform": -1,
    "Moderate Sell": -1,
    "Sell": -1,
    "Strong Sell": -2,
}

# 反向映射：分数到中文评级
SCORE_TO_RATING = {
    2: ("强烈买入", "🚀 强烈买入"),
    1: ("买入", "📈 买入"),
    0: ("中性", "➖ 中性"),
    -1: ("卖出", "📉 卖出"),
    -2: ("强烈卖出", "🔻 强烈卖出"),
}


def normalize_rating(rating_text: str) -> tuple[float, str]:
    """将任意评级文本标准化为分数和统一描述"""
    if not rating_text:
        return 0, "中性"
    
    score = RATING_MAP.get(rating_text, 0)
    
    # 处理边界分数
    if score >= 1.5:
        rating_cn = "强烈买入"
    elif score >= 0.5:
        rating_cn = "买入"
    elif score > -0.5:
        rating_cn = "中性"
    elif score > -1.5:
        rating_cn = "卖出"
    else:
        rating_cn = "强烈卖出"
    
    return score, rating_cn


def get_tradingview_rating(symbol: str, exchange: str = "NASDAQ", 
                           screener: str = "america") -> Optional[TechnicalRating]:
    """
    从 TradingView 获取技术指标评级
    
    Args:
        symbol: 股票代码，如 "AAPL"
        exchange: 交易所，如 "NASDAQ", "NYSE"
        screener: 市场类别，如 "america", "crypto"
    """
    if not TRADINGVIEW_AVAILABLE:
        return None
    
    try:
        handler = TA_Handler(
            symbol=symbol,
            screener=screener,
            exchange=exchange,
            interval=Interval.INTERVAL_1_DAY
        )
        
        analysis = handler.get_analysis()
        summary = analysis.summary
        indicators = analysis.indicators
        
        # 获取关键指标
        key_indicators = {
            "RSI": indicators.get("RSI", 0),
            "MACD": indicators.get("MACD.macd", 0),
            "EMA20": indicators.get("EMA20", 0),
            "EMA50": indicators.get("EMA50", 0),
            "SMA200": indicators.get("SMA200", 0),
            "BB.upper": indicators.get("BB.upper", 0),
            "BB.lower": indicators.get("BB.lower", 0),
        }
        
        rec = summary.get("RECOMMENDATION", "NEUTRAL")
        score, _ = normalize_rating(rec)
        
        return TechnicalRating(
            recommendation=rec,
            buy_count=summary.get("BUY", 0),
            sell_count=summary.get("SELL", 0),
            neutral_count=summary.get("NEUTRAL", 0),
            score=score,
            indicators=key_indicators,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"[ERROR] TradingView failed for {symbol}: {e}")
        return None


def get_analyst_rating(symbol: str) -> Optional[AnalystRating]:
    """从 Yahoo Finance 获取分析师评级"""
    if not YFINANCE_AVAILABLE:
        return None
    
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        
        # 获取当前价格
        current_price = info.get("currentPrice") or info.get("regularMarketPrice")
        
        # 获取分析师目标价
        target_mean = info.get("targetMeanPrice")
        target_high = info.get("targetHighPrice")
        target_low = info.get("targetLowPrice")
        
        # 计算上涨潜力
        upside_potential = None
        if current_price and target_mean and current_price > 0:
            upside_potential = round((target_mean - current_price) / current_price * 100, 2)
        
        # 获取推荐数据（尝试多种字段）
        raw_rec = info.get("recommendationKey", "")
        if not raw_rec:
            # 尝试从其他字段获取
            raw_rec = info.get("recommendationMean", "")
            if isinstance(raw_rec, (int, float)):
                if raw_rec <= 1.5:
                    raw_rec = "Strong Buy"
                elif raw_rec <= 2.5:
                    raw_rec = "Buy"
                elif raw_rec <= 3.5:
                    raw_rec = "Hold"
                elif raw_rec <= 4.5:
                    raw_rec = "Sell"
                else:
                    raw_rec = "Strong Sell"
        
        score, normalized_rec = normalize_rating(raw_rec)
        
        # 获取总评级数量
        total_ratings = info.get("numberOfAnalystOpinions", 0)
        
        return AnalystRating(
            recommendation=normalized_rec,
            raw_recommendation=raw_rec,
            target_mean=target_mean,
            target_high=target_high,
            target_low=target_low,
            current_price=current_price,
            upside_potential=upside_potential,
            score=score,
            total_ratings=total_ratings,
            timestamp=datetime.now().isoformat()
        )
    except Exception as e:
        print(f"[ERROR] Yahoo Finance failed for {symbol}: {e}")
        return None


def calculate_composite_rating(technical: Optional[TechnicalRating], 
                               analyst: Optional[AnalystRating]) -> tuple[float, str, str]:
    """
    计算综合评级
    
    权重配置：
    - 技术面: 40%
    - 分析师评级: 60%
    
    Returns:
        (综合分数, 中文评级, 置信度)
    """
    scores = []
    weights = []
    
    if technical:
        scores.append(technical.score)
        weights.append(0.4)
    
    if analyst:
        scores.append(analyst.score)
        weights.append(0.6)
    
    if not scores:
        return 0, "数据不足", "低"
    
    # 加权平均
    composite_score = sum(s * w for s, w in zip(scores, weights)) / sum(weights)
    
    # 确定评级
    if composite_score >= 1.5:
        rating = "强烈买入"
    elif composite_score >= 0.5:
        rating = "买入"
    elif composite_score > -0.5:
        rating = "中性"
    elif composite_score > -1.5:
        rating = "卖出"
    else:
        rating = "强烈卖出"
    
    # 确定置信度
    data_sources = sum([1 for x in [technical, analyst] if x is not None])
    if data_sources == 2:
        confidence = "高"
    elif data_sources == 1:
        confidence = "中"
    else:
        confidence = "低"
    
    return round(composite_score, 2), rating, confidence


def generate_summary(rating: StockRating) -> str:
    """生成一句话总结"""
    parts = []
    
    if rating.technical:
        parts.append(f"技术面{rating.technical.recommendation.replace('_', '')}")
    
    if rating.analyst:
        if rating.analyst.upside_potential is not None:
            upside = f"目标价上涨空间{rating.analyst.upside_potential:+.1f}%"
            parts.append(upside)
    
    if rating.composite_rating in ["强烈买入", "买入"]:
        return f"【{rating.composite_rating}】" + "，".join(parts) + "，建议关注"
    elif rating.composite_rating in ["强烈卖出", "卖出"]:
        return f"【{rating.composite_rating}】" + "，".join(parts) + "，建议谨慎"
    else:
        return f"【{rating.composite_rating}】" + "，".join(parts) + "，建议观望"


def get_stock_rating(symbol: str, company_name: str = "", 
                     exchange: str = "NASDAQ") -> StockRating:
    """
    获取股票综合评级（主入口函数）
    
    Args:
        symbol: 股票代码
        company_name: 公司名称
        exchange: 交易所
    
    Returns:
        StockRating 对象
    """
    print(f"Fetching rating for {symbol}...")
    
    # 获取技术面评级
    technical = get_tradingview_rating(symbol, exchange)
    if technical:
        print(f"  [OK] TradingView: {technical.recommendation} (BUY:{technical.buy_count}/SELL:{technical.sell_count}/NEUTRAL:{technical.neutral_count})")
    
    # 获取分析师评级
    analyst = get_analyst_rating(symbol)
    if analyst:
        upside = f" | Upside: {analyst.upside_potential:+.1f}%" if analyst.upside_potential else ""
        print(f"  [OK] Yahoo Finance: {analyst.recommendation}{upside}")
    
    # 计算综合评级
    composite_score, composite_rating, confidence = calculate_composite_rating(technical, analyst)
    
    rating = StockRating(
        symbol=symbol,
        company_name=company_name or symbol,
        technical=technical,
        analyst=analyst,
        composite_score=composite_score,
        composite_rating=composite_rating,
        confidence=confidence,
        summary=""
    )
    
    rating.summary = generate_summary(rating)
    
    print(f"  [Result] Composite: {composite_rating} (Confidence: {confidence})")
    
    return rating


def get_stock_ratings_batch(symbols: List[Dict[str, str]]) -> List[StockRating]:
    """
    批量获取多只股票评级
    
    Args:
        symbols: 列表，每项包含 symbol, company_name, exchange
        示例: [{"symbol": "AAPL", "company_name": "Apple Inc.", "exchange": "NASDAQ"}]
    
    Returns:
        StockRating 列表
    """
    results = []
    for item in symbols:
        rating = get_stock_rating(
            symbol=item["symbol"],
            company_name=item.get("company_name", ""),
            exchange=item.get("exchange", "NASDAQ")
        )
        results.append(rating)
    return results


def rating_to_dict(rating: StockRating) -> dict:
    """将 StockRating 转换为字典（用于 JSON 序列化）"""
    result = {
        "symbol": rating.symbol,
        "company_name": rating.company_name,
        "composite_score": rating.composite_score,
        "composite_rating": rating.composite_rating,
        "confidence": rating.confidence,
        "summary": rating.summary,
    }
    
    if rating.technical:
        result["technical"] = {
            "recommendation": rating.technical.recommendation,
            "score": rating.technical.score,
            "buy_count": rating.technical.buy_count,
            "sell_count": rating.technical.sell_count,
            "neutral_count": rating.technical.neutral_count,
            "indicators": rating.technical.indicators,
        }
    
    if rating.analyst:
        result["analyst"] = {
            "recommendation": rating.analyst.recommendation,
            "raw_recommendation": rating.analyst.raw_recommendation,
            "score": rating.analyst.score,
            "current_price": rating.analyst.current_price,
            "target_mean": rating.analyst.target_mean,
            "target_high": rating.analyst.target_high,
            "target_low": rating.analyst.target_low,
            "upside_potential": rating.analyst.upside_potential,
            "total_ratings": rating.analyst.total_ratings,
        }
    
    return result


def format_rating_for_blog(rating: StockRating) -> str:
    """
    将评级格式化为博客可用的 HTML/Markdown 格式
    """
    lines = [
        f"<div class='stock-rating'>",
        f"  <div class='rating-header'>",
        f"    <span class='rating-badge rating-{rating.composite_rating.replace(' ', '-').lower()}'>{rating.composite_rating}</span>",
        f"    <span class='rating-confidence'>置信度: {rating.confidence}</span>",
        f"  </div>",
    ]
    
    if rating.technical:
        t = rating.technical
        lines.append(f"  <div class='rating-section'>")
        lines.append(f"    <h4>📈 技术指标 (TradingView)</h4>")
        lines.append(f"    <p>综合建议: <strong>{t.recommendation.replace('_', ' ')}</strong></p>")
        lines.append(f"    <p>指标统计: 买入{t.buy_count} | 卖出{t.sell_count} | 中性{t.neutral_count}</p>")
        if t.indicators.get("RSI"):
            lines.append(f"    <p>RSI: {t.indicators['RSI']:.2f}</p>")
        lines.append(f"  </div>")
    
    if rating.analyst:
        a = rating.analyst
        lines.append(f"  <div class='rating-section'>")
        lines.append(f"    <h4>🏦 分析师评级 (Yahoo Finance)</h4>")
        lines.append(f"    <p>综合建议: <strong>{a.recommendation}</strong> (基于{a.total_ratings}位分析师)</p>")
        if a.current_price and a.target_mean:
            lines.append(f"    <p>当前价: ${a.current_price:.2f} | 目标均价: ${a.target_mean:.2f}</p>")
        if a.upside_potential is not None:
            color = "green" if a.upside_potential > 0 else "red"
            lines.append(f"    <p>上涨潜力: <span style='color:{color}'>{a.upside_potential:+.1f}%</span></p>")
        lines.append(f"  </div>")
    
    lines.append(f"  <div class='rating-summary'>")
    lines.append(f"    <p>💡 {rating.summary}</p>")
    lines.append(f"  </div>")
    lines.append(f"</div>")
    
    return "\n".join(lines)


# ===== 命令行入口 =====
if __name__ == "__main__":
    import sys
    
    # 修复 Windows 控制台编码
    if sys.platform == "win32":
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    
    # 检查参数
    if len(sys.argv) < 2:
        print("Usage: python get_stock_ratings.py <SYMBOL> [EXCHANGE]")
        print("Example: python get_stock_ratings.py AAPL NASDAQ")
        print("         python get_stock_ratings.py VST NYSE")
        sys.exit(1)
    
    symbol = sys.argv[1].upper()
    exchange = sys.argv[2].upper() if len(sys.argv) > 2 else "NASDAQ"
    
    # 获取评级
    rating = get_stock_rating(symbol, exchange=exchange)
    
    # 输出 JSON 格式
    print("\n" + "="*50)
    print("JSON Output:")
    print("="*50)
    print(json.dumps(rating_to_dict(rating), indent=2, ensure_ascii=False))
    
    # 输出 HTML 格式
    print("\n" + "="*50)
    print("HTML Output (ready for blog):")
    print("="*50)
    print(format_rating_for_blog(rating))
