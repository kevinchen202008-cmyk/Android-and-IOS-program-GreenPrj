package com.greenprj.app.data.merge

import com.google.gson.Gson
import com.greenprj.app.data.audit.AuditRepository
import com.greenprj.app.data.local.dao.AccountEntryDao
import com.greenprj.app.data.local.dao.BudgetDao
import com.greenprj.app.data.local.dao.OperationLogDao
import com.greenprj.app.data.local.entities.AccountEntryEntity
import com.greenprj.app.data.local.entities.BudgetEntity
import com.greenprj.app.data.local.entities.OperationLogEntity
import com.greenprj.app.data.models.AccountEntryJson
import com.greenprj.app.data.models.BudgetJson
import com.greenprj.app.data.models.CategoryJson
import com.greenprj.app.data.models.ExportDataJson
import com.greenprj.app.data.models.ExportFormatJson
import com.greenprj.app.data.models.OperationLogJson
import com.greenprj.app.utils.IdGenerator
import kotlinx.coroutines.flow.first
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.inject.Inject
import javax.inject.Singleton

private val ISO_DATE_TIME = DateTimeFormatter.ISO_LOCAL_DATE_TIME
private const val EXPORT_VERSION = "1.0.0"

/**
 * 账本合并：导出/导入 JSON，与 Web 端 ExportFormatSchema 对齐
 */
