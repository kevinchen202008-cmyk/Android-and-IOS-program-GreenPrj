# Web 端性能与前端监控

**目标**：统计页与大列表在较大数据量下保持可接受响应；接入错误上报与基础性能指标，并在监控面板中看到实际数据。

---

## 1. 已接入能力

### 1.1 基础性能指标（web-vitals）

- **首屏与关键交互**：LCP（最大内容绘制）、FCP（首次内容绘制）、FID/INP（首次输入延迟）、CLS（累积布局偏移）。
- **采集方式**：`web/src/monitoring.ts` 在应用启动时注册 `web-vitals` 回调；开发环境下在浏览器控制台输出 `[Web Vitals]` 日志。
- **对接 Sentry**：若已接入 Sentry（见下），可在初始化时挂载 `window.__reportWebVital`，将指标上报至 Sentry Performance，在 Sentry 面板中查看「首屏时间、关键交互耗时」等。

### 1.2 错误上报（自建 + 可选 Sentry）

- **自建**：全局 `window.onerror` 与 `window.onunhandledrejection` 已注册，错误会打日志并调用 `window.__reportError`（可在此对接自建上报接口）。
- **Sentry**：安装 `@sentry/react` 后，在 `web/src/main.tsx` 最顶部、根据 `VITE_SENTRY_DSN` 初始化 Sentry，并在 Sentry 控制台查看错误与（若配置了 Performance）性能数据。

---

## 2. 接入 Sentry（可选）

1. 安装依赖：`cd web && npm install @sentry/react`
2. 在 `web/.env.production` 或部署平台环境变量中设置：`VITE_SENTRY_DSN=你的 DSN`
3. 在 `web/src/main.tsx` 最顶部增加：

```ts
const dsn = import.meta.env.VITE_SENTRY_DSN
if (typeof dsn === 'string' && dsn) {
  import('@sentry/react').then((Sentry) => {
    Sentry.init({
      dsn,
      environment: import.meta.env.MODE,
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 0.2,
      replaysSessionSampleRate: 0.1,
    })
    window.__reportWebVital = (metric) => {
      Sentry.metrics?.increment(metric.name, metric.value, { id: metric.id })
    }
    window.__reportError = (msg, err) => {
      Sentry.captureException(err ?? new Error(msg))
    }
  })
}
```

4. 在 [Sentry 控制台](https://sentry.io) 查看「Issues」（错误）与「Performance」（若启用了 `browserTracingIntegration`）中的实际数据。

---

## 3. 统计页与大列表性能

- **当前**：统计页与列表使用现有 React 状态与 IndexedDB；数据量较大时建议：
  - 统计计算：按需分页或按时间范围聚合，避免一次性加载全部原始记录。
  - 列表：对超长列表使用虚拟滚动（如 `react-window`）或分页，以保持可接受的响应时间。
- **验证**：在本地或预发环境构造较大数据集（如数千条账目），打开统计页与列表页，观察首屏与交互是否在可接受范围内；结合 Web Vitals 与控制台/监控面板数据评估。

---

## 4. 在监控面板中看到实际数据

| 方式 | 说明 |
|------|------|
| **浏览器控制台** | 开发环境下 LCP/FCP/FID/CLS/INP 会以 `[Web Vitals]` 输出；错误以 `[GreenPrj Error]` 输出。 |
| **Sentry** | 配置 DSN 并初始化后，在 Sentry 项目的 Issues 与 Performance 中查看错误与性能指标。 |
| **自建** | 实现 `window.__reportWebVital` 与 `window.__reportError`，将数据发往自有日志/监控服务，在自建面板中查看。 |

完成上述任一种方式配置后，即可在对应监控面板中看到实际错误与性能数据。
