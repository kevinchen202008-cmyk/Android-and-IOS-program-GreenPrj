package com.greenprj.app.data.local.entities

import androidx.room.Entity
import androidx.room.Index
import androidx.room.PrimaryKey
import java.time.LocalDateTime

/**
 * Category Entity
 * Represents an expense category in the database
 */
@Entity(
    tableName = "categories",
    indices = [
        Index(value = ["name"], unique = true)
    ]
)
data class CategoryEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val icon: String? = null,
    val color: String? = null,
    val createdAt: LocalDateTime
)
