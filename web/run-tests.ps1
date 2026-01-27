# Web平台测试执行脚本
# 使用方法: .\run-tests.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GreenPrj Web平台测试执行脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查是否在正确的目录
if (-not (Test-Path "package.json")) {
    Write-Host "错误: 请在web目录下运行此脚本" -ForegroundColor Red
    exit 1
}

# 步骤1: 检查依赖
Write-Host "步骤1: 检查依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  安装依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  依赖安装失败！" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  依赖已安装 ✓" -ForegroundColor Green
}

# 检查jsdom
$jsdomInstalled = npm list jsdom 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  安装jsdom..." -ForegroundColor Yellow
    npm install --save-dev jsdom @vitest/coverage-v8
}

Write-Host ""

# 步骤2: 运行单元测试和组件测试
Write-Host "步骤2: 运行单元测试和组件测试..." -ForegroundColor Yellow
Write-Host "  执行命令: npm run test -- --run" -ForegroundColor Gray
Write-Host ""

npm run test -- --run

$unitTestExitCode = $LASTEXITCODE
Write-Host ""

if ($unitTestExitCode -eq 0) {
    Write-Host "  单元测试通过 ✓" -ForegroundColor Green
} else {
    Write-Host "  单元测试失败 ✗" -ForegroundColor Red
}

Write-Host ""

# 询问是否继续E2E测试
$continue = Read-Host "是否继续运行E2E测试? (Y/N)"
if ($continue -ne "Y" -and $continue -ne "y") {
    Write-Host "跳过E2E测试" -ForegroundColor Yellow
    exit $unitTestExitCode
}

# 步骤3: 检查Playwright浏览器
Write-Host "步骤3: 检查Playwright浏览器..." -ForegroundColor Yellow
$playwrightInstalled = npx playwright --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  安装Playwright浏览器..." -ForegroundColor Yellow
    npx playwright install chromium
} else {
    Write-Host "  Playwright已安装 ✓" -ForegroundColor Green
}

Write-Host ""

# 步骤4: 运行E2E测试
Write-Host "步骤4: 运行E2E测试..." -ForegroundColor Yellow
Write-Host "  执行命令: npm run test:e2e" -ForegroundColor Gray
Write-Host "  注意: E2E测试会自动启动开发服务器" -ForegroundColor Gray
Write-Host ""

npm run test:e2e

$e2eTestExitCode = $LASTEXITCODE
Write-Host ""

if ($e2eTestExitCode -eq 0) {
    Write-Host "  E2E测试通过 ✓" -ForegroundColor Green
} else {
    Write-Host "  E2E测试失败 ✗" -ForegroundColor Red
}

Write-Host ""

# 总结
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "测试执行完成" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($unitTestExitCode -eq 0 -and $e2eTestExitCode -eq 0) {
    Write-Host "所有测试通过！✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "部分测试失败，请查看上面的输出" -ForegroundColor Yellow
    exit 1
}
