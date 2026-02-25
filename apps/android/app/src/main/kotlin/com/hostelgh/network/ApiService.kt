package com.hostelgh.network

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET

// Data models

data class LoginRequest(val email: String, val password: String)
data class LoginResponse(val token: String, val userId: String)

data class RegisterRequest(val email: String, val password: String, val name: String)
data class RegisterResponse(val token: String, val userId: String)

data class ForgotPasswordRequest(val email: String)
data class ForgotPasswordResponse(val message: String)

// Hostel models (server should return this shape)
data class HostelDto(
    val id: String,
    val name: String,
    val city: String,
    val price: Double,
    val rating: Double,
    val imageUrl: String?
)

// Profile model
data class ProfileResponse(
    val id: String,
    val name: String,
    val email: String,
    val phone: String?
)

data class UpdateProfileRequest(
    val name: String,
    val phone: String?
)

data class UpdateProfileResponse(
    val success: Boolean,
    val message: String?
)

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>

    @GET("hostels")
    suspend fun getHostels(): Response<List<HostelDto>>

    @GET("auth/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @POST("auth/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<UpdateProfileResponse>

    // bookings
    data class BookingDto(
        val id: String,
        val hostelName: String,
        val roomName: String,
        val status: String,
        val startDate: String,
        val endDate: String,
        val price: Double
    )

    @GET("bookings")
    suspend fun getBookings(): Response<List<BookingDto>>

    data class CancelResponse(val success: Boolean, val message: String?)

    @POST("bookings/{id}/cancel")
    suspend fun cancelBooking(@retrofit2.http.Path("id") id: String): Response<CancelResponse>
}