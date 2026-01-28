/**
 * E2E Tests: Change Password (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin, TEST_PASSWORD } from '../helpers/browser-db'

test.describe('Change Password', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P0-001: User can navigate to change password page', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: '修改密码' }).click()
    await expect(page).toHaveURL(/\/change-password/)
    await expect(page.getByRole('heading', { name: '修改密码' })).toBeVisible()
  })

  test('P0-002: User can change password with valid current password', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: '修改密码' }).click()
    await expect(page).toHaveURL(/\/change-password/)
    await page.waitForTimeout(800)
    await page.getByLabel(/当前密码/).fill(TEST_PASSWORD)
    await page.locator('input[type="password"]').nth(1).fill('NewPassword456!')
    await page.getByLabel(/确认新密码/).fill('NewPassword456!')
    await page.waitForTimeout(300)
    const submitBtn = page.getByRole('main').getByRole('button', { name: '修改密码' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await page.waitForURL(/\/login/, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible({ timeout: 10000 })
  })

  test('P0-003: User sees error when current password is wrong', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: '修改密码' }).click()
    await expect(page).toHaveURL(/\/change-password/)
    await page.waitForTimeout(800)
    await page.getByLabel(/当前密码/).fill('WrongCurrent123!')
    await page.locator('input[type="password"]').nth(1).fill('NewPassword456!')
    await page.getByLabel(/确认新密码/).fill('NewPassword456!')
    await page.waitForTimeout(300)
    const submitBtn = page.getByRole('main').getByRole('button', { name: '修改密码' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await page.waitForTimeout(2000)
    await expect(page.getByText(/当前密码错误|密码错误/)).toBeVisible({ timeout: 15000 })
  })

  test('P0-004: User sees error when new passwords do not match', async ({ page }) => {
    await page.getByRole('banner').getByRole('button', { name: '修改密码' }).click()
    await expect(page).toHaveURL(/\/change-password/)
    await page.waitForTimeout(800)
    await page.getByLabel(/当前密码/).fill(TEST_PASSWORD)
    await page.locator('input[type="password"]').nth(1).fill('NewPassword456!')
    await page.getByLabel(/确认新密码/).fill('NewPassword789!')
    await page.waitForTimeout(300)
    const submitBtn = page.getByRole('main').getByRole('button', { name: '修改密码' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await page.waitForTimeout(2000)
    await expect(page.getByText(/不匹配|确认密码|新密码不匹配/)).toBeVisible({ timeout: 15000 })
  })
})
