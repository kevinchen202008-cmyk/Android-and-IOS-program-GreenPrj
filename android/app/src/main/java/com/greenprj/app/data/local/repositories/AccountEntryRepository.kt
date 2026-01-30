package com.greenprj.app.data.local.repositories

import com.greenprj.app.data.local.dao.AccountEntryDao
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.utils.IdGenerator
import kotlinx.coroutines.flow.Flow
import java.time.LocalDateTime
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for account entries on Android.
 *
 * 当前实现侧重于本地 Room 存储，后续可以在此处接入加解密逻辑，
 * 以符合 Epic 2 / Epic 7 中对数据加密的要求。
 */
@Singleton
class AccountEntryRepository @Inject constructor(
    private val accountEntryDao: AccountEntryDao
) {

    /**
     * 获取按照日期倒序排列的全部账目记录。
     */
    fun getAllEntries(): Flow<List<AccountEntryEntity>> = accountEntryDao.getAllEntries()

    /**
     * 根据 id 获取单条账目。
     */
    suspend fun getEntryById(id: String): AccountEntryEntity? = accountEntryDao.getEntryById(id)

    /**
     * 创建一条新的账目记录。
     *
     * 目前直接写入明文数据到本地数据库，后续可以在这里增加加密处理。
     */
    suspend fun createEntry(
        amount: Double,
        date: LocalDateTime,
        category: String,
        notes: String?
    ) {
        val now = LocalDateTime.now()
        val entity = AccountEntryEntity(
            id = IdGenerator.generateId(),
            amount = amount,
            date = date,
            category = category,
            notes = notes?.takeIf { it.isNotBlank() },
            createdAt = now,
            updatedAt = now
        )

        accountEntryDao.insertEntry(entity)
    }

    /**
     * 更新已有账目（id 不变，updatedAt 更新为当前时间）。
     */
    suspend fun updateEntry(
        id: String,
        amount: Double,
        date: LocalDateTime,
        category: String,
        notes: String?
    ) {
        val existing = accountEntryDao.getEntryById(id) ?: return
        val now = LocalDateTime.now()
        val updated = existing.copy(
            amount = amount,
            date = date,
            category = category,
            notes = notes?.takeIf { it.isNotBlank() },
            updatedAt = now
        )
        accountEntryDao.updateEntry(updated)
    }

    /**
     * 按 id 删除一条账目。
     */
    suspend fun deleteEntryById(id: String) {
        accountEntryDao.deleteEntryById(id)
    }
}

