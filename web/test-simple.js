/**
 * 简化版测试脚本（使用原生IndexedDB API）
 * 在浏览器控制台中直接运行
 */

(async function() {
  console.log('🧪 开始简化测试...\n')
  
  // 测试1: 检查数据库
  return new Promise((resolve) => {
    const request = indexedDB.open('greenprj_db', 1)
    
    request.onsuccess = (event) => {
      const db = event.target.result
      console.log('✅ 数据库已初始化')
      console.log('   Object Stores:', Array.from(db.objectStoreNames))
      
      // 检查settings store
      if (db.objectStoreNames.contains('settings')) {
        console.log('✅ Settings store存在')
        
        // 检查密码哈希
        const tx = db.transaction(['settings'], 'readonly')
        const store = tx.objectStore('settings')
        const getRequest = store.get('password_hash')
        
        getRequest.onsuccess = () => {
          const hash = getRequest.result
          if (hash) {
            console.log('✅ 密码哈希存在')
            console.log('   哈希格式:', hash.startsWith('$2') ? 'bcrypt格式 ✓' : '未知格式')
          } else {
            console.log('ℹ️  密码哈希不存在（未设置密码）')
          }
          db.close()
          checkSession()
          resolve()
        }
        
        getRequest.onerror = () => {
          console.log('ℹ️  无法读取密码哈希')
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
      console.log('❌ 数据库未初始化或无法访问')
      checkSession()
      resolve()
    }
  })
  
  function checkSession() {
    // 检查Session
    const sessionStr = localStorage.getItem('greenprj_session')
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr)
        console.log('\n✅ Session存在')
        console.log('   用户ID:', session.userId)
        console.log('   登录时间:', new Date(session.loginTime).toLocaleString())
        console.log('   过期时间:', new Date(session.expiresAt).toLocaleString())
        
        const timeUntilExpiry = Math.round((session.expiresAt - Date.now()) / 1000 / 60)
        if (timeUntilExpiry > 0) {
          console.log('   剩余时间:', timeUntilExpiry, '分钟')
          console.log('✅ Session有效')
        } else {
          console.log('❌ Session已过期')
        }
      } catch (e) {
        console.log('❌ Session格式错误:', e.message)
      }
    } else {
      console.log('\nℹ️  Session不存在（未登录）')
    }
    
    // 检查Material UI
    const hasMUI = document.querySelector('.MuiAppBar-root') !== null || 
                  document.querySelector('[class*="Mui"]') !== null
    console.log('\n' + (hasMUI ? '✅' : 'ℹ️ ') + ' Material UI:', hasMUI ? '已加载' : '未检测到（可能页面未完全渲染）')
    
    // 检查当前路径
    console.log('\n📍 当前路径:', window.location.pathname)
    
    console.log('\n✨ 测试完成！')
  }
})()
