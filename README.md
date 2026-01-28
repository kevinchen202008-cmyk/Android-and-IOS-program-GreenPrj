# GreenPrj：基于 BMAD 方法论的跨平台应用开发实践

## 项目简介

GreenPrj 是一个创新的全平台应用开发项目，采用 **BMAD 方法论**（Breakthrough Method for Agile AI-Driven Development）完成 Android、iOS、Windows/Linux 本地 Web 程序的开发实践。本项目覆盖移动端和桌面端全场景应用，记录了整个开发过程，展示了如何利用现代敏捷开发方法论有效地管理和实施复杂的多平台应用开发工作。

在实际工程实践中，本项目对开发工具与平台规划做了以下约定：

- **主力开发工具**：全仓库以 **Cursor** 作为主力 AI 驱动开发工具；
- **Android 开发方式**：以 **Cursor + Android Studio** 组合方式进行开发与调试；
- **Web 版本阶段规划**：
  - 第一阶段：面向 **Windows / Linux** 的本地单机 Web 版本（当前主要交付形态）；
  - 第二阶段：在架构上统一规划后端云服务，迁移为基于云后端的统一服务形态；
- **iOS 版本规划**：iOS 端功能与实现整体归入第二阶段进行开发与落地。

### 核心特点

项目采用 BMAD 方法论作为指导框架，这是一套突破性的 AI 驱动敏捷开发体系。通过 BMAD 方法论的应用，GreenPrj 具有以下特点：

- **全平台覆盖**：原生支持 iOS、Android 移动平台以及 Windows/Linux 桌面 Web 应用
- **权限管理设计**：实现跨所有平台的统一权限管理机制
- **跨平台适配**：统一的业务逻辑和接口，针对各平台特性独立实现
- **规范的开发流程**：遵循 BMAD 方法论的完整开发周期，从需求分析到交付
- **完整的过程记录**：详细记录了整个项目的开发实践过程和经验总结

## 关于 BMAD 方法论

BMAD 方法论是一个通用的 AI 代理框架，专注于代理式敏捷驱动开发（Agentic Agile Driven Development）[1]。该方法论通过以下核心特性为软件开发赋能：

### BMAD 的四大阶段

BMAD 遵循系统的四阶段开发流程，确保项目的完整性和质量：

| 阶段 | 描述 |
|-----|-----|
| **业务分析与市场研究** | 对项目进行深入的市场调研和业务需求分析 |
| **项目管理与需求规范** | 建立清晰的项目需求文档和管理体系 |
| **UX/UI 设计** | 进行用户体验和界面设计工作 |
| **技术架构与实现** | 完成技术架构设计和代码实现 |

### 核心优势

BMAD 方法论的优势体现在以下几个方面：

**团队协作模拟**：通过 AI 代理模拟完整的敏捷开发团队，包括业务分析师、产品经理、UX 专家、技术架构师等角色。这使得单个开发者或小型团队可以具备大型团队的能力。

**规范化工作流**：BMAD 定义了明确的工作流程和每个阶段的交付物，确保开发过程的可预测性和可管理性。

**上下文管理**：通过上下文工程解决 AI 在长期项目中的"记忆"问题，保持项目信息的连贯性。

**自然语言优先**：以自然语言作为主要交互方式，让 AI 能够更准确地理解开发需求和意图。

## 项目架构

GreenPrj 采用模块化、分层的架构设计，支持多个平台的独立开发，同时共享核心业务逻辑层和数据服务层：

```
GreenPrj/
├── iOS/
│   ├── 源代码（Swift/Objective-C）
│   ├── UI 组件
│   └── 权限管理实现
├── Android/
│   ├── 源代码（Java/Kotlin）
│   ├── UI 组件
│   └── 权限管理实现
├── Web/
│   ├── 前端应用（React/Vue/Angular）
│   ├── UI 组件库
│   ├── 样式和主题
│   └── 桌面集成（Electron/Tauri）
├── 后端服务/
│   ├── API 接口定义
│   ├── 业务逻辑层
│   └── 数据访问层
├── 核心业务逻辑层
├── 数据模型和服务
└── 文档和流程记录
```

### 架构层次说明

GreenPrj 遵循经典的分层架构设计，包含以下几个关键层次：

