# Test Design: Epic 3 - 核心记账功能

**Date:** 2026-01-26
**Author:** Kevin (TEA Agent)
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 3 - 核心记账功能

**Risk Summary:**

- Total risks identified: 12
- High-priority risks (≥6): 3
- Critical categories: SEC (Security), DATA (Data Integrity), PERF (Performance)

**Coverage Summary:**

- P0 scenarios: 18 (36 hours)
- P1 scenarios: 25 (25 hours)
- P2/P3 scenarios: 35 (17.5 hours)
- **Total effort**: 78.5 hours (~10 days)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner | Timeline |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ------ | -------- |
| R-001   | SEC      | 数据加密失败导致敏感信息泄露 | 2 | 3 | 6 | 实现加密验证测试，确保所有账目数据加密存储 | QA | 立即 |
| R-002   | DATA     | 账目数据丢失或损坏 | 2 | 3 | 6 | 实现数据完整性测试，验证CRUD操作的原子性 | QA | 立即 |
| R-003   | SEC      | 未授权访问账目数据 | 2 | 3 | 6 | 实现访问控制测试，验证Session过期后无法访问 | QA | 立即 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description | Probability | Impact | Score | Mitigation | Owner |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ---------- | ------ |
| R-004   | TECH     | OCR识别准确率低导致数据错误 | 2 | 2 | 4 | 实现OCR识别准确性测试，提供手动修正机制 | QA |
| R-005   | PERF     | 大量账目数据导致列表加载缓慢 | 2 | 2 | 4 | 实现分页和性能测试，优化大数据集处理 | DEV |
| R-006   | DATA     | 搜索筛选功能返回错误结果 | 1 | 3 | 3 | 实现搜索筛选准确性测试，验证各种查询场景 | QA |
| R-007   | BUS      | 语音识别失败影响用户体验 | 2 | 2 | 4 | 实现语音识别错误处理测试，提供降级方案 | QA |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description | Probability | Impact | Score | Action |
| ------- | -------- | ----------- | ----------- | ------ | ----- | ------ |
| R-008   | OPS      | 浏览器兼容性问题 | 1 | 2 | 2 | Monitor |
| R-009   | BUS      | UI响应不及时 | 1 | 1 | 1 | Monitor |
| R-010   | TECH     | 短信解析格式不支持 | 1 | 2 | 2 | Monitor |
| R-011   | PERF     | OCR处理时间过长 | 1 | 1 | 1 | Monitor |
| R-012   | OPS      | IndexedDB存储空间限制 | 1 | 1 | 1 | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| 手动输入记账 | E2E | R-002 | 3 | QA | 验证创建、验证、保存流程 |
| 数据加密存储 | API | R-001 | 5 | QA | 验证加密/解密功能 |
| 访问控制 | E2E | R-003 | 3 | QA | 验证Session过期后无法访问 |
| 账目列表加载 | E2E | R-002 | 2 | QA | 验证数据完整性 |
| 账目编辑保存 | E2E | R-002 | 2 | QA | 验证更新操作 |
| 账目删除 | E2E | R-002 | 2 | QA | 验证删除操作 |
| 登录状态验证 | E2E | R-003 | 1 | QA | 验证认证保护 |

**Total P0**: 18 tests, 36 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| 搜索功能 | API | R-006 | 4 | QA | 验证关键词搜索 |
| 类别筛选 | API | R-006 | 3 | QA | 验证类别筛选 |
| 日期范围筛选 | API | R-006 | 3 | QA | 验证日期筛选 |
| 组合筛选 | API | R-006 | 2 | QA | 验证多条件组合 |
| OCR识别 | E2E | R-004 | 3 | QA | 验证发票扫描识别 |
| 语音识别 | E2E | R-007 | 2 | QA | 验证语音输入识别 |
| 短信解析 | API | R-010 | 2 | QA | 验证短信解析逻辑 |
| 分页加载 | E2E | R-005 | 2 | QA | 验证大量数据分页 |
| 表单验证 | Component | - | 4 | DEV | 验证输入验证规则 |

**Total P1**: 25 tests, 25 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement | Test Level | Risk Link | Test Count | Owner | Notes |
| ----------- | ---------- | --------- | ---------- | ----- | ----- |
| OCR错误处理 | E2E | R-004 | 3 | QA | 验证识别失败场景 |
| 语音识别错误处理 | E2E | R-007 | 2 | QA | 验证识别失败场景 |
| 边界值测试 | Unit | - | 8 | DEV | 金额、日期边界值 |
| 空数据场景 | API | - | 4 | QA | 空列表、空搜索 |
| 大数据集性能 | E2E | R-005 | 2 | QA | 1000+条账目性能 |
| 浏览器兼容性 | E2E | R-008 | 3 | QA | Chrome, Edge, Firefox |
| 响应式设计 | Component | R-009 | 3 | DEV | 不同屏幕尺寸 |

**Total P2**: 25 tests, 12.5 hours

### P3 (Low) - Run on-demand

**Criteria**: Nice-to-have + Exploratory + Performance benchmarks

| Requirement | Test Level | Test Count | Owner | Notes |
| ----------- | ---------- | ---------- | ----- | ----- |
| OCR性能基准 | E2E | 2 | QA | 测量识别时间 |
| 存储空间测试 | API | 2 | QA | 验证IndexedDB限制 |
| 探索性测试 | E2E | 3 | QA | 用户场景探索 |
| 可访问性测试 | Component | 3 | DEV | 键盘导航、屏幕阅读器 |

