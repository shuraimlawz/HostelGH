package com.hostelgh

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.fragment.app.Fragment
import com.google.android.material.bottomnavigation.BottomNavigationView

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main_nav)

        val bottomNav = findViewById<BottomNavigationView>(R.id.bottom_nav)
        bottomNav.setOnItemSelectedListener { item ->
            val frag: Fragment = when (item.itemId) {
                R.id.nav_explore -> ExploreFragment()
                R.id.nav_bookings -> BookingsFragment()
                R.id.nav_account -> AccountFragment()
                else -> ExploreFragment()
            }
            supportFragmentManager.beginTransaction().replace(R.id.nav_host, frag).commit()
            true
        }

        // default
        if (savedInstanceState == null) {
            supportFragmentManager.beginTransaction().replace(R.id.nav_host, ExploreFragment()).commit()
        }
    }
}
