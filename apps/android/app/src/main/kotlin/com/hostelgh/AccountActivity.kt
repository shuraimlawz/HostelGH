package com.hostelgh

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.hostelgh.network.ProfileResponse
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AccountActivity : AppCompatActivity() {
    private lateinit var nameText: TextView
    private lateinit var emailText: TextView
    private lateinit var phoneText: TextView
    private lateinit var logoutButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_account)

        nameText = findViewById(R.id.nameText)
        emailText = findViewById(R.id.emailText)
        phoneText = findViewById(R.id.phoneText)
        logoutButton = findViewById(R.id.logoutButton)

        logoutButton.setOnClickListener {
            Preferences(this).authToken = null
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }

        fetchProfile()
    }

    private fun fetchProfile() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val resp = RetrofitClient.apiService.getProfile()
                withContext(Dispatchers.Main) {
                    if (resp.isSuccessful) {
                        val profile: ProfileResponse? = resp.body()
                        profile?.let { populate(it) }
                    } else {
                        Toast.makeText(this@AccountActivity, "Failed to load profile: ${resp.code()}", Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(this@AccountActivity, "Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun populate(p: ProfileResponse) {
        nameText.text = p.name
        emailText.text = p.email
        phoneText.text = p.phone ?: "-"
    }
}