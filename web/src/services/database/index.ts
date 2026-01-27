/**
 * Database Service
 * Provides IndexedDB database access and operations
 */

export {
  openDatabase,
  closeDatabase,
  getDatabase,
  DatabaseError,
  handleDatabaseError,
  type GreenPrjDBSchema,
} from './indexeddb'
