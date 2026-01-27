# Playwright 浏览器安装脚本
# 确保浏览器版本与 Playwright 版本匹配

Write-Host "正在重新安装 Playwright 浏览器..." -ForegroundColor Yellow

# 强制重新安装所有浏览器（仅 chromium）
npx playwright install chromium --force

Write-Host "`n安装完成！" -ForegroundColor Green
Write-Host "现在可以运行: npm run test:e2e" -ForegroundColor Green
