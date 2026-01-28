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

    await page.getByPlaceholder(/搜索金额、类别、备注/).fill('午餐')

    await expect(page.getByText('午餐').first()).toBeVisible()
  })

  test('P1-002: User can filter by category', async ({ page }) => {
    // 在浏览器 IndexedDB 中直接插入不同类别的账目数据
    await page.evaluate(async () => {
      const dbName = 'greenprj_db'
      const request = indexedDB.open(dbName)

      const db: IDBDatabase = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      const tx = db.transaction('accounts', 'readwrite')
      const store = tx.objectStore('accounts')
      const now = new Date().toISOString()

      const baseEntries = [
        { category: 'food', notes: '午餐' },
        { category: 'food', notes: '午餐' },
        { category: 'food', notes: '午餐' },
        { category: 'shopping', notes: '购物' },
        { category: 'shopping', notes: '购物' },
      ]

      for (let i = 0; i < baseEntries.length; i++) {
        const id = `test-cat-entry-${i}-${Date.now()}`
        const entry = {
          id,
          amount: 100,
          date: now,
          category: baseEntries[i].category,
          notes: baseEntries[i].notes,
          createdAt: now,
          updatedAt: now,
        }

        await new Promise<void>((resolve, reject) => {
          const addReq = store.add(entry)
          addReq.onsuccess = () => resolve()
          addReq.onerror = () => reject(addReq.error)
        })
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    })

    // 进入记账列表页并按类别筛选
    await page.click('text=记账')
    await selectCategoryFilter(page, 'food')

    await expect(page.getByText('餐饮').first()).toBeVisible()
  })

  test('P1-003: User can filter by date range', async ({ page }) => {
    // 在浏览器 IndexedDB 中直接插入 5 条 2026-01-15 的账目数据
    await page.evaluate(async () => {
      const dbName = 'greenprj_db'
      const request = indexedDB.open(dbName)

      const db: IDBDatabase = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
      })

      const tx = db.transaction('accounts', 'readwrite')
      const store = tx.objectStore('accounts')

      const baseEntry = {
        amount: 100.0,
        date: '2026-01-15T00:00:00.000Z',
        category: 'food',
        notes: '一月消费',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      for (let i = 0; i < 5; i++) {
        const id = `test-jan-entry-${i}-${Date.now()}`
        await new Promise<void>((resolve, reject) => {
          const addReq = store.add({ id, ...baseEntry })
          addReq.onsuccess = () => resolve()
          addReq.onerror = () => reject(addReq.error)
        })
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      })
    })

    // 进入记账列表页
    await page.click('text=记账')

    // 设置 2026-01 的日期范围
    const startDate = '2026-01-01'
    const endDate = '2026-01-31'
    await page.getByLabel(/开始日期/).fill(startDate)
    await page.getByLabel(/结束日期/).fill(endDate)

    // 期望筛选结果中能看到“一月消费”
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
