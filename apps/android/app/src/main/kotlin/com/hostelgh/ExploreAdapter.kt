package com.hostelgh

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.hostelgh.models.Hostel

class ExploreAdapter(
    private val items: List<Hostel>,
    private val onClick: (Hostel) -> Unit
) : RecyclerView.Adapter<ExploreAdapter.ViewHolder>() {

    class ViewHolder(v: View) : RecyclerView.ViewHolder(v) {
        val name: TextView = v.findViewById(R.id.hostelName)
        val city: TextView = v.findViewById(R.id.hostelCity)
        val price: TextView = v.findViewById(R.id.hostelPrice)
        val image: ImageView = v.findViewById(R.id.hostelImage)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
        val v = LayoutInflater.from(parent.context).inflate(R.layout.item_hostel, parent, false)
        return ViewHolder(v)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
        val hostel = items[position]
        holder.name.text = hostel.name
        holder.city.text = hostel.city
        holder.price.text = "₵ ${hostel.price}"
        Glide.with(holder.image.context).load(hostel.imageUrl).into(holder.image)
        holder.itemView.setOnClickListener { onClick(hostel) }
    }

    override fun getItemCount(): Int = items.size
}