**表现层**：针对不同平台（iOS、Android、Web）的用户界面实现。各平台使用本地框架和最佳实践进行界面开发，提供一致的用户体验。

**业务逻辑层**：包含所有与业务相关的核心逻辑，如权限管理、数据验证、业务规则等。该层独立于平台实现，通过统一的接口被不同平台的表现层调用。

**数据服务层**：负责数据的获取、存储和同步。包括本地数据库操作、远程 API 调用、数据缓存管理等功能。

**系统服务层**：提供跨平台的系统级功能，如文件管理、网络通信、日志记录等。

## 权限管理设计

权限管理是 GreenPrj 的核心功能之一，项目实现了跨平台统一的权限管理框架，支持移动端和桌面端的差异化需求：

### iOS 平台权限管理

iOS 平台利用系统的权限申请机制，包括位置、摄像头、麦克风、通讯录等敏感权限的管理。项目封装了统一的权限请求接口，简化了权限处理的复杂性。

### Android 平台权限管理

Android 平台需要区分不同 API 级别的权限处理机制。GreenPrj 实现了对危险权限的正确分类和动态申请，确保应用在不同 Android 版本上的兼容性。

### Web 平台权限管理

Web 应用通过浏览器 API 实现权限管理，包括地理位置、摄像头、麦克风、文件系统访问等。桌面应用（Electron/Tauri）可进一步扩展系统级权限访问。

### 跨平台权限适配

项目提供了统一的权限查询和申请接口，允许上层业务逻辑以平台无关的方式进行权限操作，底层根据不同平台自动适配相应的系统权限调用。

## 技术栈

项目使用现代的开发技术和工具，为不同平台选择最优的技术方案：

| 平台 | 主要技术 | 开发语言 | 开发工具 |
|-----|--------|--------|--------|
| **iOS** | UIKit/SwiftUI、CocoaPods | Swift、Objective-C | Cursor、Xcode |
| **Android** | Android Framework、Gradle | Java、Kotlin | Cursor、Android Studio |
| **Web 前端** | React/Vue/Angular、NPM | TypeScript/JavaScript | Cursor、VS Code、Webpack |
| **Web 桌面** | Electron/Tauri | Node.js/Rust | Cursor、VS Code、Cargo |
| **后端服务** | Express/Spring Boot/FastAPI | Node.js/Java/Python | Cursor、Docker、Kubernetes |
| **数据库** | SQLite/PostgreSQL、Redis | SQL | Cursor、pgAdmin、Adminer |
| **共享层** | REST API、数据模型 | JSON Schema | Cursor、Git |

### Cursor 使用规范与推荐流程

为充分发挥 AI 辅助开发能力，本项目在各平台统一约定使用 Cursor 的方式：

- **通用原则**
  - 以 Cursor 作为“主 IDE + AI 结对编程工具”，统一管理多平台仓库（Android、Web、后端等）；
  - 通过对话方式驱动需求拆分、代码生成、重构和文档同步，确保 BMAD 方法论在工具层落地；
  - 尽量将架构设计、接口约定、核心业务逻辑的讨论与变更记录在仓库内文档中，由 Cursor 协助维护一致性。

- **Android 场景（Cursor + Android Studio）**
  - 在 Cursor 中进行：业务代码编写、重构、单元测试、文档更新；
  - 在 Android Studio 中进行：Gradle 配置、构建签名、模拟器/真机调试、布局预览等；
  - 建议通过 Cursor 批量修改 Kotlin/Java 代码与资源，再在 Android Studio 中执行构建与运行。

- **Web 场景**
  - 使用 Cursor 作为主力前端开发环境：包括组件开发、状态管理、接口对接、单元测试等；
  - 借助 Cursor 的代码搜索与重构能力，统一管理 Web 单机版本与未来云后端对接的适配层；
  - 本地运行 `npm run dev` / `npm run build` 等命令时，可通过 Cursor 集成终端或系统终端执行。

- **后端与数据库场景**
  - 使用 Cursor 设计和实现 API、数据模型、迁移脚本，保持接口定义与前端类型的一致性；
  - 通过 Cursor 对 SQL / 查询层进行审阅与重构，结合外部数据库工具（如 pgAdmin）完成联调与运维。

