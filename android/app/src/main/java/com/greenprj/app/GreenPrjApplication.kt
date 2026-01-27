package com.greenprj.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class GreenPrjApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
