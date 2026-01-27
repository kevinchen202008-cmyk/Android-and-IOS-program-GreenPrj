# 快速测试指南

## 启动应用

```bash
cd web
npm install
npm run dev
```

应用将在 `http://localhost:3000` 启动

## 快速测试步骤

### 1. 首次使用 - 设置密码
- 打开 `http://localhost:3000`
- 应该看到"设置密码"页面
- 输入密码（至少6个字符，例如：`test123`）
- 确认密码
- 点击"设置密码"
- ✅ 应该自动登录并跳转到主页

### 2. 测试登录
- 点击右上角"退出"按钮
- 应该跳转到登录页面
- 输入刚才设置的密码
- 点击"登录"
- ✅ 应该成功登录并跳转到主页

### 3. 测试修改密码
- 点击右上角"修改密码"按钮
- 输入当前密码
- 输入新密码（例如：`newpass123`）
- 确认新密码
- 点击"修改密码"
- ✅ 应该自动登出并跳转到登录页面
- 使用新密码登录验证

### 4. 测试会话超时（快速测试）
在浏览器控制台执行：
```javascript
// 设置会话立即过期
const session = JSON.parse(localStorage.getItem('greenprj_session'))
if (session) {
  session.expiresAt = Date.now() - 1000
  localStorage.setItem('greenprj_session', JSON.stringify(session))
  location.reload()
}
```
- ✅ 应该自动跳转到登录页面

### 5. 测试访问控制
- 清除localStorage：在控制台执行 `localStorage.clear()`
- 刷新页面
- ✅ 应该自动跳转到登录页面（如果密码已设置）或密码设置页面（如果未设置）

## 检查点

### 浏览器开发者工具检查

1. **Console（控制台）**
   - 应该看到 "Database initialized successfully"
   - 不应该有错误信息

2. **Application > Storage > IndexedDB**
   - 数据库：`greenprj_db`
   - Object Store：`settings`（包含password_hash）

3. **Application > Storage > Local Storage**
   - Key：`greenprj_session`
   - Value：包含userId、loginTime、lastActivityTime、expiresAt

## 常见问题排查

### 问题：页面显示空白
- 检查控制台是否有错误
- 确保所有依赖已安装：`npm install`

### 问题：密码设置失败
- 检查密码长度是否>=6字符
- 检查两次密码是否匹配
- 查看控制台错误信息

### 问题：登录失败
- 确认密码正确
- 检查IndexedDB中是否有password_hash
- 查看控制台错误信息

### 问题：路由不工作
- 确认浏览器地址栏URL正确
- 检查React Router是否正确配置

## 重置应用（清除所有数据）

在浏览器控制台执行：
```javascript
localStorage.clear()
indexedDB.deleteDatabase('greenprj_db').then(() => {
  console.log('Database deleted')
  location.reload()
})
```
