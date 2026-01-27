# Room Database

Room database implementation for GreenPrj Android platform.

## Database Configuration

- **Database Name**: `greenprj_database`
- **Version**: 1
- **Schema Export**: Enabled (for migration support)

## Entities

### AccountEntryEntity
- Table: `accounts`
- Represents account entries (transactions)
- Indexes: `date`, `category`

### CategoryEntity
- Table: `categories`
- Represents expense categories
- Indexes: `name` (unique)

### BudgetEntity
- Table: `budgets`
- Represents budget settings (monthly/yearly)
- Indexes: `type`, `year`, `year+month` (unique)

### OperationLogEntity
- Table: `operation_logs`
- Represents operation audit logs
- Indexes: `timestamp`, `operation`

## DAOs (Data Access Objects)

- `AccountEntryDao` - Account entry operations
- `CategoryDao` - Category operations
- `BudgetDao` - Budget operations
- `OperationLogDao` - Operation log operations

## Type Converters

The `Converters` class handles conversion between:
- `LocalDateTime` ↔ String (ISO 8601)
- `Instant` ↔ Long (timestamp)

## Database Migrations

Migrations are defined in `GreenPrjDatabase.MIGRATIONS`.

To add a new migration:
1. Increment database version in `@Database` annotation
2. Add migration to `MIGRATIONS` array
3. Update schema export if needed

Example:
```kotlin
Migration(1, 2) { database ->
    database.execSQL("ALTER TABLE accounts ADD COLUMN new_field TEXT")
}
```

## Usage

Database is provided via Hilt dependency injection:

```kotlin
@Inject
lateinit var database: GreenPrjDatabase

val accountDao = database.accountEntryDao()
```

## Error Handling

All DAO operations should be wrapped in try-catch blocks and use coroutines for async operations.
