package com.greenprj.app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.LocalDateTime

/**
 * Budget Entity
 * Represents a budget setting (monthly or yearly) in the database
 */
@Entity(
    tableName = "budgets",
    indices = [
        Index(value = ["type"]),
        Index(value = ["year"]),
        Index(value = ["year", "month"], unique = true)
    ]
)
data class BudgetEntity(
    @PrimaryKey
    val id: String,
    val type: String, // "monthly" or "yearly"
    val amount: Double,
    val year: Int,
    val month: Int? = null, // null for yearly budget
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)
