#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整博客生成脚本 - 调用真实数据源
"""

import json
import argparse
import subprocess
import sys
import os
import html as html_lib
from pathlib import Path
from datetime import datetime

import requests

# ============ 路径配置 ============
BASE_DIR = Path(__file__).parent.parent
PORTFOLIO_FILE = Path.home() / ".openclaw" / "skills" / "portfolio-tracker" / "data" / "portfolio.json"
STOCK_RECOMMENDER_SCRIPT = Path.home() / ".openclaw" / "skills" / "stock-recommender" / "scripts" / "recommender.py"
IMAGES_DIR = BASE_DIR / "images"
POSTS_DIR = BASE_DIR / "posts"
GENERATE_IMAGE_SCRIPT = BASE_DIR / "scripts" / "generate_images.py"
DEPLOY_SCRIPT = BASE_DIR / "scripts" / "deploy.py"
SYNC_SCRIPT = BASE_DIR / "scripts" / "sync-site-data.py"
QA_SCRIPT = BASE_DIR / "scripts" / "qa-site.ps1"

# ============ 工具函数 ============

def run_cmd(cmd, timeout=30):
    """执行命令"""
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, shell=False)
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return -1, "", str(e)

def load_portfolio():
    """读取持仓"""
    if not PORTFOLIO_FILE.exists():
        print(f"警告: 未找到持仓文件 {PORTFOLIO_FILE}")
        return {"holdings": []}
    
    with open(PORTFOLIO_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def get_stock_recommendation():
    """获取推荐标的（JSON格式）"""
    if not STOCK_RECOMMENDER_SCRIPT.exists():
        return None
    
    code, out, err = run_cmd([sys.executable, str(STOCK_RECOMMENDER_SCRIPT), "--json"], timeout=60)
    if code != 0 or not out:
        return None
    
    try:
        return json.loads(out)
    except:
        return None

def get_finnhub_data(symbol):
    """获取 Finnhub 数据"""
    import requests
    
    token = os.environ.get('FINNHUB_API_KEY')
    if not token:
        return None
    
    try:
        # 获取实时报价
        quote_url = f'https://finnhub.io/api/v1/quote?symbol={symbol}&token={token}'
        r = requests.get(quote_url, timeout=5)
        if r.status_code != 200:
            return None
        
        quote = r.json()
        
        # 获取公司信息
        profile_url = f'https://finnhub.io/api/v1/stock/profile2?symbol={symbol}&token={token}'
        r2 = requests.get(profile_url, timeout=5)
        profile = r2.json() if r2.status_code == 200 else {}
        
        # 获取目标价
        target_url = f'https://finnhub.io/api/v1/stock/price-target?symbol={symbol}&token={token}'
        r3 = requests.get(target_url, timeout=5)
        target_data = r3.json() if r3.status_code == 200 else {}
        
        return {
            'current_price': quote.get('c'),
            'change_percent': quote.get('dp'),
            'company_name': profile.get('name', symbol),
            'industry': profile.get('finnhubIndustry', ''),
            'target_high': target_data.get('targetHigh'),
            'target_median': target_data.get('targetMedian'),
            'target_low': target_data.get('targetLow')
        }
    except Exception as e:
        print(f"Finnhub 错误: {e}", file=sys.stderr)
        return None

def get_tavily_news(symbol, company_name="", thesis_hint="", max_items=2):
    """获取最新且最重要的新闻，供“新闻内容 + 专属解读”双板块使用。"""
    api_key = (os.environ.get('TAVILY_API_KEY') or '').strip()
    if not api_key:
        return []

    query_parts = [symbol]
    if company_name:
        query_parts.append(company_name)
    if thesis_hint:
        query_parts.append(thesis_hint)
    query_parts.extend([
        'latest important stock news',
        'thesis risk catalyst',
    ])

    body = {
        'api_key': api_key,
        'query': ' '.join(part for part in query_parts if part),
        'topic': 'news',
        'time_range': 'week',
        'search_depth': 'basic',
        'count': max_items,
        'include_answer': False,
        'include_raw_content': False,
    }

    try:
        resp = requests.post('https://api.tavily.com/search', json=body, timeout=20)
        resp.raise_for_status()
        payload = resp.json()
    except Exception as exc:
        print(f"Tavily 新闻检索失败 ({symbol}): {exc}", file=sys.stderr)
        return []

    results = []
    for item in payload.get('results', [])[:max_items]:
        title = (item.get('title') or '').strip()
        snippet = (item.get('snippet') or '').strip()
        url = (item.get('url') or '').strip()
        site = (item.get('siteName') or '').strip()
        if not title or not url:
            continue
        results.append({
            'title': title,
            'snippet': snippet,
            'url': url,
            'site': site or '来源链接',
        })
    return results


def build_news_cards(tracked_assets, thesis_hint=''):
    """构建第三部分：新闻内容 + 专属解读双板块。"""
    cards = []
    for asset in tracked_assets:
        symbol = asset.get('symbol') or ''
        company_name = asset.get('name') or symbol
        position_note = asset.get('position_note') or '保持跟踪，不把一天波动直接升级成动作。'
        interpretation = asset.get('interpretation') or '更重要的不是 headline 本身，而是它有没有改变 thesis 的兑现路径。'
        news_items = get_tavily_news(symbol, company_name, thesis_hint=thesis_hint, max_items=2)

        if news_items:
            news_html = []
            interp_html = []
            for index, item in enumerate(news_items, start=1):
                news_html.append(
                    f'<article class="news-bullet">'
                    f'<h4>{html_lib.escape(item["title"])}</h4>'
                    f'<p>{html_lib.escape(item["snippet"] or "这条新闻目前最值得先记住标题和来源，再看它会不会改变更长期的判断。")} </p>'
                    f'<div class="news-meta-row">'
                    f'<span class="news-meta-pill">最新要点 {index}</span>'
                    f'<span class="news-meta-pill"><a class="news-source-link" href="{html_lib.escape(item["url"])}">{html_lib.escape(item["site"])} ↗</a></span>'
                    f'</div>'
                    f'</article>'
                )
                interp_html.append(
                    f'<div class="news-interpretation-item">'
                    f'<h4>这条新闻为什么值得看</h4>'
                    f'<p>{html_lib.escape(interpretation)}</p>'
                    f'<p style="margin-top:0.55rem;">如果 {html_lib.escape(symbol)} 后续继续围绕这类主题反复出现，真正要确认的不是标题热度，而是它有没有进一步强化兑现路径、预算承接或平台边界。</p>'
                    f'</div>'
                )
            news_block = ''.join(news_html)
            interp_block = ''.join(interp_html)
        else:
            news_block = (
                '<article class="news-bullet">'
                '<h4>暂未抓到足够新的高权重新闻</h4>'
                '<p>当检索不到高质量结果时，不强行用旧闻凑数；这一格只保留需要继续跟踪的核心变量。</p>'
                '<div class="news-meta-row"><span class="news-meta-pill">等待更新</span></div>'
                '</article>'
            )
            interp_block = (
                '<div class="news-interpretation-item">'
                '<h4>当前更该盯什么</h4>'
                f'<p>{html_lib.escape(interpretation)}</p>'
                '</div>'
            )

        cards.append(
            f'<article class="stock-detail-card news-evidence-card">'
            f'<div class="stock-detail-header">'
            f'<div><div class="stock-detail-ticker">{html_lib.escape(symbol)}</div>'
            f'<div class="stock-detail-name">{html_lib.escape(company_name)}</div></div>'
            f'</div>'
            f'<div class="highlight-box tip" style="margin:1rem 0 1.25rem;">'
            f'<strong>跟踪边界：</strong> {html_lib.escape(position_note)}'
            f'</div>'
            f'<div class="news-signal-grid">'
            f'<section class="news-stream-panel"><div class="news-panel-kicker">Latest News</div><div class="news-bullet-list">{news_block}</div></section>'
            f'<section class="news-interpretation-panel"><div class="news-panel-kicker">What It Means</div><div class="news-interpretation-list">{interp_block}</div></section>'
            f'</div>'
            f'</article>'
        )
    return ''.join(cards)


def generate_images(date_str, focus_stock):
    """生成配图"""
    value_img = IMAGES_DIR / "posts" / f"{date_str}-value.jpg"
    tech_img = IMAGES_DIR / "posts" / f"{date_str}-tech.jpg"
    
    if value_img.exists() and tech_img.exists():
        print("图片已存在")
        return True
    
    if not GENERATE_IMAGE_SCRIPT.exists():
        print(f"警告: 未找到图片生成脚本")
        return False
    
    print("正在生成图片...")
    code, out, err = run_cmd([sys.executable, str(GENERATE_IMAGE_SCRIPT), "--date", date_str], timeout=420)
    if out:
        print(out)
    if err:
        print(err)
    return code == 0 and value_img.exists() and tech_img.exists()

def build_html(date_obj, recommendation_data, finnhub_data, portfolio):
    """构建完整 HTML"""
    date_str = date_obj.strftime("%Y-%m-%d")
    display_date = f"{date_obj.year}年{date_obj.month}月{date_obj.day}日"
    date_short = f"{date_obj.year}/{date_obj.month:02d}/{date_obj.day:02d}"
    
    # 提取推荐数据
    rec = recommendation_data['recommendation']
    focus_stock = rec['symbol']
    company_name = finnhub_data['company_name'] if finnhub_data else rec['name']
    current_price = finnhub_data['current_price'] if finnhub_data else None
    target_price = finnhub_data['target_median'] if finnhub_data else None
    
    # 核心逻辑
    logic_points = rec.get('logic', [])
    logic_html = "\n".join([f"<li><strong>亮点{i+1}:</strong> {point}</li>" 
                            for i, point in enumerate(logic_points[:3])])
    
    # 风险提示（简化版）
    risks = [
        "市场波动风险",
        "行业竞争加剧",
        "监管政策变化"
    ]
    risk_html = "\n".join([f"<li><strong>风险{i+1}:</strong> {risk}</li>" 
                           for i, risk in enumerate(risks[:2])])
    
    # 持仓视角
    holdings = portfolio.get("holdings", [])
    in_portfolio = any(h["code"] == focus_stock for h in holdings)
    portfolio_view = ""
    if in_portfolio:
        h = next(x for x in holdings if x["code"] == focus_stock)
        portfolio_view = f"""
        <div class="highlight-box portfolio" style="border-left-color: #d4af37;">
            <h4>我的持仓视角</h4>
            <p><strong>当前持仓:</strong> {h['shares']}股 @ ${h['avg_cost']:.2f}</p>
            <p><strong>策略建议:</strong> 根据当前价格和基本面，建议继续持有并关注长期价值。</p>
        </div>
