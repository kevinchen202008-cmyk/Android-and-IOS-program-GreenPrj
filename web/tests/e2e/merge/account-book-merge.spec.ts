/**
 * E2E Tests: Account Book Merge (P1 - High Priority)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'
import path from 'path'

const FIXTURES_DIR = path.resolve(process.cwd(), 'tests', 'fixtures')

async function navToMerge(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '合并' }).click()
  await expect(page).toHaveURL(/\/merge/, { timeout: 10000 })
  await expect(page.getByText('账本合并')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(800)
}

test.describe('Account Book Merge', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P1-001: User can view merge page', async ({ page }) => {
    await navToMerge(page)
    await expect(page.getByText(/导出或导入账本数据/)).toBeVisible()
  })

  test('P1-002: User can export account book as JSON', async ({ page }) => {
    await navToMerge(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出账本/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/greenprj_export_.*\.json/)
  })

  test('P1-003: Export includes entries and budgets', async ({ page }) => {
    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '99.00', category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await navToMerge(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出账本/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('P1-004: User can import account book from JSON file', async ({ page }) => {
    await navToMerge(page)
    const jsonPath = path.join(FIXTURES_DIR, 'sample-export.json')
    const fileInput = page.locator('input[type="file"][accept=".json"]')
    await fileInput.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {})
    await fileInput.setInputFiles(jsonPath)
    await page.waitForTimeout(3500)
    const importBtn = page.getByRole('button', { name: /开始导入/ })
    await expect(importBtn).toBeVisible({ timeout: 15000 })
    await importBtn.click()
    await page.waitForTimeout(3500)
    await expect(page.getByRole('heading', { name: '导入完成' })).toBeVisible({ timeout: 20000 })
  })

  test('P1-005: Import preview shows account and budget counts', async ({ page }) => {
    await navToMerge(page)
    const jsonPath = path.join(FIXTURES_DIR, 'sample-export.json')
    const fileInput = page.locator('input[type="file"][accept=".json"]')
    await fileInput.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {})
    await fileInput.setInputFiles(jsonPath)
    await page.waitForTimeout(3500)
    await expect(page.getByRole('heading', { name: '预览信息' })).toBeVisible({ timeout: 15000 })
  })

  test('P1-006: After import, entries appear in accounting list', async ({ page }) => {
    await navToMerge(page)
    const jsonPath = path.join(FIXTURES_DIR, 'sample-export.json')
    const fileInput = page.locator('input[type="file"][accept=".json"]')
    await fileInput.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {})
    await fileInput.setInputFiles(jsonPath)
    await page.waitForTimeout(3500)
    const importBtn = page.getByRole('button', { name: /开始导入/ })
    await expect(importBtn).toBeVisible({ timeout: 15000 })
    await importBtn.click()
    await page.waitForTimeout(3500)
    await expect(page.getByRole('heading', { name: '导入完成' })).toBeVisible({ timeout: 20000 })
    await page.getByRole('button', { name: '记账' }).click()
    await page.waitForTimeout(2000)
    await expect(page.getByText('账目列表')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/88\.5|88\.50|25\.00|25/).first()).toBeVisible({ timeout: 15000 })
  })
})
