package com.greenprj.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.greenprj.app.data.local.entities.OperationLogEntity
import kotlinx.coroutines.flow.Flow
import java.time.Instant

/**
 * Data Access Object for OperationLogEntity
 * Provides database operations for operation logs
 */
@Dao
interface OperationLogDao {
    @Query("SELECT * FROM operation_logs ORDER BY timestamp DESC")
    fun getAllLogs(): Flow<List<OperationLogEntity>>

    @Query("SELECT * FROM operation_logs WHERE id = :id")
    suspend fun getLogById(id: String): OperationLogEntity?

    @Query("SELECT * FROM operation_logs WHERE timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp DESC")
    fun getLogsByTimeRange(startTime: Instant, endTime: Instant): Flow<List<OperationLogEntity>>

    @Query("SELECT * FROM operation_logs WHERE operation = :operation ORDER BY timestamp DESC")
    fun getLogsByOperation(operation: String): Flow<List<OperationLogEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertLog(log: OperationLogEntity)

    @Query("SELECT COUNT(*) FROM operation_logs WHERE timestamp < :beforeTime")
    suspend fun countLogsBefore(beforeTime: Instant): Int

    @Query("DELETE FROM operation_logs WHERE timestamp < :beforeTime")
    suspend fun deleteLogsBefore(beforeTime: Instant)

    @Query("DELETE FROM operation_logs")
    suspend fun deleteAllLogs()
}
