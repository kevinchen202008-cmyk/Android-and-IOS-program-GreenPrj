# GreenPrj 部署说明

本文档说明 Web 端的 **CI 构建**、**可重复执行的部署路径** 以及 **环境要求与简单回滚方式**。静态站点详细步骤见 [DEPLOYMENT_WEB.md](DEPLOYMENT_WEB.md)。

---

## 1. CI 中的 Web 构建

GitHub Actions 工作流 `.github/workflows/ci.yml` 已包含 Web 端构建与测试：

- **触发**：`push` / `pull_request` 到 `master` 或 `main` 分支。
- **步骤**（`web` 目录下）：
  1. 安装依赖（`npm ci` / `npm install`）
  2. Lint（`npm run lint`）
  3. 单元与组件测试（`npx vitest run --exclude "tests/e2e/**"`）
  4. **构建**：`npm run build`（`tsc && vite build`，输出到 `web/dist/`）
  5. E2E：安装 Playwright 浏览器后执行 `npm run test:e2e`

因此每次合入主分支都会自动执行 Web 构建；部署时可使用该构建产物或在本机/部署机再次执行相同命令。

---

## 2. 环境要求

- **Node.js**：20.x（与 CI 一致，推荐 LTS）
- **npm**：8+（或与 Node 捆绑版本）
- **构建**：在仓库根目录执行 `cd web && npm ci && npm run build`，需能访问 `web/package-lock.json` 及依赖源。

无服务端运行时要求；当前为纯前端 SPA，部署目标为静态文件托管。

---

## 3. 可重复执行的部署路径

### 路径 A：Vercel（推荐）

1. 在 [Vercel](https://vercel.com) 导入本 GitHub 仓库。
2. **Root Directory** 设为 `web`；**Build Command** 为 `npm run build`；**Output Directory** 为 `dist`。
3. 每次推送到主分支可自动构建并发布（或在 Vercel 控制台手动 Redeploy）。

### 路径 B：自建 Nginx

1. 在具备 Node 的机器上：`cd web && npm ci && npm run build`。
2. 将 `web/dist/` 目录内容上传到服务器（如 `/var/www/greenprj`）。
3. Nginx 配置示例见 [DEPLOYMENT_WEB.md#自建 Nginx](DEPLOYMENT_WEB.md)；需 `try_files $uri /index.html` 以支持 SPA 路由。

### 路径 C：GitHub Pages（含 Actions）

1. 在仓库 Settings → Pages 中启用 GitHub Pages（源可选 GitHub Actions）。
2. 新增或复用 workflow：在 `web` 下执行 `npm ci && npm run build`，使用 `actions/upload-pages-artifact` 与 `actions/deploy-pages` 将 `web/dist` 发布到 Pages。

任选一条路径即可满足「至少一条可重复执行的部署路径」。

---

## 4. 简单回滚方式

| 部署方式 | 回滚做法 |
|----------|----------|
| **Vercel** | 在 Vercel 控制台 Deployments 中选择上一版成功部署，点击「Promote to Production」。 |
| **自建 Nginx** | 保留上一版 `dist` 包（如 `dist.previous`），出问题时用其覆盖当前 `dist` 并重载 Nginx 或刷新 CDN 缓存。 |
| **GitHub Pages** | 在 Actions 中重新运行上一版 commit 对应的 workflow，或本地回退到上一 tag/commit 后重新执行部署 workflow。 |

建议发布前为当前版本打 tag（如 `v0.1.0-web-stable`），便于回滚时定位对应代码与构建。

---

## 5. 参考

- 详细构建、环境变量、各平台步骤：[DEPLOYMENT_WEB.md](DEPLOYMENT_WEB.md)
- CI 配置：[.github/workflows/ci.yml](../.github/workflows/ci.yml)
