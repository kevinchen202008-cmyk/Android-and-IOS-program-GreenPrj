# Web平台认证功能测试指南

## 测试前准备

1. **安装依赖**
   ```bash
   cd web
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **打开浏览器**
   - 访问 `http://localhost:3000`
   - 打开浏览器开发者工具（F12）查看控制台日志

## 测试场景

### 场景1: 首次使用 - 密码设置

**步骤：**
1. 打开应用（首次使用）
2. 应该看到"设置密码"页面
3. 输入密码（至少6个字符）
4. 输入确认密码
5. 点击"设置密码"按钮

**预期结果：**
- ✅ 如果密码长度<6字符，显示错误提示
- ✅ 如果两次密码不匹配，显示"密码不匹配"错误
- ✅ 如果验证通过，密码被保存，自动登录并跳转到主页
- ✅ 主页显示"欢迎使用 GreenPrj"

**验证点：**
- 检查浏览器控制台，应该看到"Database initialized successfully"
- 检查IndexedDB（Application > Storage > IndexedDB > greenprj_db > settings），应该看到password_hash
- 检查localStorage（Application > Storage > Local Storage），应该看到greenprj_session

### 场景2: 登录功能

**前提：** 已完成密码设置

**步骤：**
1. 清除localStorage中的session（或等待30分钟自动过期）
2. 刷新页面
3. 应该看到"登录"页面
4. 输入正确的密码
5. 点击"登录"按钮

**预期结果：**
- ✅ 如果密码正确，登录成功并跳转到主页
- ✅ 如果密码错误，显示"密码错误"提示
- ✅ 登录后，会话在30分钟后自动过期

**验证点：**
- 登录成功后，localStorage中应该有greenprj_session
- 会话信息包含loginTime、lastActivityTime、expiresAt

### 场景3: 会话超时

**前提：** 已登录

**步骤：**
1. 登录后，等待30分钟（或手动修改localStorage中的expiresAt为过去时间）
2. 尝试访问任何页面或进行任何操作

**预期结果：**
- ✅ 会话过期后，自动跳转到登录页面
- ✅ 所有受保护的路由都需要重新登录

**快速测试方法：**
- 在浏览器控制台执行：
  ```javascript
  const session = JSON.parse(localStorage.getItem('greenprj_session'))
  session.expiresAt = Date.now() - 1000 // 设置为过去时间
  localStorage.setItem('greenprj_session', JSON.stringify(session))
  location.reload()
  ```

### 场景4: 修改密码

**前提：** 已登录

**步骤：**
1. 点击AppBar中的"修改密码"按钮
2. 输入当前密码
3. 输入新密码（至少6个字符）
4. 输入确认新密码
5. 点击"修改密码"按钮

**预期结果：**
- ✅ 如果当前密码错误，显示"当前密码错误"
- ✅ 如果新密码不符合要求，显示相应错误
- ✅ 如果新密码不匹配，显示"新密码不匹配"
- ✅ 如果验证通过，密码被更新，自动登出并跳转到登录页面
- ✅ 使用新密码可以登录

**验证点：**
- 修改密码后，IndexedDB中的password_hash应该更新
- 旧密码无法登录，新密码可以登录

### 场景5: 访问控制保护

**前提：** 未登录或会话已过期

**步骤：**
1. 清除localStorage中的session
2. 直接访问 `http://localhost:3000/` 或任何受保护的路由

**预期结果：**
- ✅ 自动重定向到登录页面
- ✅ 未登录用户无法访问受保护的内容

### 场景6: 用户活动重置会话

**前提：** 已登录

**步骤：**
1. 登录后，进行任何用户活动（点击、键盘输入、滚动等）
2. 观察会话的expiresAt时间

**预期结果：**
- ✅ 每次用户活动都会更新lastActivityTime
- ✅ 会话过期时间会延长30分钟
- ✅ 会话不会在用户活跃时过期

## 调试技巧

### 查看当前会话状态
在浏览器控制台执行：
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session'))
console.log('Session:', session)
console.log('Time until expiry:', new Date(session.expiresAt - Date.now()))
```

### 查看密码哈希（仅用于调试）
在浏览器控制台执行：
```javascript
const db = await idb.openDB('greenprj_db', 1)
const hash = await db.get('settings', 'password_hash')
console.log('Password hash:', hash)
```

### 清除所有数据（重置应用）
在浏览器控制台执行：
```javascript
localStorage.clear()
indexedDB.deleteDatabase('greenprj_db')
location.reload()
```

## 常见问题

### 问题1: 密码设置后无法登录
**可能原因：** IndexedDB未正确初始化
**解决方法：** 检查浏览器控制台是否有错误，确保数据库已初始化

### 问题2: 会话立即过期
**可能原因：** 会话时间计算错误
**解决方法：** 检查session-manager.ts中的时间计算逻辑

### 问题3: 路由不工作
**可能原因：** React Router配置问题
**解决方法：** 确保BrowserRouter在App.tsx外层正确配置

## 测试检查清单

- [ ] 密码设置功能正常
- [ ] 密码强度验证工作
- [ ] 登录功能正常
- [ ] 密码错误时显示正确错误信息
- [ ] 会话管理正常工作（30分钟超时）
- [ ] 用户活动重置会话超时
- [ ] 修改密码功能正常
- [ ] 修改密码后需要重新登录
- [ ] 访问控制保护正常工作
- [ ] 未登录用户自动重定向
- [ ] 所有错误信息正确显示
- [ ] 加载状态正确显示
