package com.greenprj.app.presentation.statistics

import androidx.lifecycle.ViewModel
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.data.local.repositories.AccountEntryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.temporal.TemporalAdjusters
import javax.inject.Inject

/**
 * 时间维度：今日、本周、本月、本年。
 */
enum class StatisticsPeriod {
    TODAY,
    WEEK,
    MONTH,
    YEAR;

    /** 当前周期对应的起止时间（含首尾当日全天） */
    fun toRange(): Pair<LocalDateTime, LocalDateTime> {
        val today = LocalDate.now()
        return when (this) {
            TODAY -> today.atStartOfDay() to today.plusDays(1).atStartOfDay().minusNanos(1)
            WEEK -> {
                val monday = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                val sunday = monday.plusDays(6)
                monday.atStartOfDay() to sunday.plusDays(1).atStartOfDay().minusNanos(1)
            }
            MONTH -> {
                val first = today.with(TemporalAdjusters.firstDayOfMonth())
                val last = today.with(TemporalAdjusters.lastDayOfMonth())
                first.atStartOfDay() to last.plusDays(1).atStartOfDay().minusNanos(1)
            }
            YEAR -> {
                val first = today.with(TemporalAdjusters.firstDayOfYear())
                val last = today.with(TemporalAdjusters.lastDayOfYear())
                first.atStartOfDay() to last.plusDays(1).atStartOfDay().minusNanos(1)
            }
        }
    }
}

/** 类别统计：类别 key、金额、占比（0–100） */
data class CategoryStat(
    val categoryKey: String,
    val amount: Double,
    val percentage: Double
)

/** 统计页 UI 状态：周期内总金额、按类别排序的占比列表 */
data class StatisticsUiState(
    val totalAmount: Double,
    val categoryBreakdown: List<CategoryStat>,
    val period: StatisticsPeriod,
    val isEmpty: Boolean
)

/**
 * 统计页 ViewModel：按时间维度与账目数据实时计算总消费与类别占比。
 */
@HiltViewModel
class StatisticsViewModel @Inject constructor(
    private val accountEntryRepository: AccountEntryRepository
) : ViewModel() {

    private val selectedPeriod = MutableStateFlow(StatisticsPeriod.MONTH)
    val currentPeriod: StateFlow<StatisticsPeriod> = selectedPeriod

    val stats: Flow<StatisticsUiState> = combine(
        accountEntryRepository.getAllEntries(),
        selectedPeriod
    ) { list, period ->
        val (start, end) = period.toRange()
        val filtered = list.filter { it.date >= start && it.date <= end }
        val total = filtered.sumOf { it.amount }
        val byCategory = filtered
            .groupBy { it.category }
            .mapValues { (_, entries) -> entries.sumOf { it.amount } }
            .toList()
            .sortedByDescending { it.second }
        val breakdown = if (total > 0) {
            byCategory.map { (key, amount) ->
                CategoryStat(key, amount, (amount / total) * 100)
            }
        } else {
            emptyList()
        }
        StatisticsUiState(
            totalAmount = total,
            categoryBreakdown = breakdown,
            period = period,
            isEmpty = filtered.isEmpty()
        )
    }

    fun setPeriod(period: StatisticsPeriod) {
        selectedPeriod.value = period
    }
}
