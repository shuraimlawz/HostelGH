package com.hostelgh

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.hostelgh.models.Room

class RoomAdapter(
    private val items: List<Room>,
    private val onBook: (Room) -> Unit
) : RecyclerView.Adapter<RoomAdapter.ViewHolder>() {
    class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        val name: TextView = v.findViewById(R.id.roomName)
        val price: TextView = v.findViewById(R.id.roomPrice)
        val bookBtn: Button = v.findViewById(R.id.bookBtn)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_room, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val room = items[position]
        holder.name.text = room.name
        holder.price.text = "₵ ${room.pricePerTerm}"
        holder.bookBtn.setOnClickListener { onBook(room) }
    }

    override fun getItemCount(): Int = items.size
}