"""
    
    tracked_assets = []
    seen_symbols = set()
    thesis_hint = 'platform execution capital allocation latest important news'
    for holding in holdings[:3]:
        ticker = holding.get('code') or ''
        if not ticker or ticker in seen_symbols:
            continue
        seen_symbols.add(ticker)
        tracked_assets.append({
            'symbol': ticker,
            'name': holding.get('name', ticker),
            'position_note': f"持有 {holding.get('shares', '--')} 股，成本 ${holding.get('avg_cost', 0):.2f}。先看最新高权重新闻有没有真的改变长期 thesis，再决定是否调整。",
            'interpretation': f"{ticker} 现在更值得盯的是最新高权重新闻会不会改变兑现速度、预算承接或平台边界，而不是只把 headline 本身翻译成短线动作。",
        })

    if not tracked_assets:
        tracked_assets.append({
            'symbol': focus_stock,
            'name': company_name,
            'position_note': '当前无公开持仓时，也要保留一张前台跟踪卡，先盯最新且最重要的新闻，再决定是否提升研究优先级。',
            'interpretation': f'{focus_stock} 更该被拆成“最新事实”和“为什么重要”两层，而不是只看当天热度。',
        })

    market_cards_html = build_news_cards(tracked_assets, thesis_hint=thesis_hint)

    # 价格显示
    price_display = f"${current_price:.2f}" if current_price else "待更新"
    target_display = f"${target_price:.2f}" if target_price else "待更新"
    upside = f"+{((target_price - current_price) / current_price * 100):.1f}%" if current_price and target_price else "待更新"
    
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{date_str} 美股分析: {focus_stock} 深度研究">
    <meta name="theme-color" content="#ECE9E0">
    <link rel="icon" type="image/svg+xml" href="../../../favicon.svg">
    <link rel="canonical" href="https://4fire.qzz.io/posts/{date_obj.year}/{date_obj.month:02d}/{date_obj.day:02d}.html">
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://4fire.qzz.io/posts/{date_obj.year}/{date_obj.month:02d}/{date_obj.day:02d}.html">
    <meta property="og:title" content="{date_str} 美股分析: {focus_stock} | 美股价值投资笔记">
    <meta property="og:description" content="{date_str} 美股分析: {focus_stock} 深度研究">
    <meta property="og:image" content="https://4fire.qzz.io/images/posts/{date_str}-value.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{date_str} 美股分析: {focus_stock} | 美股价值投资笔记">
    <meta name="twitter:description" content="{date_str} 美股分析: {focus_stock} 深度研究">
    <meta name="twitter:image" content="https://4fire.qzz.io/images/posts/{date_str}-value.jpg">
    <meta name="keywords" content="美股,{focus_stock},价值投资,长期持有,股票分析">
    <title>{date_str} 美股分析: {focus_stock} | 美股价值投资笔记</title>
    <link rel="stylesheet" href="../../../css/style.css?v=20260418comfort1">
</head>
<body>
    <!-- Scroll Progress Bar -->
    <div class="progress-bar" id="progressBar"></div>

    <header id="header">
        <div class="nav-container">
            <a href="../../../index.html" class="logo">Value<span>Invest</span></a>
            <ul class="nav-links">
                <li><a href="../../../index.html#about">关于</a></li>
                <li><a href="../../../index.html#archive">文章目录</a></li>
            </ul>
            <div class="nav-date">{display_date}</div>
        </div>
    </header>

    <section class="hero">
        <div class="hero-bg-pattern" style="background-image: url('../../../images/hero-bg.jpg');"></div>
        <div class="hero-content">
            <div class="subtitle">Daily Research Note</div>
            <h1>{focus_stock} 跟踪笔记</h1>
            <p class="tagline">先把事实和判断讲清楚，再决定这家公司值不值得继续放在前台跟踪。</p>
        </div>
        <a href="#stock-pick" class="scroll-indicator">向下滚动</a>
    </section>
    
    <main>
        <!-- Module 1: 今日宝藏标的 -->
        <section class="section" id="stock-pick">
            <div class="section-header">
                <div class="section-number">01</div>
                <div class="section-title-group">
                    <h2 class="section-title">今日宝藏标的</h2>
                </div>
                <div class="section-date">{date_short}</div>
            </div>
            
            <div class="stock-card">
                <div class="stock-header">
                    <div class="stock-ticker">{focus_stock}</div>
                    <div class="stock-name">{company_name}</div>
                </div>
                
                <div class="highlight-box positive">
                    <h4>核心价值亮点</h4>
                    <ul>
                        {logic_html}
                    </ul>
                </div>
                
                <div class="highlight-box warning">
                    <h4>核心风险提示</h4>
                    <ul>
                        {risk_html}
                    </ul>
                </div>
                
                <div class="highlight-box tip">
                    <h4>研究 / 观察结论</h4>
                    <p>这里默认输出研究结论与动作边界，不直接生成固定仓位建议。是否进入组合、何时动作，仍取决于证据强度、赔率和用户自己的组合结构。</p>
                </div>
                
                {portfolio_view}
            </div>
        </section>
        
        <!-- Module 2: 投资认知 -->
        <section class="section" id="wisdom">
            <div class="section-header">
                <div class="section-number">02</div>
                <div class="section-title-group">
                    <h2 class="section-title">投资认知加餐</h2>
                </div>
                <div class="section-date">{date_short}</div>
            </div>
            
            <div class="wisdom-card">
                <div class="wisdom-theme">真正有用的投资认知，不是金句，而是可以复用的判断框架</div>
                <h3 class="wisdom-title">这一部分默认沉淀“为什么继续看 / 为什么先别急着动”</h3>
                <div class="wisdom-content">
                    <p>生成文章时，这里优先写一个能复用的判断框架：这家公司真正值钱的是什么，哪些证据能强化 thesis，哪些变量会让结论反转。避免再用空泛名言充当内容。</p>
                </div>
                <div class="wisdom-image">
                    <img src="../../../images/posts/{date_str}-value.jpg" alt="价值投资">
                </div>
                <div class="wisdom-rules">
                    <h4>可落地执行规则</h4>
                    <ol>
                        <li><strong>先分清事实和判断：</strong> 没有硬证据时，不把情绪变化写成结论变化。</li>
                        <li><strong>把质量和赔率拆开：</strong> 公司再好，也要单独判断现在是不是好价格。</li>
                        <li><strong>只保留动作边界：</strong> 真正会影响仓位的变量才值得留到正文里。</li>
                    </ol>
                </div>
            </div>
        </section>
        
        <!-- Module 3: 组合观察 -->
        <section class="section" id="market">
            <div class="section-header">
                <div class="section-number">03</div>
                <div class="section-title-group">
                    <h2 class="section-title">新闻 + 解读</h2>
                </div>
                <div class="section-date">{date_short}</div>
            </div>
            
            <div class="market-grid market-grid-comfort">
                <div style="grid-column: 1 / -1; margin-bottom: 1rem;">
                    <img src="../../../images/posts/{date_str}-tech.jpg" alt="组合观察与市场结构" style="width:100%;height:300px;object-fit:cover; border-radius:18px;">
                </div>
                <div class="editorial-band market-editorial-band" style="grid-column: 1 / -1; margin-bottom: 0.9rem;">
                    <div class="editorial-band-main">
                        <div class="editorial-band-kicker">News Discipline</div>
                        <h3>第三部分强制拆成两层：新闻内容 + 专属解读。</h3>
                        <p>只写最新、最重要、最可能改变判断的新闻；解读区只回答一个问题：这件事对 thesis、节奏和动作边界到底意味着什么。</p>
                    </div>
                    <div class="editorial-band-side">
                        <div class="editorial-band-item">
                            <span class="editorial-band-label">先看</span>
                            <strong>先读新闻事实，再看判断有没有必要升级</strong>
                        </div>
                        <div class="editorial-band-item">
                            <span class="editorial-band-label">避免</span>
                            <strong>不把新闻标题直接写成结论，也不把情绪当证据</strong>
                        </div>
                    </div>
                </div>
                {market_cards_html}
            </div>
        </section>
        
        <!-- 分析师评级 -->
        <section class="analysis-box">
            <h3 class="analysis-title">分析师参考</h3>
            <div class="stock-ratings-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
"""
    
    # 推荐标的评级卡
    html += f"""
                <div class="rating-card" style="background:rgba(255,255,255,0.05);padding:1.25rem;border-left:4px solid #22c55e;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;">
                        <strong style="font-size:1.15rem;color:#fff;">{focus_stock}</strong>
                        <span style="background:#22c55e;padding:0.3rem 0.8rem;border-radius:4px;font-size:0.85rem;">买入</span>
                    </div>
                    <div style="margin:0.5rem 0;">
                        <span style="color:rgba(255,255,255,0.7);">当前价</span>
                        <strong style="color:#fff;">{price_display}</strong>
                    </div>
                    <div style="margin:0.5rem 0;">
                        <span style="color:rgba(255,255,255,0.7);">目标价</span>
                        <strong style="color:#22c55e;">{target_display} ({upside})</strong>
                    </div>
                </div>
"""
    
    html += """
            </div>
        </section>
    </main>
    
    <footer>
        <p>美股长期价值投资 · 研究先于动作 · 长期主义优先</p>
    </footer>
    
    <script src="../../../js/main.js?v=20260418comfort1"></script>
</body>
</html>"""
    
    return html

