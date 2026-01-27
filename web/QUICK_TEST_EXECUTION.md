# 快速测试执行指南

**更新时间**: 2026-01-27

---

## 🚀 快速开始

### 1. 安装缺失依赖

```bash
cd web
npm install
```

如果 `jsdom` 仍未安装：

```bash
npm install --save-dev jsdom @vitest/coverage-v8
```

### 2. 安装 Playwright 浏览器（仅E2E测试需要）

```bash
npx playwright install chromium
```

---

## 📋 测试执行命令

### 方式1: 使用PowerShell脚本（推荐）

```powershell
cd web
.\run-tests.ps1
```

脚本会自动：
- ✅ 检查并安装依赖
- ✅ 运行单元测试和组件测试
- ✅ 询问是否继续E2E测试
- ✅ 运行E2E测试
- ✅ 显示测试结果总结

### 方式2: 手动执行

#### 步骤1: 单元测试和组件测试

```bash
npm run test -- --run
```

**预期输出：**
- 运行所有单元测试（服务层、仓库层、加密服务）
- 运行组件测试（CreateEntryForm）
- 显示通过/失败的测试数量

#### 步骤2: E2E测试

```bash
npm run test:e2e
```

**注意**: E2E测试会自动启动开发服务器，无需手动启动。

**预期输出：**
- 自动启动开发服务器（http://localhost:5173）
- 运行所有E2E测试
- 生成HTML测试报告

#### 步骤3: 查看测试覆盖率

```bash
npm run test:coverage
```

---

## 📊 测试文件清单

### 单元测试

| 文件 | 测试内容 | 优先级 |
|------|---------|--------|
| `tests/unit/services/account-entry-service.test.ts` | 服务层业务逻辑 | P0 |
| `tests/unit/repositories/account-entry-repository.test.ts` | 仓库层数据访问 | P0 |
| `tests/unit/services/security/encryption.test.ts` | 加密服务（安全关键） | P0 |

### 组件测试

| 文件 | 测试内容 | 优先级 |
|------|---------|--------|
| `tests/component/accounting/CreateEntryForm.test.tsx` | 创建账目表单 | P0 |

### E2E测试

| 文件 | 测试内容 | 测试数量 | 优先级 |
|------|---------|---------|--------|
| `tests/e2e/accounting/create-entry.spec.ts` | 创建账目 | 3 | P0 |
| `tests/e2e/accounting/access-control.spec.ts` | 访问控制 | 3 | P0 |
| `tests/e2e/accounting/crud-operations.spec.ts` | CRUD操作 | 3 | P0 |
| `tests/e2e/accounting/search-filter.spec.ts` | 搜索筛选 | 5 | P1 |

**总计**: 14个E2E测试（9个P0 + 5个P1）

---

## ✅ 预期测试结果

### 单元测试

- ✅ **Account Entry Service**: 8个测试全部通过
  - 创建账目验证
  - 获取操作
  - 更新操作
  - 删除操作
  - 搜索功能
  - 筛选功能

- ✅ **Account Entry Repository**: 5个测试全部通过
  - 数据创建和加密
  - 数据检索和解密
  - 数据更新
  - 数据删除
  - 数据排序

- ✅ **Encryption Service**: 5个测试全部通过（安全关键）
  - 数据加密
  - 数据解密
  - 加密/解密往返测试
  - 错误处理

### 组件测试

- ✅ **CreateEntryForm**: 5个测试全部通过
  - 表单渲染
  - 表单验证
  - 提交功能
  - 错误处理

### E2E测试

#### P0测试（必须全部通过）

- ✅ **P0-001**: 用户可以使用有效数据创建账目
- ✅ **P0-002**: 表单验证防止无效数据
- ✅ **P0-003**: 账目在存储前加密
- ✅ **P0-004**: 未认证用户无法访问记账页面
- ✅ **P0-005**: Session过期后无法访问
- ✅ **P0-006**: 认证用户可以访问记账页面
- ✅ **P0-007**: 用户可以查看账目列表
- ✅ **P0-008**: 用户可以编辑账目
- ✅ **P0-009**: 用户可以删除账目

#### P1测试（期望通过率 ≥ 95%）

- ✅ **P1-001**: 用户可以按关键词搜索
- ✅ **P1-002**: 用户可以按类别筛选
- ✅ **P1-003**: 用户可以按日期范围筛选
- ✅ **P1-004**: 用户可以组合多个筛选条件
- ✅ **P1-005**: 用户可以清除筛选

---

## 🔧 故障排除

### 问题1: jsdom未安装

**错误信息**: `Cannot find dependency 'jsdom'`

**解决方案**:
```bash
npm install --save-dev jsdom
```

### 问题2: EPERM权限错误

**错误信息**: `Error: spawn EPERM`

**解决方案**:
1. 以管理员身份运行终端
2. 关闭可能占用文件的程序
3. 检查文件权限

### 问题3: 端口被占用

**错误信息**: `Port 5173 is already in use`

**解决方案**:
1. 关闭占用端口的程序
2. 或修改 `playwright.config.ts` 中的端口号

### 问题4: Playwright浏览器未安装

**错误信息**: `Executable doesn't exist`

**解决方案**:
```bash
npx playwright install chromium
```

### 问题5: 测试超时

**解决方案**:
- 增加测试超时时间（在测试文件中）
- 检查网络连接
- 检查开发服务器是否正常启动

---

## 📝 测试结果记录

执行测试后，请记录结果：

### 单元测试结果

- **执行时间**: ___________
- **通过**: ___ / ___
- **失败**: ___ / ___
- **跳过**: ___ / ___

### E2E测试结果

- **执行时间**: ___________
- **通过**: ___ / ___
- **失败**: ___ / ___

### 测试覆盖率

- **总体覆盖率**: ___%
- **核心功能覆盖率**: ___%
- **关键路径覆盖率**: ___%

---

## 🎯 下一步

### 如果所有测试通过 ✅

1. ✅ 继续开发剩余功能（Epic 4-9）
2. ✅ 提高测试覆盖率
3. ✅ 添加更多边界情况测试

### 如果有测试失败 ❌

1. ❌ 分析失败原因
2. ❌ 修复代码问题
3. ❌ 更新测试用例（如果需要）
4. ❌ 重新运行测试

---

## 📚 相关文档

- [详细测试执行报告](./TEST_EXECUTION_REPORT.md)
- [测试状态报告](./TEST_STATUS.md)
- [Epic 3 测试指南](./TESTING_EPIC3.md)
- [测试自动化总结](../_bmad-output/automation-summary-epic3.md)

---

**提示**: 首次运行测试可能需要几分钟来安装依赖和启动服务器。请耐心等待。
