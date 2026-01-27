package com.greenprj.app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.LocalDateTime

/**
 * Account Entry Entity
 * Represents a single account entry (transaction) in the database
 */
@Entity(
    tableName = "accounts",
    indices = [
        Index(value = ["date"]),
        Index(value = ["category"])
    ]
)
data class AccountEntryEntity(
    @PrimaryKey
    val id: String,
    val amount: Double,
    val date: LocalDateTime,
    val category: String,
    val notes: String? = null,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
