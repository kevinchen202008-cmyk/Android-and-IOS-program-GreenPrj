# 测试执行检查清单

## 准备工作

### 1. 安装依赖
```bash
cd web
npm install
```

**预期输出：** 应该看到所有依赖包安装成功，包括：
- react, react-dom
- @mui/material, @mui/icons-material
- react-router-dom
- zustand
- idb
- bcryptjs
- @types/bcryptjs

### 2. 启动开发服务器
```bash
npm run dev
```

**预期输出：** 
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. 打开浏览器
- 访问 `http://localhost:3000`
- 打开开发者工具（F12）
- 切换到 Console 标签

## 测试执行步骤

### ✅ 测试1: 应用启动检查

**操作：**
1. 打开 `http://localhost:3000`
2. 查看浏览器控制台

**预期结果：**
- [ ] 控制台显示 "Database initialized successfully"
- [ ] 没有红色错误信息
- [ ] 页面显示"设置密码"表单（首次使用）

**如果失败：**
- 检查控制台错误信息
- 确认所有依赖已安装
- 检查网络连接

---

### ✅ 测试2: 密码设置功能

**操作：**
1. 在"设置密码"页面
2. 输入密码：`test123`（6个字符）
3. 输入确认密码：`test123`
4. 点击"设置密码"按钮

**预期结果：**
- [ ] 密码设置成功
- [ ] 自动跳转到主页
- [ ] 主页显示"欢迎使用 GreenPrj"
- [ ] AppBar显示"修改密码"和"退出"按钮

**验证数据：**
在控制台执行：
```javascript
// 检查IndexedDB
const db = await idb.openDB('greenprj_db', 1)
const hash = await db.get('settings', 'password_hash')
console.log('Password hash exists:', !!hash)

// 检查Session
const session = JSON.parse(localStorage.getItem('greenprj_session'))
console.log('Session:', session)
console.log('Is authenticated:', !!session)
```

**预期：**
- [ ] password_hash 存在
- [ ] session 存在且有效

---

### ✅ 测试3: 密码强度验证

**操作：**
1. 清除数据（见下方重置命令）
2. 重新打开应用
3. 尝试输入短密码：`12345`（5个字符）
4. 点击"设置密码"

**预期结果：**
- [ ] 显示错误："密码长度至少为6个字符"
- [ ] 密码未保存
- [ ] 仍在设置密码页面

---

### ✅ 测试4: 密码匹配验证

**操作：**
1. 在设置密码页面
2. 输入密码：`test123`
3. 输入确认密码：`test456`（不匹配）
4. 点击"设置密码"

**预期结果：**
- [ ] 显示错误："密码不匹配"
- [ ] 密码未保存

---

### ✅ 测试5: 登录功能

**前提：** 已完成密码设置

**操作：**
1. 点击AppBar右上角"退出"按钮
2. 应该跳转到登录页面
3. 输入正确密码：`test123`
4. 点击"登录"按钮

**预期结果：**
- [ ] 登录成功
- [ ] 跳转到主页
- [ ] 显示认证状态为"已登录"

**测试错误密码：**
1. 再次退出
2. 输入错误密码：`wrong123`
3. 点击"登录"

**预期结果：**
- [ ] 显示错误："密码错误"
- [ ] 仍在登录页面

---

### ✅ 测试6: 修改密码功能

**前提：** 已登录

**操作：**
1. 点击AppBar"修改密码"按钮
2. 输入当前密码：`test123`
3. 输入新密码：`newpass123`
4. 输入确认新密码：`newpass123`
5. 点击"修改密码"按钮

**预期结果：**
- [ ] 密码修改成功
- [ ] 自动登出
- [ ] 跳转到登录页面
- [ ] 使用新密码 `newpass123` 可以登录
- [ ] 使用旧密码 `test123` 无法登录

---

### ✅ 测试7: 会话超时（快速测试）

**前提：** 已登录

**操作：**
在浏览器控制台执行：
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session'))
if (session) {
  console.log('Current session expires at:', new Date(session.expiresAt))
  session.expiresAt = Date.now() - 1000 // 设置为过去时间
  localStorage.setItem('greenprj_session', JSON.stringify(session))
  console.log('Session expired, reloading...')
  location.reload()
}
```

**预期结果：**
- [ ] 页面自动跳转到登录页面
- [ ] 无法访问主页

---

### ✅ 测试8: 访问控制保护

**操作：**
1. 清除session（在控制台执行：`localStorage.removeItem('greenprj_session')`）
2. 刷新页面或直接访问 `http://localhost:3000/`

**预期结果：**
- [ ] 自动重定向到登录页面
- [ ] 无法访问受保护的内容

---

### ✅ 测试9: 用户活动重置会话

**前提：** 已登录

**操作：**
1. 在控制台查看当前会话：
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session'))
console.log('Current expiresAt:', new Date(session.expiresAt))
console.log('Time until expiry:', Math.round((session.expiresAt - Date.now()) / 1000 / 60), 'minutes')
```
2. 在页面上进行一些操作（点击、滚动、输入等）
3. 等待几秒后，再次查看会话

**预期结果：**
- [ ] expiresAt 时间已更新
- [ ] 过期时间延长了30分钟

---

## 重置应用数据

如果需要重置应用进行重新测试，在浏览器控制台执行：

```javascript
// 清除所有数据
localStorage.clear()
indexedDB.deleteDatabase('greenprj_db').then(() => {
  console.log('All data cleared. Reloading...')
  location.reload()
})
```

---

## 测试结果记录

### 功能测试结果

- [ ] 测试1: 应用启动 - 通过/失败
- [ ] 测试2: 密码设置 - 通过/失败
- [ ] 测试3: 密码强度验证 - 通过/失败
- [ ] 测试4: 密码匹配验证 - 通过/失败
- [ ] 测试5: 登录功能 - 通过/失败
- [ ] 测试6: 修改密码 - 通过/失败
- [ ] 测试7: 会话超时 - 通过/失败
- [ ] 测试8: 访问控制 - 通过/失败
- [ ] 测试9: 用户活动重置会话 - 通过/失败

### 发现的问题

1. 
2. 
3. 

### 备注
