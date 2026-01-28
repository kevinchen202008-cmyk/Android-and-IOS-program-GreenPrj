# 下一步行动建议

**日期**: 2026-01-28  
**项目**: GreenPrj  
**状态**: 功能完成，测试进行中

---

## 立即行动项

### 1. 运行和验证测试 ✅

**优先级**: 高

```bash
# 运行所有测试
cd web
npm run test

# 运行E2E测试
npm run test:e2e

# 运行单元测试
npm run test:unit
```

**目标**: 
- 确保所有新生成的测试能够运行
- 修复测试中的问题
- 确保测试通过

### 2. 生成剩余测试 ✅（本轮继续 1+2 已完成）

**优先级**: 高

**本轮新增**:
- [x] PasswordSetupForm、ChangePasswordForm 组件测试
- [x] StatisticsPage、BudgetPage、MergePage、OperationLogsPage 页面组件测试
- [x] merge export-service、import-service 单元测试
- [x] csv-export、csv-import、data-deletion 单元测试

**当前**: 单元+组件 130 通过，E2E 64 通过。

**待补充（可选）**: 子组件细粒度测试。

### 3. 代码审查 🔍 ✅（本轮已完成轻量审查）

**优先级**: 中

**本轮完成**:
- [x] CI 集成（GitHub Actions：lint、单元/组件测试、E2E、vite build）
- [x] ESLint 修复（src 未使用变量/导入、类型替代 any）
- [x] 关键模块抽查（auth、accounting、budget、merge、data-management、audit）
- [x] 审查摘要：`_bmad-output/code-review-summary.md`

**建议后续**:
- [ ] 修复 `tsc` 报错后，CI 恢复 `npm run build`
- [ ] 构建分包与 chunk 体积优化

---

## 短期目标（1-2周）

### 4. 完善单元测试和组件测试 ✅（已大幅完善）

**优先级**: 中

**已完成**:
- [x] statistics-service、budget-service、operation-log-service 单元测试
- [x] merge export/import、csv、data-deletion 单元测试
- [x] StatisticsPage、BudgetPage、MergePage、OperationLogsPage 组件测试
- [x] LoginForm、PasswordSetupForm、ChangePasswordForm 组件测试

### 5. 性能优化

**优先级**: 中

**优化重点**:
- [ ] 大数据量统计计算优化
- [ ] 日志查询性能优化
- [ ] 数据库查询优化
- [ ] 组件渲染优化

### 6. 文档完善

**优先级**: 中

**文档类型**:
- [ ] 用户文档
- [ ] API文档
- [ ] 开发者文档
- [ ] 部署文档

---

## 中期目标（1个月）

### 7. CI/CD集成 ✅（基础已完成）

**优先级**: 中

**已完成**:
- [x] GitHub Actions（lint、单元/组件测试、E2E、vite build）
- [x] 自动化测试流程（Vitest + Playwright）

**待补充**:
- [ ] 修复 tsc 后切换为 `npm run build`
- [ ] 自动化部署流程

### 8. Android平台功能开发

**优先级**: 中

**任务**:
- [ ] 实现Epic 2（用户认证）
- [ ] 实现Epic 3（核心记账）
- [ ] 实现其他Epic功能

### 9. 功能增强

**优先级**: 低

**可能的增强**:
- [ ] 数据可视化增强
- [ ] 报表导出功能
- [ ] 多语言支持
- [ ] 主题切换

---

## 长期目标（3个月+）

### 10. 用户测试和反馈

**优先级**: 中

**任务**:
- [ ] Beta测试
- [ ] 收集用户反馈
- [ ] 根据反馈优化

### 11. 生产部署准备

**优先级**: 高

**任务**:
- [ ] 生产环境配置
- [ ] 性能测试
- [ ] 安全审计
- [ ] 备份和恢复策略

### 12. 持续改进

**优先级**: 持续

**任务**:
- [ ] 监控和日志
- [ ] 错误追踪
- [ ] 性能监控
- [ ] 用户支持

---

## 测试状态总结

### 已完成的测试

- ✅ Epic 2: 用户认证（E2E + LoginForm 组件）
- ✅ Epic 3: 核心记账功能（E2E + 组件 + 单元）
- ✅ Epic 4: 统计与报表（E2E + statistics-service 单元）
- ✅ Epic 5: 预算管理（E2E + budget-service 单元）
- ✅ Epic 6: 账本合并（E2E）
- ✅ Epic 7: 数据管理（E2E）
- ✅ Epic 8: 操作日志与审计（E2E + operation-log-service 单元）
- ✅ Epic 9: 设备权限与离线支持（E2E）

### 待补充（可选）

- ⏳ PasswordSetupForm、ChangePasswordForm 组件测试
- ⏳ merge export/import、csv 相关单元测试
- ⏳ 更多页面组件测试

---

## 建议的工作流程

1. **本周**: 运行和修复现有测试
2. **下周**: 生成Epic 2的测试（用户认证）
3. **第三周**: 生成Epic 6和7的测试
4. **第四周**: 完善单元测试和组件测试

---

**最后更新**: 2026-01-28  
**状态**: 📋 规划完成，准备执行
