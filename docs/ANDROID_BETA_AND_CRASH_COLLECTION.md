# Android 内测渠道与崩溃收集策略

**目标**：确定内测/灰度发布渠道，接入基础崩溃与异常收集（注意隐私与脱敏），并在文档中说明内测安装方式与反馈渠道。

---

## 1. 内测分发方式

### 1.1 推荐方案（至少选一种）

| 方式 | 说明 | 配置要点 |
|------|------|----------|
| **内部 APK 分发** | 构建 `release` 或 `debug` 签名 APK，通过内网链接、网盘或自建下载页分发给内测用户。 | `./gradlew assembleRelease` 或 `assembleDebug`，输出在 `android/app/build/outputs/apk/`。可配合 CI 构建并上传到内部存储或 GitHub Releases（私有仓库可设权限）。 |
| **应用市场内测** | 使用华为/小米/应用宝等应用市场的「内测」或「开发者内测」通道，邀请指定用户安装。 | 在对应开放平台注册应用、上传签名 APK、创建内测群组并邀请用户；遵守各市场隐私与合规要求。 |
| **Firebase App Distribution** | 通过 Firebase 将构建产物分发给测试人员，支持按群组、邮件邀请。 | 在 Firebase 控制台创建项目并启用 App Distribution，在 CI 或本地使用 `gradle` 插件或 `fastlane` 上传 APK；测试者通过邮件链接安装。 |

### 1.2 本仓库当前建议

- **快速内测**：在 `android` 目录执行 `./gradlew assembleDebug`，将 `app/build/outputs/apk/debug/app-debug.apk` 通过内部链接或网盘分发给测试人员；在文档或下载页注明「仅限内测、勿外传」。
- **可重复流程**：若需自动化，可在 `.github/workflows` 中增加 job：构建 `assembleRelease`，将 APK 上传为 Artifact 或发布到 GitHub Releases 的 draft，供内测用户下载。

---

## 2. 崩溃 / 异常收集

### 2.1 隐私与脱敏

- **不收集**：密码、本地账本明文、用户输入的敏感备注；不随崩溃上报业务数据内容。
- **可收集**：崩溃堆栈、设备型号/系统版本、应用版本号、是否已登录（布尔）、上次操作页面/入口（可枚举值）；如需定位问题可收集非敏感的「操作类型」（如「点击记账」「打开统计」），不附带具体金额或类别内容。
- **建议**：在隐私政策或内测说明中写明「会收集崩溃与匿名使用信息用于改进产品」。

### 2.2 推荐工具与接入方式

| 方案 | 说明 | 接入要点 |
|------|------|----------|
| **Firebase Crashlytics** | 免费、自动收集崩溃与 NDK 崩溃，支持按版本/设备筛选。 | 在 Firebase 控制台创建项目并下载 `google-services.json` 放入 `android/app`；在 `app/build.gradle.kts` 中应用 `com.google.gms:google-services` 与 Crashlytics 插件；在 `Application` 或主入口无需额外代码即可自动上报。注意混淆时保留行号映射并上传 mapping 文件。 |
| **Sentry Android** | 支持 Java/Kotlin 崩溃与 Native，可附带自定义上下文（需脱敏）。 | 添加 `io.sentry:sentry-android` 依赖，在 `Application.onCreate` 中 `Sentry.init`；通过 `Sentry.configureScope` 设置脱敏后的上下文（如版本、页面），避免设置金额、密码等。 |
| **自建 / 日志上报** | 在 `Thread.setDefaultUncaughtExceptionHandler` 中捕获未处理异常，将堆栈与脱敏信息 POST 到自有接口。 | 仅上传堆栈、版本、设备信息；不包含用户数据；需自建存储与查询界面。 |

### 2.3 本仓库当前建议

- **优先**：接入 **Firebase Crashlytics**（与内测分发可选同一 Firebase 项目），按上述脱敏原则不附带业务数据；在文档中说明「崩溃信息仅用于修复问题，不含账本内容」。
- **备选**：若不能使用 Firebase，可接入 **Sentry Android** 或自建上报接口，并统一遵守同一套脱敏规则。

---

## 3. 内测安装方式与反馈渠道（文档说明）

### 3.1 内测安装方式

- **方式 A（内部 APK）**：  
  打开内测下载链接（或从邮件/群内获取），下载 `app-debug.apk` 或 `app-release.apk`；在 Android 设备上允许「未知来源」安装后，点击 APK 完成安装。若已安装旧版内测，可直接覆盖安装。
- **方式 B（应用市场内测）**：  
  通过应用市场提供的「内测链接」或「邀请码」进入内测页面，按提示安装/更新。
- **方式 C（Firebase App Distribution）**：  
  点击邮件中的「在设备上安装」链接，按提示完成安装。

请在项目或团队内部文档中写明当前采用的方式（A/B/C 或组合），以及「仅限内测、请勿外传」等说明。

### 3.2 反馈渠道

- **问题与建议**：提供内测用户统一反馈入口，例如：  
  - GitHub 仓库的 **Issues**（可为内测用户开权限或使用模板）；  
  - 问卷/表格链接（简要描述 + 设备型号 + 系统版本 + 复现步骤）；  
  - 群内/邮件集中收集后由负责人整理为 Issue 或 backlog。
- **崩溃反馈**：说明「若发生闪退，崩溃信息将自动上报（不含账本内容），如需补充复现步骤可在上述反馈渠道说明」。

将上述「内测安装方式」与「反馈渠道」写入 `README`、`android/README.md` 或本文档，便于内测用户查阅。

---

## 4. 验收自检

- [ ] 已确定并配置至少一种内测分发方式（内部 APK / 应用市场内测 / Firebase App Distribution 等）。
- [ ] 已接入崩溃/异常收集工具（Firebase Crashlytics / Sentry / 自建），并遵守隐私与脱敏要求。
- [ ] 在文档中已说明内测安装方式与反馈渠道（本文档或 README / android/README 中引用）。

完成以上三项即可视为满足「Android 内测渠道与崩溃收集策略」的文档与配置要求；实际分发与收集需在对应平台完成配置与测试。
