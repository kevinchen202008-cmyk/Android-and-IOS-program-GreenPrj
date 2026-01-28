# 测试计划

**日期**: 2026-01-28  
**项目**: GreenPrj  
**状态**: 规划中

---

## 测试覆盖概览

### 当前测试状态

**已完成的测试：**
- ✅ Epic 3: 核心记账功能
  - E2E测试：4个测试文件
  - 组件测试：1个测试文件
  - 单元测试：3个测试文件

**待生成的测试：**
- ⏳ Epic 2: 用户认证与数据安全
- ⏳ Epic 4: 统计与报表
- ⏳ Epic 5: 预算管理
- ⏳ Epic 6: 账本合并
- ⏳ Epic 7: 数据管理
- ⏳ Epic 8: 操作日志与审计
- ⏳ Epic 9: 设备权限与离线支持

---

## 测试优先级

### P0 - 关键路径（必须测试）

1. **Epic 2: 用户认证与数据安全**
   - 密码设置和登录流程
   - 数据加密/解密
   - 会话管理
   - 访问控制

2. **Epic 4: 统计与报表**
   - 统计计算准确性
   - 实时更新机制
   - 图表渲染

3. **Epic 5: 预算管理**
   - 预算设置和更新
   - 预算对比计算
   - 超支提醒

### P1 - 重要功能（高优先级）

4. **Epic 6: 账本合并**
   - 数据导出/导入
   - 智能去重
   - 冲突解决

5. **Epic 7: 数据管理**
   - 数据导出（JSON/CSV）
   - 数据导入验证
   - 数据删除确认

6. **Epic 8: 操作日志与审计**
   - 日志记录
   - 日志查看和筛选
   - 日志导出

### P2 - 辅助功能（中优先级）

7. **Epic 9: 设备权限与离线支持**
   - 离线功能验证
   - 权限处理

---

## 测试类型规划

### E2E测试（End-to-End）

**Epic 2: 用户认证与数据安全**
- [ ] 密码设置流程
- [ ] 登录流程
- [ ] 密码修改流程
- [ ] 会话超时处理
- [ ] 访问控制（未登录访问保护页面）

**Epic 4: 统计与报表**
- [ ] 统计页面加载
- [ ] 时间维度统计切换
- [ ] 类别维度统计显示
- [ ] 图表渲染
- [ ] 实时统计更新

**Epic 5: 预算管理**
- [ ] 预算设置流程
- [ ] 预算列表显示
- [ ] 预算对比显示
- [ ] 超支提醒显示

**Epic 6: 账本合并**
- [ ] 数据导出流程
- [ ] 数据导入流程
- [ ] 去重检测
- [ ] 冲突解决流程

**Epic 7: 数据管理**
- [ ] JSON导出
- [ ] CSV导出
- [ ] 数据导入
- [ ] 数据删除确认

**Epic 8: 操作日志与审计**
- [ ] 日志页面加载
- [ ] 日志筛选
- [ ] 日志导出

### 组件测试

**Epic 2: 用户认证与数据安全**
- [ ] PasswordSetupForm组件
- [ ] LoginForm组件
- [ ] ChangePasswordForm组件
- [ ] ProtectedRoute组件

**Epic 4: 统计与报表**
- [ ] StatisticsPage组件
- [ ] StatisticsChart组件
- [ ] CategoryDistributionChart组件

**Epic 5: 预算管理**
- [ ] BudgetPage组件
- [ ] BudgetForm组件
- [ ] BudgetComparison组件

**Epic 6: 账本合并**
- [ ] MergePage组件
- [ ] ImportPreview组件
- [ ] ConflictResolution组件

**Epic 7: 数据管理**
- [ ] DataManagementPage组件
- [ ] ExportDialog组件
- [ ] ImportDialog组件

**Epic 8: 操作日志与审计**
- [ ] OperationLogsPage组件
- [ ] LogFilter组件
- [ ] LogTable组件

### 单元测试

