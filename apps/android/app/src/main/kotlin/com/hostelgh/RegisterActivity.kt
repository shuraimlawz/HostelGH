package com.hostelgh

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.hostelgh.network.RegisterRequest
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class RegisterActivity : AppCompatActivity() {
    private lateinit var nameInput: EditText
    private lateinit var emailInput: EditText
    private lateinit var passwordInput: EditText
    private lateinit var registerButton: Button
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        nameInput = findViewById(R.id.nameInput)
        emailInput = findViewById(R.id.emailInput)
        passwordInput = findViewById(R.id.passwordInput)
        registerButton = findViewById(R.id.registerButton)
        progressBar = findViewById(R.id.progressBar)

        registerButton.setOnClickListener {
            val name = nameInput.text.toString().trim()
            val email = emailInput.text.toString().trim()
            val password = passwordInput.text.toString().trim()
            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "All fields are required", Toast.LENGTH_SHORT).show()
            } else {
                performRegister(name, email, password)
            }
        }
    }

    private fun performRegister(name: String, email: String, password: String) {
        progressBar.visibility = View.VISIBLE
        registerButton.isEnabled = false
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val response = RetrofitClient.apiService.register(RegisterRequest(email, password, name))
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    registerButton.isEnabled = true
                    if (response.isSuccessful) {
                        val body = response.body()
                        if (body != null && body.token.isNotEmpty()) {
                            Toast.makeText(this@RegisterActivity, "Registration successful", Toast.LENGTH_SHORT).show()
                            Preferences(this@RegisterActivity).authToken = body.token
                            startActivity(Intent(this@RegisterActivity, MainActivity::class.java))
                            finish()
                        } else {
                            Toast.makeText(this@RegisterActivity, "Invalid registration response from server", Toast.LENGTH_SHORT).show()
                        }
                    } else {
                        // Handle specific error codes
                        val errorMsg = when (response.code()) {
                            400 -> {
                                if (response.message().contains("Email")) "Email already in use"
                                else "Invalid input - check email and password format"
                            }
                            409 -> "Email already in use"
                            500 -> "Server error - please try again later"
                            else -> "Registration failed: ${response.code()}"
                        }
                        Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    progressBar.visibility = View.GONE
                    registerButton.isEnabled = true
                    val errorMsg = "Error: ${e.localizedMessage ?: "Unknown error occurred"}"
                    Toast.makeText(this@RegisterActivity, errorMsg, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}