- **最佳实践建议**
  - 优先在 Cursor 中完成“需求 → 设计 → 实现 → 文档”的一体化闭环，减少信息分散；
  - 大型重构或跨模块改动时，先在对话中约定改动范围和风险点，再让 Cursor 逐步实施；
  - 重要决策（如架构调整、阶段规划）建议同步更新 README / 架构文档，并通过 Cursor 统一修改。

### 前端框架对比

| 框架 | 优势 | 使用场景 |
|-----|-----|--------|
| **React** | 组件化成熟、生态丰富、性能优 | 复杂交互应用 |
| **Vue** | 学习曲线平缓、开发效率高 | 中等复杂度应用 |
| **Angular** | 企业级框架、完整工具链 | 大型企业应用 |

### 桌面集成方案

GreenPrj 提供两种桌面应用集成方案：

**Electron 方案**：使用 Chromium 和 Node.js 引擎，提供完整的系统访问能力。支持 Windows 和 Linux 平台，文件体积较大但功能强大。

**Tauri 方案**：基于系统 WebView，提供轻量级的桌面应用运行时。文件体积小，性能更优，支持 Windows、macOS 和 Linux。

## 开发过程和经验记录

GreenPrj 的核心价值在于完整记录了项目的开发过程。项目文档中包含：

**需求分析文档**：详细的项目需求规范和业务逻辑描述，包括移动端和桌面端的特殊需求。

**架构设计文档**：系统的整体架构、模块划分、接口定义和多平台适配策略。

**实现指南**：具体的代码实现步骤、技术方案选择的理由和平台特定实现细节。

**测试报告**：功能测试、兼容性测试、性能测试和跨平台一致性测试的结果。

**经验总结**：项目中遇到的问题、解决方案、平台差异处理和最佳实践。

这些记录为其他开发者学习全平台应用开发提供了宝贵的参考。

## 快速开始

### 环境要求

开发 GreenPrj 项目需要根据目标平台安装不同的开发环境：

**通用环境**：

- Git 版本控制系统
- Node.js 14.0+ 或 Python 3.8+（用于构建工具和后端开发）

**iOS 开发**：

- macOS 系统（10.15 或更高版本）
- Xcode 14.0+
- iOS SDK 12.0+ 目标版本
- CocoaPods 1.11+

**Android 开发**：

- Android Studio 2022.1+
- Android SDK API 21+
- JDK 11 或更高版本

**Web 开发**：

- Node.js 16.0+
- npm 8.0+ 或 Yarn 1.22+
- 现代浏览器（Chrome、Firefox、Edge）

**桌面应用开发**：

- Windows 7 或更高版本（Electron/Tauri）
- Linux（Ubuntu 18.04 或更高版本）
- Rust 1.70+（仅 Tauri 方案需要）

**后端开发**：

- Docker 20.10+（可选，用于容器化部署）
- PostgreSQL 12+ 或 SQLite 3.35+

### 项目克隆

```bash
git clone https://github.com/kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj.git
cd Android-and-IOS-program-GreenPrj
```

### iOS 项目编译

```bash
cd iOS
pod install
open GreenPrj.xcworkspace
# 在 Xcode 中选择目标设备并运行，或使用以下命令行方式
xcodebuild -workspace GreenPrj.xcworkspace -scheme GreenPrj -configuration Debug
```

### Android 项目编译

```bash
cd Android
./gradlew build
# 使用 Android Studio 打开项目，或通过以下命令安装
./gradlew installDebug
# 在模拟器或真实设备上运行
```

### Web 项目编译和运行

**开发环境**：

```bash
cd Web
npm install
# 或使用 yarn
yarn install

# 启动开发服务器
npm run dev
# 默认监听 http://localhost:3000

# 或使用热重载开发
npm run serve
```

**生产构建**：

```bash
# 构建生产版本
npm run build

# 生成的文件位于 dist/ 目录
ls -la dist/
```

### 桌面应用编译

**使用 Electron**：

```bash
cd Web/desktop/electron
npm install
# 开发模式运行
npm run electron-dev
# 打包应用
npm run electron-build
```

**使用 Tauri**：

```bash
cd Web/desktop/tauri
cargo install tauri-cli
# 开发模式运行
cargo tauri dev
# 构建应用
cargo tauri build
```

### 后端服务启动

