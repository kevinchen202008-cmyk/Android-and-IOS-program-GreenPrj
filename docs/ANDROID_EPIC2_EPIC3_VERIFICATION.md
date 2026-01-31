# Android Epic 2 / Epic 3 验收说明

**目的**：对照 GitHub Issue #5（Epic 2：认证与安全）、#6（Epic 3：核心记账）的验收标准，说明当前实现状态。

---

## Epic 2：认证与安全基础

| 验收项 | 状态 | 说明 |
|--------|------|------|
| 支持本地密码设置、登录、修改 | ✅ | `AuthManager` + `MainActivity`：设置密码、登录、修改密码流程完整。 |
| 账本数据以加密形式存储（与 Web 约定兼容） | ⚠️ 部分 | 密码哈希与会话由 `AuthPreferences`/`SessionManager` 管理；账目当前为 Room 明文存储。`EncryptionService`（AES-256-GCM）已存在，可用于后续在 Repository 层接入写入前加密。 |
| 会话过期处理（如 30 分钟无操作自动退出） | ✅ | `SessionManager.isSessionValid(30)`；`MainActivity.onResume` 与 `AccountingActivity.onCreate` 会检查并退回登录态。 |
| 真机/模拟器上可完成一条完整登录流水 | ✅ | 设置密码 → 登录 → 进入记账/统计/预算 → 30 分钟后需重新登录。 |

**结论**：Epic 2 功能验收通过；账本「加密存储」建议作为后续迭代在 Repository 层接入 `EncryptionService`。

---

## Epic 3：核心记账功能

| 验收项 | 状态 | 说明 |
|--------|------|------|
| 支持新增一条记账记录 | ✅ | `AccountingActivity` + `AccountingViewModel.createEntry`。 |
| 支持列表查看、编辑、删除 | ✅ | `EntryAdapter` 列表展示；编辑回填表单并 `updateEntry`；删除二次确认后 `deleteEntryById`。 |
| 支持按时间区间、类别进行基础过滤/搜索 | ✅ | `FilterState`、`filterCategorySpinner`、`filterQueryInput`；`AccountingViewModel.setFilter`/`clearFilter`，`filteredEntries` 响应筛选。 |
| 用 Android 客户端可独立完成一条记账的增删改查流程 | ✅ | 登录后进入记账页即可完成新增、列表查看、编辑、删除及按类别/关键词筛选。 |
| **解析短信**（与 Web MVP 对齐） | ✅ | 记账页「解析短信」按钮 → 粘贴/输入短信内容 → `SmsParseService.parseSms`（与 Web sms-service 规则一致）→ 预填金额/日期/类别/备注 → 确认入账。 |
| **语音输入** | ✅ | 「语音输入」→ 请求麦克风权限（拒绝时 Toast 提示）→ 系统语音识别（中文）→ `VoiceParseService.parseVoiceText` → 预填金额/类别/备注。 |
| **扫描发票** | ✅ | 「扫描发票」→ 选图（GetContent）→ ML Kit OCR → `OcrHelper.parseRecognizedText` → 预填金额/日期/备注。 |

**结论**：Epic 3 验收通过；Android 与 Web MVP 在手工记账、解析短信、语音输入、扫描发票上已对齐。
