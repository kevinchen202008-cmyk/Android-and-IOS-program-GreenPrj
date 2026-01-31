# GreenPrj Android

Android 端个人记账应用（Kotlin + Hilt + Room），与 Web 端数据模型兼容，支持账本导出/导入与合并。

---

## 构建与运行

- **环境**：Android Studio 或命令行，JDK 17+，Android SDK 21+。
- **构建**：在 `android` 目录下执行  
  `./gradlew assembleDebug`（Windows：`gradlew.bat assembleDebug`）
- **安装到设备/模拟器**：  
  `./gradlew installDebug`  
  或在 Android Studio 中打开本目录，选择设备后点击 Run。

---

## 测试执行命令

### 单元测试（JVM，无需设备）

在项目根目录（含 `build.gradle.kts` 的 `android` 目录）执行：

```bash
./gradlew test
```

或仅运行 `app` 模块的单元测试：

```bash
./gradlew :app:testDebugUnitTest
```

**覆盖范围**：认证相关（密码校验 `PasswordValidatorTest`、密码哈希 `PasswordHashServiceTest`）、核心记账相关（ID 生成 `IdGeneratorTest`）等。

### UI 冒烟测试（需连接设备或模拟器）

确保已连接真机或启动模拟器，然后执行：

```bash
./gradlew connectedDebugAndroidTest
```

或仅 `app` 模块：

```bash
./gradlew :app:connectedDebugAndroidTest
```

**覆盖范围**：至少 1 条 UI 流程——启动主界面（`MainActivity`），检查「欢迎使用 GreenPrj」等文案是否展示（见 `MainActivitySmokeTest`）。  
更完整的「登录 → 新建账单 → 查看列表」建议按 [ANDROID_ACCOUNTING_MANUAL_TEST.md](ANDROID_ACCOUNTING_MANUAL_TEST.md) 进行手动验证。

---

## 测试版构建与 GitHub 归档

在 Android Studio 中完成 **Build APK** 与 **测试** 后，可将 Debug APK 作为测试版本归档到 GitHub Release，便于内测分发与版本留存。步骤与脚本说明见：[ANDROID_TEST_RELEASE.md](ANDROID_TEST_RELEASE.md)。  
在仓库根目录执行 `.\scripts\android-upload-test-release.ps1` 可自动打标签并上传 APK（需已安装并登录 [GitHub CLI](https://cli.github.com/)）。

---

## 文档与验收

- Epic 2 / Epic 3 验收说明：[../docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md](../docs/ANDROID_EPIC2_EPIC3_VERIFICATION.md)
- 记账功能手动测试步骤：[ANDROID_ACCOUNTING_MANUAL_TEST.md](ANDROID_ACCOUNTING_MANUAL_TEST.md)
- 数据库与迁移：[ROOM_DATABASE_STATUS.md](ROOM_DATABASE_STATUS.md)
- 内测渠道与崩溃收集策略：[../docs/ANDROID_BETA_AND_CRASH_COLLECTION.md](../docs/ANDROID_BETA_AND_CRASH_COLLECTION.md)
