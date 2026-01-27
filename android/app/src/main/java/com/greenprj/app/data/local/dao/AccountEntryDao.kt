package com.greenprj.app.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.greenprj.app.data.local.entities.AccountEntryEntity
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime

/**
 * Data Access Object for AccountEntryEntity
 * Provides database operations for account entries
 */
@Dao
interface AccountEntryDao {
    @Query("SELECT * FROM accounts ORDER BY date DESC")
    fun getAllEntries(): Flow<List<AccountEntryEntity>>

    @Query("SELECT * FROM accounts WHERE id = :id")
    suspend fun getEntryById(id: String): AccountEntryEntity?

    @Query("SELECT * FROM accounts WHERE date BETWEEN :startDate AND :endDate ORDER BY date DESC")
    fun getEntriesByDateRange(startDate: LocalDateTime, endDate: LocalDateTime): Flow<List<AccountEntryEntity>>

    @Query("SELECT * FROM accounts WHERE category = :category ORDER BY date DESC")
    fun getEntriesByCategory(category: String): Flow<List<AccountEntryEntity>>

    @Query("SELECT * FROM accounts WHERE date = :date ORDER BY date DESC")
    fun getEntriesByDate(date: LocalDateTime): Flow<List<AccountEntryEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEntry(entry: AccountEntryEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEntries(entries: List<AccountEntryEntity>)

    @Update
    suspend fun updateEntry(entry: AccountEntryEntity)

    @Delete
    suspend fun deleteEntry(entry: AccountEntryEntity)

    @Query("DELETE FROM accounts WHERE id = :id")
    suspend fun deleteEntryById(id: String)

    @Query("DELETE FROM accounts")
    suspend fun deleteAllEntries()
}