```bash
# 假设使用 Node.js/Express 后端
cd backend
npm install
# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置文件

# 启动开发服务器
npm run dev
# 或生产模式
npm start
```

## 项目结构说明

### 核心目录

**iOS**：包含 iOS 应用的完整源代码、资源文件和测试用例。遵循 Xcode 项目的标准结构。

**Android**：包含 Android 应用的完整源代码、资源文件、Gradle 配置和测试用例。

**Web**：包含 Web 前端应用和桌面集成代码。前端使用现代框架开发，提供单页应用（SPA）体验。

**backend**：包含后端 API 服务、业务逻辑实现、数据库模型和数据访问层。

**共享**：包含跨平台使用的资源、接口定义、数据模型和公共工具函数。

**文档**：包含需求分析、架构设计、实现指南等详细文档。

### 重要文件

- **README.md**：项目总览（本文件）
- **ARCHITECTURE.md**：系统架构和模块设计文档
- **PERMISSIONS.md**：权限管理详细指南
- **PLATFORM_GUIDE.md**：各平台开发指南和特性说明
- **GETTING_STARTED.md**：快速开始指南
- **DEPLOYMENT.md**：部署和发布指南
- **CHANGELOG.md**：版本更新日志
- **.env.example**：环境变量配置示例

## 主要功能模块

### 用户认证模块

实现用户登录、注册和会话管理功能，支持多种认证方式（本地认证、OAuth、社交登录）。该模块在所有平台上提供统一的接口，后端验证和授权。

### 权限管理模块

提供统一的权限查询、申请和管理接口，支持动态权限请求和用户授权处理。针对不同平台的系统权限进行适配和包装。

### 数据存储模块

封装本地数据存储（数据库、文件系统）和远程数据同步功能。支持离线模式和在线模式的自动切换，确保数据一致性。

### 网络通信模块

提供 HTTP/HTTPS 请求封装、请求重试、缓存管理和错误处理。实现请求拦截、响应处理和网络状态监听。

### UI 框架模块

提供统一的 UI 组件库和主题管理，支持各个平台的一致用户体验。包括按钮、输入框、列表、对话框等常用组件。

### 数据分析模块

集成数据收集和分析功能，支持用户行为追踪、事件记录和性能监控。帮助了解应用的使用情况和优化方向。

## 测试

GreenPrj 包含完整的测试套件，确保应用的质量和稳定性：

**单元测试**：对核心业务逻辑进行单元测试，确保模块功能正确。使用 Jest、XCTest、JUnit 等框架进行测试。

**集成测试**：测试不同模块之间的交互和数据流。验证 API 集成、数据库操作和业务流程。

**UI 测试**：在真实设备和模拟器上进行 UI 测试，验证用户交互流程。使用 Espresso、XCUITest 等框架。

**端到端测试**：模拟完整的用户场景，验证整个应用流程。使用 Cypress、Playwright 等工具。

**性能测试**：测试应用在不同负载下的性能表现，包括响应时间、内存占用和 CPU 使用率。

**兼容性测试**：在不同 iOS 版本、Android 版本、浏览器和操作系统上验证应用兼容性。

**跨平台一致性测试**：验证不同平台上的功能和用户体验一致性。

运行测试命令：

```bash
# iOS 测试
cd iOS
xcodebuild test -workspace GreenPrj.xcworkspace -scheme GreenPrj

# Android 测试
cd Android
./gradlew test
./gradlew connectedAndroidTest  # UI 测试

# Web 测试
cd Web
npm run test              # 单元测试
npm run test:e2e          # 端到端测试
npm run test:coverage     # 覆盖率测试

# 后端测试
cd backend
npm run test
npm run test:coverage
```

## 部署和发布

### 移动应用发布

**iOS 应用商店**：通过 Xcode 进行归档和上传到 App Store Connect。需要开发者账户和有效的证书。

**Google Play Store**：通过 Android Studio 生成签名 APK 或 AAB（Android App Bundle），上传到 Google Play Console。

### Web 应用部署

**开发环境**：

```bash
cd Web
npm run serve
```

**生产环境**：

```bash
# 构建生产版本
npm run build

# 部署到 Web 服务器（如 Nginx、Apache）
rsync -avz dist/ user@server:/var/www/greenprj/

# 或使用 Docker 容器化部署
docker build -t greenprj-web .
docker run -p 80:3000 greenprj-web
```

