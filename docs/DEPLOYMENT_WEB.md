## GreenPrj Web 部署指南（静态站点）

本指南针对当前 **本地优先 / 单页应用（SPA）** 的 Web 版本，说明如何构建并部署到常见的静态托管平台（如 GitHub Pages、Netlify、Vercel 或自建 Nginx）。

### 1. 构建生产版本

在仓库根目录执行：

```bash
cd web
npm install          # 首次或依赖变更时执行
npm run build        # tsc && vite build，输出到 dist/
```

构建成功后，静态资源会生成到 `web/dist/` 目录（包含 `index.html`、压缩后的 JS/CSS、静态资源等）。

### 2. 环境变量与配置

当前版本为纯前端本地应用：

- **无需服务端环境变量**；  
- 构建脚本 `npm run build` 只依赖 Node.js 与前端依赖；  
- 如未来接入后端 API，可通过 `.env` / `.env.production` 等方式注入 `VITE_` 前缀变量（例如 `VITE_API_BASE_URL`），并在代码中通过 `import.meta.env.VITE_API_BASE_URL` 访问。

> 注意：请勿在前端代码或 `.env` 中硬编码真实秘钥（如数据库密码、云 AK/SK 等），生产级敏感配置应只存在于后端或部署平台的密钥管理中。

### 3. 部署到 GitHub Pages（示例）

1. **GitHub 仓库设置**  
   - 确保代码已推送到 GitHub 仓库的 `master` 或 `main` 分支。  
   - 在 GitHub 仓库中开启 Pages（Settings → Pages），选择 `gh-pages` 分支或 `docs`/`dist` 目录。

2. **使用 GitHub Actions 自动部署（推荐）**  
   - 可以新增一个简单的 CI 工作流，在构建后将 `web/dist` 发布到 `gh-pages` 分支。  
   - 示例步骤：
     - 安装依赖 → `npm run build`  
     - 使用 `actions/upload-pages-artifact` + `actions/deploy-pages` 发布静态文件。

3. **本地手动部署（不推荐长期使用）**  
   - 手动将 `web/dist` 目录内容推送到 `gh-pages` 分支；  
   - 仅适合作为初次验证使用。

### 4. 部署到 Netlify / Vercel

#### Netlify

- **Build command**：`npm run build`  
- **Publish directory**：`web/dist`  
- 可在 Netlify 控制台关联 GitHub 仓库，选择 `web` 目录为工作目录，构建完成后自动发布。

#### Vercel

- 在 Vercel 控制台导入 GitHub 仓库；  
- **Root directory** 选择 `web`；  
- **Build command**：`npm run build`（或保持默认 `vite` 模板配置）；  
- **Output directory**：`dist`。  

### 5. 自建 Nginx / 其他静态服务器

1. 将 `web/dist` 目录内容上传到服务器（例如 `/var/www/greenprj`）。  
2. 配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/greenprj;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

3. 重新加载 Nginx 配置：`nginx -s reload`。

### 6. 发布前后的检查清单

- [ ] `npm run build` 在本地通过且无严重告警；  
- [ ] 生产环境可正常访问首页与各功能页面；  
- [ ] 刷新页面与直接访问子路由（如 `/statistics`）能正确加载 SPA；  
- [ ] 浏览器控制台无严重错误；  
- [ ] 如启用 HTTPS，证书有效且配置正确。  

如需更自动化的 CI/CD（包括构建 + 部署），可以在 `.github/workflows/ci.yml` 的基础上增加发布步骤，或新建一个专门的 `deploy` 工作流。

