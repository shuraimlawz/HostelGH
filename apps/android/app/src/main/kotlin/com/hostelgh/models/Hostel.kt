package com.hostelgh.models

data class Hostel(
    val id: String,
    val name: String,
    val city: String,
    val price: Double,
    val rating: Double,
    val imageUrl: String?
)
