package com.greenprj.app.presentation.budget

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.greenprj.app.data.local.repositories.BudgetRepository
import com.greenprj.app.data.local.repositories.BudgetStatus
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

@HiltViewModel
class BudgetViewModel @Inject constructor(
    private val budgetRepository: BudgetRepository
) : ViewModel() {

    private val currentYear: Int get() = LocalDate.now().year
    private val currentMonth: Int get() = LocalDate.now().monthValue

    private val _monthlyStatus = MutableStateFlow<BudgetStatus?>(null)
    val monthlyStatus: StateFlow<BudgetStatus?> = _monthlyStatus.asStateFlow()

    private val _yearlyStatus = MutableStateFlow<BudgetStatus?>(null)
    val yearlyStatus: StateFlow<BudgetStatus?> = _yearlyStatus.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    init {
        refreshStatus()
    }

    fun refreshStatus() {
        viewModelScope.launch {
            _monthlyStatus.value = budgetRepository.getMonthlyBudgetStatus(currentYear, currentMonth)
            _yearlyStatus.value = budgetRepository.getYearlyBudgetStatus(currentYear)
        }
    }

    /** 设置/覆盖当月月度预算 */
    fun setMonthlyBudget(amount: Double) {
        if (amount <= 0) {
            _message.value = "预算金额须大于 0"
            return
        }
        viewModelScope.launch {
            val existing = budgetRepository.getMonthlyBudget(currentYear, currentMonth)
            if (existing != null) {
                budgetRepository.updateBudget(existing.id, amount)
                _message.value = "月度预算已更新"
            } else {
                budgetRepository.createBudget("monthly", currentYear, currentMonth, amount)
                _message.value = "月度预算已设置"
            }
            refreshStatus()
        }
    }

    /** 设置/覆盖当年年度预算 */
    fun setYearlyBudget(amount: Double) {
        if (amount <= 0) {
            _message.value = "预算金额须大于 0"
            return
        }
        viewModelScope.launch {
            val existing = budgetRepository.getYearlyBudget(currentYear)
            if (existing != null) {
                budgetRepository.updateBudget(existing.id, amount)
                _message.value = "年度预算已更新"
            } else {
                budgetRepository.createBudget("yearly", currentYear, null, amount)
                _message.value = "年度预算已设置"
            }
            refreshStatus()
        }
    }

    /** 修改已有预算金额（月度或年度） */
    fun updateBudget(id: String, amount: Double) {
        if (amount <= 0) {
            _message.value = "预算金额须大于 0"
            return
        }
        viewModelScope.launch {
            budgetRepository.updateBudget(id, amount)
            _message.value = "预算已更新"
            refreshStatus()
        }
    }

    fun deleteBudget(id: String) {
        viewModelScope.launch {
            budgetRepository.deleteBudgetById(id)
            _message.value = "预算已删除"
            refreshStatus()
        }
    }

    fun clearMessage() {
        _message.value = null
    }
}
