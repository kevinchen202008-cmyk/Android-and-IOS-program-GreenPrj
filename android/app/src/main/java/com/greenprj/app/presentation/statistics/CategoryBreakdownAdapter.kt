package com.greenprj.app.presentation.statistics

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.greenprj.app.R

/**
 * 统计页类别占比列表适配器。
 */
class CategoryBreakdownAdapter(
    private val categoryLabels: Map<String, String>
) : ListAdapter<CategoryStat, CategoryBreakdownAdapter.ViewHolder>(DiffCallback) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_statistics_category, parent, false)
        return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val categoryNameText: TextView = itemView.findViewById(R.id.categoryNameText)
        private val categoryAmountText: TextView = itemView.findViewById(R.id.categoryAmountText)
        private val categoryPercentText: TextView = itemView.findViewById(R.id.categoryPercentText)
        private val categoryProgressBar: ProgressBar = itemView.findViewById(R.id.categoryProgressBar)

        fun bind(stat: CategoryStat) {
            categoryNameText.text = categoryLabels[stat.categoryKey] ?: stat.categoryKey
            categoryAmountText.text = itemView.context.getString(R.string.amount_display_format, stat.amount.toFloat())
            categoryPercentText.text = itemView.context.getString(R.string.percent_format, stat.percentage.toFloat())
            categoryProgressBar.progress = stat.percentage.toInt().coerceIn(0, 100)
        }
    }

    private object DiffCallback : DiffUtil.ItemCallback<CategoryStat>() {
        override fun areItemsTheSame(old: CategoryStat, new: CategoryStat) =
            old.categoryKey == new.categoryKey

        override fun areContentsTheSame(old: CategoryStat, new: CategoryStat) =
            old == new
    }
}
