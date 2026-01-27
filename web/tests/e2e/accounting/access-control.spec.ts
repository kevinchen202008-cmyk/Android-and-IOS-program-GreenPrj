/**
 * E2E Tests: Access Control (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import { setupTestUserAndLogin } from '../helpers/browser-db'

test.describe('Access Control - Unauthenticated', () => {
  test('P0-004: Unauthenticated user cannot access accounting pages', async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))
    await page.goto('/accounting')
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe('Access Control - Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await setupTestUserAndLogin(page, '/')
  })

  test('P0-005: Session expiration prevents access', async ({ page }) => {
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))
    await page.goto('/accounting')
    await expect(page).toHaveURL(/\/login/)
  })

  test('P0-006: Authenticated user can access accounting pages', async ({ page }) => {
    await page.click('text=记账')

    await expect(page).toHaveURL(/\/accounting/)
    await expect(page.getByText('账目列表')).toBeVisible()
  })
})
