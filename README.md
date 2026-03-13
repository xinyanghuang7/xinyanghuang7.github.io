# 美股价值投资笔记

正式域名：<https://4fire.qzz.io/>

这是一个以 **长期主义美股投资** 为核心的个人博客，当前已进入 **模板冻结 + 流程规范化** 阶段。
目标不是继续堆花哨功能，而是让它能稳定地被一句话任务驱动，持续产出高质量文章。

---

## 当前冻结模板（默认标准）

只保留高 ROI、可稳定复用的能力：

- 稳定的亮 / 暗模式
- 可用的移动端布局
- 首页搜索
- 最近文章统一结构
- 持仓决策区 + 依据审查
- 最近高质量文章的快速导览条
- 最近高质量文章的阅读信息条

默认不再主动堆复杂动画、花式模块或高维护成本装饰。

---

## 一句话执行模式

以后默认按下面这条路径执行：

### 用户一句话：
> 生成 YYYY-MM-DD 的美股博客，分析 XXX

### 默认执行：
1. 生成当日文章 `posts/YYYY/MM/DD.html`
2. 生成 / 复用配图资源
3. 更新首页目录 `index.html`
4. 更新搜索索引 `js/main.js`
5. 跑本地 QA
6. 推送 GitHub
7. 验证正式域名 `https://4fire.qzz.io/`
8. 再汇报“已完成”

成功标准不是“本地改好了”，而是：
- GitHub 远端已更新
- 正式域名已更新
- 页面实际可访问 / 可渲染

---

## 内容结构（当前默认）

### Module 1：每日宝藏标的
- 核心亮点
- 核心风险
- 持有 / 研究结论

### Module 2：投资认知加餐
- 一个核心框架
- 反直觉点
- 可执行规则
- 检查清单

### Module 3：持仓决策区
不是新闻堆砌，必须包含：
- 当前持仓状态
- 数据截点
- 外部依据
- 我的判断
- 置信度 / 证据边界
- 下一步动作

### Module 4：组合动作地图
把今天真正要记住的动作压成少量可执行卡片。

---

## 仓库边界

### 1) 正式站点资产（应属于博客仓库）
- `index.html`
- `css/`
- `js/`
- `posts/`
- `images/`
- `favicon.svg`
- `CNAME`
- `robots.txt`
- `README.md`

### 2) 本地稳定工具（可属于博客仓库）
- `scripts/build-all.ps1`
- `scripts/build-search-index.ps1`
- `scripts/build-sitemap.ps1`
- `scripts/deploy.py`
- `scripts/generate_blog.py`
- `scripts/generate_images.py`
- `scripts/new-post.ps1`
- `scripts/portfolio_reader.py`
- `scripts/qa-site.ps1`
- `scripts/review-content.ps1`
- `scripts/update-index.ps1`
- `scripts/write-review-publish.ps1`

### 3) 不应混进博客仓库的内容
- 临时 clone / `_tmp`
- 取证 HTML / API 快照
- payload / base64 / bin 中间文件
- 工作区记忆、技能、学习记录
- 一次性验证脚本和实验残留

---

## 当前产品判断

这个站点现在已经够用，不追求功能越来越多，而追求：

- 一句话任务成功率更高
- 模板更稳
- 结构更清楚
- 远端与本地边界更干净

如果后面要升级，优先级也应该是：
**稳定性 > 一致性 > 新功能**

---

## 免责声明

本博客内容仅供学习交流使用，不构成任何投资建议。股市有风险，投资需谨慎。
所有数据与观点应区分“已核对事实”与“我的判断”；若证据不够硬，只能写成方向判断，不能伪装成确定性结论。
