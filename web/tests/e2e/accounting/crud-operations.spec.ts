/**
 * E2E Tests: CRUD Operations (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import {
  setupTestUserAndLogin,
  selectCategory,
  createEntryViaUI,
} from '../helpers/browser-db'

test.describe('CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P0-007: User can view entry list', async ({ page }) => {
    await page.click('text=记账')

    await expect(page.getByText('账目列表')).toBeVisible()
    await expect(page.getByRole('button', { name: '新建账目' })).toBeVisible()
  })

  test('P0-008: User can edit entry', async ({ page }) => {
    await page.click('text=记账')
    await page.click('text=新建账目')
    await createEntryViaUI(page, { amount: '100.00', category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()

    await page.getByRole('button', { name: '编辑' }).click()
    const amountInput = page.getByLabel(/金额/)
    await expect(amountInput).toBeEnabled({ timeout: 5000 })
    await amountInput.fill('200.00')
    await page.getByRole('button', { name: '保存' }).click()

    await expect(page).toHaveURL(/\/accounting\/?$/)
    await expect(page.getByText('¥200.00')).toBeVisible()
  })

  test('P0-009: User can delete entry', async ({ page }) => {
    await page.click('text=记账')
    await page.click('text=新建账目')
    await createEntryViaUI(page, { amount: '100.00', category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()

    page.once('dialog', (d) => d.accept())
    await page.getByRole('button', { name: '删除' }).click()

    await expect(page.getByText('¥100.00')).not.toBeVisible()
  })
})
