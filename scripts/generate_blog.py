#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
美股博客生成工作流脚本（精简安全版）
"""

import json
import argparse
import subprocess
import sys
from pathlib import Path
from datetime import datetime

# ============ 路径配置 ============
BASE_DIR = Path(__file__).parent.parent
PORTFOLIO_FILE = Path.home() / ".openclaw" / "skills" / "portfolio-tracker" / "data" / "portfolio.json"
STOCK_RECOMMENDER_SCRIPT = Path.home() / ".openclaw" / "skills" / "stock-recommender" / "scripts" / "recommender.py"
IMAGES_DIR = BASE_DIR / "images"
POSTS_DIR = BASE_DIR / "posts"
GENERATE_IMAGE_SCRIPT = BASE_DIR / "skills" / "us-stock-blog" / "scripts" / "generate_image.py"
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

def print_portfolio():
    """打印持仓概况"""
    data = load_portfolio()
    holdings = data.get("holdings", [])
    print(f"当前持仓: {len(holdings)} 个标的")
    for h in holdings:
        print(f"  {h['code']}: {h['shares']}股 @ ${h['avg_cost']:.2f}")

def get_recommendation():
    """获取推荐标的"""
    if not STOCK_RECOMMENDER_SCRIPT.exists():
        return None
    
    code, out, err = run_cmd([sys.executable, str(STOCK_RECOMMENDER_SCRIPT)])
    if code != 0:
        return None
    
    import re
    match = re.search(r'⭐ 推荐标的:\s*\[([A-Z]+)\]', out)
    if match:
        return match.group(1)
    return None

def determine_focus(user_stock):
    """确定分析标的"""
    portfolio_codes = [h["code"] for h in load_portfolio().get("holdings", [])]
    
    if user_stock:
        return user_stock.upper()
    
    rec = get_recommendation()
    if rec:
        print(f"推荐标的: {rec}")
        return rec
    
    if portfolio_codes:
        print(f"使用持仓第一只: {portfolio_codes[0]}")
        return portfolio_codes[0]
    
    print("错误: 请使用 --stock 指定标的")
    exit(1)

def generate_images(date_str, focus_stock):
    """生成配图"""
    value_img = IMAGES_DIR / f"{date_str}-value.jpg"
    tech_img = IMAGES_DIR / f"{date_str}-tech.jpg"
    
    if value_img.exists() and tech_img.exists():
        print("图片已存在")
        return True
    
    if not GENERATE_IMAGE_SCRIPT.exists():
        print(f"警告: 未找到图片生成脚本 {GENERATE_IMAGE_SCRIPT}")
        return False
    
    print("正在生成图片...")
    # 这里应该调用 generate_image.py
    # 简化：只检查是否存在
    return False

def contains_placeholders(html):
    placeholders = ["XXX.XX", "待填充", "最新动态...", "新闻分析...", "基于调研数据"]
    return any(token in html for token in placeholders)


def sync_site_data():
    """同步首页目录与搜索数据"""
    if not SYNC_SCRIPT.exists():
        print(f"错误: 未找到站点同步脚本 {SYNC_SCRIPT}")
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
        print(f"错误: 未找到 QA 脚本 {QA_SCRIPT}")
        return False
    code, out, err = run_cmd(["powershell", "-ExecutionPolicy", "Bypass", "-File", str(QA_SCRIPT)], timeout=120)
    if out:
        print(out)
    if err:
        print(err)
    return code == 0


def build_html(date_obj, focus_stock, portfolio):
    """构建 HTML (基于 0305 模板)"""
    date_str = date_obj.strftime("%Y-%m-%d")
    display_date = f"{date_obj.year}年{date_obj.month}月{date_obj.day}日"
    date_short = f"{date_obj.year}/{date_obj.month:02d}/{date_obj.day:02d}"
    
    # 检查持仓
    holdings = portfolio.get("holdings", [])
    in_portfolio = any(h["code"] == focus_stock for h in holdings)
    portfolio_view = ""
    if in_portfolio:
        h = next(x for x in holdings if x["code"] == focus_stock)
        portfolio_view = f"""
        <div class="highlight-box portfolio" style="border-left-color: #d4af37;">
            <h4>我的持仓视角</h4>
            <p><strong>当前持仓:</strong> {h['shares']}股 @ ${h['avg_cost']:.2f}</p>
            <p><strong>策略建议:</strong> 根据当前价格和基本面，建议继续持有/加仓/减仓...</p>
        </div>
