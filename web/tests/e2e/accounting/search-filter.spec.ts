/**
 * E2E Tests: Search and Filter (P1 - High Priority)
 */

import { test, expect } from '@playwright/test'
import {
  setupTestUserAndLogin,
  createEntryViaUI,
  createEntriesViaUI,
  selectCategoryFilter,
} from '../helpers/browser-db'

test.describe('Search and Filter', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P1-001: User can search entries by keyword', async ({ page }) => {
    await page.click('text=记账')
    await createEntriesViaUI(page, 3, { notes: '午餐' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await createEntriesViaUI(page, 2, { notes: '购物' })
    await page.getByRole('button', { name: '返回列表' }).click()

    await page.getByPlaceholder(/搜索金额、类别、备注/).fill('午餐')

    await expect(page.getByText('午餐').first()).toBeVisible()
  })

  test('P1-002: User can filter by category', async ({ page }) => {
    await page.click('text=记账')
    await createEntriesViaUI(page, 3, { category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await createEntriesViaUI(page, 2, { category: 'shopping' })
    await page.getByRole('button', { name: '返回列表' }).click()

    await selectCategoryFilter(page, 'food')

    await expect(page.getByText('餐饮').first()).toBeVisible()
  })

  test('P1-003: User can filter by date range', async ({ page }) => {
    const startDate = '2026-01-01'
    const endDate = '2026-01-31'

    await page.click('text=记账')
    await createEntriesViaUI(page, 5, {
      date: '2026-01-15',
      notes: '一月消费',
    })
    await page.getByRole('button', { name: '返回列表' }).click()

    await page.getByLabel(/开始日期/).fill(startDate)
    await page.getByLabel(/结束日期/).fill(endDate)

    await expect(page.getByText('一月消费').first()).toBeVisible()
  })

  test('P1-004: User can combine multiple filters', async ({ page }) => {
    await page.click('text=记账')
    await createEntriesViaUI(page, 3, { category: 'food', notes: '午餐' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await createEntriesViaUI(page, 2, { category: 'shopping' })
    await page.getByRole('button', { name: '返回列表' }).click()

    await page.getByPlaceholder(/搜索金额、类别、备注/).fill('午餐')
    await selectCategoryFilter(page, 'food')

    await expect(page.getByText('午餐').first()).toBeVisible()
  })

  test('P1-005: User can clear filters', async ({ page }) => {
    await page.click('text=记账')
    await page.getByPlaceholder(/搜索金额、类别、备注/).fill('test')
    await selectCategoryFilter(page, 'food')
    await page.getByRole('button', { name: '清除' }).click()

    await expect(page.getByPlaceholder(/搜索金额、类别、备注/)).toHaveValue('')
  })
})
