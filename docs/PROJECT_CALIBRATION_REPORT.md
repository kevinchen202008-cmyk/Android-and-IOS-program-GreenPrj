# 项目整体校准报告

**校准日期**：2026-01-30  
**范围**：PRD、UX 设计规范、Architecture、Epics 与当前实现的一致性；test-artifacts 对设计/实现的覆盖度与一致性。  
**目的**：按项目现状从头核对，标注偏差并给出修正建议。

---

## 一、PRD、UX、Architecture、Epics 与实现的一致性

### 1.1 PRD 与实现

| PRD 条目 | 实现状态 | 说明 |
|----------|----------|------|
| **MVP 核心功能清单** | | |
| 用户认证与数据安全（密码、加密、会话） | ✅ 一致 | Web 与 Android 均已实现；Android 账本当前为 Room 明文存储，加密服务已存在可后续接入（见 docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md）。 |
| 记账：手动 + 发票扫描 + 短信解析 + 语音 + 分类 | ✅ 一致 | Web：CreateEntryForm、InvoiceScanForm、SMSInputForm、VoiceInputForm。Android：手工记账 + **解析短信**（粘贴/输入 + 与 Web 一致规则）+ **语音输入**（系统识别 + 解析预填）+ **扫描发票**（选图 + ML Kit OCR 预填）+ 列表 CRUD + 类别筛选，与 Web MVP 对齐。 |
| 统计（时间/类别、趋势图、类别图） | ✅ 一致 | Web 与 Android 均有统计页与图表。 |
| 预算（月度/年度、对比、超支提醒） | ✅ 一致 | Web 与 Android 均有预算设置与展示。 |
| 账本管理（跨端导入导出、去重、统一统计） | ✅ 一致 | Web 与 Android 均有合并/导入导出；去重与冲突解决已实现。 |
| 数据管理（导入导出、本地存储） | ✅ 一致 | Web：DataManagementPage（JSON/CSV、导入、删除）；Android：Merge 页含导出/导入/删除。 |
| 平台支持（Android + Web） | ✅ 一致 | 双端存在；Android 为完整应用，Web 为 SPA。 |
| **PRD 非功能（性能/安全/可靠性）** | 部分可验证 | NFR 如响应时间、崩溃率需在生产/压测中验证；AES-256、bcrypt、会话 30min 已按 PRD 实现。 |

**偏差与建议**：  
- Android 端已实现解析短信（粘贴）、语音输入、扫描发票（选图 OCR），与 Web MVP 对齐；PRD 无需再标注「仅手工记账」。  
- 其余 MVP 清单与实现一致。

---

### 1.2 UX 设计规范与实现

| UX 要求 | 实现状态 | 说明 |
|---------|----------|------|
| 快速记账 3 步内完成 | ✅ 一致 | Web/Android 均为：进入记账 → 填金额/日期/类别（及可选备注）→ 确认。 |
| 智能识别流程（扫描/短信/语音 → 确认入账） | ✅ 一致 | Web 与 Android 均有：解析短信（粘贴/输入）、语音输入、扫描发票（Web 选图/拍照 + Tesseract；Android 选图 + ML Kit），确认后预填表单。 |
| 数据安全感知（密码登录、本地存储提示） | ✅ 一致 | 双端均有登录与「数据存于本地」类提示。 |
| 统计一键查看、可视化清晰 | ✅ 一致 | 统计页与图表已实现。 |
| 多端一致性（交互模式、视觉风格） | ⚠️ 部分 | 术语与流程存在差异，已记录在 docs/CROSS_PLATFORM_CONSISTENCY_CHECKLIST.md；视觉均为 Material 风格。 |

**偏差与建议**：  
- Android 已支持语音输入（麦克风权限请求与拒绝提示）、扫描发票（选图；相机拍照可后续扩展）。短信解析为「粘贴/输入」与 Web 一致；读取短信权限为可选扩展。  
- 多端一致性按跨端清单逐项收敛即可。

---

### 1.3 Architecture 与实现

| 架构决策 | 文档表述 | 实际实现 | 一致性 |
|----------|----------|----------|--------|
| Web 技术栈 | Vite + React + TypeScript + MUI、IndexedDB、Zustand | ✅ 一致 | 一致 |
| Android 技术栈 | Kotlin + Clean Architecture + MVVM + Hilt + Room | ✅ 一致 | 一致 |
| Room 版本 | 规划文档已统一为 **Room 2.6.1** | android/app/build.gradle.kts 使用 2.6.1 | ✅ 一致 |
| 数据加密 | AES-256-GCM、密钥由密码派生 | Web 已实现；Android 有 EncryptionService，账本未加密写入 | ⚠️ 见 1.1 |
| 密码哈希 | bcrypt cost 12 | Web bcryptjs；Android PasswordHashService（jbcrypt） | ✅ 一致 |
| 跨端数据格式 | JSON、统一 schema | Web/Android 导出 JSON 与 schema 对齐 | ✅ 一致 |
| 本地优先、不上传云端 | 明确 | 双端均为本地存储 | ✅ 一致 |

