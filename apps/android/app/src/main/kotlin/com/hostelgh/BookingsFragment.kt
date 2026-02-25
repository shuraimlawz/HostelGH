package com.hostelgh

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class BookingsFragment : Fragment() {
    private var list: RecyclerView? = null
    private var progressBar: View? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout/activity_bookings, container, false)
        list = v.findViewById(R.id.hostelList)
        progressBar = v.findViewById(R.id.progressBar)
        list?.layoutManager = LinearLayoutManager(requireContext())
        fetchBookings()
        return v
    }

    private fun fetchBookings() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                withContext(Dispatchers.Main) { progressBar?.visibility = View.VISIBLE }
                val resp = RetrofitClient.apiService.getBookings()
                if (resp.isSuccessful) {
                    val bookings = resp.body() ?: emptyList()
                    withContext(Dispatchers.Main) {
                        list?.adapter = BookingsAdapter(bookings) { bookingId ->
                            cancelBooking(bookingId)
                        }
                    }
                }
            } catch (_: Exception) {
            } finally {
                withContext(Dispatchers.Main) { progressBar?.visibility = View.GONE }
            }
        }
    }

    private fun cancelBooking(id: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val resp = RetrofitClient.apiService.cancelBooking(id)
                withContext(Dispatchers.Main) {
                    if (resp.isSuccessful) {
                        fetchBookings()
                    } else {
                        // maybe toast
                    }
                }
            } catch (_: Exception) {
            }
        }
    }
}
