/**
 * E2E Tests: Offline Support (P2 - Medium Priority)
 * Epic 9: 设备权限与离线支持
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'

test.describe('Offline Support', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P2-001: App shows home when navigating offline (SPA)', async ({ page, context }) => {
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await context.setOffline(true)
    await page.getByRole('button', { name: '记账' }).click()
    await page.waitForTimeout(600)
    await page.getByText('GreenPrj').first().click()
    await page.waitForTimeout(600)
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible({ timeout: 10000 })
  })

  test('P2-002: Accounting list is accessible when offline', async ({ page, context }) => {
    await page.getByRole('button', { name: '记账' }).click()
    await page.waitForLoadState('networkidle')
    await context.setOffline(true)
    await page.getByRole('button', { name: '统计' }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: '记账' }).click()
    await expect(page.getByText('账目列表')).toBeVisible({ timeout: 8000 })
  })

  test('P2-003: User can create entry when offline', async ({ page, context }) => {
    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await page.waitForURL(/\/accounting\/create/)
    await context.setOffline(true)
    await createEntryViaUI(page, { amount: '66.00', category: 'other' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await expect(page.getByText(/66\.00|¥66/)).toBeVisible({ timeout: 8000 })
  })

  test('P2-004: Statistics page loads when offline', async ({ page, context }) => {
    await page.getByRole('button', { name: '统计' }).click()
    await page.waitForLoadState('networkidle')
    await context.setOffline(true)
    await page.getByRole('button', { name: '预算' }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: '统计' }).click()
    await expect(page.getByText('统计与报表')).toBeVisible({ timeout: 8000 })
  })

  test('P2-005: Budget page loads when offline', async ({ page, context }) => {
    await page.getByRole('button', { name: '预算' }).click()
    await page.waitForLoadState('networkidle')
    await context.setOffline(true)
    await page.getByRole('button', { name: '数据' }).click()
    await page.waitForTimeout(400)
    await page.getByRole('button', { name: '预算' }).click()
    await expect(page.getByText('预算管理')).toBeVisible({ timeout: 8000 })
  })
})
