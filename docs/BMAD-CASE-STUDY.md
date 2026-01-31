# BMAD 项目复盘与案例文档

**项目**：GreenPrj（跨平台个人记账）  
**复盘日期**：2026-01-30  
**目的**：总结本项目中 BMAD 方法论的落地方式、实践与踩坑，并为下一次使用 BMAD 提供改进建议。

---

## 一、BMAD 四阶段在本项目中的具体落地方式

本项目将 BMAD 流程落实为「规划 → 方案设计 → 实施 → 交付与复盘」四个阶段，产出集中在 `_bmad-output/` 与 `_bmad-output/planning-artifacts/`。

### 1. 阶段一：规划与发现（Brief / PRD / 范围）

**目标**：明确产品愿景、用户价值与需求边界。

**落地方式**：

- **Product Brief**（`planning-artifacts/product-brief-GreenPrj-2026-01-26--1.md`）：产品定位、目标用户、核心价值主张、成功指标。
- **PRD**（`planning-artifacts/prd-2026-01-26--2.md`）：功能需求列表、非功能需求、优先级与依赖。
- **Epic 分解**（`epics-2026-01-26--5.md` / `epics-zh-2026-01-26--6.md`）：9 个 Epic、63 个 Story，与 PRD 功能点一一对应，保证「可执行 + 可验收」。

**产出**：需求与范围稳定，FR 覆盖 100%（70/70），无前向依赖，为后续架构与实施就绪评估提供输入。

---

### 2. 阶段二：方案与设计（Architecture / UX / 测试设计）

**目标**：确定技术方案、体验规范与质量策略。

**落地方式**：

- **架构文档**（`planning-artifacts/architecture-2026-01-26--4.md`）：Web（Vite + React + IndexedDB）与 Android（Kotlin + Room）技术选型、数据模型、安全与加密、跨端数据格式约定。
- **UX 设计规范**（`planning-artifacts/ux-design-specification-2026-01-26--3.md`）：界面结构、流程与一致性要求，与 Epic/Story 对齐。
- **实施就绪评估**（`planning-artifacts/implementation-readiness-report-2026-01-26--7.md`）：对 PRD、架构、Epic、UX 做一致性检查，结论为 **READY FOR IMPLEMENTATION**（置信度 HIGH），再进入开发。
- **测试设计**：针对 Epic 3 等核心流程产出测试设计（`test-design-epic-3-2026-01-26--9.md`）、测试计划（`test-plan-2026-01-28--12.md`），明确 E2E / 单元 / 组件覆盖策略。

**产出**：开发前「要做什么、怎么做、怎么验」已明确，减少实施阶段返工。

---

### 3. 阶段三：实施（Epic 开发 / CI / 代码审查）

**目标**：按 Epic/Story 交付功能，并通过 CI 与代码审查保证质量。

**落地方式**：

- **按 Epic 实施**：Web 端 Epic 1–9 依次完成（认证、记账、统计、预算、合并、数据管理、操作日志、离线）；Android 端 Epic 1（初始化 + Room）完成后，再推进 Epic 2–3（认证与记账）。每完成一批 Epic 产出完成总结（如 `epic4-5-completion-summary`、`epic8-completion-summary`）。
- **CI 闭环**：`.github/workflows/ci.yml` 串联 lint → 单元/组件测试 → **tsc && vite build** → Playwright E2E，保证合入主分支即可构建、可测。
- **代码审查**：对 CI/质量相关改动与关键模块做抽查（`code-review-summary-2026-01-28--22.md`），确认模块边界、依赖与类型使用合理。
- **测试修复与回归**：E2E 不稳定时集中修复（等待、选择器、超时），并形成测试修复总结（`test-fixes-summary`、`test-fixes-v2`），避免同类问题重复出现。

**产出**：Web 功能与测试、CI 全部就绪；Android 基建与部分 Epic 完成；代码质量与测试覆盖可追溯。

---

### 4. 阶段四：交付与复盘（状态报告 / 下一阶段计划 / 文档）

**目标**：固化当前状态、明确后续任务，并形成可复用的文档与清单。

**落地方式**：

- **项目状态与完成报告**：`final-project-status-2026-01-28--21.md`、`final-project-completion-2026-01-28--23.md` 汇总 Epic/Story 完成率、技术栈与剩余工作。
- **下一阶段计划**：`next-phase-plan-2026-01-28--25.md`、`next-steps-2026-01-28--24.md` 将「夯实质量、平台扩展、部署与运营」拆成可执行任务与优先级。
- **可执行任务清单**：`docs/PLAN_NEXT_PHASE.md` 将 _bmad-output 中的规划与总结抽取为「Web 收尾 / Android 对齐 / 文档与测试」三类任务，每项含目标、产出与依赖。
- **用户与运维文档**：`docs/USER_GUIDE.md`、`docs/DEPLOYMENT.md`、`docs/DEVELOPER_GUIDE.md` 等，便于交付与后续维护。

**产出**：项目可交接、可延续；新成员或下一次迭代可依据文档与清单继续推进。

