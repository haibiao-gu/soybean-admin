/**
 * Crypto utility using Web Crypto API (native browser crypto, no external deps).
 * Replaces the previous crypto-js based implementation.
 *
 * Two encryption schemes:
 * - Crypto<T>:    AES-CBC + PBKDF2 (random salt), for encrypting JSON-serializable objects.
 * - Token crypto: AES-GCM + PBKDF2 (fixed salt), for encrypting/decrypting token strings.
 */

// ── Shared helpers ──────────────────────────────────────────────────────────

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

function bufferToHex(buffer: ArrayBuffer | ArrayLike<number>): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

// ── CBC scheme (Crypto<T>) ─────────────────────────────────────────────────

async function deriveCbcKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export class Crypto<T extends object> {
  /** Secret */
  secret: string;

  constructor(secret: string) {
    this.secret = secret;
  }

  async encrypt(data: T): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveCbcKey(this.secret, salt);

    const dataString = JSON.stringify(data);
    const encoded = ENCODER.encode(dataString);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv },
      key,
      encoded
    );

    // Format: salt(hex):iv(hex):ciphertext(hex)
    return `${bufferToHex(salt)}:${bufferToHex(iv)}:${bufferToHex(encrypted)}`;
  }

  async decrypt(encrypted: string): Promise<T | null> {
    try {
      const parts = encrypted.split(':');
      if (parts.length !== 3) {
        console.error('[Crypto] Invalid encrypted format');
        return null;
      }

      const [saltHex, ivHex, cipherHex] = parts;
      const salt = hexToBuffer(saltHex);
      const iv = hexToBuffer(ivHex);
      const ciphertext = hexToBuffer(cipherHex);
      const key = await deriveCbcKey(this.secret, salt);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-CBC', iv: toArrayBuffer(iv) },
        key,
        toArrayBuffer(ciphertext)
      );

      const dataString = DECODER.decode(decrypted);
      return JSON.parse(dataString) as T;
    } catch (err) {
      console.error('[Crypto] Decrypt error:', err);
      return null;
    }
  }
}

// ── GCM scheme (Token) ──────────────────────────────────────────────────────

const TOKEN_SALT = new Uint8Array([
  0x73, 0x6f, 0x79, 0x62, 0x65, 0x61, 0x6e, 0x2d,
  0x61, 0x64, 0x6d, 0x69, 0x6e, 0x2d, 0x76, 0x33
]);

async function deriveGcmKey(rawSecret: string): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    ENCODER.encode(rawSecret),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: TOKEN_SALT,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

function getTokenSecret(): string {
  const meta = import.meta as ImportMeta & { env?: Record<string, string | undefined> };
  return meta.env?.VITE_TOKEN_SECRET || 'soybean-admin-token-key-2024';
}

export async function encryptToken(plainText: string): Promise<string> {
  const key = await deriveGcmKey(getTokenSecret());
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = ENCODER.encode(plainText);
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  return `${bufferToHex(iv)}:${bufferToHex(new Uint8Array(encrypted))}`;
}

export async function decryptToken(cipher: string): Promise<string | null> {
  try {
    const parts = cipher.split(':');
    if (parts.length !== 2) return null;

    const key = await deriveGcmKey(getTokenSecret());
    const iv = hexToBuffer(parts[0]);
    const data = hexToBuffer(parts[1]);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(data));
    return DECODER.decode(decrypted);
  } catch {
    return null;
  }
}
