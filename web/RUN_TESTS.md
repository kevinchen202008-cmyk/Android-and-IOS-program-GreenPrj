# 测试运行指南

## 前置准备

### 1. 安装依赖

```bash
cd web
npm install
```

这将安装所有测试依赖，包括：
- Vitest（单元测试和组件测试）
- Playwright（E2E测试）
- Testing Library（React组件测试）

### 2. 安装Playwright浏览器

```bash
npx playwright install
```

这将下载Chrome、Firefox和Safari浏览器用于E2E测试。

---

## 运行测试

### 单元测试和组件测试（Vitest）

#### 运行所有单元测试
```bash
npm run test
```

#### 运行测试并查看UI
```bash
npm run test:ui
```

#### 运行测试并生成覆盖率报告
```bash
npm run test:coverage
```

#### 运行特定测试文件
```bash
npm run test tests/unit/services/account-entry-service.test.ts
```

#### 运行测试并监听文件变化（开发模式）
```bash
npm run test -- --watch
```

### E2E测试（Playwright）

**注意**: E2E测试需要开发服务器运行。Playwright配置会自动启动服务器，但也可以手动启动。

#### 运行所有E2E测试
```bash
npm run test:e2e
```

#### 运行E2E测试并查看UI
```bash
npm run test:e2e:ui
```

#### 运行特定E2E测试文件
```bash
npx playwright test tests/e2e/accounting/create-entry.spec.ts
```

#### 运行E2E测试（headed模式，可以看到浏览器）
```bash
npx playwright test --headed
```

#### 运行E2E测试（调试模式）
```bash
npx playwright test --debug
```

---

## 测试文件结构

```
web/tests/
├── e2e/                    # E2E测试（Playwright）
│   └── accounting/
│       ├── create-entry.spec.ts
│       ├── access-control.spec.ts
│       ├── crud-operations.spec.ts
│       └── search-filter.spec.ts
├── unit/                    # 单元测试（Vitest）
│   ├── services/
│   │   ├── account-entry-service.test.ts
│   │   └── security/
│   │       └── encryption.test.ts
│   └── repositories/
│       └── account-entry-repository.test.ts
├── component/               # 组件测试（Vitest + Testing Library）
│   └── accounting/
│       └── CreateEntryForm.test.tsx
├── fixtures/               # 测试fixtures
│   ├── auth-fixture.ts
│   └── database-fixture.ts
├── factories/              # 测试数据工厂
│   └── account-entry-factory.ts
└── setup.ts                # 测试全局配置
```

---

## 测试覆盖范围

### P0 关键测试（9个场景）

**E2E测试:**
- ✅ 创建账目（3个测试）
- ✅ 访问控制（3个测试）
- ✅ CRUD操作（3个测试）

**单元测试:**
- ✅ 服务层业务逻辑
- ✅ 仓库层数据访问
- ✅ 加密服务（安全关键）

### P1 高优先级测试（5个场景）

**E2E测试:**
- ✅ 搜索和筛选（5个测试）

**组件测试:**
- ✅ CreateEntryForm组件

---

## 常见问题

### 问题1: 测试失败 - "Cannot find module"

**解决方案:**
1. 确保所有依赖已安装：`npm install`
2. 检查路径别名配置（`vitest.config.ts`）
3. 确保测试文件路径正确

### 问题2: E2E测试失败 - "Page not found"

**解决方案:**
1. 确保开发服务器可以启动：`npm run dev`
2. 检查Playwright配置中的`baseURL`
3. 确保端口5173未被占用

### 问题3: 测试失败 - "IndexedDB not available"

**解决方案:**
1. 检查测试setup文件（`tests/setup.ts`）
2. 确保IndexedDB mock正确配置
3. 在测试中使用fixtures进行数据库初始化

### 问题4: 加密测试失败 - "Password not available"

**解决方案:**
1. 确保在测试中使用`setupAuthenticatedSession()` fixture
2. 检查session管理是否正确配置
3. 验证密码是否正确存储在session中

### 问题5: 组件测试失败 - "Cannot find module '@/stores/...'"

**解决方案:**
1. 检查vitest.config.ts中的路径别名
2. 确保所有路径别名都已配置
3. 重新运行测试

---

## 测试最佳实践

### 1. 测试隔离

每个测试应该：
- 使用fixtures进行setup和teardown
- 清理测试数据
- 不依赖其他测试的状态

### 2. 测试数据

使用工厂模式生成测试数据：
```typescript
import { createAccountEntry } from '../../factories/account-entry-factory'

const entry = createAccountEntry({ amount: 100, category: 'food' })
```

### 3. 异步操作

使用`await`和`waitFor`处理异步操作：
```typescript
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument()
})
```

### 4. Mock外部依赖

Mock外部服务和不稳定的依赖：
```typescript
vi.mock('@/services/recognition/ocr-service', () => ({
  recognizeInvoice: vi.fn(),
}))
```

---

## 持续集成

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
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
```

---

## 下一步

1. ✅ 运行单元测试验证基础功能
2. ✅ 运行组件测试验证UI组件
3. ⏳ 运行E2E测试验证完整流程
4. ⏳ 生成测试覆盖率报告
5. ⏳ 修复发现的测试失败
6. ⏳ 添加更多测试用例（OCR、语音、短信）

---

## 测试报告

运行测试后，查看：
- **单元测试报告**: 控制台输出或 `npm run test:ui`
- **E2E测试报告**: `playwright-report/index.html`
- **覆盖率报告**: `coverage/index.html`（如果使用`npm run test:coverage`）

---

**最后更新**: 2026-01-26
**测试框架**: Vitest + Playwright + Testing Library
