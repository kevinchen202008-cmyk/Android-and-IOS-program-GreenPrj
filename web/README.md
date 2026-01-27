# GreenPrj Web Platform

GreenPrj 个人记账应用 - Web平台

## 技术栈

- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: Material UI (MUI)
- **路由**: React Router DOM
- **状态管理**: Zustand
- **数据库**: IndexedDB (idb library)

## 项目结构

```
web/
├── src/
│   ├── components/        # 组件
│   │   ├── common/        # 共享组件
│   │   └── features/      # 功能组件
│   ├── features/          # 功能模块
│   │   ├── accounting/    # 记账功能
│   │   ├── statistics/    # 统计功能
│   │   ├── budget/        # 预算管理
│   │   └── auth/          # 认证功能
│   ├── services/          # 服务层
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript类型定义
│   ├── App.tsx            # 主应用组件
│   └── main.tsx           # 入口文件
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 功能特性

- ✅ 项目初始化完成
- ✅ 数据库设置（IndexedDB）
- ✅ 用户认证（密码设置、登录、修改密码）
- ✅ 会话管理（30分钟超时）
- ✅ 访问控制保护
- ✅ **核心记账功能（Epic 3）**
  - ✅ 手动输入记账
  - ✅ 账目列表查看（分页）
  - ✅ 账目编辑和删除
  - ✅ 搜索和筛选（关键词、类别、日期范围）
  - ✅ 发票扫描识别（OCR - Tesseract.js）
  - ✅ 语音输入识别（Web Speech API）
  - ✅ 短信解析识别
  - ✅ 数据加密存储
- ⏳ 统计报表
- ⏳ 预算管理

## 测试

### 自动化测试

**测试框架:**
- **单元测试**: Vitest
- **组件测试**: Vitest + Testing Library
- **E2E测试**: Playwright

**快速运行测试:**
```bash
# 运行单元测试
npm run test

# 运行E2E测试（需要dev server）
npm run test:e2e

# 查看测试UI
npm run test:ui
```

**测试文档:**
- [测试执行指南](./TEST_EXECUTION_GUIDE.md) - 详细的测试运行说明
- [快速测试运行](./QUICK_TEST_RUN.md) - 一键运行指南
- [测试自动化总结](../_bmad-output/automation-summary-epic3.md) - 测试覆盖总结

### 手动测试

**Epic 3 功能测试:**
- [Epic 3 完整测试指南](./TESTING_EPIC3.md) - 详细的测试场景和步骤
- [Epic 3 快速测试指南](./QUICK_TEST_EPIC3.md) - 5分钟快速测试
- [浏览器控制台测试脚本](./test-epic3-console.js) - 快速功能验证脚本

**其他测试文档:**
- [认证功能测试指南](./TESTING.md) - Epic 2 认证功能测试
- [快速测试指南](./QUICK_TEST.md) - 通用快速测试