**偏差与建议**：  
- **Room 版本**：已统一为 2.6.1（planning-artifacts 与 _bmad-output 已更新）。  
- 其余架构点与实现一致。

---

### 1.4 Epics/Stories 与实现

| 维度 | 说明 | 一致性 |
|------|------|--------|
| **Epic/Story 总数** | Epics 文档：9 Epic、63 Story；final-project-completion 标注 63/63 完成 | Web 侧 63 Story 对应功能已实现；Android 侧为**部分 Epic 实现**（见下）。 |
| **Web** | Epic 1–9 对应功能在 web/src 均有实现（pages、components、services、repositories、stores） | ✅ 一致 |
| **Android** | Epic 1–3 及 4/5/6/8 已实现；**Epic 3.6–3.11**：解析短信（粘贴）、语音输入、扫描发票（选图+OCR）已实现；**Epic 9**：语音需麦克风权限（请求与拒绝提示已处理），选图无需存储权限（GetContent）。 | ✅ 与 MVP 要求对齐；63 Story 按平台实现状态见实现状态表。 |
| **产出文档** | final-project-status 写「58 已完成、5 待完成（Android 1.2/1.4）」；final-project-completion 写「63/63 完成」 | 两篇文档时间接近但结论不同；当前代码表明 Android 1.2/1.4 已实现，而 Android 智能识别与设备权限 Story 未实现，建议以**当前代码**为准更新「Epic/Story 完成状态」文档。 |

**建议**：  
- 在 _bmad-output 或 docs 中维护一份 **「Epic/Story 实现状态表」**：按 Epic/Story 列出 Web / Android 两列（已实现 / 未实现 / 不适用），并随实现进度更新。  
- 将「63 Story 全部完成」限定为「Web 平台 63 Story 全部完成；Android 平台 Epic 1–3 及部分 4/5/6/8 已实现」，避免与 Epics 文档完全对齐造成误解。

---

## 二、test-artifacts 对设计/实现的覆盖度与一致性

### 2.1 测试计划（test-plan）与当前实现

| 文档 | 内容 | 与当前实现一致性 |
|------|------|------------------|
| **test-plan-2026-01-28--12.md** | 「待生成的测试」列出 Epic 2、4、5、6、7、8、9 | ❌ **已过时**：上述 Epic 在 test-generation-summary 与 tests/ 目录中已有 E2E/单元/组件测试，应改为「已生成」或移除「待生成」表述。 |
| 同一文档 | P0/P1/P2 优先级与 E2E/组件/单元类型规划 | ✅ 与现有 tests/ 结构大致对应，可保留；仅需更新状态。 |

**建议**：更新 test-plan，将 Epic 2、4、5、6、7、8、9 的「待生成」改为「已生成」，并补充实际测试文件路径与用例数（见下）。

---

### 2.2 测试设计（test-design）与实现覆盖

