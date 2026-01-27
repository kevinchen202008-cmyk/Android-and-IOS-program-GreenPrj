package com.greenprj.app.data.models

import com.google.gson.annotations.SerializedName
import java.time.LocalDateTime
import java.time.Instant

/**
 * JSON Schema Models for Cross-Platform Data Exchange
 * All field names use camelCase for consistency with Web platform
 */

/**
 * Account Entry JSON Model
 */
data class AccountEntryJson(
    @SerializedName("id")
    val id: String,
    @SerializedName("amount")
    val amount: Double,
    @SerializedName("date")
    val date: String, // ISO 8601 format
    @SerializedName("category")
    val category: String,
    @SerializedName("notes")
    val notes: String? = null,
    @SerializedName("createdAt")
    val createdAt: String, // ISO 8601 format
    @SerializedName("updatedAt")
    val updatedAt: String // ISO 8601 format
)

/**
 * Category JSON Model
 */
data class CategoryJson(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("icon")
    val icon: String? = null,
    @SerializedName("color")
    val color: String? = null,
    @SerializedName("createdAt")
    val createdAt: String // ISO 8601 format
)

/**
 * Budget JSON Model
 */
data class BudgetJson(
    @SerializedName("id")
    val id: String,
    @SerializedName("type")
    val type: String, // "monthly" or "yearly"
    @SerializedName("amount")
    val amount: Double,
    @SerializedName("year")
    val year: Int,
    @SerializedName("month")
    val month: Int? = null, // Required for monthly, null for yearly
    @SerializedName("createdAt")
    val createdAt: String, // ISO 8601 format
    @SerializedName("updatedAt")
    val updatedAt: String // ISO 8601 format
)

/**
 * Operation Log JSON Model
 */
data class OperationLogJson(
    @SerializedName("id")
    val id: String,
    @SerializedName("operation")
    val operation: String,
    @SerializedName("type")
    val type: String,
    @SerializedName("content")
    val content: String,
    @SerializedName("result")
    val result: String, // "success" or "failure"
    @SerializedName("timestamp")
    val timestamp: String // ISO 8601 format
)

/**
 * Export Format JSON Model
 */
data class ExportFormatJson(
    @SerializedName("version")
    val version: String,
    @SerializedName("exportedAt")
    val exportedAt: String, // ISO 8601 format
    @SerializedName("data")
    val data: ExportDataJson
)

/**
 * Export Data JSON Model
 */
data class ExportDataJson(
    @SerializedName("accounts")
    val accounts: List<AccountEntryJson>,
    @SerializedName("categories")
    val categories: List<CategoryJson>,
    @SerializedName("budgets")
    val budgets: List<BudgetJson>,
    @SerializedName("operationLogs")
    val operationLogs: List<OperationLogJson>
)
