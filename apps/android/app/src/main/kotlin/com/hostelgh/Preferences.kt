package com.hostelgh

import android.content.Context

class Preferences(context: Context) {
    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    var authToken: String?
        get() = prefs.getString(KEY_TOKEN, null)
        set(value) = prefs.edit().putString(KEY_TOKEN, value).apply()

    companion object {
        private const val PREFS_NAME = "hostelgh_prefs"
        private const val KEY_TOKEN = "auth_token"
    }
}