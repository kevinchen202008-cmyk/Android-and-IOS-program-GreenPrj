# 手动运行完整测试说明

已配置 **jsdom** 并更新 Vitest，请在本机终端运行测试。若在 Cursor 内置终端出现 `EPERM`，在 **Windows PowerShell** 或 **CMD** 中执行下面命令。

---

## 方式一：一键脚本（推荐）

在项目 `web` 目录下打开 PowerShell，执行：

```powershell
cd "D:\Projects\Android and IOS program-GreenPrj\web"
.\run-full-test.ps1
```

脚本会依次运行：**单元+组件测试** → **E2E 测试**。

---

## 方式二：分步执行

### 1. 单元测试 + 组件测试

```powershell
cd "D:\Projects\Android and IOS program-GreenPrj\web"
npm run test -- --run
```

### 2. E2E 测试（会启动 dev server）

```powershell
npm run test:e2e
```

### 3. 可选：测试覆盖率

```powershell
npm run test:coverage
```

---

## 已完成的配置变更

- **vitest.config.ts**：`environment: 'jsdom'`，排除 `tests/e2e/**`
- **tests/setup.ts**：在缺少 IndexedDB 时使用 mock（兼容 jsdom），objectStore 增加 `clear`
- **package.json**：已包含 `jsdom`、`@vitest/coverage-v8` 等依赖

---

## 若出现 `Error: spawn EPERM`

常见原因：Cursor 内置终端或沙箱限制 esbuild 子进程。

**处理建议：**

1. 在 **系统自带的 PowerShell** 或 **CMD** 中运行上述命令（不要用 Cursor 终端）。
2. 用 **管理员身份** 打开 PowerShell 再运行。
3. 暂时关闭杀毒/安全软件对 `node`、`esbuild` 的拦截后重试。

---

## 预期结果（参考）

- **单元测试**：加密、account-entry-service、account-entry-repository、database 等。
- **组件测试**：CreateEntryForm。
- **E2E**：create-entry、access-control、crud-operations、search-filter。

跑完后把终端输出（或报错信息）发给我，我可以帮你逐条看。