**Total P3**: 10 tests, 5 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] 用户登录成功 (30s)
- [ ] 创建一条账目 (45s)
- [ ] 查看账目列表 (30s)
- [ ] 数据加密验证 (1min)

**Total**: 4 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] 手动输入记账完整流程 (E2E, 2min)
- [ ] 数据加密存储验证 (API, 1min)
- [ ] 访问控制验证 (E2E, 1min)
- [ ] 账目CRUD操作 (E2E, 3min)
- [ ] 登录状态保护 (E2E, 1min)

**Total**: 18 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] 搜索和筛选功能 (API, 5min)
- [ ] OCR识别流程 (E2E, 5min)
- [ ] 语音识别流程 (E2E, 3min)
- [ ] 短信解析流程 (API, 2min)
- [ ] 分页加载 (E2E, 2min)
- [ ] 表单验证 (Component, 3min)

**Total**: 25 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] 错误处理场景 (E2E, 10min)
- [ ] 边界值测试 (Unit, 5min)
- [ ] 性能测试 (E2E, 10min)
- [ ] 浏览器兼容性 (E2E, 15min)
- [ ] 探索性测试 (E2E, 10min)

**Total**: 35 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority | Count | Hours/Test | Total Hours | Notes |
| -------- | ----- | ---------- | ----------- | ----- |
| P0       | 18    | 2.0        | 36          | Complex setup, security |
| P1       | 25    | 1.0        | 25          | Standard coverage |
| P2       | 25    | 0.5        | 12.5        | Simple scenarios |
| P3       | 10    | 0.25       | 2.5         | Exploratory |
| **Total** | **78** | **-**      | **76**      | **~10 days** |

### Prerequisites

**Test Data:**

- AccountEntryFactory (faker-based, auto-cleanup)
- UserSessionFixture (setup/teardown)
- TestImageFixture (OCR测试图片)

**Tooling:**

- Playwright for E2E tests
- Vitest for Unit/Component tests
- Tesseract.js for OCR testing
- Web Speech API for voice testing

**Environment:**

- Local development server
- Chrome/Edge browser for voice recognition
- Test images for OCR
- Mock SMS data for parsing

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: ≥80%
- **Security scenarios**: 100%
- **Business logic**: ≥70%
- **Edge cases**: ≥50%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (≥6) items unmitigated
- [ ] Security tests (SEC category) pass 100%
- [ ] Data integrity tests (DATA category) pass 100%

---

## Mitigation Plans

### R-001: 数据加密失败导致敏感信息泄露 (Score: 6)

**Mitigation Strategy:** 
- 实现加密验证测试，确保所有账目数据在存储前加密
- 验证解密功能正常工作
- 测试Session过期后无法解密数据
- 实现加密密钥管理测试

**Owner:** QA
**Timeline:** 立即
**Status:** Planned
**Verification:** 所有P0安全测试通过，数据加密验证测试100%通过

### R-002: 账目数据丢失或损坏 (Score: 6)

**Mitigation Strategy:**
- 实现数据完整性测试，验证CRUD操作的原子性
- 测试数据库事务回滚场景
- 验证数据备份和恢复功能
- 实现数据一致性检查

**Owner:** QA
**Timeline:** 立即
**Status:** Planned
**Verification:** 所有数据操作测试通过，无数据丢失或损坏

### R-003: 未授权访问账目数据 (Score: 6)

**Mitigation Strategy:**
- 实现访问控制测试，验证Session过期后无法访问
- 测试未登录状态下的数据访问
- 验证ProtectedRoute组件功能
- 实现Session管理测试

**Owner:** QA
**Timeline:** 立即
**Status:** Planned
**Verification:** 所有访问控制测试通过，未授权访问被正确阻止

---

## Assumptions and Dependencies

### Assumptions

1. 用户已设置密码并登录（P0测试前提）
2. 浏览器支持Web Speech API（语音识别测试）
3. OCR测试使用清晰的发票图片
4. IndexedDB在测试环境中可用

### Dependencies

1. Playwright测试框架 - 需要安装和配置
2. Vitest单元测试框架 - 已配置
3. 测试数据工厂 - 需要实现
4. Mock服务 - 需要实现（OCR、语音识别）

### Risks to Plan

- **Risk**: OCR识别准确率受图片质量影响
  - **Impact**: 测试结果不稳定
  - **Contingency**: 使用标准测试图片，设置合理的准确率阈值

- **Risk**: 语音识别需要浏览器支持
  - **Impact**: 部分浏览器无法测试
  - **Contingency**: 仅测试Chrome/Edge，其他浏览器标记为已知限制

---

## Follow-on Workflows (Manual)

- Run `*atdd` to generate failing P0 tests (separate workflow; not auto-run).
- Run `*automate` for broader coverage once implementation exists.
- Run `*test-review` to validate test quality.

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: {name} Date: {date}
- [ ] Tech Lead: {name} Date: {date}
- [ ] QA Lead: {name} Date: {date}

**Comments:**

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework
- `probability-impact.md` - Risk scoring methodology
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - P0-P3 prioritization

### Related Documents

- PRD: `_bmad-output/planning-artifacts/prd.md`
- Epic: `_bmad-output/planning-artifacts/epics.md` (Epic 3)
- Architecture: `_bmad-output/planning-artifacts/architecture.md`
- Implementation: `web/src/` (Epic 3 implementation)

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
