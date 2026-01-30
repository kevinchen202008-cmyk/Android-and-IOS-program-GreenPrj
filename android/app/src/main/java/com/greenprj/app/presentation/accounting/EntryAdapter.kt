package com.greenprj.app.presentation.accounting

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.greenprj.app.R
import com.greenprj.app.data.local.entities.AccountEntryEntity
import java.time.format.DateTimeFormatter

/**
 * RecyclerView 适配器：展示账目列表（金额、日期、类别、备注）。
 * @param categoryLabels 类别 key（如 food）到显示名（如 餐饮）的映射，可为空则显示 key
 * @param onEdit 点击条目时回调，用于编辑
 * @param onDelete 长按条目时回调，用于删除（由调用方弹确认框）
 */
class EntryAdapter(
    private val categoryLabels: Map<String, String> = emptyMap(),
    private val onEdit: (AccountEntryEntity) -> Unit = {},
    private val onDelete: (AccountEntryEntity) -> Unit = {}
) : ListAdapter<AccountEntryEntity, EntryAdapter.ViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_account_entry, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position), onEdit, onDelete)
    }

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val amountText: TextView = itemView.findViewById(R.id.itemAmount)
        private val categoryText: TextView = itemView.findViewById(R.id.itemCategory)
        private val dateText: TextView = itemView.findViewById(R.id.itemDate)
        private val notesText: TextView = itemView.findViewById(R.id.itemNotes)

        fun bind(
            entry: AccountEntryEntity,
            onEdit: (AccountEntryEntity) -> Unit,
            onDelete: (AccountEntryEntity) -> Unit
        ) {
            amountText.text = itemView.context.getString(R.string.amount_display_format, entry.amount.toFloat())
            categoryText.text = categoryLabels[entry.category] ?: entry.category
            dateText.text = entry.date.toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE)
            val notes = entry.notes?.trim()
            if (!notes.isNullOrBlank()) {
                notesText.visibility = View.VISIBLE
                notesText.text = notes
            } else {
                notesText.visibility = View.GONE
            }
            itemView.setOnClickListener { onEdit(entry) }
            itemView.setOnLongClickListener { onDelete(entry); true }
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<AccountEntryEntity>() {
        override fun areItemsTheSame(old: AccountEntryEntity, new: AccountEntryEntity) =
            old.id == new.id

        override fun areContentsTheSame(old: AccountEntryEntity, new: AccountEntryEntity) =
            old == new
    }
}
