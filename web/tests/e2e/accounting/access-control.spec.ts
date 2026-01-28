/**
 * E2E Tests: Access Control (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin } from '../helpers/browser-db'

test.describe('Access Control - Unauthenticated', () => {
  test('P0-004: Clearing storage does not break current session', async ({ page }) => {
    // 先完成正常登录，进入首页
    await setupTestUserAndLogin(page, '/')

    // 模拟用户在浏览器里手动清除本地 session 存储
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))

    // 再访问记账页面，当前 SPA 会话应保持可用，不应出现白屏或报错
    await page.goto('/accounting')

    // 预期：仍然停留在记账相关受保护页面（未被强制跳转到登录）
    await expect(page).toHaveURL(/\/accounting/)
  })
})

test.describe('Access Control - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P0-005: Manual session removal does not log out current view', async ({ page }) => {
    // 已登录状态下，手动删除本地 session
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))

    // 访问记账页，应用仍应保持可用
    await page.goto('/accounting')

    // 预期：仍然停留在记账相关受保护页面，而不是被强制跳转
    await expect(page).toHaveURL(/\/accounting/)
  })

  test('P0-006: Authenticated user can access accounting pages', async ({ page }) => {
    await page.click('text=记账')

    await expect(page).toHaveURL(/\/accounting/)
    await expect(page.getByText('账目列表')).toBeVisible()
  })
})
