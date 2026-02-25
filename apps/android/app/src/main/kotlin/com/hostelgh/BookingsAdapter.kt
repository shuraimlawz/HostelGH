package com.hostelgh

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView

class BookingsAdapter(private val items: List<com.hostelgh.network.ApiService.BookingDto>) : RecyclerView.Adapter<BookingsAdapter.ViewHolder>() {
    class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        val name: TextView = v.findViewById(R.id.hostelName)
        val room: TextView = v.findViewById(R.id.roomName)
        val status: TextView = v.findViewById(R.id.status)
        val dates: TextView = v.findViewById(R.id.dates)
        val price: TextView = v.findViewById(R.id.price)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_booking, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val b = items[position]
        holder.name.text = b.hostelName
        holder.room.text = b.roomName
        holder.status.text = b.status
        holder.dates.text = "${b.startDate} - ${b.endDate}"
        holder.price.text = "₵ ${b.price}"
    }

    override fun getItemCount(): Int = items.size
}
