package com.greenprj.app.presentation.merge

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.greenprj.app.data.merge.DeleteAllResult
import com.greenprj.app.data.merge.MergeRepository
import com.greenprj.app.data.merge.MergeResult
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.Dispatchers
import javax.inject.Inject

@HiltViewModel
class MergeViewModel @Inject constructor(
    private val mergeRepository: MergeRepository
) : ViewModel() {

    private val _isExporting = MutableStateFlow(false)
    val isExporting: StateFlow<Boolean> = _isExporting.asStateFlow()

    private val _isImporting = MutableStateFlow(false)
    val isImporting: StateFlow<Boolean> = _isImporting.asStateFlow()

    private val _exportResult = MutableStateFlow<String?>(null)
    val exportResult: StateFlow<String?> = _exportResult.asStateFlow()

    private val _importResult = MutableStateFlow<MergeResult?>(null)
    val importResult: StateFlow<MergeResult?> = _importResult.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message: StateFlow<String?> = _message.asStateFlow()

    private val _isDeleting = MutableStateFlow(false)
    val isDeleting: StateFlow<Boolean> = _isDeleting.asStateFlow()

    private val _deleteCompleted = MutableStateFlow<DeleteAllResult?>(null)
    val deleteCompleted: StateFlow<DeleteAllResult?> = _deleteCompleted.asStateFlow()

    fun exportToJson(onExported: (String) -> Unit) {
        viewModelScope.launch {
            _isExporting.value = true
            _exportResult.value = null
            _message.value = null
            runCatching {
                withContext(Dispatchers.IO) {
                    mergeRepository.exportToJson()
                }
            }.onSuccess { json ->
                _exportResult.value = json
                onExported(json)
                _message.value = "导出成功，请选择保存位置"
            }.onFailure {
                _message.value = "导出失败: ${it.message}"
            }
            _isExporting.value = false
        }
    }

    fun importFromJson(json: String) {
        viewModelScope.launch {
            _isImporting.value = true
            _importResult.value = null
            _message.value = null
            runCatching {
                withContext(Dispatchers.IO) {
                    mergeRepository.importFromJson(json)
                }
            }.onSuccess { result ->
                _importResult.value = result
                val err = if (result.errors.isEmpty()) null else result.errors.joinToString("；")
                _message.value = when {
                    err != null -> "导入完成，有 ${result.errors.size} 条错误"
                    result.imported == 0 && result.duplicates == 0 -> "无有效数据可导入"
                    else -> "导入成功：新增 ${result.imported} 条，跳过重复 ${result.duplicates} 条"
                }
            }.onFailure {
                _message.value = "导入失败: ${it.message}"
            }
            _isImporting.value = false
        }
    }

    fun deleteAllData() {
        viewModelScope.launch {
            _isDeleting.value = true
            _message.value = null
            _deleteCompleted.value = null
            runCatching {
                withContext(Dispatchers.IO) {
                    mergeRepository.deleteAllData()
                }
            }.onSuccess { result ->
                _deleteCompleted.value = result
                _message.value = "已删除 ${result.entriesDeleted} 条账目、${result.budgetsDeleted} 条预算"
            }.onFailure {
                _message.value = "删除失败: ${it.message}"
            }
            _isDeleting.value = false
        }
    }

    fun clearExportResult() { _exportResult.value = null }
    fun clearImportResult() { _importResult.value = null }
    fun clearDeleteCompleted() { _deleteCompleted.value = null }
    fun clearMessage() { _message.value = null }
}
