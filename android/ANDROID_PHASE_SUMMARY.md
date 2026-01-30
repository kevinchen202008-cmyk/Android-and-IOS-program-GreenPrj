# Android 阶段性总结

**更新日期**: 2026-01-28  
**项目**: GreenPrj · Android 端

---

## 一、本阶段完成内容

### 1. 基建与构建

| 项 | 状态 |
|----|------|
| Epic 1：项目初始化、Room、Hilt、MVVM 结构 | ✅ 已完成（见 ANDROID_INITIALIZATION_STATUS / ROOM_DATABASE_STATUS） |
| Gradle / AGP 兼容 | ✅ 升级至 AGP 8.5.2、Kotlin 1.9.24，Gradle 8.7；compileSdk/targetSdk 34 |
| 启动图标 | ✅ 使用 drawable/ic_launcher（矢量），避免缺失 mipmap 报错 |

### 2. Epic 2：用户认证与会话

| 功能 | 实现 |
|------|------|
| 密码设置 | AuthManager.setupPassword + 强度校验，bcrypt 存储 |
| 密码登录 | AuthManager.login，SessionManager.markAuthenticated |
| 密码修改 | AuthManager.changePassword，登录态下可修改 |
| 会话超时 | SessionManager 30 分钟超时，isSessionValid() |
| 访问控制 | MainActivity 登录态切换；AccountingActivity 启动时校验会话，无效则 finish |

### 3. Epic 3：核心记账（当前阶段）

| Story | 内容 | 状态 |
|-------|------|------|
| 3.1 手动录入 | 金额、日期、类别、备注，校验后保存，列表实时更新 | ✅ |
| 3.2 账目列表 | RecyclerView 按日期倒序，类别标签、备注展示 | ✅ |
| 3.3 账目编辑 | 列表项点击编辑，表单预填，保存更新 | 本阶段完成 |
| 3.4 账目删除 | 列表项删除，确认弹窗后删除 | 本阶段完成 |
| 3.5 搜索筛选 | 搜索框（备注/金额/类别）、类别下拉、清除筛选、当前筛选提示 | ✅ |

### 4. Epic 4：统计与报表

| Story | 内容 | 状态 |
|-------|------|------|
| 4.1 时间维度 | 今日/本周/本月/本年周期选择，合计按周期计算 | ✅ |
| 4.2 类别占比 | 按类别金额与占比、降序、进度条 | ✅ |
| 4.5 实时统计 | 基于 Flow 实时计算，账目变更后自动更新 | ✅ |
| 4.3 消费趋势图 | 柱状图（今日/本周/本月/本年维度） | ✅ |
| 4.4 类别分布图 | 饼图（类别占比，与列表一致） | ✅ |

**实现要点**（Epic 4）：

- **StatisticsViewModel**：Period 枚举（TODAY/WEEK/MONTH/YEAR）与 toRange()，combine(getAllEntries(), selectedPeriod) 得到 filtered 列表后计算 total 与 categoryBreakdown（CategoryStat：key、amount、percentage）。
- **StatisticsActivity**：周期 Spinner、合计 TextView、类别 RecyclerView（CategoryBreakdownAdapter），collect stats Flow 更新 UI；无数据时显示「该周期暂无账目」。
- **导航**：主界面「统计」按钮启动 StatisticsActivity，会话校验同记账页。

### 5. Epic 5：预算管理

| Story | 内容 | 状态 |
|-------|------|------|
| 5.1 月度预算设置 | 设置当月预算金额，未设置时显示设置表单 | ✅ |
| 5.2 年度预算设置 | 设置当年预算金额，未设置时显示设置表单 | ✅ |
| 5.3 预算 vs 实际 | 展示预算、已用（当月/当年账目合计）、剩余、进度条 | ✅ |
| 5.4 超支与预警 | 已用 ≥ 80% 显示预警，≥ 预算显示「已超支」 | ✅ |
| 5.5 预算修改 | 修改已有月度/年度预算金额（弹窗） | ✅ |
| 5.6 预算删除 | 删除预算并恢复为「未设置」表单 | ✅ |

**实现要点**：

- **BudgetRepository**：基于 BudgetDao + AccountEntryDao；`getTotalAmountBetween` 按日期区间汇总账目金额；`getMonthlyBudgetStatus` / `getYearlyBudgetStatus` 返回 BudgetStatus（预算、已用、剩余、占比、isExceeded、isWarning）。
- **BudgetViewModel**：当前月/年由 LocalDate.now() 决定；`monthlyStatus` / `yearlyStatus` 为 StateFlow；`setMonthlyBudget` / `setYearlyBudget` 创建或覆盖；`updateBudget` / `deleteBudget` 更新/删除后刷新状态。
- **BudgetActivity**：本月/本年两区域；未设置时显示输入框 +「设置」按钮，已设置时显示预算/已用/剩余/进度条/状态提示 +「修改」「删除」；修改与删除有确认弹窗。
- **导航**：主界面「预算」按钮启动 BudgetActivity，会话校验同记账/统计。

### 6. Epic 6：账本合并

| Story | 内容 | 状态 |
|-------|------|------|
| 6.1 导出账本 | 导出所有账目、预算、类别、操作日志为 JSON（与 Web ExportFormatSchema 对齐） | ✅ |
| 6.2 导入账本 | 选择 JSON 文件，校验版本与数据，去重（同日期+同金额+同类别）后导入 | ✅ |
| 6.3 导出/导入 UI | 导出：CreateDocument 保存文件；导入：OpenDocument 选择文件，展示导入结果 | ✅ |