### 桌面应用分发

**Windows 可执行文件**：

```bash
# 使用 Electron 或 Tauri 打包
npm run electron-build
# 生成 .exe 安装程序或便携版本
```

**Linux 包**：

```bash
# 生成 AppImage、deb 或 rpm 包
cargo tauri build --target x86_64-unknown-linux-gnu
```

### 后端服务部署

```bash
# Docker 容器化
docker build -t greenprj-backend .
docker run -e DATABASE_URL=postgres://... -p 3000:3000 greenprj-backend

# 使用 Docker Compose 编排多个服务
docker-compose up -d
```

## 贡献指南

我们欢迎对 GreenPrj 项目的贡献。如果您想参与项目开发，请遵循以下步骤：

**Fork 项目**：点击 GitHub 上的 Fork 按钮创建项目的个人副本。

**创建分支**：为新功能或 Bug 修复创建专门的分支。使用描述性的分支名称，如 `feature/user-auth` 或 `fix/permission-bug`。

**提交更改**：在分支上进行修改并提交清晰的提交信息。遵循提交信息规范，如 "feat: add user authentication" 或 "fix: resolve permission issue"。

**推送到 Fork**：将更改推送到您的 Fork 仓库。

**提交 Pull Request**：向主项目提交 Pull Request，描述您的更改内容和目的。提供相关的 Issue 链接。

**代码审查**：等待代码审查。根据反馈进行必要的修改。

**合并**：审查通过后，维护者将合并您的 Pull Request。

所有贡献应符合项目的代码规范和质量标准。详见 CONTRIBUTING.md 文件。

## 许可证

GreenPrj 项目采用开源许可证。详见 LICENSE 文件。

## 联系方式

- **项目维护者**：kevinchen202008-cmyk
- **GitHub 仓库**：[Android-and-IOS-program-GreenPrj](https://github.com/kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj)
- **问题反馈**：请在 GitHub Issues 中报告问题和建议
- **讨论论坛**：使用 GitHub Discussions 进行项目讨论和知识分享

## 相关资源

### BMAD 方法论文档

- [BMAD-METHOD 官方仓库](https://github.com/bmad-code-org/BMAD-METHOD)
- [BMAD 方法论介绍](https://medium.com/@khatri.kamesh/bmad-a-practical-framework-for-ai-driven-agile-development-7639474137ee)
- [BMAD 实战指南](https://blog.csdn.net/terryso/article/details/149341561)

### 移动开发资源

- [Apple iOS 开发文档](https://developer.apple.com/documentation/)
- [Google Android 开发文档](https://developer.android.com/docs)
- [跨平台开发最佳实践](https://developer.apple.com/design/)

### Web 开发资源

- [React 官方文档](https://react.dev/)
- [Vue.js 官方文档](https://vuejs.org/)
- [Angular 官方文档](https://angular.io/)
- [MDN Web Docs](https://developer.mozilla.org/)

### 桌面应用开发

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Tauri 官方文档](https://tauri.app/docs/)

### 开发工具

- [Docker 官方文档](https://docs.docker.com/)
- [Git 官方文档](https://git-scm.com/doc)
- [VS Code 文档](https://code.visualstudio.com/docs)

## 致谢

感谢所有为 GreenPrj 项目做出贡献的开发者和合作者。本项目通过应用 BMAD 方法论，展示了现代敏捷开发在跨平台全场景应用开发中的价值。特别感谢开源社区提供的各类优秀框架和工具。

---

**文档作者**：Monica AI  
**最后更新**：2026 年 1 月  
**项目状态**：活跃维护中

## 参考资源

[1]: https://github.com/bmad-code-org/BMAD-METHOD "BMAD-METHOD GitHub 官方仓库"
[2]: https://blog.csdn.net/terryso/article/details/149341561 "BMAD-METHOD：让一个人顶一个敏捷团队的AI 驱动开发框架"
[3]: https://stevekaplanai.medium.com/the-bmad-method-how-i-build-ai-apps-10x-faster-than-traditional-dev-teams-23fddf0ff56e "The BMAD Method: How I Build AI Apps 10x Faster Than Traditional Dev Teams"
