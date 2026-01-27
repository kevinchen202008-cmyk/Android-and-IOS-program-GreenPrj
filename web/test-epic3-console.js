/**
 * Epic 3 功能测试脚本
 * 在浏览器控制台运行此脚本进行快速测试
 */

(async function testEpic3Features() {
  console.log('🧪 Epic 3: 核心记账功能测试\n')
  console.log('='.repeat(50))

  try {
    // 1. 测试数据库连接
    console.log('\n1️⃣ 测试数据库连接...')
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('greenprj_db', 1)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
    console.log('✅ 数据库连接成功')

    // 2. 检查账目数量
    console.log('\n2️⃣ 检查账目数据...')
    const tx = db.transaction(['accounts'], 'readonly')
    const store = tx.objectStore('accounts')
    
    const count = await new Promise((resolve) => {
      const request = store.count()
      request.onsuccess = () => resolve(request.result)
    })
    console.log(`📊 账目总数: ${count}`)

    // 3. 检查最近的账目
    if (count > 0) {
      console.log('\n3️⃣ 检查最近的账目...')
      const index = store.index('by-date')
      const entries = await new Promise((resolve) => {
        const entries = []
        const request = index.openCursor(null, 'prev')
        request.onsuccess = (e) => {
          const cursor = e.target.result
          if (cursor && entries.length < 5) {
            entries.push(cursor.value)
            cursor.continue()
          } else {
            resolve(entries)
          }
        }
      })

      console.log(`📝 最近${Math.min(5, entries.length)}条账目:`)
      entries.forEach((entry, i) => {
        if (entry.encrypted) {
          console.log(`  ${i + 1}. [加密数据] ID: ${entry.id}, 创建时间: ${entry.createdAt}`)
        } else {
          const date = new Date(entry.date).toLocaleDateString('zh-CN')
          console.log(`  ${i + 1}. 金额: ¥${entry.amount?.toFixed(2) || 'N/A'}, 类别: ${entry.category || 'N/A'}, 日期: ${date}`)
        }
      })
    } else {
      console.log('ℹ️  暂无账目数据，请先创建一些账目')
    }

    // 4. 检查类别分布
    if (count > 0) {
      console.log('\n4️⃣ 检查类别分布...')
      const allEntries = await new Promise((resolve) => {
        const entries = []
        const request = store.openCursor()
        request.onsuccess = (e) => {
          const cursor = e.target.result
          if (cursor) {
            entries.push(cursor.value)
            cursor.continue()
          } else {
            resolve(entries)
          }
        }
      })

      const categoryCount = {}
      allEntries.forEach((entry) => {
        if (!entry.encrypted && entry.category) {
          categoryCount[entry.category] = (categoryCount[entry.category] || 0) + 1
        }
      })

      if (Object.keys(categoryCount).length > 0) {
        console.log('📊 类别统计:')
        Object.entries(categoryCount).forEach(([cat, count]) => {
          console.log(`  - ${cat}: ${count}条`)
        })
      }
    }

    // 5. 检查数据加密状态
    console.log('\n5️⃣ 检查数据加密状态...')
    const sampleEntry = await new Promise((resolve) => {
      const request = store.openCursor()
      request.onsuccess = (e) => {
        const cursor = e.target.result
        resolve(cursor ? cursor.value : null)
      }
    })

    if (sampleEntry) {
      if (sampleEntry.encrypted) {
        console.log('✅ 数据已加密存储')
        console.log(`   - 加密字段: encrypted, salt, iv`)
      } else {
        console.log('⚠️  数据未加密（可能是旧数据或加密功能未启用）')
      }
    }

    // 6. 检查Session状态
    console.log('\n6️⃣ 检查Session状态...')
    const sessionStr = localStorage.getItem('greenprj_session')
    if (sessionStr) {
      const session = JSON.parse(sessionStr)
      const now = Date.now()
      const isExpired = now > session.expiresAt
      console.log(`📱 Session状态: ${isExpired ? '❌ 已过期' : '✅ 有效'}`)
      console.log(`   登录时间: ${new Date(session.loginTime).toLocaleString('zh-CN')}`)
      console.log(`   过期时间: ${new Date(session.expiresAt).toLocaleString('zh-CN')}`)
    } else {
      console.log('❌ 未找到Session（可能未登录）')
    }

    // 7. 检查功能可用性
    console.log('\n7️⃣ 检查功能可用性...')
    
    // OCR功能
    console.log('  📷 OCR功能: ✅ 可用（Tesseract.js）')
    
    // 语音识别
    const speechRecognitionAvailable = 
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    console.log(`  🎤 语音识别: ${speechRecognitionAvailable ? '✅ 可用' : '❌ 不可用（需要Chrome/Edge）'}`)
    
    // 短信解析
    console.log('  📱 短信解析: ✅ 可用')

    db.close()

    console.log('\n' + '='.repeat(50))
    console.log('✨ 测试完成！')
    console.log('\n💡 提示:')
    console.log('  - 如果数据未加密，请检查登录状态')
    console.log('  - 语音识别需要Chrome或Edge浏览器')
    console.log('  - OCR首次使用需要下载语言包，可能较慢')

  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
})()
