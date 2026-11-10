/**
 * SecretPix — Cryptographic Engine (Web Crypto API)
 *
 * Implements:
 * - PBKDF2 key derivation (SHA-256, 600,000 iterations)
 * - AES-256-GCM authenticated encryption and decryption
 * - CSPRNG salt (16 bytes) and IV (12 bytes) generation
 * - Sanitized domain error handling
 */

import { CONFIG } from './config.js';

/**
 * Custom Cryptographic Errors
 */
export class CryptoError extends Error {
  constructor(message, code = 'CRYPTO_ERROR') {
    super(message);
    this.name = 'CryptoError';
    this.code = code;
  }
}

export class InvalidPasswordError extends CryptoError {
  constructor(message = 'Incorrect password or corrupted data. Decryption authentication failed.') {
    super(message, 'INVALID_PASSWORD');
    this.name = 'InvalidPasswordError';
  }
}

/**
 * Generate cryptographically secure random bytes
 * @param {number} length - Number of bytes
 * @returns {Uint8Array}
 */
export function getRandomBytes(length) {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    throw new CryptoError('Web Crypto API is not supported in this environment.');
  }
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

/**
 * Generate a cryptographically secure random password
 *
 * Uses the CSPRNG with rejection sampling to avoid modulo bias, and an
 * unambiguous default charset (no easily confused characters like 0/O or 1/l/I).
 * A 20-character password from the 54-character default alphabet provides
 * ~115 bits of entropy, far beyond practical offline guessing attacks.
 *
 * @param {number} length - Desired password length (default: CONFIG.PASSWORD_GENERATION.LENGTH)
 * @param {string} charset - Allowed characters (default: CONFIG.PASSWORD_GENERATION.CHARSET)
 * @returns {string}
 */
export function generateSecurePassword(
  length = CONFIG.PASSWORD_GENERATION.LENGTH,
  charset = CONFIG.PASSWORD_GENERATION.CHARSET
) {
  if (!Number.isInteger(length) || length < 1) {
    throw new CryptoError('Password length must be a positive integer.');
  }
  if (typeof charset !== 'string' || charset.length < 2) {
    throw new CryptoError('Password charset must contain at least 2 characters.');
  }

  // Largest multiple of charset.length that fits in a byte; bytes at or above
  // this value are discarded so every character is equally likely.
  const maxUnbiased = Math.floor(256 / charset.length) * charset.length;

  const result = [];
  while (result.length < length) {
    const bytes = getRandomBytes(length);
    for (let i = 0; i < bytes.length && result.length < length; i++) {
      if (bytes[i] < maxUnbiased) {
        result.push(charset[bytes[i] % charset.length]);
      }
    }
  }

  return result.join('');
}

/**
 * Derive an AES-256-GCM CryptoKey from a password and salt using PBKDF2
 * @param {string} password - User-provided password
 * @param {Uint8Array} salt - 16-byte random salt
 * @param {number} iterations - PBKDF2 iteration count (default 600,000)
 * @returns {Promise<CryptoKey>}
 */
export async function deriveKey(
  password,
  salt,
  iterations = CONFIG.CRYPTO.PBKDF2_ITERATIONS
) {
  if (!password || typeof password !== 'string') {
    throw new CryptoError('A valid password string is required for key derivation.');
  }
  if (!salt || !(salt instanceof Uint8Array) || salt.length !== CONFIG.CRYPTO.SALT_LENGTH_BYTES) {
    throw new CryptoError(`Salt must be a Uint8Array of exactly ${CONFIG.CRYPTO.SALT_LENGTH_BYTES} bytes.`);
  }

  const textEncoder = new TextEncoder();
  const passwordBytes = textEncoder.encode(password);

  // 1. Import raw password bytes as a PBKDF2 master key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveKey']
  );

  // 2. Derive 256-bit AES-GCM encryption key
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: CONFIG.CRYPTO.PBKDF2_HASH,
    },
    baseKey,
    {
      name: CONFIG.CRYPTO.ALGORITHM,
      length: CONFIG.CRYPTO.KEY_LENGTH,
    },
    false, // Key is non-extractable for memory security
    ['encrypt', 'decrypt']
  );

  return derivedKey;
}

