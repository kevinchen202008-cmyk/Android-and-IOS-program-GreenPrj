package com.greenprj.app.data.local.repositories

import com.greenprj.app.data.local.dao.AccountEntryDao
import com.greenprj.app.data.local.dao.BudgetDao
import com.greenprj.app.data.local.entities.BudgetEntity
import com.greenprj.app.utils.IdGenerator
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.combine
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth

/**
 * 预算与「实际支出」汇总
 * - 月度：当月 1 日 00:00 至当月最后一日 23:59:59
 * - 年度：当年 1 月 1 日 00:00 至 12 月 31 日 23:59:59
 */
data class BudgetStatus(
    val budget: BudgetEntity,
    val actualAmount: Double,
    val remainingAmount: Double,
    val percentageUsed: Double,
    val isExceeded: Boolean,
    val isWarning: Boolean // 80% 阈值
)

class BudgetRepository(
    private val budgetDao: BudgetDao,
    private val accountEntryDao: AccountEntryDao
) {
    fun getAllBudgets(): Flow<List<BudgetEntity>> = budgetDao.getAllBudgets()

    suspend fun getBudgetById(id: String): BudgetEntity? = budgetDao.getBudgetById(id)

    suspend fun getMonthlyBudget(year: Int, month: Int): BudgetEntity? =
        budgetDao.getBudgetByYearMonth(year, month)

    suspend fun getYearlyBudget(year: Int): BudgetEntity? =
        budgetDao.getYearlyBudget(year)

    /** 当前自然月、当前自然年的起止时间 */
    private fun startOfMonth(year: Int, month: Int): LocalDateTime =
        LocalDate.of(year, month, 1).atStartOfDay()

    private fun endOfMonth(year: Int, month: Int): LocalDateTime {
        val lastDay = YearMonth.of(year, month).atEndOfMonth()
        return lastDay.atTime(23, 59, 59, 999_000_000)
    }

    private fun startOfYear(year: Int): LocalDateTime =
        LocalDate.of(year, 1, 1).atStartOfDay()

    private fun endOfYear(year: Int): LocalDateTime =
        LocalDate.of(year, 12, 31).atTime(23, 59, 59, 999_000_000)

    suspend fun getActualAmountForMonth(year: Int, month: Int): Double =
        accountEntryDao.getTotalAmountBetween(
            startOfMonth(year, month),
            endOfMonth(year, month)
        )

    suspend fun getActualAmountForYear(year: Int): Double =
        accountEntryDao.getTotalAmountBetween(
            startOfYear(year),
            endOfYear(year)
        )

    /** 月度预算状态：若无预算则返回 null */
    suspend fun getMonthlyBudgetStatus(year: Int, month: Int): BudgetStatus? {
        val budget = getMonthlyBudget(year, month) ?: return null
        val actual = getActualAmountForMonth(year, month)
        return toBudgetStatus(budget, actual)
    }

    /** 年度预算状态：若无预算则返回 null */
    suspend fun getYearlyBudgetStatus(year: Int): BudgetStatus? {
        val budget = getYearlyBudget(year) ?: return null
        val actual = getActualAmountForYear(year)
        return toBudgetStatus(budget, actual)
    }

    private fun toBudgetStatus(budget: BudgetEntity, actualAmount: Double): BudgetStatus {
        val remaining = (budget.amount - actualAmount).coerceAtLeast(0.0)
        val percentageUsed = if (budget.amount > 0) (actualAmount / budget.amount * 100) else 0.0
        val isExceeded = actualAmount >= budget.amount
        val isWarning = !isExceeded && percentageUsed >= 80.0
        return BudgetStatus(
            budget = budget,
            actualAmount = actualAmount,
            remainingAmount = remaining,
            percentageUsed = percentageUsed,
            isExceeded = isExceeded,
            isWarning = isWarning
        )
    }

    suspend fun createBudget(
        type: String,
        year: Int,
        month: Int?,
        amount: Double
    ): BudgetEntity {
        val now = LocalDateTime.now()
        val id = IdGenerator.generateId()
        val entity = BudgetEntity(
            id = id,
            type = type,
            amount = amount,
            year = year,
            month = month,
            createdAt = now,
            updatedAt = now
        )
        budgetDao.insertBudget(entity)
        return entity
    }

    suspend fun updateBudget(id: String, amount: Double) {
        val existing = budgetDao.getBudgetById(id) ?: return
        val updated = existing.copy(amount = amount, updatedAt = LocalDateTime.now())
        budgetDao.updateBudget(updated)
    }

    suspend fun deleteBudgetById(id: String) {
        budgetDao.deleteBudgetById(id)
    }
}
