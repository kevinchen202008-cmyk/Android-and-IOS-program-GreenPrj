package com.greenprj.app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.Instant

/**
 * Operation Log Entity
 * Represents an operation audit log in the database
 */
@Entity(
    tableName = "operation_logs",
    indices = [
        Index(value = ["timestamp"]),
        Index(value = ["operation"])
    ]
)
data class OperationLogEntity(
    @PrimaryKey
    val id: String,
    val operation: String,
    val type: String,
    val content: String,
    val result: String, // "success" or "failure"
    val timestamp: Instant
)
