/**
 * Budget Repository
 * Data access layer for budget operations with encryption support
 */

import { getDatabase } from '@/services/database'
import { encryptData, decryptData } from '@/services/security/encryption'
import { getEncryptionPassword } from '@/services/security/encryption-session'
import type { BudgetSchema } from '@/types/schema'
import type { CreateBudgetInput, UpdateBudgetInput } from '@/types/budget'

/**
 * 获取用于加密的会话口令（仅保存在内存中）
 */
async function getUserPassword(): Promise<string> {
  const password = getEncryptionPassword()
  if (!password) {
    throw new Error('Encryption password not available')
  }
  return password
}

/**
 * Create a new budget
 */
export async function createBudget(input: CreateBudgetInput): Promise<BudgetSchema> {
  const db = await getDatabase()
  const id = `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const now = new Date().toISOString()

  const budgetData: BudgetSchema = {
    id,
    type: input.type,
    year: input.year,
    month: input.type === 'monthly' ? input.month : undefined,
    amount: input.amount,
    createdAt: now,
    updatedAt: now,
  }

  try {
    const password = await getUserPassword()
    const encrypted = await encryptData(JSON.stringify(budgetData), password)
    const encryptedBudget = {
      id,
      encrypted: encrypted.encrypted,
      salt: encrypted.salt,
      iv: encrypted.iv,
      type: undefined,
      year: undefined,
      month: undefined,
      amount: undefined,
      createdAt: now,
      updatedAt: now,
    }
    await db.put('budgets', encryptedBudget)
    return budgetData
  } catch (error) {
    console.warn('Encryption not available, storing unencrypted:', error) // MVP fallback
    await db.put('budgets', budgetData)
    return budgetData
  }
}

/**
 * Get budget by ID
 */
export async function getBudgetById(id: string): Promise<BudgetSchema | null> {
  const db = await getDatabase()
  const budget = await db.get('budgets', id)

  if (!budget) {
    return null
  }

  // Decrypt if encrypted
  if ('encrypted' in budget && 'salt' in budget && 'iv' in budget) {
    try {
      const password = await getUserPassword()
      const decrypted = await decryptData(
        {
          encrypted: budget.encrypted as string,
          salt: budget.salt as string,
          iv: budget.iv as string,
        },
        password
      )
      return JSON.parse(decrypted) as BudgetSchema
    } catch (error) {
      console.error('Failed to decrypt budget:', error)
      return null
    }
  }

  return budget as BudgetSchema
}

/**
 * Get monthly budget for a specific year and month
 */
export async function getMonthlyBudget(year: number, month: number): Promise<BudgetSchema | null> {
  const db = await getDatabase()
  const index = db.transaction('budgets').store.index('by-year-month')

  // Get all budgets and filter/decrypt
  const allBudgets = await index.getAll()
  
  for (const budget of allBudgets) {
    let decrypted: BudgetSchema | null = null

    if ('encrypted' in budget && 'salt' in budget && 'iv' in budget) {
      try {
        const password = await getUserPassword()
        const decryptedData = await decryptData(
          {
            encrypted: budget.encrypted as string,
            salt: budget.salt as string,
            iv: budget.iv as string,
          },
          password
        )
        decrypted = JSON.parse(decryptedData) as BudgetSchema
      } catch (error) {
        console.error('Failed to decrypt budget:', error)
        continue
      }
    } else {
      decrypted = budget as BudgetSchema
    }

    if (decrypted && decrypted.type === 'monthly' && decrypted.year === year && decrypted.month === month) {
      return decrypted
    }
  }

  return null
}

/**
 * Get yearly budget for a specific year
 */
export async function getYearlyBudget(year: number): Promise<BudgetSchema | null> {
  const db = await getDatabase()
  const index = db.transaction('budgets').store.index('by-year')

  const allBudgets = await index.getAll(year)

  for (const budget of allBudgets) {
    let decrypted: BudgetSchema | null = null

    if ('encrypted' in budget && 'salt' in budget && 'iv' in budget) {
      try {
        const password = await getUserPassword()
        const decryptedData = await decryptData(
          {
            encrypted: budget.encrypted as string,
            salt: budget.salt as string,
            iv: budget.iv as string,
          },
          password
        )
        decrypted = JSON.parse(decryptedData) as BudgetSchema
      } catch (error) {
        console.error('Failed to decrypt budget:', error)
        continue
      }
    } else {
      decrypted = budget as BudgetSchema
    }

    if (decrypted && decrypted.type === 'yearly' && decrypted.year === year) {
      return decrypted
    }
  }

  return null
}

/**
 * Get all budgets
 */
export async function getAllBudgets(): Promise<BudgetSchema[]> {
  const db = await getDatabase()
  const allBudgets = await db.getAll('budgets')
  const decryptedBudgets: BudgetSchema[] = []

  for (const budget of allBudgets) {
    if ('encrypted' in budget && 'salt' in budget && 'iv' in budget) {
      try {
        const password = await getUserPassword()
        const decrypted = await decryptData(
          {
            encrypted: budget.encrypted as string,
            salt: budget.salt as string,
            iv: budget.iv as string,
          },
          password
        )
        decryptedBudgets.push(JSON.parse(decrypted) as BudgetSchema)
      } catch (error) {
        console.error('Failed to decrypt budget:', error)
        // Skip encrypted budgets that can't be decrypted
      }
    } else {
      decryptedBudgets.push(budget as BudgetSchema)
    }
  }

  return decryptedBudgets
}

/**
 * Update budget
 */
export async function updateBudget(id: string, input: UpdateBudgetInput): Promise<BudgetSchema> {
  const db = await getDatabase()
  const existing = await db.get('budgets', id)

  if (!existing) {
    throw new Error(`Budget with id ${id} not found`)
  }

  // Decrypt existing budget to get full data
  let existingBudget: BudgetSchema
  if ('encrypted' in existing && 'salt' in existing && 'iv' in existing) {
    try {
      const password = await getUserPassword()
      const decrypted = await decryptData(
        {
          encrypted: existing.encrypted as string,
          salt: existing.salt as string,
          iv: existing.iv as string,
        },
        password
      )
      existingBudget = JSON.parse(decrypted) as BudgetSchema
    } catch (error) {
      throw new Error(`Failed to decrypt budget: ${error}`)
    }
  } else {
    existingBudget = existing as BudgetSchema
  }

  // Update budget
  const updatedBudget: BudgetSchema = {
    ...existingBudget,
    amount: input.amount,
    updatedAt: new Date().toISOString(),
  }

  try {
    const password = await getUserPassword()
    const encrypted = await encryptData(JSON.stringify(updatedBudget), password)
    const encryptedBudget = {
      id,
      encrypted: encrypted.encrypted,
      salt: encrypted.salt,
      iv: encrypted.iv,
      type: undefined,
      year: undefined,
      month: undefined,
      amount: undefined,
      createdAt: existingBudget.createdAt,
      updatedAt: updatedBudget.updatedAt,
    }
    await db.put('budgets', encryptedBudget)
    return updatedBudget
  } catch (error) {
    console.warn('Encryption not available, storing unencrypted:', error) // MVP fallback
    await db.put('budgets', updatedBudget)
    return updatedBudget
  }
}

/**
 * Delete budget
 */
export async function deleteBudget(id: string): Promise<void> {
  const db = await getDatabase()
  await db.delete('budgets', id)
}
