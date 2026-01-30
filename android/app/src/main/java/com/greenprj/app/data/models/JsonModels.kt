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
    val id: String? = null,
    @SerializedName("amount")
    val amount: Double = 0.0,
    @SerializedName("date")
    val date: String? = null,
    @SerializedName("category")
    val category: String? = null,
    @SerializedName("notes")
    val notes: String? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
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
    val id: String? = null,
    @SerializedName("type")
    val type: String? = null,
    @SerializedName("amount")
    val amount: Double = 0.0,
    @SerializedName("year")
    val year: Int? = null,
    @SerializedName("month")
    val month: Int? = null,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
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
    val version: String? = null,
    @SerializedName("exportedAt")
    val exportedAt: String? = null,
    @SerializedName("data")
    val data: ExportDataJson? = null
)

/**
 * Export Data JSON Model
 */
data class ExportDataJson(
    @SerializedName("accounts")
    val accounts: List<AccountEntryJson>? = null,
    @SerializedName("categories")
    val categories: List<CategoryJson>? = null,
    @SerializedName("budgets")
    val budgets: List<BudgetJson>? = null,
    @SerializedName("operationLogs")
    val operationLogs: List<OperationLogJson>? = null
)
