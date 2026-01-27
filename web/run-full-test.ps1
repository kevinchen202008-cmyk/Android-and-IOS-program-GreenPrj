# GreenPrj Web - 完整测试执行脚本
# 在 PowerShell 中运行: .\run-full-test.ps1
# 若在 Cursor 终端遇到 EPERM，请在本机 PowerShell 或 CMD 中运行此脚本

$ErrorActionPreference = "Stop"
$webRoot = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " GreenPrj Web 完整测试" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $webRoot

# 1. 单元测试 + 组件测试
Write-Host "[1/2] 运行单元测试与组件测试 (Vitest)..." -ForegroundColor Yellow
npm run test -- --run
if ($LASTEXITCODE -ne 0) {
    Write-Host "单元/组件测试失败。" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "单元/组件测试通过。" -ForegroundColor Green
Write-Host ""

# 2. E2E 测试
Write-Host "[2/2] 运行 E2E 测试 (Playwright)..." -ForegroundColor Yellow
npm run test:e2e
if ($LASTEXITCODE -ne 0) {
    Write-Host "E2E 测试失败。" -ForegroundColor Red
    exit $LASTEXITCODE
}
Write-Host "E2E 测试通过。" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " 全部测试通过" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