---

## 二、最有价值的实践与踩坑总结

### 2.1 有价值实践

| 实践 | 说明 |
|------|------|
| **先实施就绪再开发** | 实施就绪评估通过后再写代码，避免「做到一半发现 PRD 与架构不一致」的返工。 |
| **Epic/Story 与 PRD 一一对应** | 每个 Story 有清晰验收标准，完成即勾选，进度可量化（如 63 Story 完成率）。 |
| **CI 包含完整构建** | 使用 `tsc && vite build` 而非仅 `vite build`，在 CI 中暴露类型与构建问题，与本地一致。 |
| **E2E 与单元/组件并重** | E2E 覆盖关键流程（登录、记账、统计、预算等）；单元/组件覆盖业务逻辑与 UI 行为，共 130+ 单元/组件、64 E2E。 |
| **集中修复测试并文档化** | E2E 不稳定时集中修等待与选择器，并写测试修复总结，便于后续维护与回归。 |
| **产出集中归档** | 所有 BMAD 产出按编号与类型放在 `_bmad-output/`，索引表（`bmad-output-index`）便于查找与复盘。 |

### 2.2 踩坑与应对

| 踩坑 | 应对 |
|------|------|
| **TypeScript 严格检查未在 CI 体现** | 初期 CI 仅跑 `vite build`，部分类型问题未暴露。后改为 `npm run build`（tsc + vite build），并修掉 `null`/`undefined`、schema 断言、`NodeJS` 命名空间等问题。 |
| **构建 chunk 体积告警** | 部分依赖导致 chunk > 500KB。通过 `manualChunks` 拆包（react、mui、charts、ocr、db、crypto）并设置 `chunkSizeWarningLimit: 800`，告警可控。 |
| **E2E 不稳定（元素未加载、重定向未完成）** | 增加 tab 点击、URL 等待、`waitForTimeout` 与合理 `timeout`；使用更稳定的选择器（如 role、文本）而非脆弱 DOM。 |
| **Android 与 Web 节奏不同** | Web 先完成 Epic 1–9，Android 仅 Epic 1 时已有一批产出。通过「下一阶段计划」与「可执行任务清单」明确 Android 对齐任务与依赖，避免两边脱节。 |
| **跨端术语与流程不一致** | 后期通过「跨端一致性检查清单」（`docs/CROSS_PLATFORM_CONSISTENCY_CHECKLIST.md`）系统性列出术语、流程、错误提示差异，并标注必须修/可选优化。 |

---

## 三、对下一次使用 BMAD 的改进建议清单

- **规划阶段**  
  - [ ] 在 Product Brief 或 PRD 中明确「第一版交付范围」（例如仅 Web 或仅 Android 某几条 Epic），避免范围蔓延。  
  - [ ] Epic 拆解时顺带标出「依赖其他 Epic」的关系，便于排期与并行度评估。  
  - [ ] 实施就绪评估增加「测试策略与优先级」（哪些 Epic 必须先有 E2E、哪些可后补），与测试设计阶段衔接。

- **方案与设计阶段**  
  - [ ] 架构文档中提前约定「跨端数据格式与版本」（如导出 JSON schema），减少后期对齐成本。  
  - [ ] 对核心 Epic（如认证、记账）在开发前就产出测试设计或用例提纲，与 Story 验收标准一致。

- **实施阶段**  
  - [ ] 第一个 Epic 完成后即接入 CI（lint + 构建 + 最少一组 E2E），再扩展测试与 Epic，避免后期一次性补 CI。  
  - [ ] E2E 使用「页面对象」或统一封装（如 waitForNavigation、稳定选择器），减少重复等待与脆弱选择器。  
  - [ ] 每完成 1–2 个 Epic 做一次轻量代码审查或模块抽查，及早发现架构漂移。

- **交付与复盘阶段**  
  - [ ] 在「下一阶段计划」中明确「可交付物」（如 tag、CHANGELOG、部署文档），便于与发布节奏对齐。  
  - [ ] 复盘时更新本案例文档（BMAD-CASE-STUDY.md），补充本次新踩坑与有效实践，形成组织级经验。

---

## 四、参考文档

- 规划与产出索引：`_bmad-output/bmad-output-index-2026-01-28--26.md`  
- 实施就绪报告：`_bmad-output/planning-artifacts/implementation-readiness-report-2026-01-26--7.md`  
- 下一阶段计划：`_bmad-output/next-phase-plan-2026-01-28--25.md`  
- 可执行任务清单：`docs/PLAN_NEXT_PHASE.md`  
- 代码审查摘要：`_bmad-output/code-review-summary-2026-01-28--22.md`  
- 测试修复总结：`_bmad-output/test-fixes-summary-2026-01-28--14.md`、`test-fixes-v2-2026-01-28--15.md`

---

**状态**：本文档满足 Issue #13 验收标准（`docs/BMAD-CASE-STUDY.md` 存在；包含 BMAD 四阶段落地方式、实践与踩坑总结、下次使用改进建议清单）。后续项目可在此基础上迭代补充。
