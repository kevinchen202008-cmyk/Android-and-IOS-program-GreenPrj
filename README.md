# GreenPrj

本仓库 README 分为两大章节：**一、为什么使用 BMAD**（本项目采用的研发方法论）；**二、GreenPrj 的介绍**（产品说明与使用指南）。

**目录**：[一、为什么使用 BMAD](#一为什么使用-bmad) · [二、GreenPrj 的介绍](#二greenprj-的介绍)

---

## 一、为什么使用 BMAD

> 一套将 AI 编程从“氛围感编码”提升为工程化、生产级开发的开放式方法论；本文同时说明在本项目（GreenPrj）中的采用原因与落地方式。

[![Methodology](https://img.shields.io/badge/Methodology-BMAD-blue)](https://github.com)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green)](https://github.com)
[![Documentation](https://img.shields.io/badge/Docs-BMAD-orange)](https://docs.bmad-method.org)

**本章节目录**：[核心支柱](#-核心支柱-core-pillars) · [核心价值](#-核心价值) · [BMAD 是什么](#-bmad-是什么) · [为什么选用 BMAD](#-为什么选用-bmad) · [本项目中的落地方式](#-本项目中的落地方式) · [何时考虑使用 BMAD](#-何时考虑使用-bmad) · [延伸阅读](#-延伸阅读与快速链接)

### 🛠 核心支柱 (Core Pillars)

| 支柱 | 说明 |
|------|------|
| **1. 工程化严谨性** | 传统 AI 提示易导致架构偏移。BMAD 坚持 **PRD 优先**、**架构优先**，让 AI 先弄清“为什么”和“怎么做”，再写代码。 |
| **2. 专项 AI 代理集群** | 12+ 个专项角色模拟真实团队：PM/分析师细化需求，架构师定义技术栈与数据模型，Scrum Master 拆 Story，开发者与 QA 实现并验证。 |
| **3. 上下文分片** | 把项目拆成独立小单元（Stories），缓解“上下文崩溃”与幻觉，每个任务只加载最相关上下文。 |
| **4. 自适应规模流** | **Quick Flow** 适合修 Bug、小改动；**Full Flow** 适合大型企业级系统从 0 到 1。 |
| **5. 跨工具兼容** | 基于 Markdown/YAML，可接入 Claude Code、Cursor、Windsurf 等主流 AI 开发工具。 |

#### 简要说明

- **工程化 vs 氛围感编码**：先定需求与架构，再让 AI 按图施工，避免盲目盲猜。
- **多代理分工**：产品、架构、Scrum、开发、测试等角色各司其职，产出可追溯。
- **分片与规模**：大项目拆小、小需求走快道，按复杂度自动选流。

### 📈 核心价值

- **极速交付**：复杂功能开发效率平均提升约 **55%**。
- **高质量代码**：架构预审 + QA 代理验证，减少技术债。
- **可审计性**：决策与产出均有文档记录，满足企业与合规要求。

### 📋 BMAD 是什么

**BMAD**（Breakthrough Method for Agile AI-Driven Development / BMad Method Agile-AI Driven-Development）是一套结合敏捷与 AI 辅助的研发方法论，本仓库中涉及的模块如下：

| 模块 | 含义 | 典型用途 |
|------|------|----------|
| **BMM** | 分析方法与流程 | 产品简介、PRD、Epic/Story、架构、UX、测试设计 |
| **BMB** | 构建器 | Agent / 工作流 / 模块的创建与扩展 |
| **CIS** | 创意与创新 | 头脑风暴、设计思维、故事讲述 |
| **Core** | 核心能力 | 主控 Agent、头脑风暴、Party Mode 等 |

本仓库在 `_bmad/` 下集成 BMAD 配置，在 `_bmad-output/` 下归档规划与实施产出。

### ✅ 为什么选用 BMAD

1. **需求与范围可追溯**  
   从 Product Brief → PRD → Epic/Story 逐层分解，需求与实现一一对应，便于验收和复盘。

2. **产出结构化、可复用**  
   架构说明、UX 规范、测试设计等以 Markdown/YAML 等形式沉淀在 `_bmad-output/`，方便版本管理与跨项目参考。

3. **与 AI 协作顺畅**  
   通过 Cursor / OpenCode 等调用 BMAD 工作流，用自然语言驱动产品简介、PRD、Story 开发等，减少手工整理成本。

4. **适合中小型产品从 0 到 1**  
   不依赖重型流程工具，用文档与工作流即可完成「规划 → 设计 → 开发 → 测试」的闭环。

### 🏃 本项目中的落地方式

- **规划阶段**：Product Brief、PRD、Epic/Story 分解（见 `_bmad-output/planning-artifacts/`）。
- **设计阶段**：架构说明、UX 规范、测试设计（同上目录及 `_bmad-output/` 根下文档）。
- **实施与交付**：按 Story 开发、代码审查、Sprint 状态跟踪；复盘与案例总结见 [BMAD-CASE-STUDY.md](docs/BMAD-CASE-STUDY.md)。

配置与命令说明见仓库根目录 [BMAD-配置说明.md](BMAD-配置说明.md)。

### ⚖️ 何时考虑使用 BMAD

| 场景 | 是否适合 |
|------|----------|
| 新项目需要从 0 梳理需求与范围 | ✅ 适合 |
| 希望需求、设计、实现可追溯、可归档 | ✅ 适合 |
| 团队已习惯纯代码/看板，不愿维护文档 | ⚠️ 需权衡 |
| 大型企业强流程（如 SAFe）已有既定规范 | ⚠️ 可作补充而非替代 |

### 🔗 延伸阅读与快速链接

| 资源 | 说明 |
|------|------|
| [BMAD 项目复盘与案例文档](docs/BMAD-CASE-STUDY.md) | 本项目四阶段落地方式与改进建议 |
| [BMAD 配置说明](BMAD-配置说明.md) | 模块、Agents、工作流与使用方式 |
| **GitHub 仓库** | [bmad-code-org/BMAD-METHOD](https://github.com) |
| **官方文档** | [BMAD Documentation](https://docs.bmad-method.org) |

> *赋能开发者，通过 AI Agent 构建企业级软件。*

---

## 二、GreenPrj 的介绍

跨平台个人记账应用：**Web** 与 **Android** 双端，本地优先、数据可导出/导入与跨端合并。

### 快速使用指南

#### 当前版本功能范围

- **Web 端（v0.1.0-web-stable）**：认证、手工记账、发票扫描（Tesseract）、短信解析（粘贴）、语音输入、统计与报表、预算管理、账本合并、数据管理（导出/导入 JSON/CSV）、操作日志、完全离线可用。
- **Android 端**：认证与安全、核心记账（录入/列表/编辑/删除/过滤）、解析短信（粘贴/输入）、语音输入（系统识别 + 解析预填）、扫描发票（选图 + ML Kit OCR 预填）、统计、预算、账本合并、操作日志等，与 Web MVP 对齐。
- **数据**：本地存储为主，不自动同步；支持导出/导入实现备份与跨设备迁移，Android 与 Web 账本格式兼容可互导。

#### 安装与访问

| 平台 | 方式 |
|------|------|
| **Web** | 项目根目录执行：`cd web` → `npm install` → `npm run dev`，浏览器打开 `http://localhost:5173`。 |
| **Android** | 用 Android Studio 打开 `android` 目录，连接设备或模拟器，运行 `app`。或从本仓库 [Releases](https://github.com/kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj/releases) 下载测试版 APK 安装。 |

更详细的安装与运行说明见：**Web** → [docs/USER_GUIDE.md](docs/USER_GUIDE.md)，**开发/构建** → [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)。

#### 典型使用路径

1. **记一笔账并查看列表**  
   设置/输入密码 → 进入「记账」→ 新增账目（金额、日期、类别、备注）→ 在列表中查看、编辑或删除。

2. **查看统计与预算**  
   登录后进入「统计」查看按天/周/月/年的消费趋势与类别分布；进入「预算」设置月度/年度预算并查看执行情况。

3. **导出数据与跨端使用**  
   在「数据管理」中导出 JSON 或 CSV 备份；可在另一台设备或 Web/Android 间导入同一备份文件，实现迁移或合并（合并时支持去重与冲突处理）。

更多场景与 FAQ 见 [docs/USER_GUIDE.md](docs/USER_GUIDE.md)。

### Releases / 测试版下载

- **Android 测试版 APK**：在本仓库 [Releases](https://github.com/kevinchen202008-cmyk/Android-and-IOS-program-GreenPrj/releases) 中下载 `greenprj-android-test-*.apk`（Debug 包，供内测与归档）。安装前请在系统设置中允许「未知来源」安装。
- 构建与归档说明见 [android/ANDROID_TEST_RELEASE.md](android/ANDROID_TEST_RELEASE.md)。

### 未来计划

- Android 与 Web 在术语、流程与体验上的一致性优化。
- Web 生产部署流水线、前端监控与性能优化。
- Android 内测渠道与崩溃收集、测试覆盖增强。

可执行任务清单见 [docs/PLAN_NEXT_PHASE.md](docs/PLAN_NEXT_PHASE.md)。

### 项目结构

| 目录 | 说明 |
|------|------|
| `web/` | Web 前端（Vite + React + TypeScript） |
| `android/` | Android 应用（Kotlin + Hilt + Room） |
| `docs/` | 用户与开发文档 |
| `scripts/` | 脚本（如 Android 测试版归档上传） |
| `.github/workflows/` | CI 配置（如 Web 构建） |
| `_bmad-output/` | BMAD 规划与产出归档 |

变更记录见 [CHANGELOG.md](CHANGELOG.md)。
