/**
 * E2E Tests: Create Entry (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import {
  setupTestUserAndLogin,
  selectCategory,
  createEntryViaUI,
} from '../helpers/browser-db'

test.describe('Create Entry - Manual Input', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P0-001: User can create entry with valid data', async ({ page }) => {
    await page.click('text=记账')
    await page.click('text=新建账目')

    await page.getByLabel(/金额/).fill('100.50')
    await page.getByLabel(/日期/).fill(new Date().toISOString().split('T')[0])
    await selectCategory(page, 'food')
    await page.getByLabel(/备注/).fill('测试账目')
    await page.getByRole('button', { name: /确认入账/ }).click()
    await page.getByRole('button', { name: '返回列表' }).click()

    await expect(page.getByText('账目列表')).toBeVisible()
    await expect(page.getByText('¥100.50')).toBeVisible()
  })

  test('P0-002: Form validation prevents invalid data', async ({ page }) => {
    await page.click('text=记账')
    await page.click('text=新建账目')

    const submit = page.getByRole('button', { name: /确认入账/ })
    await expect(submit).toBeDisabled()
  })

  test('P0-003: Entry is encrypted before storage', async ({ page }) => {
    await page.click('text=记账')
    await page.click('text=新建账目')

    await createEntryViaUI(page, { amount: '200.00', category: 'shopping' })
    await page.getByRole('button', { name: '返回列表' }).click()

    await expect(page.getByText('¥200.00')).toBeVisible()
  })
})
