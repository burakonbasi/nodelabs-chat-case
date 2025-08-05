export interface KeyPair {
    publicKey: CryptoKey;
    privateKey: CryptoKey;
  }
  
  export interface ExportedKeyPair {
    publicKey: string;
    privateKey: string;
  }
  
  export interface EncryptedMessage {
    ciphertext: string;
    iv: string;
    salt: string;
    publicKey?: string;
  }
  
  // Encryption configuration
  const ALGORITHM = {
    name: 'RSA-OAEP',
    modulusLength: 2048,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  };
  
  const AES_CONFIG = {
    name: 'AES-GCM',
    length: 256,
  };
  
  // Key management
  export const keyManagement = {
    // Generate key pair
    async generateKeyPair(): Promise<KeyPair> {
      const keyPair = await crypto.subtle.generateKey(
        ALGORITHM,
        true,
        ['encrypt', 'decrypt']
      );
      
      return keyPair as KeyPair;
    },
  
    // Export key pair to base64
    async exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair> {
      const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      
      return {
        publicKey: arrayBufferToBase64(publicKey),
        privateKey: arrayBufferToBase64(privateKey),
      };
    },
  
    // Import key pair from base64
    async importKeyPair(exported: ExportedKeyPair): Promise<KeyPair> {
      const publicKey = await crypto.subtle.importKey(
        'spki',
        base64ToArrayBuffer(exported.publicKey),
        ALGORITHM,
        true,
        ['encrypt']
      );
      
      const privateKey = await crypto.subtle.importKey(
        'pkcs8',
        base64ToArrayBuffer(exported.privateKey),
        ALGORITHM,
        true,
        ['decrypt']
      );
      
      return { publicKey, privateKey };
    },
  
    // Import public key only
    async importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
      return await crypto.subtle.importKey(
        'spki',
        base64ToArrayBuffer(publicKeyBase64),
        ALGORITHM,
        true,
        ['encrypt']
      );
    },
  
    // Generate AES key
    async generateAESKey(): Promise<CryptoKey> {
      return await crypto.subtle.generateKey(AES_CONFIG, true, ['encrypt', 'decrypt']);
    },
  
    // Derive key from password
    async deriveKeyFromPassword(password: string, salt: Uint8Array): Promise<CryptoKey> {
      const encoder = new TextEncoder();
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
      );
      
      return await crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: 100000,
          hash: 'SHA-256',
        },
        passwordKey,
        AES_CONFIG,
        true,
        ['encrypt', 'decrypt']
      );
    },
  };
  
  // Message encryption
  export const messageEncryption = {
    // Encrypt message with recipient's public key
    async encryptMessage(
      message: string,
      recipientPublicKey: CryptoKey
    ): Promise<EncryptedMessage> {
      const encoder = new TextEncoder();
      const messageData = encoder.encode(message);
      
      // Generate AES key for message
      const aesKey = await keyManagement.generateAESKey();
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt message with AES
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        aesKey,
        messageData
      );
      
      // Export AES key
      const aesKeyData = await crypto.subtle.exportKey('raw', aesKey);
      
      // Encrypt AES key with recipient's public key
      const encryptedKey = await crypto.subtle.encrypt(
        ALGORITHM,
        recipientPublicKey,
        aesKeyData
      );
      
      return {
        ciphertext: arrayBufferToBase64(ciphertext),
        iv: arrayBufferToBase64(iv),
        salt: arrayBufferToBase64(encryptedKey),
      };
    },
  
    // Decrypt message with private key
    async decryptMessage(
      encrypted: EncryptedMessage,
      privateKey: CryptoKey
    ): Promise<string> {
      // Decrypt AES key with private key
      const aesKeyData = await crypto.subtle.decrypt(
        ALGORITHM,
        privateKey,
        base64ToArrayBuffer(encrypted.salt)
      );
      
      // Import AES key
      const aesKey = await crypto.subtle.importKey(
        'raw',
        aesKeyData,
        AES_CONFIG,
        true,
        ['decrypt']
      );
      
      // Decrypt message with AES key
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: base64ToArrayBuffer(encrypted.iv),
        },
        aesKey,
        base64ToArrayBuffer(encrypted.ciphertext)
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decrypted);
    },
  
    // Encrypt for multiple recipients
    async encryptForGroup(
      message: string,
      recipientPublicKeys: Map<string, CryptoKey>
    ): Promise<Map<string, EncryptedMessage>> {
      const encoder = new TextEncoder();
      const messageData = encoder.encode(message);
      
      // Generate AES key for message
      const aesKey = await keyManagement.generateAESKey();
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt message with AES
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        aesKey,
        messageData
      );
      
      // Export AES key
      const aesKeyData = await crypto.subtle.exportKey('raw', aesKey);
      
      // Encrypt AES key for each recipient
      const encryptedMessages = new Map<string, EncryptedMessage>();
      
      for (const [userId, publicKey] of recipientPublicKeys) {
        const encryptedKey = await crypto.subtle.encrypt(
          ALGORITHM,
          publicKey,
          aesKeyData
        );
        
        encryptedMessages.set(userId, {
          ciphertext: arrayBufferToBase64(ciphertext),
          iv: arrayBufferToBase64(iv),
          salt: arrayBufferToBase64(encryptedKey),
        });
      }
      
      return encryptedMessages;
    },
  };
  
  // File encryption
  export const fileEncryption = {
    // Encrypt file
    async encryptFile(
      file: File,
      recipientPublicKey: CryptoKey
    ): Promise<{ encrypted: Blob; metadata: EncryptedMessage }> {
      // Read file as array buffer
      const fileData = await file.arrayBuffer();
      
      // Generate AES key
      const aesKey = await keyManagement.generateAESKey();
      
      // Generate IV
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      // Encrypt file with AES
      const ciphertext = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        aesKey,
        fileData
      );
      
      // Export AES key
      const aesKeyData = await crypto.subtle.exportKey('raw', aesKey);
      
      // Encrypt AES key with recipient's public key
      const encryptedKey = await crypto.subtle.encrypt(
        ALGORITHM,
        recipientPublicKey,
        aesKeyData
      );
      
      const encryptedBlob = new Blob([ciphertext], { type: 'application/octet-stream' });
      
      return {
        encrypted: encryptedBlob,
        metadata: {
          ciphertext: '', // Not used for files
          iv: arrayBufferToBase64(iv),
          salt: arrayBufferToBase64(encryptedKey),
        },
      };
    },
  
    // Decrypt file
    async decryptFile(
      encryptedBlob: Blob,
      metadata: EncryptedMessage,
      privateKey: CryptoKey,
      originalType: string
    ): Promise<File> {
      // Read encrypted data
      const encryptedData = await encryptedBlob.arrayBuffer();
      
      // Decrypt AES key with private key
      const aesKeyData = await crypto.subtle.decrypt(
        ALGORITHM,
        privateKey,
        base64ToArrayBuffer(metadata.salt)
      );
      
      // Import AES key
      const aesKey = await crypto.subtle.importKey(
        'raw',
        aesKeyData,
        AES_CONFIG,
        true,
        ['decrypt']
      );
      
      // Decrypt file with AES key
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: base64ToArrayBuffer(metadata.iv),
        },
        aesKey,
        encryptedData
      );
      
      return new File([decrypted], 'decrypted-file', { type: originalType });
    },
  };
  
  // Digital signatures
  export const signatures = {
    // Sign message
    async signMessage(message: string, privateKey: CryptoKey): Promise<string> {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      const signature = await crypto.subtle.sign(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        privateKey,
        data
      );
      
      return arrayBufferToBase64(signature);
    },
  
    // Verify signature
    async verifySignature(
      message: string,
      signature: string,
      publicKey: CryptoKey
    ): Promise<boolean> {
      const encoder = new TextEncoder();
      const data = encoder.encode(message);
      
      return await crypto.subtle.verify(
        {
          name: 'RSA-PSS',
          saltLength: 32,
        },
        publicKey,
        base64ToArrayBuffer(signature),
        data
      );
    },
  };
  
  // Utility functions
  function arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    
    return btoa(binary);
  }
  
  function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    
    return bytes.buffer;
  }
  
  // Secure storage
  export const secureStorage = {
    // Store encrypted data
    async store(key: string, data: any, password: string): Promise<void> {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const derivedKey = await keyManagement.deriveKeyFromPassword(password, salt);
      
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      const encodedData = encoder.encode(dataString);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      
      const encrypted = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv,
        },
        derivedKey,
        encodedData
      );
      
      const stored = {
        encrypted: arrayBufferToBase64(encrypted),
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
      };
      
      localStorage.setItem(key, JSON.stringify(stored));
    },
  
    // Retrieve encrypted data
    async retrieve(key: string, password: string): Promise<any> {
      const storedString = localStorage.getItem(key);
      if (!storedString) return null;
      
      const stored = JSON.parse(storedString);
      const salt = base64ToArrayBuffer(stored.salt);
      const derivedKey = await keyManagement.deriveKeyFromPassword(password, salt);
      
      const decrypted = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: base64ToArrayBuffer(stored.iv),
        },
        derivedKey,
        base64ToArrayBuffer(stored.encrypted)
      );
      
      const decoder = new TextDecoder();
      const dataString = decoder.decode(decrypted);
      return JSON.parse(dataString);
    },
  
    // Remove encrypted data
    remove(key: string): void {
      localStorage.removeItem(key);
    },
  };
  
  // Export all encryption utilities
  export default {
    keyManagement,
    messageEncryption,
    fileEncryption,
    signatures,
    secureStorage,
  };