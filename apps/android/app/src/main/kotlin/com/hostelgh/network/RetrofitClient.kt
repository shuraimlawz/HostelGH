package com.hostelgh.network

import android.content.Context
import com.hostelgh.BuildConfig
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // base URL initialized from Gradle BuildConfig; use 10.0.2.2 for emulator by default
    private val BASE_URL: String
        get() = BuildConfig.BASE_URL
    private lateinit var appContext: Context

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    private val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor { chain ->
                val reqBuilder = chain.request().newBuilder()
                if (::appContext.isInitialized) {
                    val token = Preferences(appContext).authToken
                    if (!token.isNullOrEmpty()) {
                        reqBuilder.addHeader("Authorization", "Bearer $token")
                    }
                }
                val response = chain.proceed(reqBuilder.build())
                if (response.code == 401 && ::appContext.isInitialized) {
                    // clear token and force login
                    Preferences(appContext).authToken = null
                    val intent = android.content.Intent(appContext, LoginActivity::class.java)
                    intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK or android.content.Intent.FLAG_ACTIVITY_CLEAR_TASK
                    appContext.startActivity(intent)
                }
                response
            }
            .build()
    }

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}