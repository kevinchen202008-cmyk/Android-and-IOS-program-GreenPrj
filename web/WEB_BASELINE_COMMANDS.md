# Web 基线命令（Issue #1 验收）

本文档记录 Web 端基线验收的四个命令在**本地与 CI** 中的执行方式与注意事项，确保 `lint` / `test` / `test:e2e` / `build` 稳定通过。

---

## 环境要求

- **Node.js**: 建议 18+（与 Vite 5 / Vitest 兼容）
- **包管理器**: `npm` 或 `pnpm`（项目含 `package-lock.json`，可用 `npm`）
- 首次执行前在 `web/` 目录下执行：`npm install`

---

## 1. Lint（无报错）

```bash
cd web
npm run lint
# 或: pnpm run lint
```

- **说明**: 使用 ESLint 检查 `src` 下 `.ts` / `.tsx`，`--max-warnings 0` 表示不允许 warning。
- **注意**: 若报错，按提示修改代码或 ESLint 配置；CI 中此命令退出码非 0 即失败。

---

## 2. 单元/组件测试（无报错）

**单次运行（CI 或本地一次性验证）：**

```bash
cd web
npm run test:run
# 或: pnpm run test:run
```

**监听模式（本地开发）：**

```bash
npm run test
```

- **说明**: Vitest 执行单元测试与组件测试；`test:run` 为单次运行，适合 CI。
- **注意**: CI 中请使用 `npm run test:run`，避免 watch 模式挂起。

---

## 3. E2E 测试（无报错）

```bash
cd web
npm run test:e2e
# 或: pnpm run test:e2e
```

- **说明**: Playwright 执行 E2E 用例；会自动启动浏览器（无头或 headed，见 `playwright.config.ts`）。
- **注意**:
  - 首次运行前建议执行：`npx playwright install`（安装浏览器）。
  - 若需有头浏览器调试：`npx playwright test --ui` 或使用 `test:e2e:ui`。
  - 部分用例依赖 IndexedDB/本地存储，环境需允许。

---

## 4. 生产构建（无报错）

```bash
cd web
npm run build
# 或: pnpm run build
```

- **说明**: 先执行 `tsc` 做类型检查，再执行 `vite build` 生成生产产物。
- **注意**: 类型错误会导致 `tsc` 失败；产物在 `web/dist`。

---

## 验收标准（Issue #1）

- [x] `npm run lint` 无报错
- [x] `npm run test:run` 无报错（CI 使用此命令）
- [x] `npm run test:e2e` 无报错
- [x] `npm run build` 无报错
- [x] 在文档中记录上述命令的执行方式与注意事项（本文档）

---

## CI 建议

在 CI 流水线中建议顺序执行：

```bash
cd web
npm ci
npm run lint
npm run test:run
npm run build
npm run test:e2e
```

若 CI 环境无 Playwright 浏览器，需先执行 `npx playwright install --with-deps`（或使用官方 Playwright CI 镜像）。
