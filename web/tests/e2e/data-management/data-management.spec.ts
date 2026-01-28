/**
 * E2E Tests: Data Management (P1 - High Priority)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'
import path from 'path'
import fs from 'fs'
import os from 'os'

const FIXTURES_DIR = path.resolve(process.cwd(), 'tests', 'fixtures')

test.describe('Data Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  async function navToData(page: import('@playwright/test').Page) {
    await page.getByRole('button', { name: '数据' }).click()
    await expect(page).toHaveURL(/\/data-management/, { timeout: 10000 })
    await expect(page.getByText('数据管理')).toBeVisible({ timeout: 10000 })
    await page.waitForTimeout(800)
  }

  test('P1-001: User can view data management page', async ({ page }) => {
    await navToData(page)
    await expect(page.getByText(/备份、恢复和管理账本数据/)).toBeVisible()
  })

  test('P1-002: User can export data as JSON', async ({ page }) => {
    await navToData(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出JSON/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/)
  })

  test('P1-003: User can export data as CSV', async ({ page }) => {
    await navToData(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出CSV/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.csv$/)
  })

  test('P1-004: User can import data from CSV file', async ({ page }) => {
    await navToData(page)
    const csvPath = path.join(FIXTURES_DIR, 'csv', 'sample-entries.csv')
    const fileInput = page.locator('input[type="file"][accept=".json,.csv"]')
    await fileInput.waitFor({ state: 'attached', timeout: 10000 }).catch(() => {})
    await fileInput.setInputFiles(csvPath)
    await page.waitForTimeout(3500)
    await expect(page.getByRole('heading', { name: '确认导入' })).toBeVisible({ timeout: 15000 })
    const confirmBtn = page.getByRole('button', { name: /确认导入/ })
    await confirmBtn.waitFor({ state: 'visible', timeout: 10000 })
    await confirmBtn.click()
    await page.waitForTimeout(3500)
    await expect(
      page.getByRole('heading', { name: 'CSV导入完成' }).or(page.getByText(/成功导入:/)).first()
    ).toBeVisible({ timeout: 20000 })
  })

  test('P1-005: User can select JSON file for import', async ({ page }) => {
    await navToData(page)
    const jsonPath = path.join(FIXTURES_DIR, 'sample-export.json')
    const fileInput = page.locator('input[type="file"][accept=".json,.csv"]')
    await fileInput.setInputFiles(jsonPath)
    await page.waitForTimeout(2500)
    await expect(
      page.getByText('数据导入').or(page.getByRole('heading', { name: '确认导入' }))
    ).toBeVisible({ timeout: 12000 })
  })

  test('P1-006: Delete all data opens confirmation dialog', async ({ page }) => {
    await navToData(page)
    const deleteBtn = page.getByRole('button', { name: /删除所有数据/ })
    await deleteBtn.waitFor({ state: 'visible', timeout: 10000 })
    await deleteBtn.click()
    await page.waitForTimeout(600)
    await expect(page.getByRole('heading', { name: '确认删除所有数据' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByLabel(/确认短语/)).toBeVisible({ timeout: 5000 })
    await page.getByRole('button', { name: '取消' }).click()
  })

  test('P1-007: User must type DELETE to confirm deletion', async ({ page }) => {
    await navToData(page)
    await page.getByRole('button', { name: /删除所有数据/ }).click()
    await expect(page.getByRole('heading', { name: '确认删除所有数据' })).toBeVisible()
    await page.getByLabel(/确认短语/).fill('invalid')
    await expect(page.getByRole('button', { name: /确认删除/ })).toBeDisabled()
    await page.getByLabel(/确认短语/).fill('DELETE')
    await expect(page.getByRole('button', { name: /确认删除/ })).toBeEnabled()
  })

  test('P1-008: Data export includes created entries', async ({ page }) => {
    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '123.45', category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await navToData(page)
    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: /导出JSON/ }).click()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toMatch(/\.json$/)
    const tmpPath = path.join(os.tmpdir(), `greenprj-export-${Date.now()}.json`)
    await download.saveAs(tmpPath)
    try {
      const content = fs.readFileSync(tmpPath, 'utf-8')
      expect(content).toContain('123.45')
    } finally {
      try {
        fs.unlinkSync(tmpPath)
      } catch {
        /* ignore */
      }
    }
  })
})
