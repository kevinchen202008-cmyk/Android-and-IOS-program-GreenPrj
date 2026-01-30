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
| 4.3/4.4 图表 | 趋势图、饼图（可选后续） | 待后续 |

**实现要点**：

- **StatisticsViewModel**：Period 枚举（TODAY/WEEK/MONTH/YEAR）与 toRange()，combine(getAllEntries(), selectedPeriod) 得到 filtered 列表后计算 total 与 categoryBreakdown（CategoryStat：key、amount、percentage）。
- **StatisticsActivity**：周期 Spinner、合计 TextView、类别 RecyclerView（CategoryBreakdownAdapter），collect stats Flow 更新 UI；无数据时显示「该周期暂无账目」。
- **导航**：主界面「统计」按钮启动 StatisticsActivity，会话校验同记账页。

### 5. 文档与测试

- **ANDROID_ACCOUNTING_MANUAL_TEST.md**：记账（登录、录入、列表、会话、编辑、删除、筛选）的手工测试步骤与通过标准。
- **ANDROID_STATISTICS_MANUAL_TEST.md**：统计（周期、合计、类别占比、实时更新）的手工测试步骤与通过标准。
- 本总结文档：阶段性交付与下一步计划。

---

## 二、下一步计划（按原计划继续）

1. **Epic 4**：可选增强 4.3/4.4 图表（趋势图、类别饼图）。
2. **Epic 5–9**：预算、合并、数据管理、操作日志、离线等，与 Web 对齐，按优先级分批实现。
3. **可选**：为 Repository 接入加密（Epic 2/7 要求）；为关键操作写操作日志（Epic 8）。

---

## 三、建议提交

当前改动可分批提交，例如：

- `android: add statistics screen (Epic 4: time dimension and category breakdown)`

---

**状态**：阶段性总结已完成；Epic 3 记账与 Epic 4 统计已实现并纳入本总结。
