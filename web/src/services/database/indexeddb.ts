import { openDB, DBSchema, IDBPDatabase } from 'idb'

/**
 * Database Schema Definition
 * Defines the structure of IndexedDB database
 */
export interface GreenPrjDBSchema extends DBSchema {
  settings: {
    key: string
    value: string
  }
  accounts: {
    key: string
    value: {
      id: string
      // Encrypted entry or plain entry
      encrypted?: string
      salt?: string
      iv?: string
      // Plain entry fields (for unencrypted or decrypted display)
      amount?: number
      date?: string // ISO 8601 format
      category?: string
      notes?: string
      createdAt: string
      updatedAt: string
    }
    indexes: { 'by-date': string; 'by-category': string }
  }
  categories: {
    key: string
    value: {
      id: string
      name: string
      icon?: string
      color?: string
      createdAt: string
    }
    indexes: { 'by-name': string }
  }
  budgets: {
    key: string
    value: {
      id: string
      encrypted?: string
      salt?: string
      iv?: string
      type?: 'monthly' | 'yearly'
      amount?: number
      year?: number
      month?: number
      createdAt: string
      updatedAt: string
    }
    indexes: { 'by-type': string; 'by-year': number; 'by-year-month': string }
  }
  operationLogs: {
    key: string
    value: {
      id: string
      operation: string
      type: string
      content: string
      result: 'success' | 'failure'
      timestamp: string
    }
    indexes: { 'by-timestamp': string; 'by-operation': string }
  }
}

/**
 * Database Configuration
 */
const DB_NAME = 'greenprj_db'
const DB_VERSION = 1

/**
 * Database instance
 */
let dbInstance: IDBPDatabase<GreenPrjDBSchema> | null = null

/**
 * Initialize and open IndexedDB database
 * @returns Promise resolving to database instance
 */
export async function openDatabase(): Promise<IDBPDatabase<GreenPrjDBSchema>> {
  if (dbInstance) {
    return dbInstance
  }

  try {
    dbInstance = await openDB<GreenPrjDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`)

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }

        if (!db.objectStoreNames.contains('accounts')) {
          const accountsStore = db.createObjectStore('accounts', {
            keyPath: 'id',
          })
          accountsStore.createIndex('by-date', 'date')
          accountsStore.createIndex('by-category', 'category')
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoriesStore = db.createObjectStore('categories', {
            keyPath: 'id',
          })
          categoriesStore.createIndex('by-name', 'name')
        }

        if (!db.objectStoreNames.contains('budgets')) {
          const budgetsStore = db.createObjectStore('budgets', {
            keyPath: 'id',
          })
          budgetsStore.createIndex('by-type', 'type')
          budgetsStore.createIndex('by-year', 'year')
          budgetsStore.createIndex('by-year-month', ['year', 'month'], {
            unique: false,
          })
        }

        if (!db.objectStoreNames.contains('operationLogs')) {
          const logsStore = db.createObjectStore('operationLogs', {
            keyPath: 'id',
          })
          logsStore.createIndex('by-timestamp', 'timestamp')
          logsStore.createIndex('by-operation', 'operation')
        }
      },
    })

    console.log('Database opened successfully')
    return dbInstance
  } catch (error) {
    console.error('Failed to open database:', error)
    throw new Error(`Database initialization failed: ${error}`)
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
    console.log('Database closed')
  }
}

/**
 * Get database instance (opens if not already open)
 * @returns Promise resolving to database instance
 */
export async function getDatabase(): Promise<IDBPDatabase<GreenPrjDBSchema>> {
  if (!dbInstance) {
    return await openDatabase()
  }
  return dbInstance
}

/**
 * Database error handler
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Handle database errors consistently
 */
export function handleDatabaseError(error: unknown): DatabaseError {
  if (error instanceof DatabaseError) {
    return error
  }

  if (error instanceof Error) {
    return new DatabaseError(error.message, 'UNKNOWN_ERROR', error)
  }

  return new DatabaseError('An unknown database error occurred', 'UNKNOWN_ERROR', error)
}
