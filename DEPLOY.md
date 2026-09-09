# 多语言电子书文库站 - 部署教程

## 项目概述

本项目是一个纯前端多语言电子书文库站，使用原生 HTML + CSS + JavaScript 构建，无需后端服务器，可直接部署到任意静态托管平台（GitHub Pages、Vercel、Netlify、Cloudflare Pages 等）。

---

## 一、本地开发与预览

### 1.1 环境要求

- Node.js 18+（推荐 v20 LTS）
- npm 或其他包管理器

### 1.2 安装依赖

```bash
cd web2
npm install
```

### 1.3 本地启动预览

**方式一：使用 Vite 开发服务器（推荐开发时使用）**
```bash
npm run dev
```
默认访问 `http://localhost:5173`

**方式二：使用 http-server 模拟生产环境**
```bash
npm run start
```
访问 `http://localhost:8080`

**方式三：使用 Vite 预览构建产物**
```bash
npm run build
npm run preview
```
访问 `http://localhost:8080`

### 1.4 手动构建

```bash
npm run build
```
构建产物将输出到 `dist/` 目录。

### 1.5 数据获取脚本

```bash
# 生成示例数据
npm run fetch

# 从指定远程 URL 拉取数据（失败则回退到示例数据）
DATA_URL=https://your-api.example.com/books.json npm run fetch
```

---

## 二、Git 仓库初始化与提交

### 2.1 初始化仓库

```bash
cd web2

# 初始化 Git 仓库
git init

# 切换到主分支（GitHub 新默认使用 main）
git checkout -b main
```

### 2.2 添加远程仓库

在 GitHub 创建一个新的空仓库，然后执行：

```bash
git remote add origin https://github.com/你的用户名/仓库名.git
```

### 2.3 首次提交

```bash
# 添加所有文件（.gitignore 已排除 node_modules 等）
git add -A

# 创建提交
git commit -m "feat: 初始化多语言电子书文库站"

# 推送到远程仓库
git push -u origin main
```

### 2.4 日常提交

```bash
git add .
git commit -m "更新描述"
git push
```

---

## 三、GitHub Pages 自动部署配置

项目已内置 `.github/workflows/deploy.yml` 工作流，支持三种触发方式：

| 触发方式 | 说明 |
|---------|------|
| **Push 触发** | 向 `main` / `master` 分支推送代码时自动部署 |
| **Cron 定时** | 每天 UTC 02:00（北京时间 10:00）自动更新数据并部署 |
| **手动触发** | 在 Actions 页面手动运行工作流 |

### 3.1 开启 GitHub Pages

1. 打开 GitHub 仓库页面
2. 点击顶部导航栏 **Settings**（设置）
3. 在左侧菜单找到 **Pages**（页面）
4. 在 **Build and deployment** → **Source**（源）中选择：
   ```
   Source: GitHub Actions
   ```
5. 保存设置，无需填写自定义构建命令

### 3.2 首次自动部署

- 完成上述配置后，向 `main` 分支推送一次代码
- 打开仓库顶部的 **Actions**（操作）标签页
- 会看到 `Deploy to GitHub Pages` 工作流正在运行
- 等待三个 Job（Build Site、Deploy to GitHub Pages、Commit Updated Data）全部通过
- 部署成功后，Pages URL 会显示在 Settings → Pages 页面，通常为：
  ```
  https://你的用户名.github.io/仓库名/
  ```

### 3.3 手动触发工作流

1. 打开仓库的 **Actions**（操作）标签页
2. 左侧工作流列表选择 `Deploy to GitHub Pages`
3. 点击右侧的 **Run workflow**（运行工作流）按钮
4. 选择分支（通常为 `main`），再次点击 **Run workflow**
5. 等待执行完成即可

---

## 四、Secrets 配置说明

如果需要从远程接口获取书籍数据，需要配置 Secrets：

### 4.1 配置 DATA_URL Secret

1. 打开 GitHub 仓库 **Settings**（设置）
2. 左侧菜单找到 **Secrets and variables** → **Actions**
3. 点击 **New repository secret**（新建仓库密钥）
4. 填写：
   - **Name:** `DATA_URL`
   - **Value:** 你的书籍数据 JSON 接口地址（必须是公开可访问的 HTTPS URL）
5. 点击 **Add secret**（添加密钥）保存

> 若未配置 `DATA_URL`，脚本会自动生成内置的示例数据，项目仍可正常运行。

### 4.2 工作流权限说明

工作流已声明以下 `permissions`（无需额外配置）：
```yaml
permissions:
  contents: write   # 用于 commit-data Job 提交 data.json 变更
  pages: write      # 用于部署到 GitHub Pages
  id-token: write   # 用于 Pages 身份验证
```

---

## 五、Vite 子路径适配说明

### 5.1 base 配置

`vite.config.js` 中已配置：
```js
export default {
  base: './'
}
```

该配置使用**相对路径**，能够完美兼容：
- `https://user.github.io/repo/` （项目子路径部署）
- `https://ebook.example.com/` （根域名部署）
- `https://user.github.io/repo/subdir/` （嵌套子路径）
- 本地 `file://` 协议直接打开 HTML 预览

### 5.2 前端数据加载兼容

`js/app.js` 中的 `resolveDataPath()` 函数会自动兼容：
- `<base>` 标签设置的子路径
- 无 `<base>` 标签的默认根路径
- Vite 构建后的相对路径资源加载

无需因部署路径修改任何前端代码。

---

## 六、自定义书籍数据

### 6.1 数据格式说明