@Singleton
class MergeRepository @Inject constructor(
    private val accountEntryDao: AccountEntryDao,
    private val budgetDao: BudgetDao,
    private val operationLogDao: OperationLogDao,
    private val gson: Gson,
    private val auditRepository: AuditRepository
) {

    /**
     * 导出为 JSON 字符串（可写入文件）
     */
    suspend fun exportToJson(): String {
        val entries = accountEntryDao.getAllEntries().first()
        val budgets = budgetDao.getAllBudgets().first()
        val logs = operationLogDao.getAllLogs().first()

        val accounts = entries.map { toAccountEntryJson(it) }
        val categories = defaultCategoriesJson()
        val budgetsJson = budgets.map { toBudgetJson(it) }
        val operationLogsJson = logs.map { toOperationLogJson(it) }

        val export = ExportFormatJson(
            version = EXPORT_VERSION,
            exportedAt = LocalDateTime.now().format(ISO_DATE_TIME),
            data = ExportDataJson(
                accounts = accounts,
                categories = categories,
                budgets = budgetsJson,
                operationLogs = operationLogsJson
            )
        )
        val json = gson.toJson(export)
        auditRepository.logSuccess("导出数据", "EXPORT_DATA", "导出账本数据: ${accounts.size}条账目, ${budgetsJson.size}条预算")
        return json
    }

    /**
     * 从 JSON 导入：校验、去重（同日期+同金额+同类别视为重复）、插入
     */
    suspend fun importFromJson(json: String): MergeResult {
        var imported = 0
        var duplicates = 0
        val errors = mutableListOf<String>()

        val export = runCatching {
            gson.fromJson(json, ExportFormatJson::class.java)
        }.getOrElse {
            errors.add("JSON 格式错误: ${it.message}")
            return MergeResult(imported, duplicates, errors)
        }

        if (export.version.isNullOrEmpty()) {
            errors.add("导出文件缺少版本信息")
            return MergeResult(imported, duplicates, errors)
        }
        if (export.data == null) {
            errors.add("导出文件缺少数据内容")
            return MergeResult(imported, duplicates, errors)
        }

        val data = export.data!!
        val accounts = data.accounts ?: emptyList()
        val budgets = data.budgets ?: emptyList()

        val existingEntries = accountEntryDao.getAllEntries().first()
        val existingByKey = existingEntries.associateByTo(mutableMapOf()) { "${it.date}_${it.amount}_${it.category}" }

        for (entry in accounts) {
            val dateStr = entry.date ?: ""
            val amount = entry.amount
            val category = entry.category ?: ""
            if (dateStr.isEmpty() || category.isEmpty()) {
                duplicates += 1
                continue
            }
            val key = "${dateStr}_${amount}_${category}"
            if (existingByKey.containsKey(key)) {
                duplicates += 1
                continue
            }
            runCatching {
                val date = LocalDateTime.parse(dateStr)
                val now = LocalDateTime.now()
                val entity = AccountEntryEntity(
                    id = IdGenerator.generateId(),
                    amount = amount,
                    date = date,
                    category = category,
                    notes = entry.notes,
                    createdAt = entry.createdAt?.let { LocalDateTime.parse(it) } ?: now,
                    updatedAt = entry.updatedAt?.let { LocalDateTime.parse(it) } ?: now
                )
                accountEntryDao.insertEntry(entity)
                existingByKey[key] = entity
            }.onSuccess { imported += 1 }
                .onFailure { errors.add("导入账目失败: ${it.message}") }
        }

        for (budget in budgets) {
            val type = budget.type ?: ""
            val year = budget.year ?: continue
            val amount = budget.amount
            if (type.isEmpty()) continue
            runCatching {
                val now = LocalDateTime.now()
                val entity = BudgetEntity(
                    id = IdGenerator.generateId(),
                    type = type,
                    amount = amount,
                    year = year,
                    month = budget.month,
                    createdAt = budget.createdAt?.let { LocalDateTime.parse(it) } ?: now,
                    updatedAt = budget.updatedAt?.let { LocalDateTime.parse(it) } ?: now
                )
                budgetDao.insertBudget(entity)
            }.onFailure { errors.add("导入预算失败: ${it.message}") }
        }

        if (errors.isEmpty()) {
            auditRepository.logSuccess("导入数据", "IMPORT_DATA", "导入账本数据: ${imported}条账目, ${duplicates}条重复")
        } else {
            auditRepository.logFailure("导入数据", "IMPORT_DATA", "导入账本数据部分失败", errors.joinToString("；"))
        }
        return MergeResult(imported, duplicates, errors)
    }

    /**
     * 删除所有账目与预算（不删除密码/会话）。与 Web deleteAllData 对齐。
     */
    suspend fun deleteAllData(): DeleteAllResult {
        val entriesCount = accountEntryDao.getAllEntries().first().size
        val budgetsCount = budgetDao.getAllBudgets().first().size
        accountEntryDao.deleteAllEntries()
        budgetDao.deleteAllBudgets()
        auditRepository.logSuccess("删除所有数据", "DELETE_ALL_DATA", "删除所有数据: ${entriesCount}条账目, ${budgetsCount}条预算")
        return DeleteAllResult(entriesDeleted = entriesCount, budgetsDeleted = budgetsCount)
    }

    private fun toAccountEntryJson(e: AccountEntryEntity): AccountEntryJson = AccountEntryJson(
        id = e.id,
        amount = e.amount,
        date = e.date.format(ISO_DATE_TIME),
        category = e.category,
        notes = e.notes,
        createdAt = e.createdAt.format(ISO_DATE_TIME),
        updatedAt = e.updatedAt.format(ISO_DATE_TIME)
    )

    private fun toBudgetJson(b: BudgetEntity): BudgetJson = BudgetJson(
        id = b.id,
        type = b.type,
        amount = b.amount,
        year = b.year,
        month = b.month,
        createdAt = b.createdAt.format(ISO_DATE_TIME),
        updatedAt = b.updatedAt.format(ISO_DATE_TIME)
    )

    private fun toOperationLogJson(l: OperationLogEntity): OperationLogJson = OperationLogJson(
        id = l.id,
        operation = l.operation,
        type = l.type,
        content = l.content,
        result = l.result,
        timestamp = l.timestamp.toString()
    )

    private fun defaultCategoriesJson(): List<CategoryJson> = listOf(
        CategoryJson("food", "餐饮", null, null, LocalDateTime.now().format(ISO_DATE_TIME)),
        CategoryJson("transport", "交通", null, null, LocalDateTime.now().format(ISO_DATE_TIME)),
        CategoryJson("shopping", "购物", null, null, LocalDateTime.now().format(ISO_DATE_TIME)),
        CategoryJson("other", "其他", null, null, LocalDateTime.now().format(ISO_DATE_TIME))
    )
}

