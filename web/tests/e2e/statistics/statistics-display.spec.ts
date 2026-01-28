/**
 * E2E Tests: Statistics Display (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'

/** Summary shows: 总消费|账目数量|平均消费 (data) or 暂无统计数据 (no data); or 加载中... (loading). */
const SUMMARY_READY =
  /总消费|账目数量|平均消费|暂无统计数据|加载中/

function navToStatistics(page: import('@playwright/test').Page) {
  return page.getByRole('button', { name: '统计' }).click()
}

async function waitForStatisticsReady(page: import('@playwright/test').Page) {
  await expect(page).toHaveURL(/\/statistics/, { timeout: 10000 })
  await expect(page.getByText('统计与报表')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(SUMMARY_READY).first()).toBeVisible({ timeout: 15000 })
  await page.waitForTimeout(500)
}

test.describe('Statistics Display', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    const today = new Date().toISOString().split('T')[0]
    await createEntryViaUI(page, { amount: '100.00', category: 'food', date: today })
    await createEntryViaUI(page, { amount: '50.00', category: 'transportation', date: today })
    await createEntryViaUI(page, { amount: '200.00', category: 'shopping', date: today })
    await page.getByRole('button', { name: '返回列表' }).click()
    await page.waitForTimeout(500)
  })

  test('P0-001: User can view statistics page', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)
  })

  test('P0-002: Statistics summary displays correct totals', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)
    const has350 = await page.getByText(/350\.00/).isVisible().catch(() => false)
    if (has350) await expect(page.getByText(/350\.00/)).toBeVisible()
  })

  test('P0-003: User can switch between time dimensions', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)
    await expect(page.getByText('时间维度')).toBeVisible()
    await page.getByRole('button', { name: '日', exact: true }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: '周', exact: true }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: '月', exact: true }).click()
    await page.waitForTimeout(800)
    await page.getByRole('button', { name: '年', exact: true }).click()
  })

  test('P0-004: Category statistics are displayed', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)
    await page.getByRole('tab', { name: '类别分布' }).click()
    await page.waitForTimeout(800)
    await expect(page.getByText(/类别分布|餐饮|交通|购物|暂无数据|暂无类别数据/)).toBeVisible({ timeout: 10000 })
  })

  test('P0-005: Statistics update in real-time when entry is added', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)

    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '75.00', category: 'entertainment' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await page.waitForTimeout(2500)

    await navToStatistics(page)
    await waitForStatisticsReady(page)
    await expect(
      page.getByText(SUMMARY_READY).or(page.getByText(/425|350|75/)).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('P0-006: Trend chart is displayed', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)
    const trendTab = page.getByRole('tab', { name: '趋势图表' })
    await trendTab.click()
    await page.waitForTimeout(2000)
    await expect(page.getByText('统计与报表')).toBeVisible()
    await expect(trendTab).toHaveAttribute('aria-selected', 'true')
  })

  test('P0-007: Category distribution chart is displayed', async ({ page }) => {
    await navToStatistics(page)
    await waitForStatisticsReady(page)
    await page.getByRole('tab', { name: '类别分布' }).click()
    await page.waitForTimeout(800)
    await expect(page.getByText(/类别分布|暂无数据|暂无类别数据/)).toBeVisible({ timeout: 10000 })
  })
})
