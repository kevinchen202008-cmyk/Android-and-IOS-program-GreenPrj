/**
 * 前端监控：错误上报与基础性能指标（首屏时间、关键交互耗时）。
 * - 错误：全局 uncaught error / unhandledrejection 会打日志；接入 Sentry 时见 docs/MONITORING_WEB.md。
 * - 性能：web-vitals 采集 LCP/FCP/FID/CLS/INP，开发环境控制台输出；生产环境可对接 Sentry 等。
 */

import { onCLS, onFCP, onFID, onLCP, onINP, type Metric } from 'web-vitals'

function reportWebVitals(metric: Metric) {
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric.rating ?? '', metric.id)
  }
  const w = window as unknown as { __reportWebVital?: (m: Metric) => void }
  if (typeof w.__reportWebVital === 'function') w.__reportWebVital(metric)
}

function reportError(message: string, source?: string, lineno?: number, colno?: number, error?: Error) {
  console.error('[GreenPrj Error]', message, source, lineno, colno, error)
  const w = window as unknown as { __reportError?: (msg: string, err?: Error) => void }
  if (typeof w.__reportError === 'function') w.__reportError(message, error ?? undefined)
}

export function initMonitoring() {
  onCLS(reportWebVitals)
  onFCP(reportWebVitals)
  onFID(reportWebVitals)
  onLCP(reportWebVitals)
  onINP(reportWebVitals)

  window.onerror = (msg, source, lineno, colno, error) => {
    reportError(String(msg), source, lineno, colno, error ?? undefined)
    return false
  }
  window.onunhandledrejection = (event) => {
    reportError('Unhandled rejection', undefined, undefined, undefined, event.reason)
  }
}
