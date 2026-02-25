package com.hostelgh

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
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

    override fun onCreateView(inflater: LayoutInflater, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val v = inflater.inflate(R.layout.activity_account, container, false)
        nameText = v.findViewById(R.id.nameText)
        emailText = v.findViewById(R.id.emailText)
        phoneText = v.findViewById(R.id.phoneText)
        logoutButton = v.findViewById(R.id.logoutButton)

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
