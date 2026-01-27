/**
 * 完整功能测试脚本
 * 在浏览器控制台中运行此脚本来全面测试认证功能
 * 
 * 使用方法：
 * 1. 确保应用已运行（http://localhost:3000）
 * 2. 打开浏览器开发者工具（F12）
 * 3. 切换到 Console 标签
 * 4. 复制粘贴此脚本并执行
 */

(async function runFullTests() {
  console.log('🧪 开始完整功能测试...\n')
  console.log('='.repeat(50))
  
  const results = {
    passed: [],
    failed: [],
    warnings: []
  }

  function test(name, condition, message) {
    if (condition) {
      console.log(`✅ ${name}`)
      results.passed.push(name)
    } else {
      console.error(`❌ ${name}: ${message}`)
      results.failed.push({ name, message })
    }
  }

  function warn(name, message) {
    console.warn(`⚠️  ${name}: ${message}`)
    results.warnings.push({ name, message })
  }

  // ==================== 测试1: 数据库检查 ====================
  console.log('\n📦 测试1: 数据库检查')
  console.log('-'.repeat(50))
  
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('greenprj_db', 1)
      request.onsuccess = (e) => resolve(e.target.result)
      request.onerror = () => reject(new Error('无法打开数据库'))
    })
    
    test('数据库已初始化', db !== null, '数据库未初始化')
    test('Object Stores数量', db.objectStoreNames.length >= 5, `只有${db.objectStoreNames.length}个stores`)
    test('Settings store存在', db.objectStoreNames.contains('settings'), 'Settings store不存在')
    test('Accounts store存在', db.objectStoreNames.contains('accounts'), 'Accounts store不存在')
    test('Categories store存在', db.objectStoreNames.contains('categories'), 'Categories store不存在')
    test('Budgets store存在', db.objectStoreNames.contains('budgets'), 'Budgets store不存在')
    test('OperationLogs store存在', db.objectStoreNames.contains('operationLogs'), 'OperationLogs store不存在')
    
    db.close()
  } catch (error) {
    test('数据库检查', false, error.message)
  }

  // ==================== 测试2: 密码哈希检查 ====================
  console.log('\n🔐 测试2: 密码哈希检查')
  console.log('-'.repeat(50))
  
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('greenprj_db', 1)
      request.onsuccess = (e) => resolve(e.target.result)
      request.onerror = () => reject(new Error('无法打开数据库'))
    })
    
    const passwordHash = await new Promise((resolve) => {
      const tx = db.transaction(['settings'], 'readonly')
      const store = tx.objectStore('settings')
      const request = store.get('password_hash')
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
    })
    
    if (passwordHash) {
      test('密码哈希存在', true, '')
      test('密码哈希格式', typeof passwordHash === 'string', '密码哈希不是字符串')
      test('bcrypt格式', passwordHash.startsWith('$2'), '密码哈希不是bcrypt格式')
      test('密码哈希长度', passwordHash.length > 20, '密码哈希长度异常')
    } else {
      warn('密码哈希', '密码未设置（这是正常的，如果是首次使用）')
    }
    
    db.close()
  } catch (error) {
    test('密码哈希检查', false, error.message)
  }

  // ==================== 测试3: Session检查 ====================
  console.log('\n🔑 测试3: Session检查')
  console.log('-'.repeat(50))
  
  const sessionStr = localStorage.getItem('greenprj_session')
  if (sessionStr) {
    try {
      const session = JSON.parse(sessionStr)
      test('Session存在', true, '')
      test('Session格式', 
        session.userId && session.loginTime && session.lastActivityTime && session.expiresAt,
        'Session数据不完整'
      )
      
      const now = Date.now()
      const isExpired = now >= session.expiresAt
      test('Session未过期', !isExpired, 'Session已过期')
      
      if (!isExpired) {
        const minutesLeft = Math.round((session.expiresAt - now) / 1000 / 60)
        console.log(`   ℹ️  剩余时间: ${minutesLeft} 分钟`)
        test('Session剩余时间', minutesLeft > 0 && minutesLeft <= 30, 'Session剩余时间异常')
      }
      
      test('登录时间', session.loginTime <= now, '登录时间异常')
      test('最后活动时间', session.lastActivityTime <= now, '最后活动时间异常')
    } catch (error) {
      test('Session格式', false, error.message)
    }
  } else {
    warn('Session', 'Session不存在（可能未登录）')
  }

  // ==================== 测试4: 路由和UI检查 ====================
  console.log('\n🌐 测试4: 路由和UI检查')
  console.log('-'.repeat(50))
  
  test('当前路径', window.location.pathname !== undefined, '无法获取路径')
  console.log(`   ℹ️  当前路径: ${window.location.pathname}`)
  
  const hasMaterialUI = document.querySelector('.MuiAppBar-root') !== null || 
                       document.querySelector('[class*="Mui"]') !== null ||
                       document.querySelector('style[data-emotion]') !== null
  test('Material UI加载', hasMaterialUI, 'Material UI未检测到')
  
  const hasReact = window.React !== undefined || document.querySelector('#root') !== null
  test('React加载', hasReact, 'React未加载')
  
  // ==================== 测试5: 功能组件检查 ====================
  console.log('\n🧩 测试5: 功能组件检查')
  console.log('-'.repeat(50))
  
  // 检查密码设置表单
  const passwordInputs = document.querySelectorAll('input[type="password"]')
  const hasPasswordForm = passwordInputs.length > 0
  if (hasPasswordForm) {
    console.log(`   ℹ️  检测到 ${passwordInputs.length} 个密码输入框`)
    test('密码表单存在', true, '')
  } else {
    warn('密码表单', '未检测到密码输入框（可能已登录）')
  }
  
  // 检查登录按钮
  const loginButtons = Array.from(document.querySelectorAll('button')).filter(
    btn => btn.textContent.includes('登录') || btn.textContent.includes('设置密码')
  )
  if (loginButtons.length > 0) {
    console.log(`   ℹ️  检测到 ${loginButtons.length} 个相关按钮`)
    test('操作按钮存在', true, '')
  }

  // ==================== 测试6: 安全功能检查 ====================
  console.log('\n🛡️  测试6: 安全功能检查')
  console.log('-'.repeat(50))
  
  // 检查密码是否明文存储（应该不是）
  if (sessionStr) {
    const session = JSON.parse(sessionStr)
    test('Session不包含密码', !session.password, 'Session中不应包含密码')
  }
  
  // 检查localStorage中是否有敏感信息
  const localStorageKeys = Object.keys(localStorage)
  const hasSensitiveData = localStorageKeys.some(key => 
    key.includes('password') && !key.includes('hash')
  )
  test('无明文密码存储', !hasSensitiveData, '发现可能的明文密码存储')

  // ==================== 测试7: 数据完整性检查 ====================
  console.log('\n📊 测试7: 数据完整性检查')
  console.log('-'.repeat(50))
  
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('greenprj_db', 1)
      request.onsuccess = (e) => resolve(e.target.result)
      request.onerror = () => reject(new Error('无法打开数据库'))
    })
    
    // 检查所有stores是否可访问
    for (const storeName of db.objectStoreNames) {
      try {
        const tx = db.transaction([storeName], 'readonly')
        const store = tx.objectStore(storeName)
        test(`${storeName} store可访问`, store !== null, `${storeName} store无法访问`)
      } catch (error) {
        test(`${storeName} store可访问`, false, error.message)
      }
    }
    
    db.close()
  } catch (error) {
    test('数据完整性检查', false, error.message)
  }

  // ==================== 输出测试结果 ====================
  console.log('\n' + '='.repeat(50))
  console.log('📊 测试结果汇总')
  console.log('='.repeat(50))
  console.log(`✅ 通过: ${results.passed.length}`)
  console.log(`❌ 失败: ${results.failed.length}`)
  console.log(`⚠️  警告: ${results.warnings.length}`)
  
  if (results.passed.length > 0) {
    console.log('\n✅ 通过的测试:')
    results.passed.forEach((name, index) => {
      console.log(`   ${index + 1}. ${name}`)
    })
  }
  
  if (results.failed.length > 0) {
    console.log('\n❌ 失败的测试:')
    results.failed.forEach(({ name, message }, index) => {
      console.log(`   ${index + 1}. ${name}: ${message}`)
    })
  }
  
  if (results.warnings.length > 0) {
    console.log('\n⚠️  警告:')
    results.warnings.forEach(({ name, message }, index) => {
      console.log(`   ${index + 1}. ${name}: ${message}`)
    })
  }
  
  // ==================== 测试建议 ====================
  console.log('\n💡 下一步测试建议:')
  console.log('-'.repeat(50))
  
  if (!sessionStr) {
    console.log('1. 如果密码已设置，请尝试登录功能')
    console.log('2. 测试密码错误时的错误处理')
  } else {
    console.log('1. 测试退出功能（点击右上角"退出"按钮）')
    console.log('2. 测试修改密码功能')
    console.log('3. 测试会话超时（使用快速测试命令）')
  }
  
  console.log('4. 测试访问控制（清除Session后验证重定向）')
  console.log('5. 测试用户活动重置会话超时')
  
  // ==================== 快速测试命令 ====================
  console.log('\n🔧 快速测试命令:')
  console.log('-'.repeat(50))
  console.log('// 测试会话过期')
  console.log(`const s = JSON.parse(localStorage.getItem('greenprj_session'))
s.expiresAt = Date.now() - 1000
localStorage.setItem('greenprj_session', JSON.stringify(s))
location.reload()`)
  
  console.log('\n// 重置应用')
  console.log(`localStorage.clear()
indexedDB.deleteDatabase('greenprj_db').then(() => location.reload())`)
  
  console.log('\n✨ 测试完成！')
  console.log('='.repeat(50))
  
  return results
})()
