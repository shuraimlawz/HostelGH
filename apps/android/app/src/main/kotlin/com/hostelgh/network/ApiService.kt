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

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<RegisterResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>

    @GET("hostels")
    suspend fun getHostels(): Response<List<HostelDto>>
}