# Database Service

IndexedDB database service for GreenPrj Web platform.

## Features

- ✅ Database connection management
- ✅ Version control mechanism
- ✅ Schema definition (accounts, categories, budgets, operationLogs)
- ✅ Error handling
- ✅ Type-safe operations with TypeScript

## Usage

```typescript
import { openDatabase, getDatabase, closeDatabase } from '@/services/database'

// Open database
const db = await openDatabase()

// Get database instance (opens if needed)
const db = await getDatabase()

// Close database
await closeDatabase()
```

## Database Schema

### Object Stores

1. **accounts** - Account entries
   - Indexes: `by-date`, `by-category`

2. **categories** - Expense categories
   - Indexes: `by-name`

3. **budgets** - Budget settings
   - Indexes: `by-type`, `by-year`, `by-year-month`

4. **operationLogs** - Operation audit logs
   - Indexes: `by-timestamp`, `by-operation`

## Version Control

Database version is managed through the `upgrade` callback in `openDatabase()`.
When the version changes, the upgrade function will:
- Create new object stores
- Add new indexes
- Migrate data if needed

## Error Handling

All database operations should use `handleDatabaseError()` for consistent error handling:

```typescript
import { handleDatabaseError } from '@/services/database'

try {
  // database operation
} catch (error) {
  const dbError = handleDatabaseError(error)
  // handle error
}
```
