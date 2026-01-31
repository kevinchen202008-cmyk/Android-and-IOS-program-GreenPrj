# Android 测试版构建与 GitHub 归档

本文说明如何在 Android Studio 中完成构建与测试，并将生成的 APK 作为测试版本归档到 GitHub Release。

---

## 一、在 Android Studio 中完成构建

1. 打开项目：用 **Android Studio** 打开本仓库下的 **`android`** 目录（或仓库根目录并选择 `android` 为项目）。
2. 同步 Gradle：若提示 “Gradle files have changed”，点击 **Sync Now**。
3. 构建 APK：
   - 菜单 **Build → Build Bundle(s) / APK(s) → Build APK(s)**，
   - 或使用 **Run** 运行一次应用（会先构建再安装）。
4. 构建成功后，Debug APK 路径为：
   ```text
   android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

## 二、在 Android Studio 中运行测试

1. **单元测试（无需设备）**  
   - 菜单 **Run → Run 'Tests in GreenPrj.app'**，或  
   - 在左侧 **Project** 中展开 `app/src/test`，右键 `java` → **Run 'All Tests'**。  
   - 或在项目根终端执行：`.\gradlew.bat :app:testDebugUnitTest`（在 `android` 目录下）。

2. **仪器化/UI 测试（需设备或模拟器）**  
   - 连接真机或启动模拟器后，运行 `app/src/androidTest` 下的测试，或  
   - 终端：`.\gradlew.bat :app:connectedDebugAndroidTest`（在 `android` 目录下）。

建议在归档前至少跑通单元测试。

---

## 三、将 APK 作为测试版归档到 GitHub

### 方式 A：使用脚本（推荐）

1. 在 **Android Studio** 中完成**构建**（确保已生成 `app-debug.apk`）。
2. 在仓库**根目录**打开 PowerShell，执行：
   ```powershell
   .\scripts\android-upload-test-release.ps1
   ```
3. 脚本会：
   - 检查 `android/app/build/outputs/apk/debug/app-debug.apk` 是否存在；
   - 创建标签（如 `android-test/1.0.0`）；
   - 创建 GitHub Release 并上传 APK 作为附件。

首次使用需已安装 [GitHub CLI](https://cli.github.com/)（`gh`）并已登录（`gh auth login`）。

### 方式 B：手动归档

1. **打标签并推送**（在仓库根目录）：
   ```bash
   git tag android-test/1.0.0
   git push origin android-test/1.0.0
   ```
2. **创建 Release 并上传 APK**：
   - 打开 GitHub 仓库 → **Releases** → **Draft a new release**；
   - **Choose a tag** 选择刚推送的 `android-test/1.0.0`；
   - **Release title** 填如：`Android 测试版 1.0.0`；
   - **Describe** 中可简要说明：Debug 测试包、构建日期、主要功能；
   - 在 **Attach binaries** 中上传本地文件：  
     `android/app/build/outputs/apk/debug/app-debug.apk`（可重命名为 `greenprj-android-test-1.0.0.apk`）；
   - 发布 Release。

或使用 GitHub CLI（在仓库根目录）：

```powershell
gh release create android-test/1.0.0 `
  --title "Android 测试版 1.0.0" `
  --notes "Debug 测试包，用于内测与归档。构建自当前 main/master。" `
  "android\app\build\outputs\apk\debug\app-debug.apk#greenprj-android-test-1.0.0.apk"
```

---

## 四、版本号说明

- 当前应用版本在 `android/app/build.gradle.kts` 中：`versionName = "1.0.0"`。
- 每次发新的测试归档时，可沿用同一 `versionName`，仅改标签（如 `android-test/1.0.0-2`）或随应用版本升级标签（如 `android-test/1.0.1`）。

完成上述步骤后，APK 会作为该 Release 的附件保留在 GitHub 上，便于内测分发与归档。
