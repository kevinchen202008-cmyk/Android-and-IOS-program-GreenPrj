# 浏览器控制台测试命令

在浏览器开发者工具的Console标签中，可以直接运行以下命令进行测试。

## 快速测试脚本

### 方法1: 使用简化测试脚本

复制以下代码到Console并执行：

```javascript
// 简化测试脚本
(async function() {
  console.log('🧪 开始测试...\n')
  
  // 检查数据库
  return new Promise((resolve) => {
    const request = indexedDB.open('greenprj_db', 1)
    request.onsuccess = (event) => {
      const db = event.target.result
      console.log('✅ 数据库已初始化')
      console.log('   Object Stores:', Array.from(db.objectStoreNames))
      
      if (db.objectStoreNames.contains('settings')) {
        console.log('✅ Settings store存在')
        const tx = db.transaction(['settings'], 'readonly')
        const store = tx.objectStore('settings')
        const getRequest = store.get('password_hash')
        
        getRequest.onsuccess = () => {
          const hash = getRequest.result
          if (hash) {
            console.log('✅ 密码哈希存在')
            console.log('   格式:', hash.startsWith('$2') ? 'bcrypt ✓' : '未知')
          } else {
            console.log('ℹ️  密码未设置')
          }
          db.close()
          checkSession()
          resolve()
        }
      } else {
        console.log('❌ Settings store不存在')
        db.close()
        checkSession()
        resolve()
      }
    }
    request.onerror = () => {
      console.log('❌ 数据库未初始化')
      checkSession()
      resolve()
    }
  })
  
  function checkSession() {
    const sessionStr = localStorage.getItem('greenprj_session')
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr)
        console.log('\n✅ Session存在')
        console.log('   过期时间:', new Date(session.expiresAt).toLocaleString())
        const minutes = Math.round((session.expiresAt - Date.now()) / 1000 / 60)
        console.log('   剩余:', minutes > 0 ? minutes + '分钟' : '已过期')
      } catch (e) {
        console.log('❌ Session格式错误')
      }
    } else {
      console.log('\nℹ️  未登录')
    }
    console.log('📍 当前路径:', window.location.pathname)
    console.log('\n✨ 测试完成')
  }
})()
```

### 方法2: 使用test-simple.js文件

1. 打开 `test-simple.js` 文件
2. 复制全部内容
3. 粘贴到Console并执行

## 常用检查命令

### 检查数据库
```javascript
const request = indexedDB.open('greenprj_db', 1)
request.onsuccess = (e) => {
  const db = e.target.result
  console.log('Stores:', Array.from(db.objectStoreNames))
  db.close()
}
```

### 检查密码哈希
```javascript
const request = indexedDB.open('greenprj_db', 1)
request.onsuccess = (e) => {
  const db = e.target.result
  const tx = db.transaction(['settings'], 'readonly')
  const store = tx.objectStore('settings')
  store.get('password_hash').onsuccess = (e) => {
    console.log('Password hash:', e.target.result ? '存在' : '不存在')
    db.close()
  }
}
```

### 检查Session
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
console.log('Session:', session)
if (session) {
  console.log('Expires:', new Date(session.expiresAt))
  console.log('Minutes left:', Math.round((session.expiresAt - Date.now()) / 1000 / 60))
}
```

### 快速测试会话过期
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session'))
if (session) {
  session.expiresAt = Date.now() - 1000
  localStorage.setItem('greenprj_session', JSON.stringify(session))
  console.log('Session expired, reloading...')
  location.reload()
}
```

### 重置应用
```javascript
localStorage.clear()
indexedDB.deleteDatabase('greenprj_db').then(() => {
  console.log('All data cleared')
  location.reload()
})
```

## 功能测试命令

### 测试密码设置（模拟）
```javascript
// 注意：这需要实际的UI操作，这里只是验证数据存储
const request = indexedDB.open('greenprj_db', 1)
request.onsuccess = async (e) => {
  const db = e.target.result
  // 检查密码是否已设置
  const tx = db.transaction(['settings'], 'readonly')
  const store = tx.objectStore('settings')
  store.get('password_hash').onsuccess = (e) => {
    if (e.target.result) {
      console.log('✅ 密码已设置')
    } else {
      console.log('ℹ️  密码未设置，请使用UI设置密码')
    }
    db.close()
  }
}
```

## 调试技巧

### 查看所有localStorage数据
```javascript
console.table(Object.keys(localStorage).map(key => ({
  key,
  value: localStorage.getItem(key)
})))
```

### 查看IndexedDB所有数据
```javascript
const request = indexedDB.open('greenprj_db', 1)
request.onsuccess = async (e) => {
  const db = e.target.result
  for (const storeName of db.objectStoreNames) {
    const tx = db.transaction([storeName], 'readonly')
    const store = tx.objectStore(storeName)
    const all = await store.getAll()
    console.log(`${storeName}:`, all)
  }
  db.close()
}
```

### 监控Session变化
```javascript
// 每5秒检查一次Session状态
setInterval(() => {
  const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
  if (session) {
    const minutes = Math.round((session.expiresAt - Date.now()) / 1000 / 60)
    console.log(`Session expires in: ${minutes} minutes`)
  } else {
    console.log('No active session')
  }
}, 5000)
```
