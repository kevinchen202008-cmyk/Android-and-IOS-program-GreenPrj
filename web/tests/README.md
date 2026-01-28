# 测试文档

**项目**: GreenPrj  
**最后更新**: 2026-01-28

---

## 测试结构

```
tests/
├── e2e/                    # E2E测试（Playwright）
│   ├── accounting/         # 记账功能测试
│   ├── statistics/         # 统计功能测试
│   ├── budget/            # 预算功能测试
│   ├── audit/             # 操作日志测试
│   └── helpers/           # 测试辅助函数
├── component/             # 组件测试（Vitest + React Testing Library）
│   └── accounting/
├── unit/                  # 单元测试（Vitest）
│   ├── repositories/
│   └── services/
├── fixtures/              # 测试数据fixtures
├── factories/             # 测试数据工厂
└── setup.ts               # 测试设置
```

---

## 运行测试

### 运行所有测试

```bash
npm run test
```

### 运行E2E测试

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行特定测试文件
npm run test:e2e tests/e2e/statistics/statistics-display.spec.ts

# 运行测试并显示UI
npm run test:e2e:ui
```

### 运行单元测试

```bash
# 运行所有单元测试
npm run test:unit

# 运行测试并监听变化
npm run test:unit:watch

# 运行测试并生成覆盖率报告
npm run test:unit:coverage
```

### 运行组件测试

```bash
# 运行所有组件测试
npm run test:component

# 运行测试并监听变化
npm run test:component:watch
```

---

## 测试类型

### E2E测试（End-to-End）

**工具**: Playwright  
**位置**: `tests/e2e/`

**特点**:
- 测试完整的用户流程
- 使用真实浏览器
- 测试跨组件交互

**示例**:
```typescript
test('P0-001: User can create entry', async ({ page }) => {
  await setupTestUserAndLogin(page, '/')
  await page.click('text=记账')
  await createEntryViaUI(page, { amount: '100.00', category: 'food' })
  await expect(page.getByText('¥100.00')).toBeVisible()
})
```

### 组件测试

**工具**: Vitest + React Testing Library  
**位置**: `tests/component/`

**特点**:
- 测试单个组件的行为
- 快速执行
- 隔离测试

**示例**:
```typescript
test('CreateEntryForm validates input', () => {
  render(<CreateEntryForm />)
  const submitButton = screen.getByRole('button', { name: /确认入账/ })
  expect(submitButton).toBeDisabled()
})
```

### 单元测试

**工具**: Vitest  
**位置**: `tests/unit/`

**特点**:
- 测试纯函数和业务逻辑
- 最快执行速度
- 高覆盖率

**示例**:
```typescript
test('encryptData encrypts data correctly', async () => {
  const data = 'test data'
  const password = 'password'
  const encrypted = await encryptData(data, password)
  expect(encrypted.encrypted).not.toBe(data)
})
```

---

## 测试辅助工具

### Fixtures

**位置**: `tests/fixtures/`

**用途**: 提供测试数据和设置

**示例**:
- `auth-fixture.ts` - 认证相关fixtures
- `database-fixture.ts` - 数据库相关fixtures

### Factories

**位置**: `tests/factories/`

**用途**: 生成测试数据

**示例**:
- `account-entry-factory.ts` - 账目数据工厂

### Helpers

**位置**: `tests/e2e/helpers/`

**用途**: E2E测试辅助函数

**示例**:
- `browser-db.ts` - 浏览器数据库操作

---

## 测试最佳实践

### 1. 测试命名

使用描述性的测试名称，包含优先级标签：

```typescript
test('P0-001: User can create entry with valid data', async ({ page }) => {
  // ...
})
```

### 2. Given-When-Then格式

所有测试使用Given-When-Then结构：

```typescript
test('P0-001: User can create entry', async ({ page }) => {
  // Given: User is logged in
  await setupTestUserAndLogin(page, '/')
  
  // When: User creates an entry
  await createEntryViaUI(page, { amount: '100.00', category: 'food' })
  
  // Then: Entry is displayed
  await expect(page.getByText('¥100.00')).toBeVisible()
})
```

### 3. 使用data-testid

优先使用`data-testid`选择器：

```typescript
// ✅ Good
await page.getByTestId('create-entry-button').click()

// ❌ Bad
await page.locator('.btn-primary').click()
```

### 4. 原子测试

一个测试只测试一个场景：

```typescript
// ✅ Good
test('User can create entry', async ({ page }) => {
  // Test creation only
})

test('User can edit entry', async ({ page }) => {
  // Test editing only
})

// ❌ Bad
test('User can create and edit entry', async ({ page }) => {
  // Testing multiple things
})
```

### 5. 自动清理

使用fixtures自动清理测试数据：

```typescript
test.beforeEach(async ({ page }) => {
  await setupTestUserAndLogin(page, '/')
  // Fixture automatically cleans up after test
})
```

### 6. 显式等待

使用显式等待，不使用硬等待：

```typescript
// ✅ Good
await expect(page.getByText('Success')).toBeVisible()

// ❌ Bad
await page.waitForTimeout(1000)
```

---

## 测试覆盖率

### 当前覆盖率

- **单元测试**: ~40% (部分Epic)
- **组件测试**: ~20% (部分组件)
- **E2E测试**: ~50% (关键路径)

### 覆盖率目标

- **单元测试**: >80%
- **组件测试**: >70%
- **E2E测试**: 关键路径100%

---

## 测试优先级

### P0 - 关键路径（必须测试）

- 用户认证流程
- 账目创建流程
- 统计计算准确性
- 预算设置和管理

### P1 - 重要功能（高优先级）

- 账本合并
- 数据导入导出
- 操作日志

### P2 - 辅助功能（中优先级）

- 权限处理
- 离线功能

---

## 故障排除

### 测试失败

1. **检查测试环境**
   ```bash
   npm run test:e2e:debug
   ```

2. **查看测试报告**
   ```bash
   npm run test:e2e -- --reporter=html
   ```

3. **运行单个测试**
   ```bash
   npm run test:e2e tests/e2e/accounting/create-entry.spec.ts
   ```

### 常见问题

**问题**: 测试超时  
**解决**: 增加超时时间或检查网络请求

**问题**: 元素找不到  
**解决**: 使用`data-testid`或检查页面加载状态

**问题**: 测试不稳定  
**解决**: 使用显式等待，避免硬等待

---

## CI/CD集成

### GitHub Actions示例

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:e2e
```

---

## 贡献指南

### 添加新测试

1. 确定测试类型（E2E/组件/单元）
2. 选择合适的测试文件或创建新文件
3. 遵循测试最佳实践
4. 添加优先级标签
5. 确保测试通过

### 测试审查清单

- [ ] 测试使用Given-When-Then格式
- [ ] 测试有优先级标签
- [ ] 测试使用data-testid选择器
- [ ] 测试是原子的（一个测试一个场景）
- [ ] 测试有自动清理
- [ ] 测试使用显式等待

---

**最后更新**: 2026-01-28
