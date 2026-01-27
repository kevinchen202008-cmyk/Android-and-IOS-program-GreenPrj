/**
 * E2E Browser Helpers
 * Run in browser context (page) - no Node/IndexedDB in test runner.
 */

import { expect } from '@playwright/test'
import type { Page } from '@playwright/test'

const DB_NAME = 'greenprj_db'
const STORES = ['accounts', 'categories', 'budgets', 'operationLogs', 'settings']
export const TEST_PASSWORD = 'TestPassword123!'

/**
 * Clear IndexedDB in browser. Call after page.goto() so app has created DB.
 */
export async function clearAppDatabase(page: Page): Promise<void> {
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
}

/**
 * Set up test user (set password or login) and ensure we're on home.
 * Clears DB first, so we always see set-password then login.
 */
export async function setupTestUserAndLogin(page: Page, baseURL = '/'): Promise<void> {
  await page.goto(baseURL)
  await page.waitForLoadState('networkidle')

  await clearAppDatabase(page)
  await page.reload()
  await page.waitForLoadState('networkidle')

  // Wait for page to be ready
  await page.waitForTimeout(1000)

  const setPasswordHeading = page.getByRole('heading', { name: '设置密码' })
  const loginHeading = page.getByRole('heading', { name: '登录' })

  // Check which form is visible with timeout
  const isSetPassword = await setPasswordHeading.isVisible({ timeout: 5000 }).catch(() => false)
  const isLogin = await loginHeading.isVisible({ timeout: 5000 }).catch(() => false)

  if (isSetPassword) {
    // MUI TextField with type="password" - use getByLabel or getByPlaceholder
    // Wait for form to be ready
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    
    // Get password inputs by label (MUI TextField exposes label via aria-label or label element)
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.first().fill(TEST_PASSWORD)
    await passwordInputs.nth(1).fill(TEST_PASSWORD)
    
    // Wait for button to be enabled
    const submitButton = page.getByRole('button', { name: '设置密码' })
    await submitButton.waitFor({ state: 'visible', timeout: 5000 })
    await submitButton.click()
    await page.waitForURL(/\//, { timeout: 10000 })
  } else if (isLogin) {
    await page.waitForSelector('input[type="password"]', { timeout: 10000 })
    await page.locator('input[type="password"]').first().fill(TEST_PASSWORD)
    await page.getByRole('button', { name: '登录' }).click()
    await page.waitForURL(/\//, { timeout: 10000 })
  }
  // 等待应用进入稳定状态即可，具体页面由各个用例自行断言
  await page.waitForLoadState('networkidle')
}

const CATEGORY_LABELS: Record<string, string> = {
  food: '餐饮',
  transportation: '交通',
  shopping: '购物',
  entertainment: '娱乐',
  housing: '住房',
  healthcare: '医疗',
  education: '教育',
  other: '其他',
}

/**
 * Select category in MUI Select (CreateEntryForm). Use label "类别".
 */
export async function selectCategory(page: Page, categoryValue: string): Promise<void> {
  const label = CATEGORY_LABELS[categoryValue] ?? categoryValue
  // MUI Select renders as combobox
  const categorySelect = page.getByRole('combobox', { name: /类别/ })
  await categorySelect.waitFor({ state: 'visible', timeout: 10000 })
  await categorySelect.click()
  // Wait for menu to open
  await page.waitForTimeout(300)
  await page.getByRole('option', { name: label }).click()
}

/**
 * Select category filter in EntryList (label "类别筛选").
 */
export async function selectCategoryFilter(page: Page, categoryValue: string): Promise<void> {
  const label = CATEGORY_LABELS[categoryValue] ?? categoryValue
  // MUI Select renders as combobox
  const filterSelect = page.getByRole('combobox', { name: /类别筛选/ })
  await filterSelect.waitFor({ state: 'visible', timeout: 10000 })
  await filterSelect.click()
  await page.waitForTimeout(300)
  await page.getByRole('option', { name: label }).click()
}

/**
 * Create one entry via UI (create form).
 */
export interface CreateEntryUIOptions {
  amount?: string
  date?: string
  category?: string
  notes?: string
}

export async function createEntryViaUI(
  page: Page,
  opts: CreateEntryUIOptions = {}
): Promise<void> {
  const amount = opts.amount ?? '100.00'
  const date = opts.date ?? new Date().toISOString().split('T')[0]
  const category = opts.category ?? 'food'

  await page.getByLabel(/金额/).fill(amount)
  await page.getByLabel(/日期/).fill(date)
  await selectCategory(page, category)
  if (opts.notes) await page.getByLabel(/备注/).fill(opts.notes)
  const submitButton = page.getByRole('button', { name: /确认入账/ })
  await expect(submitButton).toBeEnabled({ timeout: 5000 })
  await submitButton.click()
}

/**
 * Create multiple entries via UI. Expects to be on /accounting list.
 * Opens create form once, then submits `count` times (form stays on create after submit).
 */
export async function createEntriesViaUI(
  page: Page,
  count: number,
  opts: CreateEntryUIOptions = {}
): Promise<void> {
  await page.getByRole('button', { name: '新建账目' }).click()
  await page.waitForURL(/\/accounting\/create/)
  for (let i = 0; i < count; i++) {
    await createEntryViaUI(page, opts)
  }
}
