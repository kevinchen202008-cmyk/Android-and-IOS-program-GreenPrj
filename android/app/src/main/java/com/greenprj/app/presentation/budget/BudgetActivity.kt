package com.greenprj.app.presentation.budget

import android.os.Bundle
import android.view.View
import android.widget.Toast
import androidx.activity.viewModels
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.flowWithLifecycle
import androidx.lifecycle.lifecycleScope
import com.greenprj.app.R
import com.greenprj.app.databinding.ActivityBudgetBinding
import com.greenprj.app.data.local.repositories.BudgetStatus
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@AndroidEntryPoint
class BudgetActivity : AppCompatActivity() {

    private lateinit var binding: ActivityBudgetBinding
    private val viewModel: BudgetViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityBudgetBinding.inflate(layoutInflater)
        setContentView(binding.root)
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { finish() }

        // 月度：设置
        binding.monthlySetButton.setOnClickListener {
            val amount = binding.monthlyAmountInput.text.toString().toDoubleOrNull()
            if (amount == null || amount <= 0) {
                Toast.makeText(this, getString(R.string.budget_amount_hint), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.setMonthlyBudget(amount)
            binding.monthlyAmountInput.text?.clear()
        }

        // 年度：设置
        binding.yearlySetButton.setOnClickListener {
            val amount = binding.yearlyAmountInput.text.toString().toDoubleOrNull()
            if (amount == null || amount <= 0) {
                Toast.makeText(this, getString(R.string.budget_amount_hint), Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.setYearlyBudget(amount)
            binding.yearlyAmountInput.text?.clear()
        }

        // 月度：修改（弹窗）
        binding.monthlyEditButton.setOnClickListener {
            viewModel.monthlyStatus.value?.let { status ->
                showEditDialog(viewModel, status.budget.id, status.budget.amount)
            }
        }

        // 月度：删除
        binding.monthlyDeleteButton.setOnClickListener {
            viewModel.monthlyStatus.value?.let { status ->
                showDeleteConfirm(viewModel, status.budget.id)
            }
        }

        // 年度：修改
        binding.yearlyEditButton.setOnClickListener {
            viewModel.yearlyStatus.value?.let { status ->
                showEditDialog(viewModel, status.budget.id, status.budget.amount)
            }
        }

        // 年度：删除
        binding.yearlyDeleteButton.setOnClickListener {
            viewModel.yearlyStatus.value?.let { status ->
                showDeleteConfirm(viewModel, status.budget.id)
            }
        }

        lifecycleScope.launch {
            viewModel.monthlyStatus
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { status -> updateMonthlyUi(status) }
        }
        lifecycleScope.launch {
            viewModel.yearlyStatus
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { status -> updateYearlyUi(status) }
        }
        lifecycleScope.launch {
            viewModel.message
                .flowWithLifecycle(lifecycle, Lifecycle.State.STARTED)
                .collectLatest { msg ->
                    if (msg != null) {
                        binding.budgetMessage.visibility = View.VISIBLE
                        binding.budgetMessage.text = msg
                        binding.budgetMessage.setTextColor(
                            androidx.core.content.ContextCompat.getColor(this@BudgetActivity, android.R.color.holo_green_dark)
                        )
                        viewModel.clearMessage()
                    } else {
                        binding.budgetMessage.visibility = View.GONE
                    }
                }
        }
    }

    private fun updateMonthlyUi(status: BudgetStatus?) {
        if (status == null) {
            binding.monthlyStatusContainer.visibility = View.GONE
            binding.monthlySetContainer.visibility = View.VISIBLE
            return
        }
        binding.monthlySetContainer.visibility = View.GONE
        binding.monthlyStatusContainer.visibility = View.VISIBLE
        binding.monthlyBudgetAmount.text = "预算：${getString(R.string.amount_display_format).format(status.budget.amount)}"
        binding.monthlyActualAmount.text = "已用：${getString(R.string.amount_display_format).format(status.actualAmount)}"
        binding.monthlyRemainingAmount.text = "剩余：${getString(R.string.amount_display_format).format(status.remainingAmount)}"
        binding.monthlyProgressBar.progress = status.percentageUsed.toInt().coerceIn(0, 100)
        binding.monthlyStatusHint.text = when {
            status.isExceeded -> getString(R.string.budget_status_exceeded)
            status.isWarning -> getString(R.string.budget_status_warning)
            else -> getString(R.string.budget_used_format, status.percentageUsed)
        }
        if (status.isExceeded) {
            binding.monthlyStatusHint.setTextColor(
                androidx.core.content.ContextCompat.getColor(this, android.R.color.holo_red_dark)
            )
        } else if (status.isWarning) {
            binding.monthlyStatusHint.setTextColor(
                androidx.core.content.ContextCompat.getColor(this, android.R.color.holo_orange_dark)
            )
        } else {
            binding.monthlyStatusHint.setTextColor(
                ContextCompat.getColor(this, android.R.color.darker_gray)
            )
        }
    }

    private fun updateYearlyUi(status: BudgetStatus?) {
        if (status == null) {
            binding.yearlyStatusContainer.visibility = View.GONE
            binding.yearlySetContainer.visibility = View.VISIBLE
            return
        }
        binding.yearlySetContainer.visibility = View.GONE
        binding.yearlyStatusContainer.visibility = View.VISIBLE
        binding.yearlyBudgetAmount.text = "预算：${getString(R.string.amount_display_format).format(status.budget.amount)}"
        binding.yearlyActualAmount.text = "已用：${getString(R.string.amount_display_format).format(status.actualAmount)}"
        binding.yearlyRemainingAmount.text = "剩余：${getString(R.string.amount_display_format).format(status.remainingAmount)}"
        binding.yearlyProgressBar.progress = status.percentageUsed.toInt().coerceIn(0, 100)
        binding.yearlyStatusHint.text = when {
            status.isExceeded -> getString(R.string.budget_status_exceeded)
            status.isWarning -> getString(R.string.budget_status_warning)
            else -> getString(R.string.budget_used_format, status.percentageUsed)
        }
        if (status.isExceeded) {
            binding.yearlyStatusHint.setTextColor(
                ContextCompat.getColor(this, android.R.color.holo_red_dark)
            )
        } else if (status.isWarning) {
            binding.yearlyStatusHint.setTextColor(
                ContextCompat.getColor(this, android.R.color.holo_orange_dark)
            )
        } else {
            binding.yearlyStatusHint.setTextColor(
                ContextCompat.getColor(this, android.R.color.darker_gray)
            )
        }
    }

    private fun showEditDialog(viewModel: BudgetViewModel, id: String, currentAmount: Double) {
        val editText = android.widget.EditText(this).apply {
            setHint(R.string.budget_amount_hint)
            inputType = android.text.InputType.TYPE_CLASS_NUMBER or android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
            setText(currentAmount.toLong().toString().takeIf { currentAmount == currentAmount.toLong().toDouble() } ?: currentAmount.toString())
        }
        AlertDialog.Builder(this)
            .setTitle(R.string.budget_edit_dialog_title)
            .setView(editText)
            .setPositiveButton(android.R.string.ok) { _, _ ->
                val amount = editText.text.toString().toDoubleOrNull()
                if (amount != null && amount > 0) viewModel.updateBudget(id, amount)
            }
            .setNegativeButton(android.R.string.cancel, null)
            .show()
    }

    private fun showDeleteConfirm(viewModel: BudgetViewModel, id: String) {
        AlertDialog.Builder(this)
            .setTitle(R.string.budget_delete_confirm_title)
            .setMessage(R.string.budget_delete_confirm_message)
            .setPositiveButton(R.string.delete_confirm_ok) { _, _ -> viewModel.deleteBudget(id) }
            .setNegativeButton(R.string.delete_confirm_cancel, null)
            .show()
    }
}
