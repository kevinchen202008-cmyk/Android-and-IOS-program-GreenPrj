# 快速测试运行指南

## 一键运行所有测试

### 方法1: 使用npm脚本（推荐）

```bash
cd web

# 1. 安装依赖（如果还没安装）
npm install

# 2. 运行单元测试
npm run test -- --run

# 3. 运行E2E测试（需要先启动dev server）
# 终端1: npm run dev
# 终端2: npm run test:e2e
```

### 方法2: 使用PowerShell脚本

创建并运行 `run-tests.ps1`:

```powershell
# run-tests.ps1
cd web
Write-Host "安装依赖..." -ForegroundColor Yellow
npm install

Write-Host "运行单元测试..." -ForegroundColor Yellow
npm run test -- --run

Write-Host "测试完成！" -ForegroundColor Green
```

---

## 分步执行

### 步骤1: 验证环境

```bash
cd web
node --version  # 应该显示 v18+ 或 v20+
npm --version   # 应该显示 9+
```

### 步骤2: 安装依赖

```bash
npm install
```

### 步骤3: 运行单元测试

```bash
# 快速运行（一次性）
npm run test -- --run

# 或者使用UI模式（可视化）
npm run test:ui
```

### 步骤4: 运行E2E测试

```bash
# 终端1: 启动开发服务器
npm run dev

# 终端2: 运行E2E测试
npm run test:e2e
```

---

## 预期输出

### 单元测试成功输出示例

```
✓ tests/unit/services/account-entry-service.test.ts (8)
  ✓ Account Entry Service (8)
    ✓ createEntry (3)
      ✓ should create entry with valid data
      ✓ should throw error for invalid amount
      ✓ should throw error for missing category
    ✓ getEntryById (2)
      ✓ should return entry by id
      ✓ should return null for non-existent id
    ...

Test Files  1 passed (1)
     Tests  8 passed (8)
```

### E2E测试成功输出示例

```
Running 9 tests using 1 worker

  ✓ tests/e2e/accounting/create-entry.spec.ts:9:5 (3)
  ✓ tests/e2e/accounting/access-control.spec.ts:9:5 (3)
  ✓ tests/e2e/accounting/crud-operations.spec.ts:9:5 (3)

  9 passed (30s)
```

---

## 如果测试失败

### 常见失败原因

1. **依赖未安装**
   - 解决: `npm install`

2. **开发服务器未运行**（E2E测试）
   - 解决: 先运行 `npm run dev`

3. **IndexedDB mock问题**
   - 解决: 检查 `tests/setup.ts`

4. **路径别名问题**
   - 解决: 检查 `vitest.config.ts`

5. **权限问题**
   - 解决: 以管理员身份运行，或检查文件权限

---

## 测试文件清单

### 应该存在的测试文件

- ✅ `tests/unit/services/account-entry-service.test.ts`
- ✅ `tests/unit/repositories/account-entry-repository.test.ts`
- ✅ `tests/unit/services/security/encryption.test.ts`
- ✅ `tests/component/accounting/CreateEntryForm.test.tsx`
- ✅ `tests/e2e/accounting/create-entry.spec.ts`
- ✅ `tests/e2e/accounting/access-control.spec.ts`
- ✅ `tests/e2e/accounting/crud-operations.spec.ts`
- ✅ `tests/e2e/accounting/search-filter.spec.ts`
- ✅ `tests/fixtures/auth-fixture.ts`
- ✅ `tests/fixtures/database-fixture.ts`
- ✅ `tests/factories/account-entry-factory.ts`
- ✅ `tests/setup.ts`

---

## 快速检查清单

运行测试前，确认：

- [ ] 已安装所有依赖 (`npm install`)
- [ ] Node.js版本 >= 18
- [ ] 测试文件都存在
- [ ] `vitest.config.ts`配置正确
- [ ] `playwright.config.ts`配置正确（E2E测试）
- [ ] 开发服务器可以启动（E2E测试）

---

**提示**: 如果遇到任何问题，请查看 `TEST_EXECUTION_GUIDE.md` 获取详细故障排除指南。
