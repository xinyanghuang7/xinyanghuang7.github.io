# 拆解策略投资项目说明【Alpha Portfolio Demo】

正式域名：[https://4fire.qzz.io/](https://4fire.qzz.io/)

本项目为一个**长线组合投资**为核心的个人站点，当前已运行于**模板整合 + 流程标准化**阶段。主要目标不是持续扩展功能，而是让其作为一个可持续运作的“自动化内容发布+回测检验”工具，产出高质量的投资相关内容。

---

## 当前模板摘要（默认标准）

保证高 ROI 与复用性能力：

- 固定结构的日报/周报模板
- 支持动态内容组件（例如动量端布局）
- 首页支持搜索
- 最近文章列表与内容结构一致
- 报告类内容模板化 + 有据可查
- 最新高质量内容可快速索引
- 每篇内容都包含数据与结论两条主线

默认不再添加重复性/无效的新功能，也不会集成高维护成本的复杂工具

---

## 自动内容发布流程（One Sentence Task Workflow）

后续默认按此流程执行：

### 用户输入一句话：
> 生成 YYYY-MM-DD 的策略报告，并分析 XXX

### 默认执行步骤：
1. 生成当日内容到 `posts/YYYY/MM/DD.html`
2. 同步或复用图片等资源
3. 运行 `python scripts/sync-site-data.py`，自动同步主页目录与 `js/posts-data.js`
4. 本地 QA
5. 提交并推送至 GitHub
6. 验证正式站点 https://4fire.qzz.io/
7. 回报“已完成”

成功标准：
- GitHub 端代码已更新
- 主站点内容已更新
- 页面可访问与检索

---

## 内容结构（当前默认）

### Module 1：今日重点
- 可为思考/市场观察/成果记录
- 必须包含关键要点、数据边界与结论
- 命名为“今日重点”，不许空、删节

### Module 2：观点/经验分享
- 不限来自本站数据，也可引用第三方优质来源
- 必须标明来源、数据要求和经验边界
- 以提升可复用投资经验为目标

### Module 3：新闻解读
- 非纯新闻整合
- 必须：
  - 明确拆分投资逻辑（如 META/NVDA 等）
  - 至少写出市场动因、事件简述、触发信息与结论
  - 强调因果、相关性、资本结构或模型链路
  - 让读者看懂“为什么今天大涨/大跌、重大与否”
  - 若无因，则注明——空则略过

### Module 4：操作打分
- 对今日关键操作进行复盘或单项评分
- 能回应前三模块的数据、原因与结论

### 发布前自检（强制）
- 每次内容发布前，需做自查、对照并标注
- 核查内容逻辑、数据完整、标题合规、表达精炼、信息准确

---

## 仓库目录范围

### 1) 正式前端产物（全部属于内容仓库）：
- `index.html`
- `css/`
- `js/`
- `posts/`
- `images/`
- `favicon.svg`
- `CNAME`
- `robots.txt`
- `README.md`

### 2) 本地管理工具（可存于仓库）：
- `scripts/build-all.ps1`
- `scripts/sync-site-data.py`
- `scripts/build-search-index.ps1`（作为 sync-site-data 子模块）
- `scripts/build-sitemap.ps1`
- `scripts/deploy.py`
- `scripts/generate_blog.py`（仅维护，暂不用于前端生成）
- `scripts/generate_images.py`
- `scripts/new-post.ps1`
- `scripts/portfolio_reader.py`
- `scripts/qa-site.ps1`
- `scripts/review-content.ps1`
- `scripts/update-index.ps1`（作为 sync-site-data 子模块）
- `scripts/write-review-publish.ps1`

### 3) 禁止加入仓库的内容
- 临时 clone 或 `_tmp`
- 含身份认证的 HTML/API 测试
- payload/base64/bin 等中间文件
- 工作记录、技能、学习日志
- 一次性实验代码及中间产物

---

## 安全边界（高级）

本仓库为**公开内容仓库**，默认所有网页为“面向全球可见”模式。

### 严禁存储内容
- API key / token / password / Cookie / 秘钥 / 数据库凭证
- 明文 Git remote URL
- `.env`/`.pem`/`.key`/`.p12`/`.pfx` 等机密文件
- 其它可直接造成权限转移、资金损失的字符串

### 允许的做法
- 需要密钥的脚本，仅允许从环境变量读取如 `GITHUB_TOKEN`
- README/文档、异常提示处，仅出现变量名，不得出现真实值
- 日志、截图、终端输出信息需处理敏感内容
- 严禁明文露出认证 URL 或 header

### 发布前检查要求
1. 扫描所有机密内容（token/private key/bearer/URL等）
2. 检查是否误传`.env`/密钥/证书等机密文件
3. 检查 Git remote/脚本是否包含认证信息
4. 核查仅有 index.html/js/posts/images/README.md 出现在前端内容目录

遵守本规则优先级极高：**允许裁剪功能，但绝不允许泄露“密钥/账号/交易凭证”到公开仓库或前端页面！**

---

## 当前产品判断

本静态站点已正式运行，无需过度开发新功能，重点关注：

- 单句任务成功率与效率
- 模板持续优化
- 内容结构简洁完善
- 前后端数据一致性

如后续需要升级，应优先保证：**稳定性 > 简洁性 > 新功能**

---

## 免责声明

网站内所有内容仅供学习交流，不构成投资建议。股市有风险，投资需谨慎。
所有数据和观点均为“已标明出处”与“个人分析”；仅供参考，不可作为决策依据。如有疏漏失误，敬请谅解。
