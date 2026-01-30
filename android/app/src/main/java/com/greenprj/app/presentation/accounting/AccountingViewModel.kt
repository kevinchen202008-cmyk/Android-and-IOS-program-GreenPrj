package com.greenprj.app.presentation.accounting

import androidx.lifecycle.ViewModel
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.data.local.repositories.AccountEntryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.map
import java.time.LocalDateTime
import javax.inject.Inject

/**
 * 筛选条件：类别为空表示“全部”；关键词匹配备注、金额、类别。
 */
data class FilterState(
    val category: String? = null,
    val query: String? = null
)

/**
 * 记账界面 ViewModel：提供账目列表流（含筛选）、创建/编辑/删除能力。
 */
@HiltViewModel
class AccountingViewModel @Inject constructor(
    private val accountEntryRepository: AccountEntryRepository
) : ViewModel() {

    private val filterState = MutableStateFlow(FilterState())
    val currentFilter: StateFlow<FilterState> = filterState

    /** 全部账目（未筛选） */
    private val entries: Flow<List<AccountEntryEntity>> = accountEntryRepository.getAllEntries()

    /** 根据当前筛选条件过滤后的账目列表 */
    val filteredEntries: Flow<List<AccountEntryEntity>> = combine(
        entries,
        filterState
    ) { list, filter ->
        list.filter { entry ->
            val matchCategory = filter.category == null || entry.category == filter.category
            val matchQuery = filter.query.isNullOrBlank() || run {
                val q = filter.query!!.trim().lowercase()
                entry.notes?.lowercase()?.contains(q) == true ||
                    entry.amount.toString().contains(q) ||
                    entry.category.lowercase().contains(q)
            }
            matchCategory && matchQuery
        }
    }

    fun setFilter(category: String?, query: String?) {
        filterState.value = FilterState(
            category = category?.takeIf { it.isNotBlank() },
            query = query?.trim()?.takeIf { it.isNotBlank() }
        )
    }

    fun clearFilter() {
        filterState.value = FilterState()
    }

    suspend fun getEntryById(id: String): AccountEntryEntity? =
        accountEntryRepository.getEntryById(id)

    suspend fun createEntry(
        amount: Double,
        date: LocalDateTime,
        category: String,
        notes: String?
    ) {
        accountEntryRepository.createEntry(amount, date, category, notes)
    }

    suspend fun updateEntry(
        id: String,
        amount: Double,
        date: LocalDateTime,
        category: String,
        notes: String?
    ) {
        accountEntryRepository.updateEntry(id, amount, date, category, notes)
    }

    suspend fun deleteEntryById(id: String) {
        accountEntryRepository.deleteEntryById(id)
    }

    /** 供 UI 判断是否有筛选生效 */
    fun hasActiveFilter(): Boolean {
        val f = filterState.value
        return f.category != null || !f.query.isNullOrBlank()
    }
}
