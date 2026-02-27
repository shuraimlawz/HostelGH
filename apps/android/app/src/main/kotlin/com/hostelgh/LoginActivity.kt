package com.hostelgh

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.hostelgh.network.LoginRequest
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class LoginActivity : AppCompatActivity() {
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var loginButton: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        loginButton = findViewById(R.id.loginButton)
        progressBar = findViewById(R.id.progressBar)

        loginButton.setOnClickListener {
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString().trim()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Email and password are required", Toast.LENGTH_SHORT).show()
            } else {
                performLogin(email, password)
            }
        }

        findViewById<TextView>(R.id.registerLink).setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }
        findViewById<TextView>(R.id.forgotLink).setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }

        // if already logged in, skip directly
        val prefs = Preferences(this)
        prefs.authToken?.let {
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }
    }

    private fun performLogin(email: String, password: String) {
        progressBar.visibility = View.VISIBLE
        loginButton.isEnabled = false
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitClient.apiService.login(LoginRequest(email, password))
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    loginButton.isEnabled = true
                    if (response.isSuccessful) {
                        val body = response.body()
                        if (body != null && body.token.isNotEmpty()) {
                            Toast.makeText(this@LoginActivity, "Login successful", Toast.LENGTH_SHORT).show()
                            Preferences(this@LoginActivity).authToken = body.token
                            startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                            finish()
                        } else {
                            Toast.makeText(this@LoginActivity, "Invalid login response from server", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        // Handle specific error codes
                        val errorMsg = when (response.code()) {
                            401 -> "Invalid email or password"
                            400 -> "Invalid email or password format"
                            500 -> "Server error - please try again later"
                            else -> "Login failed: ${response.code()}"
                        }
                        Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    loginButton.isEnabled = true
                    val errorMsg = "Error: ${e.localizedMessage ?: "Unknown error occurred"}"
                    Toast.makeText(this@LoginActivity, errorMsg, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}