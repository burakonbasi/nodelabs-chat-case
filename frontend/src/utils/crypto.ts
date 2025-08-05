// Crypto utilities for end-to-end encryption and security

export interface KeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }
  
  export interface EncryptedData {
    ciphertext: ArrayBuffer;
    iv: Uint8Array;
    salt?: Uint8Array;
  }
  
  export interface SignedData {
    data: ArrayBuffer;
    signature: ArrayBuffer;
  }
  
  // Generate random values
  export function generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }
  
  export function generateUUID(): string {
    if ('randomUUID' in crypto) {
      return crypto.randomUUID();
    }
    
    // Fallback implementation
    const bytes = generateRandomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10
    
    const hex = Array.from(bytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }
  
  // Generate cryptographically secure random string
  export function generateSecureRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = generateRandomBytes(length);
    
    return Array.from(values)
      .map(x => charset[x % charset.length])
      .join('');
  }
  
  // Key generation
  export async function generateKeyPair(): Promise<KeyPair> {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256'
      },
      true,
      ['encrypt', 'decrypt']
    );
    
    return keyPair;
  }
  
  export async function generateSymmetricKey(): Promise<CryptoKey> {
    return crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Key derivation from password
  export async function deriveKeyFromPassword(
    password: string,
    salt: Uint8Array,
    iterations: number = 100000
  ): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    const importedKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations,
        hash: 'SHA-256'
      },
      importedKey,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  // Encryption/Decryption
  export async function encryptData(
    data: ArrayBuffer | string,
    key: CryptoKey
  ): Promise<EncryptedData> {
    const iv = generateRandomBytes(12); // 96 bits for GCM
    
    const dataBuffer = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;
    
    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );
    
    return { ciphertext, iv };
  }
  
  export async function decryptData(
    encryptedData: EncryptedData,
    key: CryptoKey
  ): Promise<ArrayBuffer> {
    return crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encryptedData.iv
      },
      key,
      encryptedData.ciphertext
    );
  }
  
  // String encryption helpers
  export async function encryptString(
    text: string,
    key: CryptoKey
  ): Promise<string> {
    const encrypted = await encryptData(text, key);
    
    // Combine IV and ciphertext
    const combined = new Uint8Array(encrypted.iv.length + encrypted.ciphertext.byteLength);
    combined.set(encrypted.iv, 0);
    combined.set(new Uint8Array(encrypted.ciphertext), encrypted.iv.length);
    
    // Convert to base64
    return btoa(String.fromCharCode(...combined));
  }
  
  export async function decryptString(
    encryptedText: string,
    key: CryptoKey
  ): Promise<string> {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedText), c => c.charCodeAt(0));
    
    // Extract IV and ciphertext
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await decryptData(
      { ciphertext: ciphertext.buffer, iv },
      key
    );
    
    return new TextDecoder().decode(decrypted);
  }
  
  // Hashing
  export async function hashData(
    data: ArrayBuffer | string,
    algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'
  ): Promise<ArrayBuffer> {
    const dataBuffer = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;
    
    return crypto.subtle.digest(algorithm, dataBuffer);
  }
  
  export async function hashString(
    text: string,
    algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256'
  ): Promise<string> {
    const hash = await hashData(text, algorithm);
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Digital signatures
  export async function signData(
    data: ArrayBuffer | string,
    privateKey: CryptoKey
  ): Promise<SignedData> {
    const dataBuffer = typeof data === 'string'
      ? new TextEncoder().encode(data)
      : data;
    
    const signature = await crypto.subtle.sign(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      privateKey,
      dataBuffer
    );
    
    return {
      data: dataBuffer,
      signature
    };
  }
  
  export async function verifySignature(
    signedData: SignedData,
    publicKey: CryptoKey
  ): Promise<boolean> {
    return crypto.subtle.verify(
      {
        name: 'RSA-PSS',
        saltLength: 32
      },
      publicKey,
      signedData.signature,
      signedData.data
    );
  }
  
  // Key storage helpers
  export async function exportKey(key: CryptoKey): Promise<JsonWebKey> {
    return crypto.subtle.exportKey('jwk', key);
  }
  
  export async function importKey(
    keyData: JsonWebKey,
    keyUsages: KeyUsage[]
  ): Promise<CryptoKey> {
    const algorithm = keyData.alg?.startsWith('RS') 
      ? { name: 'RSA-OAEP', hash: 'SHA-256' }
      : { name: 'AES-GCM' };
    
    return crypto.subtle.importKey(
      'jwk',
      keyData,
      algorithm,
      true,
      keyUsages
    );
  }
  
  // Secure comparison (timing-safe)
  export function secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
  
  // Password strength checker
  export interface PasswordStrength {
    score: number; // 0-4
    feedback: string[];
    isStrong: boolean;
  }
  
  export function checkPasswordStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    else feedback.push('Use at least 12 characters');
    
    // Character variety
    if (/[a-z]/.test(password)) score += 0.5;
    else feedback.push('Include lowercase letters');
    
    if (/[A-Z]/.test(password)) score += 0.5;
    else feedback.push('Include uppercase letters');
    
    if (/[0-9]/.test(password)) score += 0.5;
    else feedback.push('Include numbers');
    
    if (/[^a-zA-Z0-9]/.test(password)) score += 0.5;
    else feedback.push('Include special characters');
    
    // Common patterns
    if (!/(.)\1{2,}/.test(password)) score += 0.5;
    else feedback.push('Avoid repeated characters');
    
    if (!/12345|qwerty|password/i.test(password)) score += 0.5;
    else feedback.push('Avoid common patterns');
    
    return {
      score: Math.min(4, Math.floor(score)),
      feedback,
      isStrong: score >= 3
    };
  }
  
  // TOTP (Time-based One-Time Password) generator
  export async function generateTOTP(
    secret: string,
    timeStep: number = 30,
    digits: number = 6
  ): Promise<string> {
    const time = Math.floor(Date.now() / 1000 / timeStep);
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(4, time, false);
    
    // Convert base32 secret to bytes
    const secretBytes = base32ToBytes(secret);
    
    // Import key
    const key = await crypto.subtle.importKey(
      'raw',
      secretBytes,
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    
    // Generate HMAC
    const hmac = await crypto.subtle.sign('HMAC', key, timeBuffer);
    const hmacArray = new Uint8Array(hmac);
    
    // Dynamic truncation
    const offset = hmacArray[hmacArray.length - 1] & 0x0f;
    const code = (
      ((hmacArray[offset] & 0x7f) << 24) |
      ((hmacArray[offset + 1] & 0xff) << 16) |
      ((hmacArray[offset + 2] & 0xff) << 8) |
      (hmacArray[offset + 3] & 0xff)
    );
    
    const otp = code % Math.pow(10, digits);
    return otp.toString().padStart(digits, '0');
  }
  
  // Base32 decoder for TOTP
  function base32ToBytes(base32: string): Uint8Array {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    const bytes: number[] = [];
    let bits = 0;
    let value = 0;
    
    for (const char of base32.toUpperCase()) {
      if (char === '=') break;
      
      const index = alphabet.indexOf(char);
      if (index === -1) throw new Error('Invalid base32 character');
      
      value = (value << 5) | index;
      bits += 5;
      
      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    
    return new Uint8Array(bytes);
  }
  
  // Generate backup codes
  export function generateBackupCodes(count: number = 8, length: number = 8): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const code = generateSecureRandomString(length)
        .toUpperCase()
        .match(/.{1,4}/g)
        ?.join('-') || '';
      codes.push(code);
    }
    
    return codes;
  }