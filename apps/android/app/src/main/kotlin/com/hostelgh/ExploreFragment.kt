package com.hostelgh

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import android.content.Intent
import com.hostelgh.HostelDetailActivity
import com.hostelgh.models.Hostel
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ExploreFragment : Fragment() {
    private var list: RecyclerView? = null
    private var progressBar: View? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.activity_explore, container, false)
        list = v.findViewById(R.id.hostelList)
        progressBar = v.findViewById(R.id.progressBar)
        list?.layoutManager = LinearLayoutManager(requireContext())
        fetchHostels()
        return v
    }

    private fun fetchHostels() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                withContext(Dispatchers.Main) { progressBar?.visibility = View.VISIBLE }
                val resp = RetrofitClient.apiService.getHostels()
                if (resp.isSuccessful) {
                    val dtos = resp.body() ?: emptyList()
                    val hostels = dtos.map { Hostel(it.id, it.name, it.city, it.price, it.rating, it.imageUrl) }
                    withContext(Dispatchers.Main) {
                        if (hostels.isEmpty()) {
                            // show simple text if no hostels
                            Toast.makeText(requireContext(), "No hostels available", Toast.LENGTH_SHORT).show()
                        }
                        list?.adapter = ExploreAdapter(hostels) { hostel ->
                            val intent = android.content.Intent(requireContext(), HostelDetailActivity::class.java)
                            intent.putExtra("hostelId", hostel.id)
                            intent.putExtra("hostelName", hostel.name)
                            intent.putExtra("hostelCity", hostel.city)
                            intent.putExtra("hostelPrice", hostel.price)
                            intent.putExtra("hostelImageUrl", hostel.imageUrl)
                            startActivity(intent)
                        }
                    }
                }
            } catch (_: Exception) {
                // ignore for now
            } finally {
                withContext(Dispatchers.Main) { progressBar?.visibility = View.GONE }
            }
        }
    }
}
