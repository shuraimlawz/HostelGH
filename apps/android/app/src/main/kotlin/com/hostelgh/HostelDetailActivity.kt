package com.hostelgh

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.ImageView
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.hostelgh.models.Room
import com.hostelgh.network.ApiService
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

class HostelDetailActivity : AppCompatActivity() {
    private var roomsList: RecyclerView? = null
    private var progressBar: ProgressBar? = null

    private lateinit var hostelId: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_hostel_detail)

        val image = findViewById<ImageView>(R.id.detailImage)
        val nameTv = findViewById<TextView>(R.id.detailName)
        val cityTv = findViewById<TextView>(R.id.detailCity)
        val priceTv = findViewById<TextView>(R.id.detailPrice)
        roomsList = findViewById(R.id.roomsList)
        progressBar = findViewById(R.id.detailProgress)

        hostelId = intent.getStringExtra("hostelId") ?: ""
        val hostelName = intent.getStringExtra("hostelName") ?: ""
        val hostelCity = intent.getStringExtra("hostelCity") ?: ""
        val hostelPrice = intent.getDoubleExtra("hostelPrice", 0.0)
        val hostelImage = intent.getStringExtra("hostelImageUrl")

        nameTv.text = hostelName
        cityTv.text = hostelCity
        priceTv.text = "₵ $hostelPrice"
        if (!hostelImage.isNullOrEmpty()) {
            Glide.with(this).load(hostelImage).into(image)
        }

        roomsList?.layoutManager = LinearLayoutManager(this)
        fetchRooms()
    }

    private fun fetchRooms() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                withContext(Dispatchers.Main) { progressBar?.visibility = View.VISIBLE }
                val resp = RetrofitClient.apiService.getRooms(hostelId)
                if (resp.isSuccessful) {
                    val dtos = resp.body() ?: emptyList()
                    val rooms = dtos.map { Room(it.id, it.name, it.pricePerTerm, it.totalUnits) }
                    withContext(Dispatchers.Main) {
                        roomsList?.adapter = RoomAdapter(rooms) { room ->
                            pickDateAndBook(room)
                        }
                    }
                } else {
                    withContext(Dispatchers.Main) {
                        Toast.makeText(this@HostelDetailActivity, "Failed to load rooms", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@HostelDetailActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            } finally {
                withContext(Dispatchers.Main) { progressBar?.visibility = View.GONE }
            }
        }
    }

    private fun pickDateAndBook(room: Room) {
        val cal = Calendar.getInstance()
        DatePickerDialog(
            this,
            { _, year, month, day ->
                cal.set(year, month, day)
                val startDate = cal.time
                // add 4 months (approx)
                cal.add(Calendar.MONTH, 4)
                val endDate = cal.time
                createBooking(room, startDate, endDate)
            },
            cal.get(Calendar.YEAR),
            cal.get(Calendar.MONTH),
            cal.get(Calendar.DAY_OF_MONTH)
        ).show()
    }

    private fun createBooking(room: Room, start: Date, end: Date) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // ISO formatting
                val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
                val request = ApiService.CreateBookingRequest(
                    hostelId = hostelId,
                    startDate = fmt.format(start),
                    endDate = fmt.format(end),
                    items = listOf(ApiService.BookingItem(room.id, 1)),
                    notes = "Booked via Android app"
                )
                val resp = RetrofitClient.apiService.createBooking(request)
                withContext(Dispatchers.Main) {
                    if (resp.isSuccessful) {
                        Toast.makeText(this@HostelDetailActivity, "Booking request sent", Toast.LENGTH_SHORT).show()
                        finish()
                    } else {
                        Toast.makeText(this@HostelDetailActivity, "Failed to book", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@HostelDetailActivity, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
