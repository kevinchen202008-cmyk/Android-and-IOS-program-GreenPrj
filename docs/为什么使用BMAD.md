# 🚀 为什么选择 BMAD？ (Why BMAD?)

> 一套将 AI 编程从“氛围感编码”提升为工程化、生产级开发的开放式方法论；本文同时说明在本项目（GreenPrj）中的采用原因与落地方式。

[![Methodology](https://img.shields.io/badge/Methodology-BMAD-blue)](https://github.com)
[![Open Source](https://img.shields.io/badge/Open%20Source-Yes-green)](https://github.com)
[![Documentation](https://img.shields.io/badge/Docs-BMAD-orange)](https://docs.bmad-method.org)

**目录**：[核心支柱](#-核心支柱-core-pillars) · [核心价值](#-核心价值) · [BMAD 是什么](#-bmad-是什么) · [为什么选用 BMAD](#-为什么选用-bmad) · [本项目中的落地方式](#-本项目中的落地方式) · [何时考虑使用 BMAD](#-何时考虑使用-bmad) · [延伸阅读](#-延伸阅读)

---

## 🛠 核心支柱 (Core Pillars)

| 支柱 | 说明 |
|------|------|
| **1. 工程化严谨性** | 传统 AI 提示易导致架构偏移。BMAD 坚持 **PRD 优先**、**架构优先**，让 AI 先弄清“为什么”和“怎么做”，再写代码。 |
| **2. 专项 AI 代理集群** | 12+ 个专项角色模拟真实团队：PM/分析师细化需求，架构师定义技术栈与数据模型，Scrum Master 拆 Story，开发者与 QA 实现并验证。 |
| **3. 上下文分片** | 把项目拆成独立小单元（Stories），缓解“上下文崩溃”与幻觉，每个任务只加载最相关上下文。 |
| **4. 自适应规模流** | **Quick Flow** 适合修 Bug、小改动；**Full Flow** 适合大型企业级系统从 0 到 1。 |
| **5. 跨工具兼容** | 基于 Markdown/YAML，可接入 Claude Code、Cursor、Windsurf 等主流 AI 开发工具。 |

### 简要说明

- **工程化 vs 氛围感编码**：先定需求与架构，再让 AI 按图施工，避免盲目盲猜。
- **多代理分工**：产品、架构、Scrum、开发、测试等角色各司其职，产出可追溯。
- **分片与规模**：大项目拆小、小需求走快道，按复杂度自动选流。

---

## 📈 核心价值

- **极速交付**：复杂功能开发效率平均提升约 **55%**。
- **高质量代码**：架构预审 + QA 代理验证，减少技术债。
- **可审计性**：决策与产出均有文档记录，满足企业与合规要求。

---

## 📋 BMAD 是什么

**BMAD**（Breakthrough Method for Agile AI-Driven Development / BMad Method Agile-AI Driven-Development）是一套结合敏捷与 AI 辅助的研发方法论，本仓库中涉及的模块如下：

| 模块 | 含义 | 典型用途 |
|------|------|----------|
| **BMM** | 分析方法与流程 | 产品简介、PRD、Epic/Story、架构、UX、测试设计 |
| **BMB** | 构建器 | Agent / 工作流 / 模块的创建与扩展 |
| **CIS** | 创意与创新 | 头脑风暴、设计思维、故事讲述 |
| **Core** | 核心能力 | 主控 Agent、头脑风暴、Party Mode 等 |

本仓库在 `_bmad/` 下集成 BMAD 配置，在 `_bmad-output/` 下归档规划与实施产出。

---

## ✅ 为什么选用 BMAD

1. **需求与范围可追溯**  
   从 Product Brief → PRD → Epic/Story 逐层分解，需求与实现一一对应，便于验收和复盘。

2. **产出结构化、可复用**  
   架构说明、UX 规范、测试设计等以 Markdown/YAML 等形式沉淀在 `_bmad-output/`，方便版本管理与跨项目参考。

3. **与 AI 协作顺畅**  
   通过 Cursor / OpenCode 等调用 BMAD 工作流，用自然语言驱动产品简介、PRD、Story 开发等，减少手工整理成本。

4. **适合中小型产品从 0 到 1**  
   不依赖重型流程工具，用文档与工作流即可完成「规划 → 设计 → 开发 → 测试」的闭环。

---

## 🏃 本项目中的落地方式

- **规划阶段**：Product Brief、PRD、Epic/Story 分解（见 `_bmad-output/planning-artifacts/`）。
- **设计阶段**：架构说明、UX 规范、测试设计（同上目录及 `_bmad-output/` 根下文档）。
- **实施与交付**：按 Story 开发、代码审查、Sprint 状态跟踪；复盘与案例总结见 [BMAD-CASE-STUDY.md](BMAD-CASE-STUDY.md)。

配置与命令说明见仓库根目录 [BMAD-配置说明.md](../BMAD-配置说明.md)。

---

## ⚖️ 何时考虑使用 BMAD

| 场景 | 是否适合 |
|------|----------|
| **绿地项目**：新项目从 0 梳理需求与范围 | ✅ 适合 |
| **棕地项目**：既有系统演进、改造或增量开发 | ✅ 适合 |
| 希望需求、设计、实现可追溯、可归档 | ✅ 适合 |
| 团队已习惯纯代码/看板，不愿维护文档 | ⚠️ 需权衡 |
| 大型企业强流程（如 SAFe）已有既定规范 | ⚠️ 可作补充而非替代 |

---

## 🔗 延伸阅读与快速链接

| 资源 | 说明 |
|------|------|
| [BMAD 项目复盘与案例文档](BMAD-CASE-STUDY.md) | 本项目四阶段落地方式与改进建议 |
| [BMAD 配置说明](../BMAD-配置说明.md) | 模块、Agents、工作流与使用方式 |
| **GitHub 仓库** | [bmad-code-org/BMAD-METHOD](https://github.com) |
| **官方文档** | [BMAD Documentation](https://docs.bmad-method.org) |

---

> *赋能开发者，通过 AI Agent 构建企业级软件。*
