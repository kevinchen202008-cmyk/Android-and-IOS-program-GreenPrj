/**
 * E2E Tests: Password Setup & Login (P0 - Critical)
 */

import { test, expect } from '@playwright/test'
import { TEST_PASSWORD } from '../helpers/browser-db'

const DB_NAME = 'greenprj_db'
const STORES = ['accounts', 'categories', 'budgets', 'operationLogs', 'settings']

async function clearDb(page: import('@playwright/test').Page) {
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.evaluate(
    ({ dbName, storeNames }) => {
      return new Promise<void>((resolve, reject) => {
        const r = indexedDB.open(dbName)
        r.onsuccess = () => {
          const db = r.result
          const existing = storeNames.filter((s) => db.objectStoreNames.contains(s))
          if (existing.length === 0) {
            db.close()
            resolve()
            return
          }
          const tx = db.transaction(existing, 'readwrite')
          tx.oncomplete = () => {
            db.close()
            resolve()
          }
          tx.onerror = () => reject(tx.error)
          for (const s of existing) tx.objectStore(s).clear()
        }
        r.onerror = () => reject(r.error)
      })
    },
    { dbName: DB_NAME, storeNames: STORES }
  )
  await page.reload()
  await page.waitForLoadState('networkidle')
}

test.describe('Password Setup & Login', () => {
  test('P0-001: User sees password setup when no password is set', async ({ page }) => {
    await clearDb(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: '设置密码' })).toBeVisible()
    await expect(page.locator('input[type="password"]')).toHaveCount(2)
    await expect(page.getByRole('button', { name: '设置密码' })).toBeVisible()
  })

  test('P0-002: User can set password and is redirected after setup', async ({ page }) => {
    await clearDb(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    const inputs = page.locator('input[type="password"]')
    await inputs.first().fill(TEST_PASSWORD)
    await inputs.nth(1).fill(TEST_PASSWORD)
    const submitBtn = page.getByRole('button', { name: '设置密码' })
    await submitBtn.waitFor({ state: 'visible', timeout: 10000 })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()
    await page.waitForURL(/\//, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible({ timeout: 15000 })
  })

  test('P0-003: User sees login form when password is set', async ({ page }) => {
    await clearDb(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    const inputs = page.locator('input[type="password"]')
    await inputs.first().fill(TEST_PASSWORD)
    await inputs.nth(1).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '设置密码' }).click()
    await page.waitForURL(/\//, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.evaluate(() => localStorage.removeItem('greenprj_session'))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
  })

  test('P0-004: User can login with correct password', async ({ page }) => {
    await clearDb(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    const inputs = page.locator('input[type="password"]')
    await inputs.first().fill(TEST_PASSWORD)
    await inputs.nth(1).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '设置密码' }).click()
    await page.waitForURL(/\//, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    const loginInput = page.locator('input[type="password"]').first()
    await loginInput.waitFor({ state: 'visible', timeout: 10000 })
    await loginInput.fill(TEST_PASSWORD)
    const loginBtn = page.getByRole('button', { name: '登录' })
    await expect(loginBtn).toBeEnabled()
    await loginBtn.click()
    await page.waitForURL(/\//, { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)
    await expect(page.getByRole('heading', { name: '欢迎使用 GreenPrj' })).toBeVisible({ timeout: 15000 })
  })

  test('P0-005: User sees error on wrong password', async ({ page }) => {
    await clearDb(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    const inputs = page.locator('input[type="password"]')
    await inputs.first().fill(TEST_PASSWORD)
    await inputs.nth(1).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '设置密码' }).click()
    await page.waitForURL(/\//, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await page.locator('input[type="password"]').first().fill('WrongPassword123!')
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForTimeout(1000)

    await expect(page.getByText(/密码错误|登录失败/)).toBeVisible({ timeout: 10000 })
  })

  test('P0-006: Unauthenticated user is redirected to login when visiting protected route', async ({
    page,
  }) => {
    await clearDb(page)
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    const inputs = page.locator('input[type="password"]')
    await inputs.first().fill(TEST_PASSWORD)
    await inputs.nth(1).fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '设置密码' }).click()
    await page.waitForURL(/\//, { timeout: 10000 })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    await page.evaluate(() => localStorage.removeItem('greenprj_session'))

    await page.goto('/accounting')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    await expect(page.getByRole('heading', { name: '登录' })).toBeVisible()
  })
})
