/**
 * In-memory encryption password manager
 *
 * 仅在前端内存中保存当前会话的加密口令（由用户密码派生），
 * 不写入 localStorage / IndexedDB / Cookie。
 *
 * 注意：
 * - 页面刷新或关闭后会丢失，需要用户重新登录（当前产品行为已如此）。
 * - 这是从「session 里存明文密码」迁移出来的过渡实现，比之前安全很多。
 */

let encryptionPassword: string | null = null

/**
 * 设置当前会话的加密口令
 * 通常在登录 / 设置密码成功后调用。
 */
export function setEncryptionPassword(password: string): void {
  encryptionPassword = password
}

/**
 * 获取当前会话的加密口令
 * 如果未登录或会话已清理，返回 null。
 */
export function getEncryptionPassword(): string | null {
  return encryptionPassword
}

/**
 * 清除当前会话的加密口令
 * 在登出 / 会话过期 / 删除所有数据时调用。
 */
export function clearEncryptionPassword(): void {
  encryptionPassword = null
}

