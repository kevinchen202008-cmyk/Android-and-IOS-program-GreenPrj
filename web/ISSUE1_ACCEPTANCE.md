# Issue #1 验收说明

**目标**：稳定 Web 基线，使 `npm run lint` / `npm run test` / `npm run test:e2e` / `npm run build` 在本地与 CI 中稳定通过，并形成可依赖的 Web 端基线。

---

## 验收结果

| 验收项 | 命令 | 结果 |
|--------|------|------|
| Lint 无报错 | `npm run lint` | ✅ 通过 |
| 单元/组件测试无报错 | `npm run test` / `npm run test:run` | ✅ 通过（20 个测试文件，130 个用例） |
| E2E 无报错 | `npm run test:e2e` | ✅ 通过（64 个 E2E 用例） |
| 生产构建无报错 | `npm run build` | ✅ 通过（tsc + vite build） |
| 文档记录 | 命令执行方式与注意事项 | ✅ 已记录于 `web/WEB_BASELINE_COMMANDS.md` |

---

## 执行环境与说明

- **环境**：Node.js 18+，在 `web/` 目录下执行 `npm install` 后运行上述命令。
- **CI 建议**：使用 `npm run test:run` 做单次单元测试；E2E 需先执行 `npx playwright install --with-deps` 或使用 Playwright CI 镜像；E2E 约需 2–3 分钟，建议为流水线预留足够超时。
- **详细说明**：见 [web/WEB_BASELINE_COMMANDS.md](./WEB_BASELINE_COMMANDS.md)。

---

**结论**：四项验收标准均已满足，Web 基线可依赖，建议关闭本 Issue。
