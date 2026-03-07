# 安全与配置指南

## ⚠️ API 密钥安全管理

### 绝对不要做的事情

❌ **不要将以下内容提交到 GitHub：**
- 实际的 API Token（如 `github_pat_xxx`, `ghp_xxx`）
- 实际的 ModelScope Token
- 任何包含密钥的配置文件

### 正确做法

✅ **本地配置（只在本地使用）：**

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cd ~/.openclaw/skills/us-stock-blog
   cp .env.example .env
   ```

2. 编辑 `.env` 填入你的密钥：
   ```bash
   GITHUB_TOKEN=your_actual_github_token_here
   MODELSCOPE_TOKEN=your_actual_modelscope_token_here
   ```

3. 加载环境变量（每次使用前）：
   
   **PowerShell:**
   ```powershell
   Get-Content .env | ForEach-Object { 
       $key, $value = $_ -split '=', 2
       [Environment]::SetEnvironmentVariable($key, $value, "Process")
   }
   ```
   
   **Bash:**
   ```bash
   source .env
   ```

4. 验证环境变量已加载：
   ```powershell
   $env:GITHUB_TOKEN
   ```

### .env 文件已被 Git 忽略

`.gitignore` 中已包含：
```
.env
```

所以 `.env` 文件不会意外提交到仓库。

## 🔄 每日博客发布流程

### 1. 准备博客内容

创建博客内容文件（仅内容，不需要完整 HTML）：
```html
<!-- content/2026-03-07.html -->
<h3>VST / Vistra Corp.</h3>
<p>电力公用事业... (你的分析内容)</p>
```

### 2. 运行发布脚本

```powershell
# 自动提取股票代码并添加评级
cd ~/.openclaw/skills/us-stock-blog
.\scripts\daily-publish.ps1 -BlogFile "content/2026-03-07.html"

# 或指定股票代码
.\scripts\daily-publish.ps1 -BlogFile "content/2026-03-07.html" -Symbols "VST,NEE"
```

脚本会自动：
1. 提取文中提到的股票代码
2. 获取 TradingView 技术指标
3. 获取 Yahoo Finance 分析师评级
4. 计算综合评级
5. 在文末添加评级汇总表格
6. 推送到 GitHub Pages

### 3. 验证发布

访问：
- https://xinyanghuang7.github.io/stock-blog/

## 📁 项目文件说明

| 文件/目录 | 说明 | 是否提交到 Git |
|-----------|------|----------------|
| `.env.example` | 环境变量模板（示例） | ✅ 是 |
| `.env` | 实际环境变量（含密钥） | ❌ 否 |
| `scripts/get_stock_ratings.py` | 评级获取模块 | ✅ 是 |
| `scripts/daily-publish.ps1` | 每日发布脚本 | ✅ 是 |
| `output/` | 生成的博客文件 | ❌ 否 |
| `*.log` | 日志文件 | ❌ 否 |

## 🔍 故障排除

### "GITHUB_TOKEN not set"

```powershell
# 检查环境变量
$env:GITHUB_TOKEN

# 如果没有输出，重新加载 .env
Get-Content .env | ForEach-Object { $key, $value = $_ -split '=', 2; [Environment]::SetEnvironmentVariable($key, $value, "Process") }
```

### "Failed to get stock rating"

- 检查网络连接
- TradingView/Yahoo Finance 可能有请求限制
- 脚本会自动降级处理，继续生成博客

### 股票代码识别失败

在 `generate_daily_blog.py` 中 `STOCK_ALIASES` 添加映射：
```python
STOCK_ALIASES = {
    "NEWSTOCK": ["Company Name", "中文名"],
}
```