| 设计/文档 | 覆盖范围 | 与实现的对应关系 |
|-----------|----------|------------------|
| **test-design-epic-3-2026-01-26--9.md** | Epic 3 核心记账 | ✅ 与 web/tests/e2e/accounting/*、component/accounting/CreateEntryForm、unit 中 account-entry 对应。 |
| **test-plan 中其他 Epic** | Epic 2、4、5、6、7、8、9 的测试类型与用例列表 | ✅ 与 test-generation-summary 及实际文件一致；**无单独「测试设计」文档**，设计以 test-plan 中列表形式存在。 |

**建议**：若需可追溯性，可为 Epic 2、4、5、6、7、8、9 各建简短「测试设计」页（或合并为一篇），引用现有 spec/test 文件与用例编号；非必须，当前以 test-plan + test-generation-summary 即可。

---

### 2.3 最终测试报告与设计/实现的覆盖度

**E2E（Playwright）**

| Epic | 设计/计划 | 实际文件 | 覆盖度 |
|------|-----------|----------|--------|
| Epic 2 认证 | 密码设置/登录/修改/会话/访问控制 | auth/password-and-login.spec.ts, change-password.spec.ts | ✅ 覆盖 |
| Epic 3 记账 | 创建/CRUD/搜索筛选/访问控制 | accounting/create-entry, crud-operations, search-filter, access-control | ✅ 覆盖 |
| Epic 4 统计 | 统计页、时间/类别、图表、实时更新 | statistics/statistics-display.spec.ts | ✅ 覆盖 |
| Epic 5 预算 | 预算设置/对比/超支/修改 | budget/budget-management.spec.ts | ✅ 覆盖 |
| Epic 6 合并 | 导出/导入/去重/冲突 | merge/account-book-merge.spec.ts | ✅ 覆盖 |
| Epic 7 数据管理 | JSON/CSV 导出、导入、删除确认 | data-management/data-management.spec.ts | ✅ 覆盖 |
| Epic 8 操作日志 | 日志页、筛选、导出 | audit/operation-logs.spec.ts | ✅ 覆盖 |
| Epic 9 离线 | 离线 SPA 导航与核心页 | offline/offline-support.spec.ts | ✅ 覆盖（Web） |
| Epic 1 基础设施 | 无单独 E2E | 通过其他 E2E 间接覆盖（如登录后各页） | ⚠️ 无直接 Epic 1 用例，可接受 |

**单元/组件（Vitest）**

| Epic | 实际文件 | 覆盖度 |
|------|----------|--------|
| Epic 2 | auth-store、encryption、password-hash；组件 LoginForm、PasswordSetupForm、ChangePasswordForm | ✅ 覆盖 |
| Epic 3 | account-entry-service、account-entry-repository；组件 CreateEntryForm | ✅ 覆盖 |
| Epic 4 | statistics-service；组件 StatisticsPage | ✅ 覆盖 |
| Epic 5 | budget-service；组件 BudgetPage | ✅ 覆盖 |
| Epic 6 | merge export-service、import-service；组件 MergePage | ✅ 覆盖 |
| Epic 7 | csv-export、csv-import、data-deletion-service | ✅ 覆盖 |
| Epic 8 | operation-log-service；组件 OperationLogsPage | ✅ 覆盖 |
| Epic 1 | 无单独 Epic 1 单元测试（IndexedDB 等通过依赖方间接覆盖） | ⚠️ 可接受 |

**结论**：  
- 对所有**已实现的 Web Epic/功能**，test-artifacts 中的最终测试（E2E + 单元 + 组件）与设计和实现**一致且覆盖到位**。  
- Epic 1 无单独测试设计/用例，依赖其他 Epic 的测试间接覆盖，可接受；若需更强可追溯性，可在 test-plan 中增加「Epic 1：通过 E2E 登录及各页加载覆盖」的说明。  
- **Android**：当前无 _bmad-output 中的自动化测试报告；android/ 仅有本地单元测试（PasswordValidator、PasswordHashService、IdGenerator）与 1 个 UI 冒烟（MainActivitySmokeTest），与 Epics 中 Android Story 的对应关系需在后续补充（例如在 android/README 或 test-artifacts 中列出 Android 测试范围）。

---

### 2.4 test-artifacts 内部一致性

| 文档/产出 | 一致性说明 |
|-----------|------------|
| test-plan vs test-generation-summary | test-plan 中「待生成」与 test-generation-summary 及实际 tests/ 不符，需以 test-generation-summary 和仓库为准更新 test-plan。 |
| test-fixes-summary / test-fixes-v2 | 与当前 E2E 实现一致（等待、选择器、超时等修复已落地）。 |
| final-project-completion / final-project-status | 与 1.4 一致：两文对 Android 完成度表述不同，建议统一为「Web 63/63；Android 见实现状态表」。 |

---

## 三、建议修正清单（可执行）

1. **架构/Epics 文档**  
   - [x] 已将「Room 2.8.4」统一改为 **2.6.1**（规划文档与 _bmad-output 已更新）。  

2. **PRD / 产品范围**  
   - [x] Android 已实现解析短信（粘贴）、语音输入、扫描发票（选图 OCR），与 Web MVP 对齐；可选：在 PRD 中补充「Web/Android 功能矩阵」表。  

3. **Epic/Story 完成状态**  
   - [ ] 新增或更新「Epic/Story 实现状态表」（Web 列 / Android 列），并据此修正 final-project-status 或 final-project-completion 的叙述，避免「63/63 全部完成」与 Android 实际实现不符。  

4. **测试计划**  
   - [ ] 更新 test-plan-2026-01-28--12.md：将 Epic 2、4、5、6、7、8、9 标为已生成，并补充实际测试文件路径与用例数（可引用 test-generation-summary）。  

5. **测试设计可追溯性（可选）**  
   - [ ] 在 test-plan 中增加一句：Epic 1 通过其他 Epic 的 E2E（登录及各页）间接覆盖；如需可为 Epic 2/4/5/6/7/8/9 各建简短测试设计引用表。  

6. **Android 测试**  
   - [ ] 在 android/README 或 _bmad-output/test-artifacts 中说明当前 Android 测试范围（单元：认证/ID；UI 冒烟：MainActivity），与 Epics 中 Android Story 的覆盖关系及后续计划。  

---

## 四、参考文档

- PRD：`_bmad-output/planning-artifacts/prd-2026-01-26--2.md`  
- UX：`_bmad-output/planning-artifacts/ux-design-specification-2026-01-26--3.md`  
- 架构：`_bmad-output/planning-artifacts/architecture-2026-01-26--4.md`  
- Epics：`_bmad-output/planning-artifacts/epics-zh-2026-01-26--6.md`  
- 测试计划：`_bmad-output/test-plan-2026-01-28--12.md`  
- 测试生成总结：`_bmad-output/test-generation-summary-2026-01-28--13.md`  
- 项目状态：`_bmad-output/final-project-status-2026-01-28--21.md`、`final-project-completion-2026-01-28--23.md`  
- 跨端一致性：`docs/CROSS_PLATFORM_CONSISTENCY_CHECKLIST.md`  
- Android 验收：`docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md`  

---

**状态**：校准已完成；上述偏差与建议可按优先级在文档与代码中逐步落实。
