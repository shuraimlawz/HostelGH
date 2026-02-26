package com.hostelgh

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class SplashActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        // initialize networking (so interceptor can pick up token)
        RetrofitClient.init(this)

        // show splash for 1.2s then go to MainActivity or LoginActivity depending on auth
        CoroutineScope(Dispatchers.Main).launch {
            delay(1200)
            val prefs = Preferences(this@SplashActivity)
            val dest = if (prefs.authToken != null) MainActivity::class.java else LoginActivity::class.java
            startActivity(Intent(this@SplashActivity, dest))
            finish()
        }
    }
}
