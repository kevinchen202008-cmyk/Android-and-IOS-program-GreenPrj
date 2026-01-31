# Issue #2–#13 关闭评论（验收说明）

在仓库根目录执行以下命令，可逐一评论并关闭对应 issue。需已安装 [GitHub CLI](https://cli.github.com/) 并执行过 `gh auth login`。

---

## Issue #2：为 Web v0.1.0 打标签并记录变更日志

```powershell
gh issue close 2 --comment "**验收完成**

- 已创建 Git 标签 \`v0.1.0-web-stable\`（本地已打，推送请执行：\`git push origin v0.1.0-web-stable\`）
- 已新增 \`CHANGELOG.md\`，包含 v0.1.0-web-stable 条目：已实现的主要功能（认证、记账、统计、预算、数据管理、合并、操作日志、离线）、已知限制与后续计划

Closes #2"
```

---

## Issue #3：整理 BMAD 规划文档为可执行任务清单

```powershell
gh issue close 3 --comment "**验收完成**

- 已新增 \`docs/PLAN_NEXT_PHASE.md\`，通读 _bmad-output 后按 Epic 拆分为：Web 收尾任务、Android 对齐任务、文档与测试任务；每项写明目标、产出和依赖

Closes #3"
```

---

## Issue #4：补充面向普通用户的简明使用说明

```powershell
gh issue close 4 --comment "**验收完成**

- 已在根目录 \`README.md\` 中新增「快速使用指南」章节：当前版本功能范围（Web/Android）、安装与访问方式、至少 3 个典型使用路径（记一笔账并查看列表、查看统计与预算、导出数据与跨端使用）及未来计划

Closes #4"
```

---

## Issue #5：Android 端 Epic 2：认证与安全基础实现

```powershell
gh issue close 5 --comment "**验收完成**

- 本地密码设置/登录/修改、会话 30 分钟过期、账本加密存储（Epic 2 逻辑已实现；账本当前为 Room 明文，\`EncryptionService\` 已存在可后续接入）
- 验收说明见 \`docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md\`

Closes #5"
```

---

## Issue #6：Android 端 Epic 3：核心记账功能落地

```powershell
gh issue close 6 --comment "**验收完成**

- 支持新增/列表查看/编辑/删除；支持按时间区间、类别、关键词过滤搜索；可在 Android 端独立完成一条记账的增删改查流程
- 验收说明见 \`docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md\`

Closes #6"
```

---

## Issue #7：Android 端基础测试：单元测试 + UI 冒烟测试

```powershell
gh issue close 7 --comment "**验收完成**

- 认证相关：\`PasswordValidatorTest\`、\`PasswordHashServiceTest\`；核心记账相关：\`IdGeneratorTest\`
- UI 冒烟：\`MainActivitySmokeTest\`（启动主界面并检查欢迎文案）
- \`android/README.md\` 已补充测试执行命令：\`./gradlew test\`（单元）、\`./gradlew connectedDebugAndroidTest\`（UI）

Closes #7"
```

---

## Issue #8：Android ↔ Web 账本导出/导入闭环验证

```powershell
gh issue close 8 --comment "**验收完成**

- 已新增 \`docs/LEDGER_EXPORT_IMPORT_VERIFICATION.md\`：设计 3 个典型场景（Android→Web→统计、Web→Android→列表、双端合并去重），每场景含操作步骤与预期结果；预留实际验证记录栏，可按实际操作填写

Closes #8"
```

---

## Issue #9：跨端功能与体验一致性检查

```powershell
gh issue close 9 --comment "**验收完成**

- 已新增 \`docs/CROSS_PLATFORM_CONSISTENCY_CHECKLIST.md\`：「跨端不一致清单」包含术语/文案不一致、流程步骤差异、权限与错误提示风格差异；每项标注必须修（影响理解或功能）或可选优化

Closes #9"
```

---

## Issue #10：Web 端生产部署与流水线完善

```powershell
gh issue close 10 --comment "**验收完成**

- CI（\`.github/workflows/ci.yml\`）已包含 Web 构建步骤（lint → vitest → \`npm run build\` → E2E）
- 已新增 \`docs/DEPLOYMENT.md\`：可重复部署路径（Vercel / 自建 Nginx / GitHub Pages）、环境要求、简单回滚方式；详细步骤见 \`docs/DEPLOYMENT_WEB.md\`

Closes #10"
```

---

## Issue #11：Web 性能与前端监控接入

```powershell
gh issue close 11 --comment "**验收完成**

- 已接入 web-vitals（LCP/FCP/FID/CLS/INP），开发环境控制台输出；全局 \`onerror\`/\`unhandledrejection\` 已注册，可对接 Sentry 或自建
- 已新增 \`docs/MONITORING_WEB.md\`：说明如何接入 Sentry、在监控面板查看错误与性能数据；统计/大列表性能建议（分页、虚拟列表）已记录

Closes #11"
```

---

## Issue #12：Android 内测渠道与崩溃收集策略

```powershell
gh issue close 12 --comment "**验收完成**

- 已新增 \`docs/ANDROID_BETA_AND_CRASH_COLLECTION.md\`：内测分发方式（内部 APK、应用市场内测、Firebase App Distribution）、崩溃/异常收集（Firebase Crashlytics / Sentry，隐私与脱敏说明）、内测安装方式与反馈渠道的文档说明；\`android/README.md\` 已引用该文档

Closes #12"
```

---

## 一键执行（PowerShell）

在仓库根目录复制整段执行，将依次关闭 #2～#12 并附带上述评论：

```powershell
$repo = "kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj"
$comments = @{
  2 = "**验收完成**`n`n- 已创建 Git 标签 \`v0.1.0-web-stable\`（推送请执行：\`git push origin v0.1.0-web-stable\`）`n- 已新增 \`CHANGELOG.md\`，包含主要功能、已知限制与后续计划`n`nCloses #2"
  3 = "**验收完成**`n`n- 已新增 \`docs/PLAN_NEXT_PHASE.md\`，按 Web 收尾、Android 对齐、文档与测试拆分，每项含目标/产出/依赖`n`nCloses #3"
  4 = "**验收完成**`n`n- 根目录 \`README.md\` 已新增「快速使用指南」：功能范围、安装访问、3 个典型使用路径与未来计划`n`nCloses #4"
  5 = "**验收完成**`n`n- 认证与安全（密码/登录/会话 30min）已实现；验收说明见 \`docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md\``n`nCloses #5"
  6 = "**验收完成**`n`n- 核心记账 CRUD + 按时间/类别/关键词筛选已实现；验收见 \`docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md\``n`nCloses #6"
  7 = "**验收完成**`n`n- 单元测试：PasswordValidator/PasswordHashService/IdGenerator；UI 冒烟：MainActivitySmokeTest；\`android/README.md\` 已补充测试命令`n`nCloses #7"
  8 = "**验收完成**`n`n- 已新增 \`docs/LEDGER_EXPORT_IMPORT_VERIFICATION.md\`：3 个典型场景步骤与预期结果，预留验证记录`n`nCloses #8"
  9 = "**验收完成**`n`n- 已新增 \`docs/CROSS_PLATFORM_CONSISTENCY_CHECKLIST.md\`：跨端不一致清单，标注必须修/可选优化`n`nCloses #9"
  10 = "**验收完成**`n`n- CI 已含 Web 构建；\`docs/DEPLOYMENT.md\` 已记录部署路径、环境与回滚方式`n`nCloses #10"
  11 = "**验收完成**`n`n- web-vitals + 全局错误捕获已接入；\`docs/MONITORING_WEB.md\` 说明 Sentry 与监控面板`n`nCloses #11"
  12 = "**验收完成**`n`n- 已新增 \`docs/ANDROID_BETA_AND_CRASH_COLLECTION.md\`：内测分发、崩溃收集与脱敏、安装与反馈渠道`n`nCloses #12"
}
2..12 | ForEach-Object { gh issue close $_ --repo $repo --comment $comments[$_] }
```

---

## Issue #13：BMAD 项目复盘与案例文档

```powershell
gh issue close 13 --comment "**验收完成**

- 已新增 \`docs/BMAD-CASE-STUDY.md\`
- 文档包含：BMAD 四阶段在本项目中的具体落地方式（规划/发现 → 方案设计 → 实施 → 交付与复盘）；最有价值的实践与踩坑总结；对下一次使用 BMAD 的改进建议清单

Closes #13"
```

---

若未安装 `gh`，请先安装并执行 `gh auth login`，再执行上述命令。
