/**
 * Session Management Service
 * Manages user sessions with 30-minute timeout
 */

const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const SESSION_WARNING_MS = 25 * 60 * 1000 // 25 minutes (warning before timeout)
const SESSION_STORAGE_KEY = 'greenprj_session'

export interface Session {
  userId: string
  loginTime: number
  lastActivityTime: number
  expiresAt: number
}

let sessionTimeoutId: ReturnType<typeof setTimeout> | null = null
let sessionWarningId: ReturnType<typeof setTimeout> | null = null
let onSessionExpiredCallback: (() => void) | null = null
let onSessionWarningCallback: (() => void) | null = null

/**
 * Create a new session
 * @param userId - User ID
 * @returns Session object
 */
export function createSession(userId: string): Session {
  const now = Date.now()
  const session: Session = {
    userId,
    loginTime: now,
    lastActivityTime: now,
    expiresAt: now + SESSION_TIMEOUT_MS,
  }

  // Store session in localStorage
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))

  // Set up timeout
  setupSessionTimeout(session.expiresAt)

  return session
}

/**
 * Get current session
 * @returns Session if valid, null otherwise
 */
export function getSession(): Session | null {
  try {
    const sessionData = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!sessionData) {
      return null
    }

    const session: Session = JSON.parse(sessionData)
    const now = Date.now()

    // Check if session is expired
    if (now >= session.expiresAt) {
      clearSession()
      return null
    }

    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}

/**
 * Update last activity time
 */
export function updateActivity(): void {
  const session = getSession()
  if (!session) {
    return
  }

  const now = Date.now()
  session.lastActivityTime = now
  session.expiresAt = now + SESSION_TIMEOUT_MS

  // Store updated session
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))

  // Reset timeout
  setupSessionTimeout(session.expiresAt)
}

/**
 * Clear session
 */
export function clearSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEY)
  clearSessionTimeout()
}

/**
 * Check if user is logged in
 * @returns true if valid session exists
 */
export function isLoggedIn(): boolean {
  return getSession() !== null
}

/**
 * Setup session timeout
 */
function setupSessionTimeout(expiresAt: number): void {
  clearSessionTimeout()

  const now = Date.now()
  const timeUntilExpiry = expiresAt - now

  if (timeUntilExpiry <= 0) {
    handleSessionExpired()
    return
  }

  // Set warning at 25 minutes
  const timeUntilWarning = timeUntilExpiry - (SESSION_TIMEOUT_MS - SESSION_WARNING_MS)
  if (timeUntilWarning > 0) {
    sessionWarningId = setTimeout(() => {
      if (onSessionWarningCallback) {
        onSessionWarningCallback()
      }
    }, timeUntilWarning)
  }

  // Set expiry timeout
  sessionTimeoutId = setTimeout(() => {
    handleSessionExpired()
  }, timeUntilExpiry)
}

/**
 * Clear session timeout
 */
function clearSessionTimeout(): void {
  if (sessionTimeoutId) {
    clearTimeout(sessionTimeoutId)
    sessionTimeoutId = null
  }
  if (sessionWarningId) {
    clearTimeout(sessionWarningId)
    sessionWarningId = null
  }
}

/**
 * Handle session expired
 */
function handleSessionExpired(): void {
  clearSession()
  if (onSessionExpiredCallback) {
    onSessionExpiredCallback()
  }
}

/**
 * Set callback for session expired
 */
export function setOnSessionExpired(callback: () => void): void {
  onSessionExpiredCallback = callback
}

/**
 * Set callback for session warning
 */
export function setOnSessionWarning(callback: () => void): void {
  onSessionWarningCallback = callback
}

/**
 * Initialize session manager
 * Should be called on app startup
 */
export function initializeSessionManager(): void {
  const session = getSession()
  if (session) {
    setupSessionTimeout(session.expiresAt)
  }

  // Update activity on user interactions
  const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
  events.forEach((event) => {
    window.addEventListener(event, updateActivity, { passive: true })
  })
}
