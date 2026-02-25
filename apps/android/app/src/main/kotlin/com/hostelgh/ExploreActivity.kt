package com.hostelgh

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.hostelgh.models.Hostel
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExploreActivity : AppCompatActivity() {
    private lateinit var list: RecyclerView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_explore)
        list = findViewById(R.id.hostelList)
        list.layoutManager = LinearLayoutManager(this)
        fetchHostels()
    }

    private fun fetchHostels() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val resp = RetrofitClient.apiService.getHostels()
                if (resp.isSuccessful) {
                    val dtos = resp.body() ?: emptyList()
                    val hostels = dtos.map { Hostel(it.id, it.name, it.city, it.price, it.rating, it.imageUrl) }
                    withContext(Dispatchers.Main) {
                        list.adapter = ExploreAdapter(hostels)
                    }
                }
            } catch (_: Exception) {
                withContext(Dispatchers.Main) { /* show error toast if needed */ }
            }
        }
    }
}