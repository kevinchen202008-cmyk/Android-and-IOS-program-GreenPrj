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

/** 趋势图数据点：标签、金额（供 BarChart 使用） */
data class TrendPoint(val label: String, val value: Float)

/** 统计页 UI 状态：周期内总金额、类别占比、趋势数据、是否为空 */
data class StatisticsUiState(
    val totalAmount: Double,
    val categoryBreakdown: List<CategoryStat>,
    val trendPoints: List<TrendPoint>,
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
        val trendPoints = buildTrendPoints(filtered, period)
        StatisticsUiState(
            totalAmount = total,
            categoryBreakdown = breakdown,
            trendPoints = trendPoints,
            period = period,
            isEmpty = filtered.isEmpty()
        )
    }

    fun setPeriod(period: StatisticsPeriod) {
        selectedPeriod.value = period
    }

    private fun buildTrendPoints(filtered: List<AccountEntryEntity>, period: StatisticsPeriod): List<TrendPoint> {
        val today = LocalDate.now()
        return when (period) {
            StatisticsPeriod.TODAY -> {
                val sum = filtered.sumOf { it.amount }.toFloat()
                listOf(TrendPoint("今日", sum))
            }
            StatisticsPeriod.WEEK -> {
                val monday = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
                val dayNames = listOf("周一", "周二", "周三", "周四", "周五", "周六", "周日")
                val byDay = filtered.groupBy { it.date.toLocalDate() }.mapValues { (_, entries) -> entries.sumOf { it.amount }.toFloat() }
                (0..6).map { i ->
                    val d = monday.plusDays(i.toLong())
                    TrendPoint(dayNames[i], byDay[d] ?: 0f)
                }
            }
            StatisticsPeriod.MONTH -> {
                val lastDay = today.with(TemporalAdjusters.lastDayOfMonth()).dayOfMonth
                val byDay = filtered.groupBy { it.date.toLocalDate().dayOfMonth }.mapValues { (_, entries) -> entries.sumOf { it.amount }.toFloat() }
                (1..lastDay).map { day ->
                    TrendPoint("${day}日", byDay[day] ?: 0f)
                }
            }
            StatisticsPeriod.YEAR -> {
                val monthNames = (1..12).map { "${it}月" }
                val byMonth = filtered.groupBy { it.date.toLocalDate().monthValue }.mapValues { (_, entries) -> entries.sumOf { it.amount }.toFloat() }
                (1..12).map { month ->
                    TrendPoint(monthNames[month - 1], byMonth[month] ?: 0f)
                }
            }
        }
    }
}
