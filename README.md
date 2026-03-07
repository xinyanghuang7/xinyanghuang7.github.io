# 美股价值投资博客

> 专注美股长期价值投资，每日分享宝藏标的、投资认知与科技核心资讯。
>
> "以合理的价格买入优秀的企业，远胜过以便宜的价格买入平庸的企业" —— 沃伦·巴菲特

🔗 **在线访问**: https://xinyanghuang7.github.io

![博客截图](images/blog-preview.jpg)

## ✨ 特色功能

- **📊 每日宝藏标的** - 深度挖掘符合价值投资逻辑的稀缺标的，分析核心亮点与风险提示
- **🧠 投资认知加餐** - 萃取价值投资大师智慧，提供可落地执行的投资原则
- **📰 科技核心资讯** - 机构级专业投研参考，专为长期价值投资者定制
- **🎨 AI 自动生成配图** - 使用 ModelScope API 为每篇文章生成专业金融风格配图
- **⭐ 智能股票评级** - 整合 TradingView 技术指标 + Yahoo Finance 分析师评级
- **📱 响应式设计** - 完美适配桌面、平板和手机

## 🚀 快速开始

### 环境准备

```bash
# 克隆仓库
git clone https://github.com/xinyanghuang7/xinyanghuang7.github.io.git
cd xinyanghuang7.github.io

# 安装股票评级依赖（可选）
pip install tradingview-ta yfinance
```

### 配置 API 密钥

复制环境变量模板并填入你的密钥：

```bash
cp .env.example .env
# 编辑 .env 文件，填入以下密钥：
# - MODELSCOPE_TOKEN: ModelScope API 密钥（用于生成配图）
# - GITHUB_TOKEN: GitHub Personal Access Token（用于部署）
```

⚠️ **安全提醒**: `.env` 文件已加入 `.gitignore`，绝不会提交到 GitHub。

### 生成每日博客

使用 Skill 自动生成高质量博客文章：

```powershell
# 方式1：使用 OpenClaw Skill
# 在 OpenClaw 中运行：
# "生成 2026年3月8日的美股博客，分析 UNH"

# 方式2：手动运行脚本
python us-stock-blog/scripts/generate_daily_blog.py --date 2026-03-08 --focus UNH

# 方式3：一键发布（自动生成 + 获取评级 + 推送到 GitHub）
.\us-stock-blog\scripts\daily-publish.ps1 -Date "2026-03-08" -FocusStock "UNH"
```

## 📁 项目结构

```
xinyanghuang7.github.io/
├── index.html                 # 博客首页
├── css/
│   └── style.css             # 主样式文件
├── js/
│   └── main.js               # 交互脚本
├── images/                   # 配图目录
│   ├── hero-bg.jpg          # 首页主图
│   └── posts/               # 文章配图
├── posts/                    # 文章目录
│   └── 2026/
│       └── 03/
│           ├── 05.html      # 2026-03-05 文章
│           ├── 07.html      # 2026-03-07 文章
│           └── 08.html      # 2026-03-08 文章
└── us-stock-blog/           # Skill 目录
    ├── SKILL.md             # 详细使用文档
    ├── assets/              # 模板和样式
    ├── scripts/             # 自动化脚本
    └── references/          # 参考资料
```

## 🎨 文章质量标准

每篇博客文章包含三个模块，每个模块都有严格的格式和质量要求：

### 模块1：美股每日宝藏标的

**结构要求**：
- 股票代码 + 公司全称
- 所属行业 + 核心主营业务
- ✅ 核心价值亮点（3点，每点详细展开）
- ⚠️ 核心风险提示（2点，说明具体风险）
- 💡 长期持有建议（持有周期、仓位控制、适用场景）

**质量要求**：
- 每点亮点/风险都要有数据支撑或逻辑推理
- 避免泛泛而谈，要具体到业务层面
- 风险提示要诚实，不回避关键风险

### 模块2：每日投资认知加餐