/**
 * Encrypt a plaintext message using AES-256-GCM
 * @param {string} plaintext - Plaintext message to encrypt
 * @param {string} password - User password
 * @returns {Promise<{ ciphertext: Uint8Array, salt: Uint8Array, iv: Uint8Array }>}
 */
export async function encryptMessage(plaintext, password) {
  if (typeof plaintext !== 'string' || plaintext.length === 0) {
    throw new CryptoError('Cannot encrypt empty or invalid message.');
  }
  if (!password || typeof password !== 'string') {
    throw new CryptoError('Password cannot be empty.');
  }

  // 1. Generate fresh CSPRNG salt and IV
  const salt = getRandomBytes(CONFIG.CRYPTO.SALT_LENGTH_BYTES);
  const iv = getRandomBytes(CONFIG.CRYPTO.IV_LENGTH_BYTES);

  // 2. Derive AES key via PBKDF2 (600,000 rounds)
  const key = await deriveKey(password, salt);

  // 3. Encode plaintext to UTF-8 bytes
  const textEncoder = new TextEncoder();
  const plaintextBytes = textEncoder.encode(plaintext);

  // 4. Encrypt with AES-GCM (128-bit authentication tag appended automatically)
  let encryptedBuffer;
  try {
    encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: CONFIG.CRYPTO.ALGORITHM,
        iv: iv,
        tagLength: CONFIG.CRYPTO.TAG_LENGTH_BITS,
      },
      key,
      plaintextBytes
    );
  } catch (err) {
    throw new CryptoError(`Encryption operation failed: ${err.message}`);
  }

  return {
    ciphertext: new Uint8Array(encryptedBuffer),
    salt,
    iv,
  };
}

/**
 * Decrypt a ciphertext buffer using AES-256-GCM
 * @param {Uint8Array} ciphertext - Encrypted ciphertext with appended 128-bit auth tag
 * @param {Uint8Array} salt - 16-byte PBKDF2 salt
 * @param {Uint8Array} iv - 12-byte AES-GCM initialization vector
 * @param {string} password - User-provided password
 * @returns {Promise<string>} - Decrypted plaintext string
 */
export async function decryptMessage(ciphertext, salt, iv, password) {
  if (!ciphertext || !(ciphertext instanceof Uint8Array) || ciphertext.length === 0) {
    throw new CryptoError('Invalid ciphertext buffer.');
  }
  if (!salt || !(salt instanceof Uint8Array) || salt.length !== CONFIG.CRYPTO.SALT_LENGTH_BYTES) {
    throw new CryptoError('Invalid cryptographic salt.');
  }
  if (!iv || !(iv instanceof Uint8Array) || iv.length !== CONFIG.CRYPTO.IV_LENGTH_BYTES) {
    throw new CryptoError('Invalid initialization vector (IV).');
  }
  if (!password || typeof password !== 'string') {
    throw new CryptoError('Password is required for decryption.');
  }

  // 1. Re-derive key using identical parameters and salt
  const key = await deriveKey(password, salt);

  // 2. Decrypt with AES-GCM (verifies 128-bit authentication tag)
  let decryptedBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: CONFIG.CRYPTO.ALGORITHM,
        iv: iv,
        tagLength: CONFIG.CRYPTO.TAG_LENGTH_BITS,
      },
      key,
      ciphertext
    );
  } catch (err) {
    // If decryption fails (authentication tag mismatch or invalid key), Web Crypto throws an OperationError.
    // We sanitize this into a secure, domain-friendly InvalidPasswordError.
    throw new InvalidPasswordError();
  }

  // 3. Decode UTF-8 bytes to plaintext string
  const textDecoder = new TextDecoder('utf-8', { fatal: true });
  try {
    return textDecoder.decode(decryptedBuffer);
  } catch (decodeErr) {
    throw new CryptoError('Decrypted payload contains invalid UTF-8 characters.');
  }
}
