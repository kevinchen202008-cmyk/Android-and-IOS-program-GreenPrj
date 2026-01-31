package com.greenprj.app.presentation

import androidx.test.core.app.ActivityScenario
import androidx.test.espresso.Espresso.onView
import androidx.test.espresso.assertion.ViewAssertions.matches
import androidx.test.espresso.matcher.ViewMatchers.isDisplayed
import androidx.test.espresso.matcher.ViewMatchers.withText
import androidx.test.ext.junit.runners.AndroidJUnit4
import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * UI 冒烟测试：启动主界面并检查欢迎/登录相关文案是否展示。
 * 场景：打开应用 → 应看到「欢迎使用 GreenPrj」或密码设置/登录区域。
 */
@HiltAndroidTest
@RunWith(AndroidJUnit4::class)
class MainActivitySmokeTest {

    @get:Rule
    var hiltRule = HiltAndroidRule(this)

    @Test
    fun launchMainActivity_showsWelcomeOrAuth() {
        hiltRule.inject()
        ActivityScenario.launch(MainActivity::class.java)
        onView(withText("欢迎使用 GreenPrj")).check(matches(isDisplayed()))
    }
}
