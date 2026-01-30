package com.greenprj.app.data.local.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.greenprj.app.data.local.entities.BudgetEntity
import kotlinx.coroutines.flow.Flow

/**
 * Data Access Object for BudgetEntity
 * Provides database operations for budgets
 */
@Dao
interface BudgetDao {
    @Query("SELECT * FROM budgets ORDER BY year DESC, month DESC")
    fun getAllBudgets(): Flow<List<BudgetEntity>>

    @Query("SELECT * FROM budgets WHERE id = :id")
    suspend fun getBudgetById(id: String): BudgetEntity?

    @Query("SELECT * FROM budgets WHERE type = :type ORDER BY year DESC, month DESC")
    fun getBudgetsByType(type: String): Flow<List<BudgetEntity>>

    @Query("SELECT * FROM budgets WHERE year = :year AND month = :month")
    suspend fun getBudgetByYearMonth(year: Int, month: Int): BudgetEntity?

    @Query("SELECT * FROM budgets WHERE year = :year AND type = 'yearly'")
    suspend fun getYearlyBudget(year: Int): BudgetEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertBudget(budget: BudgetEntity)

    @Update
    suspend fun updateBudget(budget: BudgetEntity)

    @Delete
    suspend fun deleteBudget(budget: BudgetEntity)

    @Query("DELETE FROM budgets WHERE id = :id")
    suspend fun deleteBudgetById(id: String)

    @Query("DELETE FROM budgets")
    suspend fun deleteAllBudgets()
}
