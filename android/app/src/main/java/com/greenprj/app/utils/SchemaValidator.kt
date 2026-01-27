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
    // Validate id
    if (!isValidUUID(data.id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    // Validate amount
    if (data.amount <= 0) {
        throw ValidationException("amount must be a positive number", "amount", data.amount)
    }

    // Validate date
    if (!isValidISODate(data.date)) {
        throw ValidationException("date must be a valid ISO 8601 date string", "date", data.date)
    }

    // Validate category
    if (data.category.isBlank()) {
        throw ValidationException("category must be a non-empty string", "category", data.category)
    }

    // Validate createdAt
    if (!isValidISODate(data.createdAt)) {
        throw ValidationException(
            "createdAt must be a valid ISO 8601 date string",
            "createdAt",
            data.createdAt
        )
    }

    // Validate updatedAt
    if (!isValidISODate(data.updatedAt)) {
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
    // Validate id
    if (!isValidUUID(data.id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    // Validate name
    if (data.name.isBlank()) {
        throw ValidationException("name must be a non-empty string", "name", data.name)
    }

    // Validate createdAt
    if (!isValidISODate(data.createdAt)) {
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
    // Validate id
    if (!isValidUUID(data.id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    // Validate type
    if (data.type != "monthly" && data.type != "yearly") {
        throw ValidationException("type must be 'monthly' or 'yearly'", "type", data.type)
    }

    // Validate amount
    if (data.amount <= 0) {
        throw ValidationException("amount must be a positive number", "amount", data.amount)
    }

    // Validate year
    if (data.year < 2000) {
        throw ValidationException("year must be >= 2000", "year", data.year)
    }

    // Validate month
    if (data.type == "monthly") {
        if (data.month == null) {
            throw ValidationException("month is required for monthly budget", "month", data.month)
        }
        if (data.month < 1 || data.month > 12) {
            throw ValidationException("month must be between 1 and 12", "month", data.month)
        }
    } else if (data.type == "yearly") {
        if (data.month != null) {
            throw ValidationException("month must be null for yearly budget", "month", data.month)
        }
    }

    // Validate createdAt
    if (!isValidISODate(data.createdAt)) {
        throw ValidationException(
            "createdAt must be a valid ISO 8601 date string",
            "createdAt",
            data.createdAt
        )
    }

    // Validate updatedAt
    if (!isValidISODate(data.updatedAt)) {
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
    // Validate id
    if (!isValidUUID(data.id)) {
        throw ValidationException("id must be a valid UUID", "id", data.id)
    }

    // Validate operation
    if (data.operation.isBlank()) {
        throw ValidationException("operation must be a non-empty string", "operation", data.operation)
    }

    // Validate type
    if (data.type.isBlank()) {
        throw ValidationException("type must be a non-empty string", "type", data.type)
    }

    // Validate result
    if (data.result != "success" && data.result != "failure") {
        throw ValidationException("result must be 'success' or 'failure'", "result", data.result)
    }

    // Validate timestamp
    if (!isValidISODate(data.timestamp)) {
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
    // Validate version
    if (data.version.isBlank()) {
        throw ValidationException("version must be a non-empty string", "version", data.version)
    }

    // Validate exportedAt
    if (!isValidISODate(data.exportedAt)) {
        throw ValidationException(
            "exportedAt must be a valid ISO 8601 date string",
            "exportedAt",
            data.exportedAt
        )
    }

    // Validate accounts
    data.data.accounts.forEachIndexed { index, entry ->
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

    // Validate categories
    data.data.categories.forEachIndexed { index, category ->
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

    // Validate budgets
    data.data.budgets.forEachIndexed { index, budget ->
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

    // Validate operationLogs
    data.data.operationLogs.forEachIndexed { index, log ->
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
