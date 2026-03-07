# Click: [xinyanghuang7.github.io](https://xinyanghuang7.github.io/)

---

## 🚀 新增：美股投资博客与交易评级系统

### 在线演示
- **股票博客演示**: https://xinyanghuang7.github.io/stock-blog-demo.html
- **技能文档**: [us-stock-blog/SKILL.md](./us-stock-blog/SKILL.md)

### 功能特性
- 📊 **实时交易评级**: 整合 TradingView 技术指标 + Yahoo Finance 分析师评级
- 🤖 **AI 图片生成**: 使用 ModelScope 自动生成博客配图
- 📱 **响应式设计**: 适配桌面和移动端
- 🎨 **专业金融风格**: 优雅的投资杂志风格设计

### 评级系统
| 评级 | 说明 | 数据来源权重 |
|------|------|-------------|
| 🚀 强烈买入 | +2分 | TradingView 技术面 40% + Yahoo 分析师 60% |
| 📈 买入 | +1分 | |
| ➖ 中性 | 0分 | |
| 📉 卖出 | -1分 | |
| 🔻 强烈卖出 | -2分 | |

### 快速开始

\&#96;\&#96;\&#96;bash
# 安装依赖
pip install tradingview-ta yfinance

# 获取股票评级
python us-stock-blog/scripts/get_stock_ratings.py AAPL NASDAQ

# 或使用 PowerShell
.\us-stock-blog\scripts\get-rating.ps1 -Symbol "VST" -Exchange "NYSE"
\&#96;\&#96;\&#96;

### 项目结构
\&#96;\&#96;\&#96;
us-stock-blog/
├── SKILL.md                    # 完整文档
├── assets/
│   ├── blog-template.html      # 博客模板
│   └── rating-styles.css       # 评级组件样式
├── references/                 # API 文档和示例
└── scripts/
    ├── get_stock_ratings.py    # 核心评级模块
    └── get-rating.ps1          # PowerShell 封装
\&#96;\&#96;\&#96;

---

*Last updated: 2026-03-07*