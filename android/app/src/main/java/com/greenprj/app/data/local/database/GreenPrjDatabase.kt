package com.greenprj.app.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import com.greenprj.app.data.local.dao.AccountEntryDao
import com.greenprj.app.data.local.dao.BudgetDao
import com.greenprj.app.data.local.dao.CategoryDao
import com.greenprj.app.data.local.dao.OperationLogDao
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.data.local.entities.BudgetEntity
import com.greenprj.app.data.local.entities.CategoryEntity
import com.greenprj.app.data.local.entities.OperationLogEntity

/**
 * GreenPrj Database
 * Room database with versioning support
 * 
 * Version 1: Initial database schema
 * - accounts table
 * - categories table
 * - budgets table
 * - operation_logs table
 */
@Database(
    entities = [
        AccountEntryEntity::class,
        CategoryEntity::class,
        BudgetEntity::class,
        OperationLogEntity::class
    ],
    version = 1,
    exportSchema = true
)
@TypeConverters(Converters::class)
abstract class GreenPrjDatabase : RoomDatabase() {
    abstract fun accountEntryDao(): AccountEntryDao
    abstract fun categoryDao(): CategoryDao
    abstract fun budgetDao(): BudgetDao
    abstract fun operationLogDao(): OperationLogDao

    companion object {
        /**
         * Database migrations
         * Add new migrations here when database version changes
         */
        val MIGRATIONS: Array<Migration> = arrayOf(
            // Migration from version 1 to 2 would go here
            // Example:
            // Migration(1, 2) { database ->
            //     database.execSQL("ALTER TABLE accounts ADD COLUMN new_field TEXT")
            // }
        )
    }
}
