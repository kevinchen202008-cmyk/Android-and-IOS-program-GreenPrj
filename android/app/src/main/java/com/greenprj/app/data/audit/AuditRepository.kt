package com.greenprj.app.data.audit

import com.greenprj.app.data.local.dao.OperationLogDao
import com.greenprj.app.data.local.entities.OperationLogEntity
import com.greenprj.app.utils.IdGenerator
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.temporal.ChronoUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 操作日志与审计：与 Web 端 operation-log-service 对齐
 */
@Singleton
class AuditRepository @Inject constructor(
    private val operationLogDao: OperationLogDao
) {

    private val scope = CoroutineScope(Dispatchers.IO)

    /**
     * 记录成功操作（不阻塞调用方）
     */
    fun logSuccess(operation: String, type: String, content: String) {
        scope.launch {
            runCatching {
                insertLog(operation, type, content, "success")
            }
        }
    }

    /**
     * 记录失败操作（不阻塞调用方）
     */
    fun logFailure(operation: String, type: String, content: String, error: String) {
        scope.launch {
            runCatching {
                insertLog(operation, type, "$content; 错误: $error", "failure")
            }
        }
    }

    private suspend fun insertLog(operation: String, type: String, content: String, result: String) {
        withContext(Dispatchers.IO) {
            val entity = OperationLogEntity(
                id = IdGenerator.generateId(),
                operation = operation,
                type = type,
                content = content,
                result = result,
                timestamp = Instant.now()
            )
            operationLogDao.insertLog(entity)
        }
    }

    /**
     * 获取全部日志（按时间倒序），用于列表展示
     */
    fun getLogsFlow(): Flow<List<OperationLogEntity>> = operationLogDao.getAllLogs()

    /**
     * 清理 N 天前的日志，返回删除条数
     */
    suspend fun cleanupOldLogs(daysToKeep: Int = 90): Int {
        val beforeTime = Instant.now().minus(daysToKeep.toLong(), ChronoUnit.DAYS)
        val count = operationLogDao.countLogsBefore(beforeTime)
        operationLogDao.deleteLogsBefore(beforeTime)
        return count
    }
}