def save_html(html, date_str):
    """保存 HTML 带 UTF-8 BOM"""
    year, month, day = date_str.split('-')
    post_file = POSTS_DIR / year / month / f"{day}.html"
    post_file.parent.mkdir(parents=True, exist_ok=True)
    
    bom = b'\xef\xbb\xbf'
    content_bytes = html.encode('utf-8')
    with open(post_file, 'wb') as f:
        f.write(bom + content_bytes)
    
    print(f"HTML 已保存: posts/{year}/{month}/{day}.html")
    return True

def sync_site_data():
    """同步首页目录与搜索数据"""
    if not SYNC_SCRIPT.exists():
        print(f"错误: 未找到站点同步脚本")
        return False
    code, out, err = run_cmd([sys.executable, str(SYNC_SCRIPT)], timeout=60)
    if out:
        print(out)
    if err:
        print(err)
    return code == 0

def run_qa():
    """运行站点 QA"""
    if not QA_SCRIPT.exists():
        print(f"错误: 未找到 QA 脚本")
        return False
    code, out, err = run_cmd(["powershell", "-ExecutionPolicy", "Bypass", "-File", str(QA_SCRIPT)], timeout=120)
    if out:
        print(out)
    if err:
        print(err)
    return code == 0

def deploy(date_str):
    """部署到 GitHub"""
    if not DEPLOY_SCRIPT.exists():
        print(f"错误: 未找到部署脚本")
        return False
    
    code, out, err = run_cmd([sys.executable, str(DEPLOY_SCRIPT), "--date", date_str], timeout=120)
    print(out)
    if err:
        print("错误:", err)
    return code == 0

