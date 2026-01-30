package com.greenprj.app.utils

import com.greenprj.app.data.models.*
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException
import java.util.UUID
import java.util.regex.Pattern

/**
 * Schema Validation Utilities
 * Validates JSON data against schema definitions
 */

/**
 * Validation Exception
 */
class ValidationException(message: String, val field: String? = null, val value: Any? = null) :
    Exception(message)

/**
 * Validate UUID format
 */
private fun isValidUUID(id: String): Boolean {
    return try {
        UUID.fromString(id)
        true
    } catch (e: IllegalArgumentException) {
        false
    }
}

/**
 * Validate ISO 8601 date string
 */
private fun isValidISODate(dateString: String): Boolean {
    return try {
        LocalDateTime.parse(dateString, DateTimeFormatter.ISO_DATE_TIME)
        true
    } catch (e: DateTimeParseException) {
        try {
            java.time.Instant.parse(dateString)
            true
        } catch (e2: DateTimeParseException) {
            false
        }
    }
}

/**
 * Validate AccountEntryJson
 */
fun validateAccountEntry(data: AccountEntryJson) {
    val id = data.id ?: throw ValidationException("id is required", "id", null)
    if (!isValidUUID(id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    if (data.amount <= 0) {
        throw ValidationException("amount must be a positive number", "amount", data.amount)
    }

    val date = data.date ?: throw ValidationException("date is required", "date", null)
    if (!isValidISODate(date)) {
        throw ValidationException("date must be a valid ISO 8601 date string", "date", data.date)
    }

    val category = data.category ?: throw ValidationException("category is required", "category", null)
    if (category.isBlank()) {
        throw ValidationException("category must be a non-empty string", "category", data.category)
    }

    val createdAt = data.createdAt ?: throw ValidationException("createdAt is required", "createdAt", null)
    if (!isValidISODate(createdAt)) {
        throw ValidationException(
            "createdAt must be a valid ISO 8601 date string",
            "createdAt",
            data.createdAt
        )
    }

    val updatedAt = data.updatedAt ?: throw ValidationException("updatedAt is required", "updatedAt", null)
    if (!isValidISODate(updatedAt)) {
        throw ValidationException(
            "updatedAt must be a valid ISO 8601 date string",
            "updatedAt",
            data.updatedAt
        )
    }
}

/**
 * Validate CategoryJson
 */
fun validateCategory(data: CategoryJson) {
    val id = data.id ?: throw ValidationException("id is required", "id", null)
    if (!isValidUUID(id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    val name = data.name ?: throw ValidationException("name is required", "name", null)
    if (name.isBlank()) {
        throw ValidationException("name must be a non-empty string", "name", data.name)
    }

    val createdAt = data.createdAt ?: throw ValidationException("createdAt is required", "createdAt", null)
    if (!isValidISODate(createdAt)) {
        throw ValidationException(
            "createdAt must be a valid ISO 8601 date string",
            "createdAt",
            data.createdAt
        )
    }
}

/**
 * Validate BudgetJson
 */
fun validateBudget(data: BudgetJson) {
    val id = data.id ?: throw ValidationException("id is required", "id", null)
    if (!isValidUUID(id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    val type = data.type ?: throw ValidationException("type is required", "type", null)
    if (type != "monthly" && type != "yearly") {
        throw ValidationException("type must be 'monthly' or 'yearly'", "type", data.type)
    }

    if (data.amount <= 0) {
        throw ValidationException("amount must be a positive number", "amount", data.amount)
    }

    val year = data.year ?: throw ValidationException("year is required", "year", null)
    if (year < 2000) {
        throw ValidationException("year must be >= 2000", "year", data.year)
    }

    if (type == "monthly") {
        val month = data.month ?: throw ValidationException("month is required for monthly budget", "month", null)
        if (month < 1 || month > 12) {
            throw ValidationException("month must be between 1 and 12", "month", data.month)
        }
    } else if (type == "yearly") {
        if (data.month != null) {
            throw ValidationException("month must be null for yearly budget", "month", data.month)
        }
    }

    val createdAt = data.createdAt ?: throw ValidationException("createdAt is required", "createdAt", null)
    if (!isValidISODate(createdAt)) {
        throw ValidationException(
            "createdAt must be a valid ISO 8601 date string",
            "createdAt",
            data.createdAt
        )
    }

    val updatedAt = data.updatedAt ?: throw ValidationException("updatedAt is required", "updatedAt", null)
    if (!isValidISODate(updatedAt)) {
        throw ValidationException(
            "updatedAt must be a valid ISO 8601 date string",
            "updatedAt",
            data.updatedAt
        )
    }
}

/**
 * Validate OperationLogJson
 */
fun validateOperationLog(data: OperationLogJson) {
    val id = data.id ?: throw ValidationException("id is required", "id", null)
    if (!isValidUUID(id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    val operation = data.operation ?: throw ValidationException("operation is required", "operation", null)
    if (operation.isBlank()) {
        throw ValidationException("operation must be a non-empty string", "operation", data.operation)
    }

    val type = data.type ?: throw ValidationException("type is required", "type", null)
    if (type.isBlank()) {
        throw ValidationException("type must be a non-empty string", "type", data.type)
    }

    val result = data.result ?: throw ValidationException("result is required", "result", null)
    if (result != "success" && result != "failure") {
        throw ValidationException("result must be 'success' or 'failure'", "result", data.result)
    }

    val timestamp = data.timestamp ?: throw ValidationException("timestamp is required", "timestamp", null)
    if (!isValidISODate(timestamp)) {
        throw ValidationException(
            "timestamp must be a valid ISO 8601 date string",
            "timestamp",
            data.timestamp
        )
    }
}

/**
 * Validate ExportFormatJson
 */
fun validateExportFormat(data: ExportFormatJson) {
    val version = data.version ?: throw ValidationException("version is required", "version", null)
    if (version.isBlank()) {
        throw ValidationException("version must be a non-empty string", "version", data.version)
    }

    val exportedAt = data.exportedAt ?: throw ValidationException("exportedAt is required", "exportedAt", null)
    if (!isValidISODate(exportedAt)) {
        throw ValidationException(
            "exportedAt must be a valid ISO 8601 date string",
            "exportedAt",
            data.exportedAt
        )
    }

    val exportData = data.data ?: throw ValidationException("data is required", "data", null)

    exportData.accounts?.forEachIndexed { index, entry ->
        try {
            validateAccountEntry(entry)
        } catch (e: ValidationException) {
            throw ValidationException(
                "Invalid account entry at index $index: ${e.message}",
                "data.accounts[$index]",
                entry
            )
        }
    }

    exportData.categories?.forEachIndexed { index, category ->
        try {
            validateCategory(category)
        } catch (e: ValidationException) {
            throw ValidationException(
                "Invalid category at index $index: ${e.message}",
                "data.categories[$index]",
                category
            )
        }
    }

    exportData.budgets?.forEachIndexed { index, budget ->
        try {
            validateBudget(budget)
        } catch (e: ValidationException) {
            throw ValidationException(
                "Invalid budget at index $index: ${e.message}",
                "data.budgets[$index]",
                budget
            )
        }
    }

    exportData.operationLogs?.forEachIndexed { index, log ->
        try {
            validateOperationLog(log)
        } catch (e: ValidationException) {
            throw ValidationException(
                "Invalid operation log at index $index: ${e.message}",
                "data.operationLogs[$index]",
                log
            )
        }
    }
}