**实现要点**：

- **MergeRepository**：`exportToJson()` 从 AccountEntryDao/BudgetDao/OperationLogDao 取数据，转为 ExportFormatJson（JsonModels）后 Gson 序列化；`importFromJson(json)` 解析、校验 version/data，按 key（date+amount+category）去重，插入账目与预算，返回 MergeResult(imported, duplicates, errors)。
- **MergeViewModel**：`exportToJson(onExported)`、`importFromJson(json)`，StateFlow 暴露 isExporting/isImporting、message、importResult。
- **MergeActivity**：CreateDocument 保存导出 JSON；OpenDocument 选择文件后读取并调用 importFromJson；展示 message 与导入结果文案。
- **导航**：主界面「账本合并」按钮启动 MergeActivity，会话校验同记账/统计。

### 7. Epic 7：数据管理（删除所有数据）

| Story | 内容 | 状态 |
|-------|------|------|
| 7.1 删除所有账目与预算 | 清空账目表与预算表，不删除密码/会话 | ✅ |
| 7.2 确认流程 | 用户需输入「DELETE」确认后执行 | ✅ |

**实现要点**：

- **BudgetDao**：新增 `deleteAllBudgets()`；**MergeRepository**：新增 `deleteAllData()`，先统计条数再调用 `accountEntryDao.deleteAllEntries()`、`budgetDao.deleteAllBudgets()`，返回 `DeleteAllResult(entriesDeleted, budgetsDeleted)`。
- **MergeViewModel**：新增 `deleteAllData()`、`isDeleting`、`deleteCompleted`；删除完成后通过 `deleteCompleted` 通知 Activity 关闭。
- **MergeActivity**：新增「危险操作」区块与「删除所有数据」按钮；弹窗要求输入「DELETE」方可确认，确认后调用 `viewModel.deleteAllData()`，收到 `deleteCompleted` 后 Toast 并 `finish()`。

### 8. Epic 8：操作日志与审计

| Story | 内容 | 状态 |
|-------|------|------|
| 8.1 记录关键操作 | 登录、改密、导出、导入、删除所有数据 写入 operation_logs | ✅ |
| 8.2 操作日志列表 | 按时间倒序展示，时间/操作/类型/内容/结果 | ✅ |
| 8.3 清理旧日志 | 清理 90 天前旧日志 | ✅ |

**实现要点**：

- **AuditRepository**：`logSuccess(operation, type, content)`、`logFailure(..., error)`（协程 IO 不阻塞）；`getLogsFlow()` 来自 OperationLogDao；`cleanupOldLogs(daysToKeep)` 使用 `countLogsBefore` + `deleteLogsBefore`。
- **OperationLogDao**：新增 `countLogsBefore(beforeTime)`。
- **MergeRepository**：注入 AuditRepository，导出/导入/删除所有数据后调用 logSuccess/logFailure。
- **MainActivity**：注入 AuditRepository，登录成功、修改密码成功后调用 logSuccess。
- **OperationLogsViewModel**：collect getLogsFlow() 更新 logs；`cleanupOldLogs(90)`。
- **OperationLogsActivity**：RecyclerView（LogItemAdapter）、「清理 90 天前旧日志」按钮、空态提示。
- **导航**：主界面「操作日志」按钮启动 OperationLogsActivity，会话校验同记账/统计。

### 9. Epic 9：离线支持

| Story | 内容 | 状态 |
|-------|------|------|
| 9.1 本地优先 | 账目、预算、操作日志均存于 Room，无网络依赖 | ✅（设计如此） |
| 9.2 离线说明 | 主界面已登录时展示「数据存于本地，可离线使用」 | ✅ |

**实现要点**：

- 本应用为**本地优先**：记账、统计、预算、账本合并、数据管理、操作日志均使用本地 Room/文件，不依赖网络，所有功能**离线可用**。
- 主界面在已登录且会话有效时，在功能按钮下方增加文案「数据存于本地，可离线使用」（`offline_hint`），明确告知用户可离线使用。

### 10. 文档与测试

- **ANDROID_ACCOUNTING_MANUAL_TEST.md**：记账（登录、录入、列表、会话、编辑、删除、筛选）的手工测试步骤与通过标准。
- **ANDROID_STATISTICS_MANUAL_TEST.md**：统计（周期、合计、类别占比、实时更新）的手工测试步骤与通过标准。
- **ANDROID_BUDGET_MANUAL_TEST.md**：预算（月度/年度设置、预算 vs 实际、修改、删除、超支与预警）的手工测试步骤与通过标准。
- 本总结文档：阶段性交付与下一步计划。

---

## 二、下一步计划（可选）

1. **可选**：为 Repository 接入加密（Epic 2/7 要求）。
2. **可选**：云同步、多设备合并等（需后端与协议设计）。

---

## 三、建议提交

当前改动可分批提交，例如：

- `android: add operation logs (Epic 8) and offline hint (Epic 9)`

---

**状态**：阶段性总结已完成；Epic 3–9 已实现并纳入本总结（记账、统计、预算、账本合并、数据管理、操作日志、离线支持）。
