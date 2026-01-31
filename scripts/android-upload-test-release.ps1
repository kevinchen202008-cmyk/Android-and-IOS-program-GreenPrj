# 将 Android Debug APK 作为测试版归档到 GitHub Release
# 使用前：1) 在 Android Studio 中完成 Build APK；2) 已安装并登录 gh (gh auth login)
# 在仓库根目录执行：.\scripts\android-upload-test-release.ps1

$ErrorActionPreference = "Stop"
$repoRoot = if ($PSScriptRoot) { (Resolve-Path (Join-Path $PSScriptRoot "..")).Path } else { Get-Location }
Set-Location $repoRoot

$apkPath = Join-Path $repoRoot "android\app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apkPath)) {
    Write-Host "未找到 APK，请先在 Android Studio 中执行 Build → Build APK(s)。" -ForegroundColor Red
    Write-Host "预期路径: $apkPath" -ForegroundColor Yellow
    exit 1
}

# 从 build.gradle.kts 读取 versionName，默认 1.0.0
$gradleFile = Join-Path $repoRoot "android\app\build.gradle.kts"
$versionName = "1.0.0"
if (Test-Path $gradleFile) {
    $m = Select-String -Path $gradleFile -Pattern 'versionName\s*=\s*"([^"]+)"' | Select-Object -First 1
    if ($m) { $versionName = $m.Matches.Groups[1].Value }
}

$tag = "android-test/$versionName"
$assetName = "greenprj-android-test-$versionName.apk"

Write-Host "APK: $apkPath" -ForegroundColor Cyan
Write-Host "版本: $versionName | 标签: $tag" -ForegroundColor Cyan

# 若标签已存在则跳过创建，直接上传到已有 Release
$tagExists = $null -ne (git tag -l $tag 2>$null)
if (-not $tagExists) {
    git tag $tag
    git push origin $tag
    Write-Host "已创建并推送标签: $tag" -ForegroundColor Green
}

$notes = @"
Android 测试版 $versionName（Debug 包）

- 用于内测与归档，构建自当前 main/master。
- 安装前请在系统设置中允许「未知来源」安装。
- 详细说明见 [android/ANDROID_TEST_RELEASE.md](android/ANDROID_TEST_RELEASE.md)。
"@

# 上传时使用友好文件名（path#显示名）
$apkWithName = "${apkPath}#${assetName}"

# 若 Release 已存在则上传资源；否则创建 Release 并上传
$releaseExists = gh release view $tag 2>$null
if ($releaseExists) {
    gh release upload $tag $apkWithName --clobber
    if ($LASTEXITCODE -ne 0) { gh release upload $tag $apkPath --clobber }
    Write-Host "已更新 Release 附件: $tag" -ForegroundColor Green
} else {
    gh release create $tag $apkWithName --title "Android 测试版 $versionName" --notes $notes
    if ($LASTEXITCODE -ne 0) { gh release create $tag $apkPath --title "Android 测试版 $versionName" --notes $notes }
    Write-Host "已创建 Release 并上传 APK: $tag" -ForegroundColor Green
}

Write-Host "完成。可在 GitHub 仓库的 Releases 页面查看并下载 $assetName。" -ForegroundColor Green