# ============ 主流程 ============

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--date', default=datetime.now().strftime('%Y-%m-%d'))
    parser.add_argument('--stock', help='指定分析标的（可选，默认使用推荐引擎）')
    parser.add_argument('--skip-images', action='store_true')
    parser.add_argument('--skip-deploy', action='store_true')
    args = parser.parse_args()
    
    try:
        date_obj = datetime.strptime(args.date, '%Y-%m-%d')
    except:
        print("日期格式错误，应为 YYYY-MM-DD")
        return
    
    print("="*60)
    print("美股博客完整生成工作流")
    print("="*60)
    print(f"日期: {args.date}")
    
    # 1. 获取推荐数据
    print("\n[1/6] 获取推荐标的...")
    recommendation = get_stock_recommendation()
    if not recommendation or 'error' in recommendation:
        print("错误: 无法获取推荐标的")
        return
    
    focus_stock = args.stock.upper() if args.stock else recommendation['recommendation']['symbol']
    print(f"分析标的: {focus_stock}")
    
    # 2. 获取 Finnhub 数据
    print("\n[2/6] 获取市场数据...")
    finnhub_data = get_finnhub_data(focus_stock)
    if finnhub_data:
        print(f"当前价: ${finnhub_data['current_price']:.2f}")
    else:
        print("警告: 无法获取实时数据，将使用默认值")
    
    # 3. 生成图片
    if not args.skip_images:
        print("\n[3/6] 生成配图...")
        generate_images(args.date, focus_stock)
    else:
        print("\n[3/6] 跳过图片生成")
    
    # 4. 生成 HTML
    print("\n[4/6] 生成 HTML...")
    portfolio = load_portfolio()
    html = build_html(date_obj, recommendation, finnhub_data, portfolio)
    save_html(html, args.date)
    
    # 5. 同步站点数据
    print("\n[5/6] 同步站点数据...")
    if not sync_site_data():
        print("错误: 站点数据同步失败")
        return
    
    # 6. QA 检查
    print("\n[6/6] 运行 QA 检查...")
    if not run_qa():
        print("警告: QA 检查未通过，但继续部署")
    
    # 7. 部署
    if not args.skip_deploy:
        print("\n[7/7] 部署到 GitHub...")
        if deploy(args.date):
            print("\n" + "="*60)
            print("部署成功!")
            print(f"访问: https://4fire.qzz.io/posts/{date_obj.year}/{date_obj.month:02d}/{date_obj.day:02d}.html")
            print("="*60)
    else:
        print("\n跳过部署")

if __name__ == '__main__':
    main()
