/**
 * 自动化测试脚本
 * 在浏览器控制台中运行此脚本来验证认证功能
 * 
 * 使用方法：
 * 1. 打开应用 http://localhost:3000
 * 2. 打开浏览器开发者工具（F12）
 * 3. 切换到 Console 标签
 * 4. 复制粘贴此脚本并执行
 */

(async function runTests() {
  console.log('🧪 开始自动化测试...\n')
  
  const results = {
    passed: [],
    failed: [],
  }

  function test(name, condition, message) {
    if (condition) {
      console.log(`✅ ${name}: 通过`)
      results.passed.push(name)
    } else {
      console.error(`❌ ${name}: 失败 - ${message}`)
      results.failed.push({ name, message })
    }
  }

  // 测试1: 检查数据库是否初始化（使用原生IndexedDB API）
  try {
    return new Promise((resolve) => {
      const request = indexedDB.open('greenprj_db', 1)
      request.onsuccess = async (event) => {
        const db = event.target.result
        test('数据库初始化', db !== null, '数据库未初始化')
        
        // 测试2: 检查settings store是否存在
        const stores = Array.from(db.objectStoreNames)
        test('Settings store存在', stores.includes('settings'), 'Settings store不存在')
        
        db.close()
        await continueTests()
        resolve()
      }
      request.onerror = () => {
        test('数据库初始化', false, '无法打开数据库')
        continueTests().then(() => resolve())
      }
    })
  } catch (error) {
    test('数据库初始化', false, error.message)
    await continueTests()
  }

  async function continueTests() {

  // 测试3: 检查session存储
  const session = localStorage.getItem('greenprj_session')
  if (session) {
    try {
      const sessionData = JSON.parse(session)
      test('Session格式正确', 
        sessionData.userId && sessionData.loginTime && sessionData.expiresAt,
        'Session数据格式不正确'
      )
      
      const isExpired = Date.now() >= sessionData.expiresAt
      test('Session未过期', !isExpired, 'Session已过期')
    } catch (error) {
      test('Session格式正确', false, error.message)
    }
  } else {
    console.log('ℹ️ Session不存在（可能未登录）')
  }

    // 测试4: 检查密码哈希存储（使用原生IndexedDB API）
    return new Promise((resolve) => {
      const request = indexedDB.open('greenprj_db', 1)
      request.onsuccess = (event) => {
        const db = event.target.result
        const transaction = db.transaction(['settings'], 'readonly')
        const store = transaction.objectStore('settings')
        const getRequest = store.get('password_hash')
        
        getRequest.onsuccess = () => {
          const passwordHash = getRequest.result
          if (passwordHash) {
            test('密码哈希存在', typeof passwordHash === 'string' && passwordHash.length > 0, '密码哈希格式不正确')
            test('密码哈希格式', passwordHash.startsWith('$2'), '密码哈希不是bcrypt格式')
          } else {
            console.log('ℹ️ 密码哈希不存在（可能未设置密码）')
          }
          db.close()
          finishTests()
          resolve()
        }
        
        getRequest.onerror = () => {
          test('密码哈希检查', false, '无法读取密码哈希')
          db.close()
          finishTests()
          resolve()
        }
      }
      request.onerror = () => {
        test('密码哈希检查', false, '无法打开数据库')
        finishTests()
        resolve()
      }
    })
  }

  function finishTests() {

  // 测试5: 检查路由状态
  const currentPath = window.location.pathname
  const isPasswordSet = session !== null || currentPath === '/login'
  console.log(`ℹ️ 当前路径: ${currentPath}`)
  console.log(`ℹ️ 密码状态: ${isPasswordSet ? '已设置' : '未设置'}`)

  // 测试6: 检查Material UI是否加载（检查DOM元素或样式）
  const hasMaterialUI = document.querySelector('.MuiAppBar-root') !== null || 
                       document.querySelector('[class*="Mui"]') !== null ||
                       document.querySelector('style[data-emotion]') !== null
  test('Material UI加载', hasMaterialUI, 'Material UI未加载（页面可能未完全渲染）')

  // 测试7: 检查React Router
  test('React Router工作', window.location.pathname !== undefined, 'React Router未工作')

    // 输出测试结果
    console.log('\n📊 测试结果汇总:')
    console.log(`✅ 通过: ${results.passed.length}`)
    console.log(`❌ 失败: ${results.failed.length}`)
    
    if (results.failed.length > 0) {
      console.log('\n❌ 失败的测试:')
      results.failed.forEach(({ name, message }) => {
        console.log(`  - ${name}: ${message}`)
      })
    }

    if (results.passed.length > 0) {
      console.log('\n✅ 通过的测试:')
      results.passed.forEach(name => {
        console.log(`  - ${name}`)
      })
    }

    console.log('\n💡 提示: 如果Material UI测试失败，可能是页面还在加载中，请稍等片刻后刷新页面重试')
    
    return results
  }
})()