**Epic 2: 用户认证与数据安全**
- [ ] auth-service测试
- [ ] session-manager测试
- [ ] encryption-service测试
- [ ] password-hash-service测试

**Epic 4: 统计与报表**
- [ ] statistics-service测试
- [ ] statistics-store测试

**Epic 5: 预算管理**
- [ ] budget-service测试
- [ ] budget-repository测试
- [ ] budget-store测试

**Epic 6: 账本合并**
- [ ] export-service测试
- [ ] import-service测试
- [ ] merge-store测试

**Epic 7: 数据管理**
- [ ] csv-export-service测试
- [ ] csv-import-service测试
- [ ] data-deletion-service测试

**Epic 8: 操作日志与审计**
- [ ] operation-log-service测试
- [ ] operation-log-repository测试
- [ ] operation-log-store测试

---

## 测试执行计划

### 第一阶段：P0测试（关键路径）

1. **Epic 2测试** - 用户认证与数据安全
   - 预计时间：2-3小时
   - 优先级：最高
   - 测试类型：E2E + 组件 + 单元

2. **Epic 4测试** - 统计与报表
   - 预计时间：2-3小时
   - 优先级：最高
   - 测试类型：E2E + 组件 + 单元

3. **Epic 5测试** - 预算管理
   - 预计时间：2-3小时
   - 优先级：最高
   - 测试类型：E2E + 组件 + 单元

### 第二阶段：P1测试（重要功能）

4. **Epic 6测试** - 账本合并
   - 预计时间：2-3小时
   - 优先级：高
   - 测试类型：E2E + 组件 + 单元

5. **Epic 7测试** - 数据管理
   - 预计时间：2-3小时
   - 优先级：高
   - 测试类型：E2E + 组件 + 单元

6. **Epic 8测试** - 操作日志与审计
   - 预计时间：2-3小时
   - 优先级：高
   - 测试类型：E2E + 组件 + 单元

### 第三阶段：P2测试（辅助功能）

7. **Epic 9测试** - 设备权限与离线支持
   - 预计时间：1-2小时
   - 优先级：中
   - 测试类型：E2E + 单元

---

## 测试工具和框架

### 已配置的工具

- **E2E测试**: Playwright
- **单元测试**: Vitest
- **组件测试**: Vitest + React Testing Library
- **测试数据**: Faker.js
- **Fixtures**: Playwright fixtures

### 测试命令

```bash
# 运行所有测试
npm run test

# 运行E2E测试
npm run test:e2e

# 运行单元测试
npm run test:unit

# 运行组件测试
npm run test:component

# 运行测试并生成覆盖率报告
npm run test:coverage
```

---

## 测试质量标准

### 测试设计原则

1. **Given-When-Then格式**
   - 所有测试使用Given-When-Then结构
   - 清晰的测试步骤注释

2. **优先级标签**
   - 所有测试名称包含优先级标签（[P0], [P1], [P2], [P3]）

3. **数据测试ID**
   - 使用`data-testid`选择器，不使用CSS类

4. **原子测试**
   - 一个断言 per 测试
   - 测试之间无依赖

5. **无硬等待**
   - 使用显式等待，不使用sleep

6. **自动清理**
   - 使用fixtures自动清理测试数据

### 测试覆盖率目标

- **单元测试覆盖率**: >80%
- **组件测试覆盖率**: >70%
- **E2E测试覆盖率**: 关键路径100%

---

## 下一步行动

1. **立即开始**
   - [ ] 生成Epic 2的测试（用户认证）
   - [ ] 生成Epic 4的测试（统计与报表）
   - [ ] 生成Epic 5的测试（预算管理）

2. **短期目标**
   - [ ] 完成所有P0测试
   - [ ] 运行测试并修复问题
   - [ ] 达到覆盖率目标

3. **长期目标**
   - [ ] 完成所有P1测试
   - [ ] 完成所有P2测试
   - [ ] 建立CI/CD测试流程

---

**状态**: 📋 规划完成，准备开始实施  
**最后更新**: 2026-01-28