**结构要求**：
- 核心主题（一句话点明）
- 核心理念（详细阐述投资大师观点）
- 可落地执行规则（3条具体操作步骤）
- 经典案例极简解读（真实案例 + 核心逻辑 + 可借鉴经验）
- 一句话记忆点（金句总结）
- **配图**：生成一张与主题相关的概念图

**质量要求**：
- 必须引用投资大师（巴菲特、芒格、格雷厄姆等）
- 案例必须是真实历史事件
- 执行规则要具体可操作，不能是空话

### 模块3：美股科技核心标的每日财经资讯早报

**结构要求**：
- 3-5 只核心科技股（NVDA、META、AAPL 等）
- 每只股票的股价数据（收盘价、涨跌幅、成交量）
- 3 条核心资讯 + 【长线视角】解读
- 华尔街分析师专业研判（机会端 + 风险端）
- 综合投资态度与操作策略
- **配图**：生成一张科技股票分析可视化图

**质量要求**：
- 数据来源必须是权威渠道（SEC、公司财报、Bloomberg/Reuters）
- 资讯必须是 24 小时内的
- 分析必须聚焦长期价值，不做短期价格预测

## 🤖 AI 配图生成

每篇文章需要生成 2 张配图：

1. **价值投资概念图** - 用于模块2（投资认知加餐）
2. **科技股票分析可视化图** - 用于模块3（科技核心资讯早报）

生成命令示例：

```powershell
# 生成价值投资概念图
python us-stock-blog/scripts/generate-images.ps1 `
    -Prompt "Professional financial investment concept, vintage leather-bound investment ledger with gold pen, golden calculator, stock certificates scattered artistically, warm golden hour lighting, dark wood desk surface" `
    -Output "images/posts/2026-03-08-value.jpg"
```

## 📊 股票评级功能

为文章中提到的股票自动生成交易评级：

```powershell
# 获取单个股票评级
python us-stock-blog/scripts/get_stock_ratings.py VST NYSE

# 输出示例：
# VST / Vistra Corp. 综合评级: 🚀 强烈买入 (+1.85分)
# - TradingView: BUY (11买入/2卖出/8中性)
# - Yahoo Finance: 买入 | 目标价 $106.75 (+23.5%)
```

评级计算逻辑：
- **TradingView 技术指标**（40% 权重）：RSI、MACD、移动平均线等
- **Yahoo Finance 分析师评级**（60% 权重）：华尔街机构共识

## 📝 写作风格指南

### 整体风格
- **专业金融杂志风格** - 类似《巴伦周刊》《福布斯》
- **优雅、精炼、有深度** - 避免口语化表达
- **数据驱动** - 每个观点都要有数据支撑
- **长期视角** - 不做短期预测，专注长期价值

### 排版要求
- 使用 HTML5 语义化标签
- 遵循 CSS 设计系统（颜色、字体、间距）
- 配图必须高质量，与内容主题匹配
- 引用必须标注来源

### 禁止事项
- ❌ 口语化表达（"我觉得"、"可能吧"）
- ❌ 短期价格预测（"明天会涨"）
- ❌ 无数据支撑的结论
- ❌ 超过 3 个月的旧资讯
- ❌ 模糊的风险提示（"市场有风险"这类空话）

## 🔧 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JS
- **字体**: Cormorant Garamond (标题) + Source Sans Pro (正文)
- **配色**: 金融杂志风格（深蓝 #0f1419、金色 #c9a227、米白 #faf8f5）
- **配图**: ModelScope 文生图 API
- **数据**: TradingView API + Yahoo Finance API
- **部署**: GitHub Pages

## 📈 更新日志

| 日期 | 更新内容 |
|------|----------|
| 2026-03-08 | 新增 UNH 分析文章，优化 README |
| 2026-03-07 | 新增 GOOGL 护城河分析 |
| 2026-03-05 | 首发文章：VST + 安全边际概念 |

## ⚠️ 免责声明

本博客内容仅供学习交流使用，不构成任何投资建议。股市有风险，投资需谨慎。所有数据均来自公开可溯源渠道，作者不对信息的准确性、完整性作任何明示或暗示的保证。

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

<p align="center">Made with ❤️ for value investors</p>
