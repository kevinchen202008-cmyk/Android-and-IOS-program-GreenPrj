package com.greenprj.app.di

import android.content.Context
import androidx.room.Room
import com.greenprj.app.data.local.dao.AccountEntryDao
import com.greenprj.app.data.local.database.GreenPrjDatabase
import com.greenprj.app.data.local.repositories.AccountEntryRepository
import com.greenprj.app.data.security.AuthManager
import com.greenprj.app.data.security.AuthPreferences
import com.greenprj.app.data.security.SessionManager
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
    fun provideAccountEntryDao(database: GreenPrjDatabase): AccountEntryDao {
        return database.accountEntryDao()
    }

    @Provides
    @Singleton
    fun provideAccountEntryRepository(
        accountEntryDao: AccountEntryDao
    ): AccountEntryRepository {
        return AccountEntryRepository(accountEntryDao)
    }

    @Provides
    @Singleton
    fun provideAuthPreferences(@ApplicationContext context: Context): AuthPreferences {
        return AuthPreferences(context)
    }

    @Provides
    @Singleton
    fun provideSessionManager(@ApplicationContext context: Context): SessionManager {
        return SessionManager(context)
    }

    @Provides
    @Singleton
    fun provideAuthManager(
        authPreferences: AuthPreferences,
        sessionManager: SessionManager
    ): AuthManager {
        return AuthManager(authPreferences, sessionManager)
    }
}

