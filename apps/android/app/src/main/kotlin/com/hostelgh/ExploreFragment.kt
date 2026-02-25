package com.hostelgh

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.hostelgh.models.Hostel
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExploreFragment : Fragment() {
    private var list: RecyclerView? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.activity_explore, container, false)
        list = v.findViewById(R.id.hostelList)
        list?.layoutManager = LinearLayoutManager(requireContext())
        fetchHostels()
        return v
    }

    private fun fetchHostels() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val resp = RetrofitClient.apiService.getHostels()
                if (resp.isSuccessful) {
                    val dtos = resp.body() ?: emptyList()
                    val hostels = dtos.map { Hostel(it.id, it.name, it.city, it.price, it.rating, it.imageUrl) }
                    withContext(Dispatchers.Main) {
                        list?.adapter = ExploreAdapter(hostels)
                    }
                }
            } catch (_: Exception) {
                // ignore for now
            }
        }
    }
}
