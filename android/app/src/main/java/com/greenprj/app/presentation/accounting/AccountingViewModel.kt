package com.greenprj.app.presentation.accounting

import androidx.lifecycle.ViewModel
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.data.local.repositories.AccountEntryRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
import javax.inject.Inject

/**
 * 记账界面 ViewModel：提供账目列表流与创建账目能力。
 */
@HiltViewModel
class AccountingViewModel @Inject constructor(
    private val accountEntryRepository: AccountEntryRepository
) : ViewModel() {

    val entries: Flow<List<AccountEntryEntity>> = accountEntryRepository.getAllEntries()

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
}
