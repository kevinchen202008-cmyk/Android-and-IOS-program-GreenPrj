package com.greenprj.app.presentation

import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.greenprj.app.data.security.AuthManager
import com.greenprj.app.data.security.AuthManager.LoginResult
import com.greenprj.app.data.security.AuthManager.SetupResult
import com.greenprj.app.databinding.ActivityMainBinding
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    @Inject
    lateinit var authManager: AuthManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupAuthUi()
    }

    private fun setupAuthUi() {
        val isPasswordSet = authManager.isPasswordSet()
        binding.passwordSetupContainer.visibility = if (isPasswordSet) View.GONE else View.VISIBLE
        binding.loginContainer.visibility = if (isPasswordSet) View.VISIBLE else View.GONE

        binding.authStatusText.text = ""

        binding.setupPasswordButton.setOnClickListener {
            val password = binding.setupPasswordInput.text?.toString().orEmpty()
            val confirm = binding.setupPasswordConfirmInput.text?.toString().orEmpty()

            when (val result = authManager.setupPassword(password, confirm)) {
                is SetupResult.Success -> {
                    binding.authStatusText.text = "密码设置成功，请使用新密码登录。"
                    // 切换到登录视图
                    binding.passwordSetupContainer.visibility = View.GONE
                    binding.loginContainer.visibility = View.VISIBLE
                    binding.setupPasswordInput.text?.clear()
                    binding.setupPasswordConfirmInput.text?.clear()
                }

                is SetupResult.PasswordsDoNotMatch -> {
                    binding.authStatusText.text = "两次输入的密码不一致，请重新输入。"
                }

                is SetupResult.InvalidPassword -> {
                    binding.authStatusText.text = result.errors.joinToString(separator = "\n")
                }
            }
        }

        binding.loginButton.setOnClickListener {
            val password = binding.loginPasswordInput.text?.toString().orEmpty()
            when (val result = authManager.login(password)) {
                is LoginResult.Success -> {
                    binding.authStatusText.text = "登录成功，欢迎使用 GreenPrj。"
                    binding.loginPasswordInput.text?.clear()
                    // 后续可以在这里导航到具体功能界面（记账 / 统计等）
                }

                is LoginResult.PasswordNotSet -> {
                    binding.authStatusText.text = "尚未设置密码，请先完成密码设置。"
                    binding.passwordSetupContainer.visibility = View.VISIBLE
                    binding.loginContainer.visibility = View.GONE
                }

                is LoginResult.InvalidCredentials -> {
                    binding.authStatusText.text = "密码错误，请重试。"
                }

                is LoginResult.Error -> {
                    binding.authStatusText.text = result.message
                }
            }
        }
    }
}
