package com.hostelgh

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // replace layout with buttons programmatically or modify XML
        findViewById<Button>(R.id.exploreBtn)?.setOnClickListener {
            startActivity(Intent(this, ExploreActivity::class.java))
        }
        findViewById<Button>(R.id.bookingsBtn)?.setOnClickListener {
            startActivity(Intent(this, BookingsActivity::class.java))
        }
        findViewById<Button>(R.id.accountBtn)?.setOnClickListener {
            startActivity(Intent(this, AccountActivity::class.java))
        }
    }
}
