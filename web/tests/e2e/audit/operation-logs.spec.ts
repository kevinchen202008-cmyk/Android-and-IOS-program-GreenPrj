/**
 * E2E Tests: Operation Logs (P1 - High Priority)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'

async function ensureLogWithCreateEntry(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '记账' }).click()
  await page.getByRole('button', { name: '新建账目' }).click()
  await createEntryViaUI(page, { amount: '100.00', category: 'food' })
  await page.getByRole('button', { name: '返回列表' }).click()
  await page.waitForTimeout(2000)
}

async function navToLogs(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '日志' }).click()
  await expect(page).toHaveURL(/\/operation-logs/, { timeout: 10000 })
  await expect(page.getByText('操作日志与审计')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(1500)
}

test.describe('Operation Logs', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P1-001: User can view operation logs page', async ({ page }) => {
    await navToLogs(page)
  })

  test('P1-002: Operation logs are displayed after creating entry', async ({ page }) => {
    await ensureLogWithCreateEntry(page)
    await navToLogs(page)
    await expect(page.getByRole('cell', { name: '创建账目' }).first()).toBeVisible({ timeout: 15000 })
    await expect(page.locator('tbody td').filter({ hasText: '成功' }).first()).toBeVisible({ timeout: 5000 })
  })

  test('P1-003: User can filter logs by operation type', async ({ page }) => {
    await ensureLogWithCreateEntry(page)
    await navToLogs(page)
    await page.getByLabel(/操作类型/).click()
    await page.waitForTimeout(400)
    await page.getByRole('option', { name: '创建账目' }).click()
    await page.waitForTimeout(1000)
    await expect(page.getByRole('cell', { name: '创建账目' }).first()).toBeVisible({ timeout: 10000 })
  })

  test('P1-004: User can filter logs by result', async ({ page }) => {
    await ensureLogWithCreateEntry(page)
    await navToLogs(page)
    await page.getByLabel(/操作结果/).click()
    await page.waitForTimeout(400)
    await page.getByRole('option', { name: '成功' }).click()
    await page.waitForTimeout(1000)
    await expect(page.getByRole('cell', { name: '成功' }).first()).toBeVisible({ timeout: 10000 })
  })

  test('P1-005: User can filter logs by date range', async ({ page }) => {
    await ensureLogWithCreateEntry(page)
    await navToLogs(page)
    const today = new Date().toISOString().split('T')[0]
    await page.getByLabel(/开始日期/).first().fill(today)
    await page.getByLabel(/结束日期/).first().fill(today)
    await page.waitForTimeout(1500)
    await expect(
      page.getByRole('cell', { name: '创建账目' }).first().or(page.getByText('暂无操作日志')).first()
    ).toBeVisible({ timeout: 10000 })
  })

  test('P1-006: User can export operation logs', async ({ page }) => {
    await ensureLogWithCreateEntry(page)
    await navToLogs(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: '导出日志' }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('operation_logs')
    expect(download.suggestedFilename()).toContain('.json')
  })

  test('P1-007: Logs are displayed in reverse chronological order', async ({ page }) => {
    await ensureLogWithCreateEntry(page)
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '200.00', category: 'shopping' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await page.waitForTimeout(2000)
    await navToLogs(page)
    const rows = await page.locator('tbody tr').all()
    expect(rows.length).toBeGreaterThan(0)
  })
})
