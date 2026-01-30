package com.greenprj.app.presentation

import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.greenprj.app.data.security.AuthManager
import com.greenprj.app.data.security.AuthManager.LoginResult
import com.greenprj.app.data.security.AuthManager.SetupResult
import com.greenprj.app.data.security.AuthManager.ChangePasswordResult
import com.greenprj.app.data.security.SessionManager
import com.greenprj.app.databinding.ActivityMainBinding
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : AppCompatActivity() {
    private lateinit var binding: ActivityMainBinding

    @Inject
    lateinit var authManager: AuthManager

    @Inject
    lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupAuthUi()
    }

    override fun onResume() {
        super.onResume()
        // 从记账页返回时若会话已过期，则回到登录态
        setupAuthUi()
    }

    private fun setupAuthUi() {
        val isPasswordSet = authManager.isPasswordSet()
        val isSessionValid = if (isPasswordSet) sessionManager.isSessionValid() else false

        when {
            !isPasswordSet -> {
                binding.passwordSetupContainer.visibility = View.VISIBLE
                binding.loginContainer.visibility = View.GONE
                binding.changePasswordContainer.visibility = View.GONE
                binding.authStatusText.text = ""
            }

            isPasswordSet && !isSessionValid -> {
                binding.passwordSetupContainer.visibility = View.GONE
                binding.loginContainer.visibility = View.VISIBLE
                binding.changePasswordContainer.visibility = View.GONE
                binding.authStatusText.text = "会话已过期，请重新登录。"
            }

            else -> {
                // 已登录且会话有效
                binding.passwordSetupContainer.visibility = View.GONE
                binding.loginContainer.visibility = View.GONE
                binding.changePasswordContainer.visibility = View.VISIBLE
                binding.authStatusText.text = "已登录：会话有效，可修改密码。"
            }
        }

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
                    // 登录成功后显示修改密码区域
                    binding.loginContainer.visibility = View.GONE
                    binding.changePasswordContainer.visibility = View.VISIBLE
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
        binding.changePasswordButton.setOnClickListener {
            val current = binding.currentPasswordInput.text?.toString().orEmpty()
            val newPassword = binding.newPasswordInput.text?.toString().orEmpty()
            val confirmNew = binding.confirmNewPasswordInput.text?.toString().orEmpty()

            when (val result = authManager.changePassword(current, newPassword, confirmNew)) {
                is ChangePasswordResult.Success -> {
                    binding.authStatusText.text = "密码修改成功。"
                    binding.currentPasswordInput.text?.clear()
                    binding.newPasswordInput.text?.clear()
                    binding.confirmNewPasswordInput.text?.clear()
                }

                is ChangePasswordResult.PasswordNotSet -> {
                    binding.authStatusText.text = "尚未设置密码，请先完成首次密码设置。"
                    binding.passwordSetupContainer.visibility = View.VISIBLE
                    binding.loginContainer.visibility = View.GONE
                    binding.changePasswordContainer.visibility = View.GONE
                }

                is ChangePasswordResult.InvalidCurrentPassword -> {
                    binding.authStatusText.text = "当前密码不正确，请重试。"
                }

                is ChangePasswordResult.PasswordsDoNotMatch -> {
                    binding.authStatusText.text = "两次输入的新密码不一致，请重新输入。"
                }

                is ChangePasswordResult.InvalidNewPassword -> {
                    binding.authStatusText.text = result.errors.joinToString(separator = "\n")
                }

                is ChangePasswordResult.Error -> {
                    binding.authStatusText.text = result.message
                }
            }
        }

        binding.goToAccountingButton.setOnClickListener {
            if (authManager.isPasswordSet() && sessionManager.isSessionValid()) {
                startActivity(Intent(this, AccountingActivity::class.java))
            } else {
                binding.authStatusText.text = "会话已过期，请重新登录。"
                setupAuthUi()
            }
        }

        binding.goToStatisticsButton.setOnClickListener {
            if (authManager.isPasswordSet() && sessionManager.isSessionValid()) {
                startActivity(Intent(this, StatisticsActivity::class.java))
            } else {
                binding.authStatusText.text = "会话已过期，请重新登录。"
                setupAuthUi()
            }
        }
    }
}
