# 测试执行指南

## 快速开始

### 步骤1: 安装依赖

```bash
cd web
npm install
```

### 步骤2: 安装Playwright浏览器（仅E2E测试需要）

```bash
npx playwright install chromium
```

### 步骤3: 运行测试

#### 选项A: 运行单元测试（推荐先运行）
```bash
npm run test
```

#### 选项B: 运行单元测试（UI模式，可视化）
```bash
npm run test:ui
```

#### 选项C: 运行E2E测试（需要开发服务器）
```bash
# 在另一个终端启动开发服务器
npm run dev

# 然后运行E2E测试
npm run test:e2e
```

---

## 预期测试结果

### 单元测试（Vitest）

**应该通过的测试:**

1. **Database Service Tests** (`src/services/database/__tests__/indexeddb.test.ts`)
   - ✅ 数据库打开
   - ✅ Object stores创建
   - ✅ 索引创建

2. **Account Entry Service Tests** (`tests/unit/services/account-entry-service.test.ts`)
   - ✅ 创建账目
   - ✅ 获取账目
   - ✅ 更新账目
   - ✅ 删除账目
   - ✅ 搜索账目
   - ✅ 筛选账目

3. **Account Entry Repository Tests** (`tests/unit/repositories/account-entry-repository.test.ts`)
   - ✅ 数据创建和加密
   - ✅ 数据检索和解密
   - ✅ 数据更新
   - ✅ 数据删除

4. **Encryption Service Tests** (`tests/unit/services/security/encryption.test.ts`)
   - ✅ 数据加密
   - ✅ 数据解密
   - ✅ 加密/解密往返测试
   - ✅ 错误密码处理

### 组件测试

1. **CreateEntryForm Tests** (`tests/component/accounting/CreateEntryForm.test.tsx`)
   - ✅ 表单渲染
   - ✅ 表单验证
   - ✅ 提交功能

### E2E测试（Playwright）

**需要开发服务器运行:**

1. **Create Entry Tests** (`tests/e2e/accounting/create-entry.spec.ts`)
   - ✅ P0-001: 用户可以使用有效数据创建账目
   - ✅ P0-002: 表单验证防止无效数据
   - ✅ P0-003: 账目在存储前加密

2. **Access Control Tests** (`tests/e2e/accounting/access-control.spec.ts`)
   - ✅ P0-004: 未认证用户无法访问记账页面
   - ✅ P0-005: Session过期后无法访问
   - ✅ P0-006: 认证用户可以访问记账页面

3. **CRUD Operations Tests** (`tests/e2e/accounting/crud-operations.spec.ts`)
   - ✅ P0-007: 用户可以查看账目列表
   - ✅ P0-008: 用户可以编辑账目
   - ✅ P0-009: 用户可以删除账目

4. **Search and Filter Tests** (`tests/e2e/accounting/search-filter.spec.ts`)
   - ✅ P1-001: 用户可以按关键词搜索
   - ✅ P1-002: 用户可以按类别筛选
   - ✅ P1-003: 用户可以按日期范围筛选
   - ✅ P1-004: 用户可以组合多个筛选条件
   - ✅ P1-005: 用户可以清除筛选

---

## 测试执行命令参考

### Vitest命令

```bash
# 运行所有测试（一次性）
npm run test -- --run

# 运行测试（监听模式）
npm run test

# 运行测试（UI模式）
npm run test:ui

# 运行测试（覆盖率）
npm run test:coverage

# 运行特定测试文件
npm run test tests/unit/services/account-entry-service.test.ts

# 运行匹配模式的测试
npm run test -- -t "createEntry"

# 运行测试（详细输出）
npm run test -- --reporter=verbose
```

### Playwright命令

```bash
# 运行所有E2E测试
npm run test:e2e

# 运行E2E测试（UI模式）
npm run test:e2e:ui

# 运行特定测试文件
npx playwright test tests/e2e/accounting/create-entry.spec.ts

# 运行测试（headed模式，显示浏览器）
npx playwright test --headed

# 运行测试（调试模式）
npx playwright test --debug

# 运行测试（特定浏览器）
npx playwright test --project=chromium

# 查看测试报告
npx playwright show-report
```

---

## 故障排除

### 问题1: 模块找不到错误

**错误信息:**
```
Cannot find module '@/services/...'
```

**解决方案:**
1. 检查`vitest.config.ts`中的路径别名配置
2. 确保所有路径别名都已正确设置
3. 重新运行测试

### 问题2: IndexedDB相关错误

**错误信息:**
```
IndexedDB is not available
```

**解决方案:**
1. 检查`tests/setup.ts`中的IndexedDB mock
2. 确保在测试中使用`setupTestDatabase()` fixture
3. 验证数据库初始化逻辑

### 问题3: 加密测试失败

**错误信息:**
```
Password not available for encryption
```

**解决方案:**
1. 确保使用`setupAuthenticatedSession()` fixture
2. 检查session中是否正确存储了密码
3. 验证`auth-fixture.ts`中的实现

### 问题4: E2E测试无法连接到服务器

**错误信息:**
```
net::ERR_CONNECTION_REFUSED
```

**解决方案:**
1. 确保开发服务器正在运行：`npm run dev`
2. 检查Playwright配置中的`baseURL`
3. 验证端口5173未被占用

### 问题5: 组件测试失败 - React Router错误

**错误信息:**
```
useNavigate() may be used only in the context of a Router component
```

**解决方案:**
1. 在测试中包装组件：`<BrowserRouter><Component /></BrowserRouter>`
2. Mock `react-router-dom`的`useNavigate` hook

---

## 测试覆盖率目标

- **P0测试**: 100%通过率（必须）
- **P1测试**: ≥95%通过率
- **单元测试覆盖率**: ≥70%
- **关键路径覆盖率**: ≥80%

---

## 下一步

运行测试后：

1. **查看测试结果**
   - 检查哪些测试通过
   - 识别失败的测试
   - 分析失败原因

2. **修复失败的测试**
   - 如果是测试代码问题，修复测试
   - 如果是实现代码问题，修复实现

3. **提高覆盖率**
   - 添加缺失的测试用例
   - 覆盖边界情况
   - 添加错误处理测试

4. **优化测试性能**
   - 并行运行测试
   - 优化慢速测试
   - 减少不必要的等待

---

**提示**: 如果遇到权限问题（EPERM错误），可能需要：
1. 以管理员身份运行终端
2. 检查文件权限
3. 关闭可能占用文件的程序（如IDE、其他测试进程）
