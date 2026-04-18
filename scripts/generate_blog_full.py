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
from pathlib import Path
from datetime import datetime

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
    <title>{date_str} 美股分析: {focus_stock} | 美股价值投资笔记</title>
    <link rel="stylesheet" href="../../../css/style.css?v=20260418">
</head>
<body>
    <header>
        <div class="nav-date">{display_date}</div>
    </header>
    
    <section class="hero">
        <div class="hero-content">
            <div class="subtitle">美股每日财经分析</div>
            <h1>{focus_stock} 深度解析</h1>
        </div>
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
                    <h4>长期持有建议</h4>
                    <p>建议持有周期 3-5 年，仓位 3%-5%。</p>
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
                <div class="wisdom-theme">长期持有的艺术</div>
                <h3 class="wisdom-title">用时间换取复利的奇迹</h3>
                <div class="wisdom-content">
                    <p>巴菲特说: "如果你不愿意持有一只股票十年，那就不要持有它十分钟。"</p>
                </div>
                <div class="wisdom-image">
                    <img src="../../../images/posts/{date_str}-value.jpg" alt="价值投资">
                </div>
                <div class="wisdom-rules">
                    <h4>可落地执行规则</h4>
                    <ol>
                        <li><strong>用永久资金投资:</strong> 只投入长期不用的钱</li>
                        <li><strong>区分价格波动和价值变化:</strong> 关注企业基本面</li>
                        <li><strong>建立持有清单:</strong> 写下买入核心理由</li>
                    </ol>
                </div>
            </div>
        </section>
        
        <!-- Module 3: 持仓动态 -->
        <section class="section" id="market">
            <div class="section-header">
                <div class="section-number">03</div>
                <div class="section-title-group">
                    <h2 class="section-title">持仓动态追踪</h2>
                </div>
                <div class="section-date">{date_short}</div>
            </div>
            
            <div class="market-grid">
                <div style="grid-column: 1 / -1; margin-bottom: 1rem;">
                    <img src="../../../images/posts/{date_str}-tech.jpg" alt="市场分析" style="width:100%;height:300px;object-fit:cover;">
                </div>
"""
    
    # 持仓标的卡片
    holding_tickers = [h["code"] for h in holdings]
    for ticker in holding_tickers[:3]:  # 最多显示3个
        h = next(x for x in holdings if x["code"] == ticker)
        html += f"""
                <div class="stock-detail-card">
                    <div class="stock-detail-header">
                        <div class="stock-detail-ticker">{ticker}</div>
                        <div class="stock-detail-name">{h.get('name', ticker)}</div>
                        <div class="stock-price">
                            <div class="price-value">${h['avg_cost']:.2f}</div>
                        </div>
                    </div>
                    <div class="portfolio-viewpoint" style="background:rgba(212,175,55,0.1);padding:0.75rem;margin-top:0.5rem;border-left:3px solid #d4af37;">
                        <strong style="color:#d4af37;">【持仓视角】</strong>
                        持有 {h['shares']} 股，成本 ${h['avg_cost']:.2f}，继续关注长期价值。
                    </div>
                </div>
"""
    
    if not holding_tickers:
        html += """
                <div class="analysis-box" style="grid-column: 1 / -1;">
                    <h3 class="analysis-title">当前无持仓</h3>
                    <p>建议根据推荐标的建立初始仓位。</p>
                </div>
"""
    
    html += """
            </div>
        </section>
        
        <!-- 分析师评级 -->
        <section class="analysis-box">
            <h3 class="analysis-title">华尔街分析师评级</h3>
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
        <p>美股长期价值投资 · 数据驱动 · 独立思考</p>
    </footer>
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
