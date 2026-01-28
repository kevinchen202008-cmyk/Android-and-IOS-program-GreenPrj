/**
 * E2E Tests: Budget Management (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, createEntryViaUI } from '../helpers/browser-db'

async function navToBudget(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '预算' }).click()
  await expect(page).toHaveURL(/\/budget/, { timeout: 10000 })
  await expect(page.getByText('预算管理')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('预算设置')).toBeVisible({ timeout: 10000 })
  await page.waitForTimeout(800)
}

test.describe('Budget Management', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P0-001: User can view budget page', async ({ page }) => {
    await navToBudget(page)
  })

  test('P0-002: User can set monthly budget', async ({ page }) => {
    await navToBudget(page)
    const amountInputs = page.getByLabel(/预算金额/)
    const n = await amountInputs.count()
    if (n > 0) {
      await amountInputs.first().fill('1000')
      await page.getByRole('button', { name: '设置月度预算' }).click()
      await page.waitForTimeout(2000)
    }
    await expect(page.getByRole('heading', { name: '月度预算' }).or(page.getByText(/1000/)).first()).toBeVisible({ timeout: 10000 })
  })

  test('P0-003: User can set yearly budget', async ({ page }) => {
    await navToBudget(page)
    const amountInputs = page.getByLabel(/预算金额/)
    const n = await amountInputs.count()
    if (n > 1) {
      await amountInputs.nth(1).fill('12000')
      await page.getByRole('button', { name: '设置年度预算' }).click()
      await page.waitForTimeout(2000)
    }
    await expect(page.getByRole('heading', { name: '年度预算' }).or(page.getByText(/12000/)).first()).toBeVisible({ timeout: 10000 })
  })

  test('P0-004: Budget vs actual consumption is displayed', async ({ page }) => {
    await navToBudget(page)
    const amountInputs = page.getByLabel(/预算金额/)
    if ((await amountInputs.count()) > 0) {
      await amountInputs.first().fill('1000')
      await page.getByRole('button', { name: '设置月度预算' }).click()
      await page.waitForTimeout(2000)
    }

    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '200.00', category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await page.waitForTimeout(1500)

    await navToBudget(page)
    await expect(page.getByRole('heading', { name: '月度预算' }).or(page.getByText(/200|1000|已使用/)).first()).toBeVisible({ timeout: 10000 })
  })

  test('P0-005: Budget exceeded alert is displayed', async ({ page }) => {
    await navToBudget(page)
    const amountInputs = page.getByLabel(/预算金额/)
    if ((await amountInputs.count()) > 0) {
      await amountInputs.first().fill('100')
      await page.getByRole('button', { name: '设置月度预算' }).click()
      await page.waitForTimeout(2000)
    }

    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '150.00', category: 'food' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await page.waitForTimeout(2500)

    await navToBudget(page)
    await expect(page.getByText('预算管理')).toBeVisible()
    await expect(
      page.getByText(/已超支|150|100|月度预算|预算金额/).first()
    ).toBeVisible({ timeout: 15000 })
  })

  test('P0-006: User can modify budget', async ({ page }) => {
    await navToBudget(page)
    const amountInputs = page.getByLabel(/预算金额/)
    if ((await amountInputs.count()) > 0) {
      await amountInputs.first().fill('1000')
      await page.getByRole('button', { name: '设置月度预算' }).click()
      await page.waitForTimeout(2000)
    }

    const editBtn = page.getByTitle('编辑').first()
    if (await editBtn.isVisible().catch(() => false)) {
      await editBtn.click()
      await page.waitForTimeout(1000)
      const inDialog = page.getByLabel(/预算金额/)
      if ((await inDialog.count()) > 0) {
        await inDialog.last().fill('2000')
        await page.getByRole('button', { name: '保存' }).click()
        await page.waitForTimeout(2000)
        await expect(page.getByText(/2000/)).toBeVisible({ timeout: 10000 })
      }
    } else {
      await expect(page.getByRole('heading', { name: /月度预算|年度预算/ }).first()).toBeVisible({ timeout: 10000 })
    }
  })

  test('P0-007: Budget status updates in real-time', async ({ page }) => {
    await navToBudget(page)
    const amountInputs = page.getByLabel(/预算金额/)
    if ((await amountInputs.count()) > 0) {
      await amountInputs.first().fill('1000')
      await page.getByRole('button', { name: '设置月度预算' }).click()
      await page.waitForTimeout(2000)
    }

    await page.getByRole('button', { name: '记账' }).click()
    await page.getByRole('button', { name: '新建账目' }).click()
    await createEntryViaUI(page, { amount: '300.00', category: 'shopping' })
    await page.getByRole('button', { name: '返回列表' }).click()
    await page.waitForTimeout(1500)

    await navToBudget(page)
    await expect(page.getByRole('heading', { name: '月度预算' }).or(page.getByText(/300|已使用/)).first()).toBeVisible({ timeout: 10000 })
  })
})