`data/data.json` 为 JSON 数组，每条记录包含以下字段：

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 唯一标识（正整数） |
| `title` | string | 翻译后书名 |
| `originalTitle` | string | 原书名 |
| `author` | string | 作者 |
| `translator` | string | 译者（无则留空字符串） |
| `language` | string | 语言代码（见下方列表） |
| `category` | string | 分类代码（见下方列表） |
| `description` | string | 书籍简介 |
| `coverUrl` | string | 封面图片 URL |
| `rating` | number | 评分（0-5 之间小数） |
| `pages` | number | 页数 |
| `publishYear` | number | 出版年份（公元前为负数） |
| `isbn` | string | ISBN 编号 |
| `downloadUrl` | string | 下载链接 |
| `readUrl` | string | 在线阅读链接 |

### 6.2 可用语言代码

| 代码 | 语言 |
|------|------|
| `zh` | 中文 |
| `en` | English |
| `ja` | 日本語 |
| `ko` | 한국어 |
| `fr` | Français |
| `es` | Español |
| `de` | Deutsch |
| `ru` | Русский |

### 6.3 可用分类代码

| 代码 | 分类 |
|------|------|
| `novel` | 小说 |
| `scifi` | 科幻 |
| `history` | 历史 |
| `philosophy` | 哲学 |
| `biography` | 传记 |
| `programming` | 编程 |
| `poetry` | 诗歌 |
| `economy` | 经济 |

### 6.4 数据修改方法

**方式一：直接编辑本地文件**
```bash
# 编辑 data/data.json
# 然后提交
git add data/data.json
git commit -m "chore(data): 更新书籍数据"
git push
```
推送后 GitHub Actions 会自动构建部署。

**方式二：使用远程接口自动更新**
1. 部署一个返回上述格式 JSON 的 HTTPS 接口
2. 在 GitHub Secrets 中配置 `DATA_URL` 为该接口地址
3. 每天定时触发或手动触发工作流，会自动拉取最新数据并提交回仓库

---

## 七、常见问题 FAQ

### Q1: 部署后页面是空白的 404？
**A:** 检查以下几点：
1. 确认 Settings → Pages 的 Source 已选择 `GitHub Actions`，不是 `Deploy from branch`
2. 确认 Actions 工作流执行成功，三个 Job 都显示绿色对勾
3. 等待 1~3 分钟让 CDN 缓存生效
4. 清除浏览器缓存后刷新

### Q2: 部署后 data.json 加载失败（404）？
**A:** 通常是路径配置问题：
1. 检查 `vite.config.js` 中 `base` 是否为 `'./'`
2. 确认 `dist/` 目录下存在 `data/data.json` 文件
3. 检查仓库根目录是否存在 `.nojekyll` 文件（防止 GitHub Jekyll 处理下划线路径）

### Q3: 本地开发正常，部署后样式错乱？
**A:** 这是 GitHub Pages 的 Jekyll 处理导致的：
1. 确认仓库根目录有 `.nojekyll` 空文件（本项目已自带）
2. 重新触发一次工作流部署

### Q4: 工作流 commit-data Job 失败？
**A:** 常见原因：
1. 工作流权限不足：确认 Settings → Actions → General → Workflow permissions 选择 `Read and write permissions`
2. 分支受保护：将工作流 bot（github-actions[bot]）添加到受保护分支的允许推送列表

### Q5: 如何绑定自定义域名？
**A:** 
1. 在仓库根目录创建 `CNAME` 文件，内容为你的域名（如 `ebook.example.com`）
2. 在你的 DNS 服务商添加 CNAME 记录，指向 `你的用户名.github.io`
3. Settings → Pages → Custom domain 填入域名，勾选 Enforce HTTPS

### Q6: 如何修改主题色？
**A:** 编辑 `css/style.css` 顶部的 CSS 变量：
```css
:root {
    --accent: #3b82f6;        /* 修改主色 */
    --accent-hover: #2563eb;  /* 修改悬停色 */
}
[data-theme="dark"] {
    --accent: #60a5fa;
}
```

### Q7: 定时任务（Cron）没有触发？
**A:** GitHub Actions 的定时调度有以下限制：
1. 免费账户的定时任务可能有延迟（通常 0~15 分钟）
2. 仓库超过 60 天无活动时，定时任务会被自动暂停，手动触发一次即可恢复
3. 可在 Settings → Actions → Disable / enable 中检查工作流状态

### Q8: 构建过程中 Node 版本报错？
**A:** 工作流已锁定 `node-version: '20'`，如仍有问题：
1. 本地确保使用 Node 18+：`node -v`
2. 删除 `package-lock.json` 和 `node_modules`，重新 `npm install`
3. 提交最新的 lock 文件到仓库

### Q9: 封面图片加载失败？
**A:** 
1. 默认封面使用 Unsplash CDN，国内访问可能较慢或失败
2. 可将 `coverUrl` 替换为国内可访问的图片 CDN（如 jsdelivr、七牛、阿里 OSS 等）
3. 卡片图片加载失败时 CSS 已自动 fallback 为渐变背景

---

## 八、一键部署清单

首次部署请按以下顺序检查：

- [ ] `npm install` 成功
- [ ] `npm run build` 成功，生成 `dist/`
- [ ] `git init && git add -A && git commit -m "init"` 成功
- [ ] GitHub 新建仓库并 `git push -u origin main`
- [ ] Settings → Pages → Source 选择 `GitHub Actions`
- [ ] （可选）Settings → Secrets 添加 `DATA_URL`
- [ ] （可选）Settings → Actions → Workflow permissions 设为读写
- [ ] Actions 页面确认工作流执行成功
- [ ] 访问 Pages URL 确认网站正常
