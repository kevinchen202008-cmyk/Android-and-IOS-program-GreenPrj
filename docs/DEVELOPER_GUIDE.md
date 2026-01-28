## GreenPrj 开发者指南

本指南面向参与 GreenPrj 项目的开发者，概述项目结构、常用脚本、测试与 CI 以及贡献约定。  
当前重点针对 **Web 版本**；Android 后续阶段按计划推进。

### 1. 项目结构概览

仓库主要目录（简化版）：

```text
Android-and-IOS-program-GreenPrj/
├── android/                 # Android 原生工程（Kotlin + Room + Hilt）
├── web/                     # Web 前端（React + TS + Vite + MUI）
│   ├── src/
│   │   ├── components/      # 通用与特定功能组件
│   │   ├── features/        # 按领域划分的功能模块（auth/accounting/statistics/...）
│   │   ├── services/        # 领域服务与数据访问封装
│   │   ├── types/           # TypeScript 类型定义
│   │   ├── utils/           # 工具函数
│   │   ├── App.tsx          # 应用入口组件
│   │   └── main.tsx         # Vite 入口
│   ├── tests/               # 单元 / 组件 / E2E 测试
│   ├── vite.config.ts       # Vite 配置（含手工分包）
│   └── package.json
├── _bmad-output/            # BMM / BMAD 工件与报告（已加日期+序号后缀）
├── docs/                    # 本目录：用户 / 部署 / 开发者文档
└── README.md                # 项目总览与方法论说明
```

更详细说明可参考根目录 `README.md` 与 `_bmad-output` 下的各类文档。

### 2. 开发环境与常用脚本

在仓库根目录：

```bash
cd web
npm install          # 安装依赖

# 开发模式
npm run dev          # 启动本地开发服务器（默认 5173 端口）

# 构建
npm run build        # tsc && vite build，输出到 dist/

# 预览构建
npm run preview
```

> 提示：本项目推荐使用 **Cursor** 作为主 IDE，配合脚手架脚本与 GitHub Actions 完成日常开发与 CI。

### 3. 测试与质量保证

- **测试框架**  
  - 单元测试：Vitest  
  - 组件测试：Vitest + Testing Library  
  - 端到端测试（E2E）：Playwright  

- **常用命令**（在 `web` 目录）：

```bash
npm run test           # 运行单元 / 组件测试
npm run test:e2e      # 运行 E2E 测试
npm run test:coverage # 测试覆盖率报告
```

- **测试文档入口**：  
  - `web/TEST_STATUS.md`：测试状态概览  
  - `web/QUICK_TEST_EXECUTION.md`：快速测试执行指南  
  - `web/tests/README.md`：测试目录与规范说明  
  - `_bmad-output/test-generation-summary-2026-01-28--13.md`：自动化测试生成与覆盖总结  

CI 在 `.github/workflows/ci.yml` 中配置，会执行：

1. `npm run lint`  
2. `vitest run`（排除 E2E）  
3. `npm run build`（`tsc && vite build`）  
4. `npm run test:e2e`（Playwright）

### 4. 代码风格与贡献约定

- **语言与框架**：  
  - Web：TypeScript + React + MUI + Zustand；  
  - 按 feature / domain 组织代码，避免巨型组件或 God service。

- **代码风格**：  
  - 统一使用 ESLint + Prettier（配置见 `web/.eslintrc.cjs`、`web/package.json`）；  
  - 禁止随意使用 `any`，如需使用需有明确说明；  
  - 优先使用类型安全的 API 与辅助函数（例如 schema 校验后再做类型断言）。

- **Git 约定**：  
  - 建议使用前缀型提交信息：`feat: ...` / `fix: ...` / `docs: ...` / `chore: ...`；  
  - 大改动优先开分支（如 `feature/statistics-enhancement`），再合并到主干。  

- **BMAD / BMM 工件**：  
  - `_bmad-output` 下的规划、测试与总结文档已按 `日期--编号` 规范重命名，并在 `bmad-output-index-2026-01-28--26.md` 中建立索引；  
  - 新增文档时建议继续使用相同命名和更新索引表，保持可追踪性。

### 5. 后续开发方向

根据 `_bmad-output/next-phase-plan-2026-01-28--25.md`：

- 阶段一（质量与生产就绪）：TypeScript 严格检查、构建与体积优化、文档与安全检查（当前已完成前两项与首版文档）；  
- 阶段二：Android 功能补齐（Epic 2–9）与 Web 功能增强（i18n、主题、可视化增强等）；  
- 阶段三：部署、监控与用户反馈闭环。  

建议在开始新任务前先阅读上述计划文档与 `sprint-status.yaml`，确保新工作与整体路线保持一致。

