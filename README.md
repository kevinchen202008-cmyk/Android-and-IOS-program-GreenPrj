# GreenPrj

跨平台个人记账应用：**Web** 与 **Android** 双端，本地优先、数据可导出/导入与跨端合并。

---

## 快速使用指南

### 当前版本功能范围

- **Web 端（v0.1.0-web-stable）**：认证、手工记账、发票扫描（Tesseract）、短信解析（粘贴）、语音输入、统计与报表、预算管理、账本合并、数据管理（导出/导入 JSON/CSV）、操作日志、完全离线可用。
- **Android 端**：认证与安全、核心记账（录入/列表/编辑/删除/过滤）、解析短信（粘贴/输入）、语音输入（系统识别 + 解析预填）、扫描发票（选图 + ML Kit OCR 预填）、统计、预算、账本合并、操作日志等，与 Web MVP 对齐。
- **数据**：本地存储为主，不自动同步；支持导出/导入实现备份与跨设备迁移，Android 与 Web 账本格式兼容可互导。

### 安装与访问

| 平台 | 方式 |
|------|------|
| **Web** | 项目根目录执行：`cd web` → `npm install` → `npm run dev`，浏览器打开 `http://localhost:5173`。 |
| **Android** | 用 Android Studio 打开 `android` 目录，连接设备或模拟器，运行 `app`。或从本仓库 [Releases](https://github.com/kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj/releases) 下载测试版 APK 安装。 |

更详细的安装与运行说明见：**Web** → [docs/USER_GUIDE.md](docs/USER_GUIDE.md)，**开发/构建** → [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)。

### 典型使用路径

1. **记一笔账并查看列表**  
   设置/输入密码 → 进入「记账」→ 新增账目（金额、日期、类别、备注）→ 在列表中查看、编辑或删除。

2. **查看统计与预算**  
   登录后进入「统计」查看按天/周/月/年的消费趋势与类别分布；进入「预算」设置月度/年度预算并查看执行情况。

3. **导出数据与跨端使用**  
   在「数据管理」中导出 JSON 或 CSV 备份；可在另一台设备或 Web/Android 间导入同一备份文件，实现迁移或合并（合并时支持去重与冲突处理）。

更多场景与 FAQ 见 [docs/USER_GUIDE.md](docs/USER_GUIDE.md).

---

## Releases / 测试版下载

- **Android 测试版 APK**：在本仓库 [Releases](https://github.com/kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj/releases) 中下载 `greenprj-android-test-*.apk`（Debug 包，供内测与归档）。安装前请在系统设置中允许「未知来源」安装。
- 构建与归档说明见 [android/ANDROID_TEST_RELEASE.md](android/ANDROID_TEST_RELEASE.md)。

---

## 未来计划

- Android 与 Web 在术语、流程与体验上的一致性优化。
- Web 生产部署流水线、前端监控与性能优化。
- Android 内测渠道与崩溃收集、测试覆盖增强。

可执行任务清单见 [docs/PLAN_NEXT_PHASE.md](docs/PLAN_NEXT_PHASE.md)。

---

## 项目结构

| 目录 | 说明 |
|------|------|
| `web/` | Web 前端（Vite + React + TypeScript） |
| `android/` | Android 应用（Kotlin + Hilt + Room） |
| `docs/` | 用户与开发文档 |
| `scripts/` | 脚本（如 Android 测试版归档上传） |
| `.github/workflows/` | CI 配置（如 Web 构建） |
| `_bmad-output/` | BMAD 规划与产出归档 |

变更记录见 [CHANGELOG.md](CHANGELOG.md)。