"""
    
    # 简化版 HTML（使用 0305 模板结构）
    html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{date_str} 美股分析: {focus_stock} 深度研究">
    <title>{date_str} 美股分析: {focus_stock} | 美股价值投资笔记</title>
    <link rel="stylesheet" href="../../../css/style.css">
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
                    <div class="stock-name">公司名称待填充</div>
                </div>
                
                <div class="highlight-box positive">
                    <h4>核心价值亮点</h4>
                    <ul>
                        <li><strong>亮点1:</strong> 基于调研数据</li>
                        <li><strong>亮点2:</strong> 基于调研数据</li>
                        <li><strong>亮点3:</strong> 基于调研数据</li>
                    </ul>
                </div>
                
                <div class="highlight-box warning">
                    <h4>核心风险提示</h4>
                    <ul>
                        <li><strong>风险1:</strong> 基于调研数据</li>
                        <li><strong>风险2:</strong> 基于调研数据</li>
                    </ul>
                </div>
                
                <div class="highlight-box tip">
                    <h4>长期持有建议</h4>
                    <p>建议持有周期 3-5 年，仓位 3%-5%。</p>
                </div>
                
                {portfolio_view}
            </div>
        </section>
        
        <!-- Module 2: 故事 / 经验分享 -->
        <section class="section" id="wisdom">
            <div class="section-header">
                <div class="section-number">02</div>
                <div class="section-title-group">
                    <h2 class="section-title">故事 / 经验分享</h2>
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
        
        <!-- Module 3: 新闻解读 -->
        <section class="section" id="market">
            <div class="section-header">
                <div class="section-number">03</div>
                <div class="section-title-group">
                    <h2 class="section-title">新闻解读</h2>
                </div>
                <div class="section-date">{date_short}</div>
            </div>
            
            <div class="market-grid">
                <div style="grid-column: 1 / -1; margin-bottom: 1rem;">
                    <img src="../../../images/posts/{date_str}-tech.jpg" alt="科技分析" style="width:100%;height:300px;object-fit:cover;">
                </div>
"""
    
    # Module 3 / 4 只能覆盖当前持仓，不能把非持仓 focus_stock 混进去
    holding_tickers = [h["code"] for h in holdings]
    for ticker in holding_tickers:
        portfolio_note = f"""
                <div class="portfolio-viewpoint" style="background:rgba(212,175,55,0.1);padding:0.75rem;margin-top:0.5rem;border-left:3px solid #d4af37;">
                    <strong style="color:#d4af37;">【持仓视角】</strong>
                    你持有 {ticker}，此消息需结合持仓成本综合分析。
                </div>
"""
        
        html += f"""
                <div class="stock-detail-card">
                    <div class="stock-detail-header">
                        <div class="stock-detail-ticker">{ticker}</div>
                        <div class="stock-detail-name">公司名称</div>
                        <div class="stock-price">
                            <div class="price-value">$XXX.XX</div>
                        </div>
                    </div>
                    <div class="news-list">
                        <div class="news-item">
                            <div class="news-title">最新动态...</div>
                            <div class="news-perspective"><strong>【长线视角】</strong>新闻分析...</div>
                            {portfolio_note}
                        </div>
                    </div>
                </div>
"""

    if not holding_tickers:
        html += """
                <div class=\"analysis-box\" style=\"grid-column: 1 / -1;\">
                    <h3 class=\"analysis-title\">当前无持仓，第三部分不展示持仓决策卡</h3>
                    <p>非持仓标的请放在 Module 1 或单独标注为“观察池 / 案例”，不要混写成持仓决策。</p>
                </div>
"""
    
    html += """
            </div>
        </section>
        
        <!-- 分析师评级 -->
        <section class="analysis-box">
            <h3 class="analysis-title">华尔街分析师评级汇总</h3>
            <div class="stock-ratings-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.5rem;">
"""
    
    for ticker in holding_tickers:
        compare_html = """
                <div style="background:rgba(212,175,55,0.1);padding:0.75rem;margin-top:0.75rem;border-radius:6px;">
                    <div style="font-size:0.85rem;color:#d4af37;margin-bottom:0.25rem;">我的持仓对比</div>
                    <div style="display:flex;justify-content:space-between;font-size:0.9rem;">
                        <span style="color:rgba(255,255,255,0.6);">我的成本</span>
                        <span style="color:#fff;">$XXX.XX</span>
                    </div>
                </div>
"""
        
        html += f"""
                <div class="rating-card" style="background:rgba(255,255,255,0.05);padding:1.25rem;border-left:4px solid #22c55e;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;">
                        <strong style="font-size:1.15rem;color:#fff;">{ticker}</strong>
                        <span style="background:#22c55e;padding:0.3rem 0.8rem;border-radius:4px;font-size:0.85rem;">买入</span>
                    </div>
                    <div style="margin:0.5rem 0;">
                        <span style="color:rgba(255,255,255,0.7);">当前价</span>
                        <strong style="color:#fff;">$XXX.XX</strong>
                    </div>
                    <div style="margin:0.5rem 0;">
                        <span style="color:rgba(255,255,255,0.7);">目标价</span>
                        <strong style="color:#22c55e;">$XXX.XX (+XX%)</strong>
                    </div>
                    {compare_html}
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
    
    # 添加 BOM
    bom = b'\xef\xbb\xbf'
    content_bytes = html.encode('utf-8')
    with open(post_file, 'wb') as f:
        f.write(bom + content_bytes)
    
    print(f"HTML 已保存: posts/{year}/{month}/{day}.html")
    return True

def deploy(date_str):
    """部署到 GitHub"""
    if not DEPLOY_SCRIPT.exists():
        print(f"错误: 未找到部署脚本 {DEPLOY_SCRIPT}")
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
    parser.add_argument('--stock', help='指定分析标的')
    parser.add_argument('--skip-images', action='store_true')
    parser.add_argument('--skip-deploy', action='store_true')
    args = parser.parse_args()
    
    try:
        date_obj = datetime.strptime(args.date, '%Y-%m-%d')
    except:
        print("日期格式错误，应为 YYYY-MM-DD")
        return
    
    print("="*60)
    print("美股博客生成工作流")
    print("="*60)
    print(f"日期: {args.date}")
    
    # 1. 持仓
    print_portfolio()
    
    # 2. 确定标的
    focus = determine_focus(args.stock)
    print(f"分析标的: {focus}")
    
    # 3. 图片
    if not args.skip_images:
        generate_images(args.date, focus)
    
    # 4. 生成 HTML
    portfolio = load_portfolio()
    html = build_html(date_obj, focus, portfolio)

    if contains_placeholders(html):
        print("错误: 当前 generate_blog.py 生成的仍是占位草稿，已拒绝写入/部署。")
        print("请先补齐真实内容，或改用手工正文 + build-search-index/qa-site/deploy.py 工作流。")
        return

    save_html(html, args.date)

    if not sync_site_data():
        print("错误: 站点数据同步失败，停止后续流程")
        return

    if not run_qa():
        print("错误: QA 未通过，停止部署")
        return
    
    # 5. 部署
    if not args.skip_deploy:
        if deploy(args.date):
            print("部署成功!")
            print(f"访问: https://4fire.qzz.io/posts/{date_obj.year}/{date_obj.month:02d}/{date_obj.day:02d}.html")
    else:
        print("跳过部署")
    
    print("="*60)

if __name__ == '__main__':
    main()
