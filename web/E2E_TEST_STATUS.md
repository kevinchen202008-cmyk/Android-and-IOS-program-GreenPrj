# E2E 测试状态与执行指南

**更新时间**: 2026-01-27

---

## ✅ 已完成的重构

### 1. **浏览器端 Helper 创建**
- ✅ `tests/e2e/helpers/browser-db.ts` - 所有数据库和认证操作在浏览器端执行
  - `clearAppDatabase(page)` - 在浏览器中清空 IndexedDB
  - `setupTestUserAndLogin(page)` - 设置测试用户并登录
  - `selectCategory(page, category)` - 选择类别（创建表单）
  - `selectCategoryFilter(page, category)` - 选择类别筛选（列表页）
  - `createEntryViaUI(page, opts)` - 通过 UI 创建单个账目
  - `createEntriesViaUI(page, count, opts)` - 通过 UI 创建多个账目

### 2. **所有 E2E 测试文件已重构**
- ✅ `create-entry.spec.ts` - 使用浏览器 helper
- ✅ `crud-operations.spec.ts` - 使用浏览器 helper
- ✅ `access-control.spec.ts` - 使用浏览器 helper
- ✅ `search-filter.spec.ts` - 使用浏览器 helper

### 3. **Playwright 配置更新**
- ✅ 仅配置 **chromium**（避免 Firefox/WebKit 未安装错误）
- ✅ `baseURL` 和 `webServer.url` 改为 `http://localhost:3000`（匹配 Vite 配置）

---

## ⚠️ 重要提示

### 如果看到以下错误：

1. **`indexedDB is not defined`** 或 **`clearDatabase` 错误**
   - **原因**: 可能运行了旧版本的测试文件或缓存
   - **解决**: 清除 Playwright 缓存并重新运行

2. **`Executable doesn't exist at ... firefox.exe`**
   - **原因**: Playwright 配置可能未生效
   - **解决**: 确认 `playwright.config.ts` 只包含 chromium，或运行 `npx playwright install chromium`

---

## 🚀 执行步骤

### 步骤 1: 清除缓存（如果遇到旧错误）

```powershell
cd "D:\Projects\Android and IOS program-GreenPrj\web"
# 清除 Playwright 缓存
Remove-Item -Recurse -Force test-results, playwright-report -ErrorAction SilentlyContinue
# 清除 node_modules/.cache（如果有）
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
```

### 步骤 2: 确认配置

检查 `playwright.config.ts` 应只包含：
```typescript
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
],
```

### 步骤 3: 运行测试

```powershell
cd "D:\Projects\Android and IOS program-GreenPrj\web"
npm run test:e2e
```

Playwright 会自动：
1. 启动 dev server (`npm run dev`)
2. 等待 `http://localhost:3000` 就绪
3. 运行所有 E2E 测试（仅 chromium）

---

## 📊 预期结果

### 测试用例总数：14 个

| 测试文件 | 用例数 | 状态 |
|---------|-------|------|
| `create-entry.spec.ts` | 3 (P0) | ⏳ 待验证 |
| `crud-operations.spec.ts` | 3 (P0) | ⏳ 待验证 |
| `access-control.spec.ts` | 3 (P0) | ⏳ 待验证 |
| `search-filter.spec.ts` | 5 (P1) | ⏳ 待验证 |

### 成功标志

- ✅ 所有测试在 **chromium** 中运行（无 Firefox/WebKit 错误）
- ✅ 无 `indexedDB is not defined` 错误
- ✅ 测试通过或显示真实的 UI 交互失败（而非环境错误）

---

## 🔍 故障排查

### 问题 1: 仍然看到 Firefox/WebKit 错误

**检查**:
```powershell
# 查看 playwright.config.ts
Get-Content playwright.config.ts | Select-String "firefox|webkit"
```

**解决**: 确保配置中只有 chromium

### 问题 2: 仍然看到 `clearDatabase` 错误

**检查**:
```powershell
# 确认测试文件没有导入旧 fixture
Get-Content tests\e2e\accounting\*.spec.ts | Select-String "clearDatabase|setupTestDatabase|from.*fixtures"
```

**解决**: 应该没有匹配结果。如果有，说明文件未保存，重新保存所有测试文件

### 问题 3: Dev server 启动失败

**检查**:
```powershell
# 手动启动 dev server
npm run dev
# 在另一个终端检查端口
netstat -ano | findstr :3000
```

**解决**: 确保 3000 端口可用，或修改 `vite.config.ts` 和 `playwright.config.ts` 中的端口

---

## 📝 测试 Helper 使用示例

```typescript
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'

test('示例测试', async ({ page }) => {
  // 1. 设置用户并登录（自动清空 DB）
  await setupTestUserAndLogin(page, '/')
  
  // 2. 导航到记账页面
  await page.click('text=记账')
  
  // 3. 创建账目
  await createEntryViaUI(page, {
    amount: '100.00',
    category: 'food',
    notes: '午餐'
  })
  
  // 4. 返回列表查看
  await page.getByRole('button', { name: '返回列表' }).click()
  
  // 5. 断言
  await expect(page.getByText('¥100.00')).toBeVisible()
})
```

---

## ✅ 下一步

1. **运行测试**: 按照上述步骤执行
2. **查看报告**: 测试完成后运行 `npx playwright show-report` 查看 HTML 报告
3. **修复失败**: 如果测试失败，查看具体错误并修复 UI 交互或断言问题

---

**状态**: 重构完成，等待本机验证
