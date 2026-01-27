# 测试执行指南

## 快速开始

### 步骤1: 运行完整测试脚本

在浏览器Console中，复制粘贴 `test-full.js` 文件的全部内容并执行。

或者直接运行以下简化版本：

```javascript
// 完整测试脚本（简化版）
(async function() {
  console.log('🧪 开始完整测试...\n')
  const results = { passed: [], failed: [] }
  
  function test(name, condition, msg) {
    if (condition) {
      console.log(`✅ ${name}`)
      results.passed.push(name)
    } else {
      console.error(`❌ ${name}: ${msg}`)
      results.failed.push({ name, msg })
    }
  }
  
  // 测试数据库
  const db = await new Promise((r, rej) => {
    const req = indexedDB.open('greenprj_db', 1)
    req.onsuccess = e => r(e.target.result)
    req.onerror = () => rej('无法打开数据库')
  })
  test('数据库初始化', db !== null, '')
  test('Settings store', db.objectStoreNames.contains('settings'), '')
  
  // 测试密码哈希
  const hash = await new Promise(r => {
    const tx = db.transaction(['settings'], 'readonly')
    tx.objectStore('settings').get('password_hash').onsuccess = e => r(e.target.result)
  })
  test('密码哈希存在', !!hash, '')
  test('bcrypt格式', hash && hash.startsWith('$2'), '')
  
  // 测试Session
  const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
  test('Session存在', !!session, '')
  if (session) {
    test('Session未过期', Date.now() < session.expiresAt, '')
    const mins = Math.round((session.expiresAt - Date.now()) / 1000 / 60)
    console.log(`   剩余时间: ${mins}分钟`)
  }
  
  db.close()
  
  console.log(`\n✅ 通过: ${results.passed.length}, ❌ 失败: ${results.failed.length}`)
  return results
})()
```

---

## 功能测试步骤

### 测试A: 密码设置验证

**当前状态：** 密码已设置 ✅

**验证：**
1. 检查密码哈希格式
2. 验证Session是否创建

**在Console运行：**
```javascript
// 验证密码和Session
const db = await new Promise(r => {
  indexedDB.open('greenprj_db', 1).onsuccess = e => r(e.target.result)
})
const hash = await new Promise(r => {
  db.transaction(['settings'], 'readonly').objectStore('settings').get('password_hash').onsuccess = e => r(e.target.result)
})
console.log('密码哈希:', hash ? '✅ 存在 (' + hash.substring(0, 20) + '...)' : '❌ 不存在')

const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
console.log('Session:', session ? '✅ 存在' : '❌ 不存在')
if (session) {
  console.log('过期时间:', new Date(session.expiresAt).toLocaleString())
}
db.close()
```

---

### 测试B: 登录功能

**操作步骤：**
1. 点击右上角"退出"按钮
2. 应该跳转到登录页面
3. 输入密码
4. 点击"登录"

**验证命令（登录后运行）：**
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session'))
if (session) {
  console.log('✅ 登录成功')
  console.log('过期时间:', new Date(session.expiresAt).toLocaleString())
} else {
  console.log('❌ 登录失败 - Session不存在')
}
```

**测试错误密码：**
1. 退出登录
2. 输入错误密码（例如：`wrong123`）
3. 应该显示"密码错误"
4. 不应该创建Session

---

### 测试C: 修改密码功能

**操作步骤：**
1. 登录后，点击"修改密码"
2. 输入当前密码
3. 输入新密码：`newpass123`
4. 确认新密码
5. 点击"修改密码"

**验证：**
```javascript
// 修改密码后验证
const db = await new Promise(r => {
  indexedDB.open('greenprj_db', 1).onsuccess = e => r(e.target.result)
})
const oldHash = await new Promise(r => {
  db.transaction(['settings'], 'readonly').objectStore('settings').get('password_hash').onsuccess = e => r(e.target.result)
})
console.log('旧密码哈希:', oldHash ? oldHash.substring(0, 20) + '...' : '不存在')

// 使用新密码登录后再次检查
// 应该看到哈希已更新
```

**预期结果：**
- ✅ 修改成功
- ✅ 自动登出
- ✅ 跳转到登录页面
- ✅ 新密码可以登录
- ✅ 旧密码无法登录

---

### 测试D: 会话超时（快速测试）

**在Console运行：**
```javascript
// 快速测试会话过期
const session = JSON.parse(localStorage.getItem('greenprj_session'))
if (session) {
  console.log('当前过期时间:', new Date(session.expiresAt).toLocaleString())
  session.expiresAt = Date.now() - 1000 // 设置为过去时间
  localStorage.setItem('greenprj_session', JSON.stringify(session))
  console.log('✅ Session已设置为过期，刷新页面...')
  setTimeout(() => location.reload(), 1000)
} else {
  console.log('❌ 没有活动的Session')
}
```

**预期结果：**
- ✅ 页面刷新后自动跳转到登录页面
- ✅ 无法访问主页

---

### 测试E: 访问控制保护

**操作步骤：**
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

### 测试F: 用户活动重置会话

**操作步骤：**
1. 登录后，在Console查看当前Session：
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session'))
console.log('当前过期时间:', new Date(session.expiresAt).toLocaleString())
const mins1 = Math.round((session.expiresAt - Date.now()) / 1000 / 60)
console.log('剩余时间:', mins1, '分钟')
```

2. 在页面上进行一些操作（点击、滚动、输入等）

3. 等待几秒后，再次检查：
```javascript
const session2 = JSON.parse(localStorage.getItem('greenprj_session'))
console.log('更新后过期时间:', new Date(session2.expiresAt).toLocaleString())
const mins2 = Math.round((session2.expiresAt - Date.now()) / 1000 / 60)
console.log('剩余时间:', mins2, '分钟')
console.log('时间延长:', mins2 > mins1 ? '✅ 是' : '❌ 否')
```

**预期结果：**
- ✅ 过期时间已更新
- ✅ 剩余时间延长了约30分钟

---

## 测试结果记录

请填写以下测试结果：

### 基础功能
- [x] 密码设置 - ✅ 已通过（密码哈希已设置）
- [ ] 登录功能 - [ ]通过 / [ ]失败
- [ ] 修改密码 - [ ]通过 / [ ]失败
- [ ] 退出功能 - [ ]通过 / [ ]失败

### 安全功能
- [ ] 密码强度验证 - [ ]通过 / [ ]失败
- [ ] 密码匹配验证 - [ ]通过 / [ ]失败
- [ ] 错误密码处理 - [ ]通过 / [ ]失败
- [ ] 会话超时 - [ ]通过 / [ ]失败
- [ ] 访问控制 - [ ]通过 / [ ]失败
- [ ] 用户活动重置会话 - [ ]通过 / [ ]失败

### 数据验证
- [x] 密码哈希存储 - ✅ 已通过
- [ ] Session创建 - [ ]通过 / [ ]失败
- [ ] Session过期处理 - [ ]通过 / [ ]失败

---

## 发现问题记录

### 问题1: [如有]
**描述：**
**重现步骤：**
**预期行为：**
**实际行为：**

---

## 测试完成确认

完成所有测试后，请确认：

- [ ] 所有核心功能正常工作
- [ ] 安全功能正常
- [ ] 错误处理完善
- [ ] 用户体验良好
- [ ] 无严重问题

**测试完成时间：** _______________
