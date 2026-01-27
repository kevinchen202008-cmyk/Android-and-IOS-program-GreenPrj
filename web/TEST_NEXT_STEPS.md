# 下一步测试步骤

## 当前状态 ✅

- ✅ 密码已设置
- ✅ 应用正常运行
- ✅ 当前在登录页面（符合预期）

## 测试步骤

### 步骤1: 测试登录功能

**操作：**
1. 在登录页面输入您设置的密码
2. 点击"登录"按钮

**验证（登录后运行）：**
```javascript
// 验证登录成功
const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
if (session) {
  console.log('✅ 登录成功！')
  console.log('过期时间:', new Date(session.expiresAt).toLocaleString())
  const mins = Math.round((session.expiresAt - Date.now()) / 1000 / 60)
  console.log('剩余时间:', mins, '分钟')
  console.log('当前路径:', window.location.pathname)
} else {
  console.log('❌ 登录失败 - Session未创建')
}
```

**预期结果：**
- ✅ 登录成功
- ✅ 跳转到主页
- ✅ Session已创建
- ✅ Session过期时间为30分钟后

---

### 步骤2: 测试错误密码处理

**操作：**
1. 点击"退出"按钮
2. 输入错误密码（例如：`wrong123`）
3. 点击"登录"

**预期结果：**
- ✅ 显示"密码错误"提示
- ✅ 不创建Session
- ✅ 仍在登录页面

---

### 步骤3: 测试修改密码功能

**前提：** 已登录

**操作：**
1. 登录后，点击右上角"修改密码"按钮
2. 输入当前密码
3. 输入新密码：`newpass123`
4. 确认新密码
5. 点击"修改密码"

**验证（修改后运行）：**
```javascript
// 验证密码已更新
const db = await new Promise(r => indexedDB.open('greenprj_db', 1).onsuccess = e => r(e.target.result))
const newHash = await new Promise(r => db.transaction(['settings'], 'readonly').objectStore('settings').get('password_hash').onsuccess = e => r(e.target.result))
console.log('新密码哈希:', newHash ? '✅ 已更新' : '❌ 未更新')
console.log('Session:', localStorage.getItem('greenprj_session') ? '❌ 应已清除' : '✅ 已清除')
db.close()
```

**预期结果：**
- ✅ 修改成功
- ✅ 自动登出
- ✅ 跳转到登录页面
- ✅ 使用新密码可以登录
- ✅ 旧密码无法登录

---

### 步骤4: 测试会话超时

**前提：** 已登录

**在Console运行：**
```javascript
// 快速测试会话过期
const session = JSON.parse(localStorage.getItem('greenprj_session'))
if (session) {
  console.log('当前过期时间:', new Date(session.expiresAt).toLocaleString())
  session.expiresAt = Date.now() - 1000 // 设置为过去时间
  localStorage.setItem('greenprj_session', JSON.stringify(session))
  console.log('✅ Session已设置为过期，3秒后刷新...')
  setTimeout(() => location.reload(), 3000)
} else {
  console.log('❌ 没有活动的Session，请先登录')
}
```

**预期结果：**
- ✅ 页面刷新后自动跳转到登录页面
- ✅ 无法访问主页

---

### 步骤5: 测试访问控制

**操作：**
1. 清除Session（在Console运行）：
```javascript
localStorage.removeItem('greenprj_session')
location.reload()
```

2. 或者直接访问 `http://localhost:3000/`

**预期结果：**
- ✅ 自动重定向到登录页面
- ✅ 无法访问受保护的内容

---

### 步骤6: 测试用户活动重置会话

**前提：** 已登录

**操作：**
1. 登录后，在Console查看Session：
```javascript
const s1 = JSON.parse(localStorage.getItem('greenprj_session'))
const mins1 = Math.round((s1.expiresAt - Date.now()) / 1000 / 60)
console.log('初始剩余时间:', mins1, '分钟')
```

2. 在页面上进行一些操作（点击、滚动、输入等）

3. 等待几秒后，再次检查：
```javascript
const s2 = JSON.parse(localStorage.getItem('greenprj_session'))
const mins2 = Math.round((s2.expiresAt - Date.now()) / 1000 / 60)
console.log('更新后剩余时间:', mins2, '分钟')
console.log('时间延长:', mins2 > mins1 ? '✅ 是' : '❌ 否')
```

**预期结果：**
- ✅ 过期时间已更新
- ✅ 剩余时间延长了约30分钟

---

## 测试结果记录

请记录以下测试结果：

### 登录功能
- [ ] 登录成功
- [ ] Session创建
- [ ] 错误密码处理
- [ ] 跳转正确

### 修改密码
- [ ] 修改成功
- [ ] 自动登出
- [ ] 新密码可用
- [ ] 旧密码不可用

### 会话管理
- [ ] 会话超时
- [ ] 用户活动重置
- [ ] 访问控制

---

## 快速测试命令汇总

```javascript
// 1. 检查当前状态
(async function() {
  const db = await new Promise(r => indexedDB.open('greenprj_db', 1).onsuccess = e => r(e.target.result))
  const hash = await new Promise(r => db.transaction(['settings'], 'readonly').objectStore('settings').get('password_hash').onsuccess = e => r(e.target.result))
  const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
  console.log('密码:', hash ? '✅' : '❌', 'Session:', session ? '✅' : '❌')
  if (session) console.log('剩余:', Math.round((session.expiresAt - Date.now()) / 1000 / 60), '分钟')
  db.close()
})()

// 2. 测试会话过期
const s = JSON.parse(localStorage.getItem('greenprj_session'))
s.expiresAt = Date.now() - 1000
localStorage.setItem('greenprj_session', JSON.stringify(s))
location.reload()

// 3. 重置应用
localStorage.clear()
indexedDB.deleteDatabase('greenprj_db').then(() => location.reload())
```
