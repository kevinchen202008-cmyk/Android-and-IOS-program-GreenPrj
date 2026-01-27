# 手动测试步骤指南

由于环境限制，请按照以下步骤手动执行测试。

## 第一步：安装依赖

在终端中执行：

```bash
cd "d:\Projects\Android and IOS program-GreenPrj\web"
npm install
```

**预期输出：**
- 应该看到所有依赖包安装成功
- 不应该有错误信息（警告可以忽略）

**如果失败：**
- 检查网络连接
- 尝试使用 `npm install --legacy-peer-deps`
- 或使用 `yarn install` 替代

## 第二步：启动开发服务器

```bash
npm run dev
```

**预期输出：**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**如果失败：**
- 检查端口3000是否被占用
- 尝试修改 `vite.config.ts` 中的端口号

## 第三步：打开浏览器测试

### 3.1 打开应用

1. 打开浏览器（Chrome/Edge/Firefox）
2. 访问 `http://localhost:3000`
3. 打开开发者工具（按F12）
4. 切换到 **Console** 标签

### 3.2 运行自动化测试脚本

1. 在Console中，复制粘贴 `test-automation.js` 文件的内容
2. 按Enter执行
3. 查看测试结果

### 3.3 手动功能测试

按照 `TEST_CHECKLIST.md` 中的步骤逐一测试：

#### 测试1: 密码设置
- [ ] 输入密码（至少6字符）
- [ ] 确认密码
- [ ] 点击"设置密码"
- [ ] 验证跳转到主页

#### 测试2: 登录
- [ ] 点击"退出"
- [ ] 输入密码登录
- [ ] 验证登录成功

#### 测试3: 修改密码
- [ ] 点击"修改密码"
- [ ] 输入当前密码和新密码
- [ ] 验证修改成功并自动登出

## 第四步：验证数据存储

在浏览器Console中执行以下命令验证数据：

### 检查IndexedDB
```javascript
const db = await idb.openDB('greenprj_db', 1)
console.log('Object stores:', Array.from(db.objectStoreNames))
const passwordHash = await db.get('settings', 'password_hash')
console.log('Password hash exists:', !!passwordHash)
db.close()
```

### 检查Session
```javascript
const session = JSON.parse(localStorage.getItem('greenprj_session') || 'null')
console.log('Session:', session)
if (session) {
  console.log('Expires at:', new Date(session.expiresAt))
  console.log('Time until expiry:', Math.round((session.expiresAt - Date.now()) / 1000 / 60), 'minutes')
}
```

## 第五步：报告测试结果

请记录以下信息：

1. **安装是否成功：** ✅ / ❌
2. **服务器是否启动：** ✅ / ❌
3. **应用是否打开：** ✅ / ❌
4. **自动化测试结果：** 通过 X / 失败 Y
5. **功能测试结果：** 
   - 密码设置：✅ / ❌
   - 登录功能：✅ / ❌
   - 修改密码：✅ / ❌
   - 会话管理：✅ / ❌
6. **发现的问题：** （如有）

## 常见问题解决

### 问题1: npm install 失败
**解决方案：**
```bash
# 清除npm缓存
npm cache clean --force

# 删除node_modules和package-lock.json
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 问题2: 端口被占用
**解决方案：**
修改 `vite.config.ts`：
```typescript
server: {
  port: 3001, // 改为其他端口
}
```

### 问题3: 页面空白
**检查：**
- 浏览器Console是否有错误
- Network标签是否有404错误
- 确认所有文件都已保存

### 问题4: 数据库错误
**解决方案：**
在Console执行：
```javascript
// 删除数据库重新初始化
indexedDB.deleteDatabase('greenprj_db').then(() => {
  console.log('Database deleted, reload page')
  location.reload()
})
```

## 需要帮助？

如果遇到问题，请提供：
1. 浏览器Console的错误信息
2. 终端中的错误输出
3. 具体是哪个测试步骤失败
4. 截图（如果有）
