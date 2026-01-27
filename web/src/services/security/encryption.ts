/**
 * Data Encryption Service
 * Uses AES-256-GCM encryption with PBKDF2 key derivation
 */

/**
 * Derive encryption key from password using PBKDF2
 * @param password - User password
 * @param salt - Salt for key derivation (optional, will be generated if not provided)
 * @returns Promise resolving to { key: CryptoKey, salt: Uint8Array }
 */
async function deriveKey(
  password: string,
  salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
  const encoder = new TextEncoder()
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )

  // Generate salt if not provided
  const keySalt = salt || crypto.getRandomValues(new Uint8Array(16))

  // Derive key using PBKDF2 with 100,000+ iterations
  const iterations = 100000
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: keySalt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )

  return { key, salt: keySalt }
}

/**
 * Encrypt data using AES-256-GCM
 * @param data - Data to encrypt (string)
 * @param password - User password for key derivation
 * @returns Promise resolving to encrypted data with salt and IV
 */
export async function encryptData(
  data: string,
  password: string
): Promise<{ encrypted: string; salt: string; iv: string }> {
  try {
    const { key, salt } = await deriveKey(password)

    // Generate IV (Initialization Vector)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    // Encrypt data
    const encoder = new TextEncoder()
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      encoder.encode(data)
    )

    // Convert to base64 for storage
    const encryptedArray = new Uint8Array(encrypted)
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedArray))
    const saltBase64 = btoa(String.fromCharCode(...salt))
    const ivBase64 = btoa(String.fromCharCode(...iv))

    return {
      encrypted: encryptedBase64,
      salt: saltBase64,
      iv: ivBase64,
    }
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Decrypt data using AES-256-GCM
 * @param encryptedData - Encrypted data with salt and IV
 * @param password - User password for key derivation
 * @returns Promise resolving to decrypted data (string)
 */
export async function decryptData(
  encryptedData: { encrypted: string; salt: string; iv: string },
  password: string
): Promise<string> {
  try {
    // Convert from base64
    const encryptedArray = Uint8Array.from(atob(encryptedData.encrypted), (c) => c.charCodeAt(0))
    const saltArray = Uint8Array.from(atob(encryptedData.salt), (c) => c.charCodeAt(0))
    const ivArray = Uint8Array.from(atob(encryptedData.iv), (c) => c.charCodeAt(0))

    // Derive key using stored salt
    const { key } = await deriveKey(password, saltArray)

    // Decrypt data
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivArray,
      },
      key,
      encryptedArray
    )

    // Convert to string
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : String(error)}`)
  }
}
