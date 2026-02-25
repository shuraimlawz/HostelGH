package com.hostelgh

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import com.hostelgh.network.ProfileResponse
import com.hostelgh.network.RetrofitClient
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class AccountFragment : Fragment() {
    private var nameText: TextView? = null
    private var emailText: TextView? = null
    private var phoneText: TextView? = null
    private var logoutButton: Button? = null
    private var editButton: Button? = null

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.activity_account, container, false)
        nameText = v.findViewById(R.id.nameText)
        emailText = v.findViewById(R.id.emailText)
        phoneText = v.findViewById(R.id.phoneText)
        editButton = v.findViewById(R.id.editButton)
        logoutButton = v.findViewById(R.id.logoutButton)

        editButton?.setOnClickListener {
            showEditDialog()
        }

        logoutButton?.setOnClickListener {
            context?.let {
                Preferences(it).authToken = null
                startActivity(Intent(it, LoginActivity::class.java))
                activity?.finish()
            }
        }

        fetchProfile()
        return v
    }

    private fun showEditDialog() {
        val ctx = context ?: return
        val inflater = LayoutInflater.from(ctx)
        val dialogView = inflater.inflate(R.layout/dialog_edit_profile, null)
        val nameInput = dialogView.findViewById<EditText>(R.id/dialogName)
        val phoneInput = dialogView.findViewById<EditText>(R.id/dialogPhone)

        // prefill current values
        nameInput.text = nameText?.text
        phoneInput.text = phoneText?.text

        val dialog = android.app.AlertDialog.Builder(ctx)
            .setTitle("Edit Profile")
            .setView(dialogView)
            .setPositiveButton("Save") { _, _ ->
                val newName = nameInput.text.toString().trim()
                val newPhone = phoneInput.text.toString().trim().takeIf { it.isNotEmpty() }
                updateProfile(newName, newPhone)
            }
            .setNegativeButton("Cancel", null)
            .create()
        dialog.show()
    }

    private fun updateProfile(name: String, phone: String?) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val request = com.hostelgh.network.UpdateProfileRequest(name, phone)
                val resp = RetrofitClient.apiService.updateProfile(request)
                withContext(Dispatchers.Main) {
                    if (resp.isSuccessful) {
                        resp.body()?.let {
                            if (it.success) {
                                // update displayed values
                                nameText?.text = name
                                phoneText?.text = phone ?: "-"
                                android.widget.Toast.makeText(context, "Profile updated", android.widget.Toast.LENGTH_SHORT).show()
                            } else {
                                android.widget.Toast.makeText(context, it.message ?: "Update failed", android.widget.Toast.LENGTH_SHORT).show()
                            }
                        }
                    } else {
                        android.widget.Toast.makeText(context, "Update failed", android.widget.Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    android.widget.Toast.makeText(context, "Error: ${e.message}", android.widget.Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    private fun fetchProfile() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val resp = RetrofitClient.apiService.getProfile()
                withContext(Dispatchers.Main) {
                    if (resp.isSuccessful) {
                        resp.body()?.let { populate(it) }
                    }
                }
            } catch (_: Exception) {}
        }
    }

    private fun populate(p: ProfileResponse) {
        nameText?.text = p.name
        emailText?.text = p.email
        phoneText?.text = p.phone ?: "-"
    }
}
