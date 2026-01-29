/**
 * E2E Tests: Offline Support (P2 - Medium Priority)
 * Epic 9: 设备权限与离线支持
 *
 * 测试假设：用户在“在线”状态下已经正常使用过相关页面，
 * 离线后依然可以在这些“已加载页面”之间来回切换和使用核心功能。
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

    // 在线导航：进入记账，再回首页，确保路由正常
    await page.getByRole('button', { name: '记账' }).click()
    await page.waitForTimeout(600)
    await page.getByText('GreenPrj').first().click()
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible()

    // 离线：在 SPA 内做一次往返导航
    await context.setOffline(true)
    await page.getByRole('button', { name: '记账' }).click()
    await page.waitForTimeout(600)
    await page.getByText('GreenPrj').first().click()

    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible({
      timeout: 10000,
    })
  })

  test('P2-002: Accounting list is accessible when offline', async ({ page, context }) => {
    // 在线：进入记账列表一次，完成页面和相关资源的加载
    await page.getByRole('button', { name: '记账' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('账目列表')).toBeVisible()

    // 在线：回首页，确认路由正常
    await page.getByText('GreenPrj').first().click()
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible()

    // 离线：从首页回到账目列表（不再首次访问新路由）
    await context.setOffline(true)
    await page.getByRole('button', { name: '记账' }).click()

    await expect(page.getByText('账目列表')).toBeVisible({ timeout: 8000 })
  })

  test('P2-003: User can create entry when offline', async ({ page, context }) => {
    // 在线：打开记账页面和新建表单，确保页面资源已加载
    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await page.waitForURL(/\/accounting\/create/)

    // 离线：在 IndexedDB 上离线创建一条记录
    await context.setOffline(true)
    await createEntryViaUI(page, { amount: '66.00', category: 'other' })

    await page.getByRole('button', { name: '返回列表' }).click()
    await expect(page.getByText(/66\.00|¥66/)).toBeVisible({ timeout: 8000 })
  })

  test('P2-004: Statistics page loads when offline', async ({ page, context }) => {
    // 在线：打开统计页一次，加载 lazy chunk
    await page.getByRole('button', { name: '统计' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('统计与报表')).toBeVisible()

    // 在线：回首页
    await page.getByText('GreenPrj').first().click()
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible()

    // 离线：从首页再跳回统计页
    await context.setOffline(true)
    await page.getByRole('button', { name: '统计' }).click()

    await expect(page.getByText('统计与报表')).toBeVisible({ timeout: 8000 })
  })

  test('P2-005: Budget page loads when offline', async ({ page, context }) => {
    // 在线：打开预算页一次，完成 lazy chunk 加载
    await page.getByRole('button', { name: '预算' }).click()
    await page.waitForLoadState('networkidle')
    await expect(page.getByText('预算管理')).toBeVisible()

    // 在线：回首页
    await page.getByText('GreenPrj').first().click()
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible()

    // 离线：从首页回到预算页
    await context.setOffline(true)
    await page.getByRole('button', { name: '预算' }).click()

    await expect(page.getByText('预算管理')).toBeVisible({ timeout: 8000 })
  })
})
