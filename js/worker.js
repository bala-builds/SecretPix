/**
 * SecretPix — Dedicated Web Worker for Cryptography & Steganography
 *
 * Runs off the main UI thread to prevent UI freezing during:
 * - PBKDF2 key derivation (600,000 SHA-256 iterations)
 * - Intensive pixel traversal across multi-megapixel images
 */

import { encryptMessage, decryptMessage, InvalidPasswordError } from './crypto.js';
import {
  packPayload,
  embedPayloadInImageData,
  extractPayloadFromImageData,
  NoSecretPixDataError,
  CapacityExceededError
} from './steganography.js';

self.onmessage = async (e) => {
  const { type, payload } = e.data;

  try {
    if (type === 'ENCRYPT_AND_EMBED') {
      const { imageData, message, password } = payload;

      // Stage 1: Deriving key and encrypting
      self.postMessage({
        status: 'PROGRESS',
        stage: 'Deriving key with PBKDF2 (600k rounds) & encrypting...',
        percent: 25,
      });

      const { ciphertext, salt, iv } = await encryptMessage(message, password);

      // Stage 2: Packaging binary payload
      self.postMessage({
        status: 'PROGRESS',
        stage: 'Packing binary steganographic protocol...',
        percent: 50,
      });

      const binaryPayload = packPayload(salt, iv, ciphertext);

      // Stage 3: Embedding bits into pixels
      self.postMessage({
        status: 'PROGRESS',
        stage: 'Embedding encrypted bits into image pixels...',
        percent: 75,
      });

      embedPayloadInImageData(imageData, binaryPayload);

      // Success
      self.postMessage({
        status: 'SUCCESS',
        type: 'ENCRYPT_AND_EMBED',
        result: { imageData },
      });
    } else if (type === 'EXTRACT_AND_DECRYPT') {
      const { imageData, password } = payload;

      // Stage 1: Extracting payload from pixels
      self.postMessage({
        status: 'PROGRESS',
        stage: 'Extracting hidden payload from pixels...',
        percent: 30,
      });

      const { salt, iv, ciphertext } = extractPayloadFromImageData(imageData);

      // Stage 2: Deriving key and decrypting
      self.postMessage({
        status: 'PROGRESS',
        stage: 'Deriving key & decrypting ciphertext...',
        percent: 70,
      });

      const decryptedText = await decryptMessage(ciphertext, salt, iv, password);

      // Success
      self.postMessage({
        status: 'SUCCESS',
        type: 'EXTRACT_AND_DECRYPT',
        result: { decryptedText },
      });
    } else {
      throw new Error(`Unknown worker message type: "${type}"`);
    }
  } catch (err) {
    let errorCode = 'WORKER_ERROR';
    if (err instanceof InvalidPasswordError) errorCode = 'INVALID_PASSWORD';
    if (err instanceof NoSecretPixDataError) errorCode = 'NO_PAYLOAD_DETECTED';
    if (err instanceof CapacityExceededError) errorCode = 'CAPACITY_EXCEEDED';

    self.postMessage({
      status: 'ERROR',
      type,
      error: {
        message: err.message,
        code: errorCode,
      },
    });
  }
};
