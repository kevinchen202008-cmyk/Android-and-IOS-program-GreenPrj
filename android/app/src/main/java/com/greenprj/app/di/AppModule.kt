package com.greenprj.app.di

import android.content.Context
import androidx.room.Room
import com.greenprj.app.data.local.database.GreenPrjDatabase
import com.greenprj.app.data.security.AuthManager
import com.greenprj.app.data.security.AuthPreferences
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): GreenPrjDatabase {
        return Room.databaseBuilder(
            context,
            GreenPrjDatabase::class.java,
            "greenprj_database"
        )
            .addMigrations(*GreenPrjDatabase.MIGRATIONS)
            .fallbackToDestructiveMigration() // For development only - remove in production
            .build()
    }

    @Provides
    @Singleton
    fun provideAuthPreferences(@ApplicationContext context: Context): AuthPreferences {
        return AuthPreferences(context)
    }

    @Provides
    @Singleton
    fun provideAuthManager(authPreferences: AuthPreferences): AuthManager {
        return AuthManager(authPreferences)
    }
}
