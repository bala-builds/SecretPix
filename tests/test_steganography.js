/**
 * Unit Test Suite for SecretPix Steganography Engine
 */

import {
  packPayload,
  unpackPayload,
  embedPayloadInImageData,
  extractPayloadFromImageData,
  detectSecretPixHeader,
  NoSecretPixDataError,
  CapacityExceededError,
  SteganographyError,
} from '../js/steganography.js';
import { CONFIG } from '../js/config.js';

function runTests() {
  console.log('--- Starting SecretPix Steganography Engine Tests ---');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAILED: ${message}`);
      throw new Error(message);
    } else {
      passed++;
      console.log(`✅ PASSED: ${message}`);
    }
  }

  // Test 1: Payload Serialization (pack & unpack)
  console.log('\n[Test 1] Payload Serialization (packPayload & unpackPayload)');
  const mockSalt = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  const mockIv = new Uint8Array([20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
  const mockCiphertext = new Uint8Array([100, 101, 102, 103, 104, 105, 106, 107]);

  const packed = packPayload(mockSalt, mockIv, mockCiphertext);
  assert(packed.length === CONFIG.PROTOCOL.HEADER_SIZE_BYTES + mockCiphertext.length, 'Packed size matches header + ciphertext');
  assert(packed[0] === 0x53 && packed[1] === 0x50 && packed[2] === 0x49 && packed[3] === 0x58, 'Magic bytes are SPIX');
  assert(packed[4] === 0x01, 'Version is 0x01');
  assert(packed[5] === 0x01, 'Payload type is 0x01 (TEXT)');

  const unpacked = unpackPayload(packed);
  assert(unpacked.version === 0x01, 'Unpacked version matches');
  assert(unpacked.payloadType === 0x01, 'Unpacked payload type matches');
  assert(unpacked.salt.every((b, i) => b === mockSalt[i]), 'Unpacked salt matches byte-for-byte');
  assert(unpacked.iv.every((b, i) => b === mockIv[i]), 'Unpacked IV matches byte-for-byte');
  assert(unpacked.ciphertext.every((b, i) => b === mockCiphertext[i]), 'Unpacked ciphertext matches byte-for-byte');

  // Test 2: Mock Synthetic ImageData Creation
  console.log('\n[Test 2] Synthetic ImageData Setup (50x50 image)');
  const width = 50;
  const height = 50;
  const pixelCount = width * height;
  const mockData = new Uint8Array(pixelCount * 4);

  // Fill mock image with arbitrary non-zero RGB values and Alpha = 255
  for (let i = 0; i < pixelCount; i++) {
    mockData[i * 4 + 0] = (i * 7) % 256;  // R
    mockData[i * 4 + 1] = (i * 13) % 256; // G
    mockData[i * 4 + 2] = (i * 19) % 256; // B
    mockData[i * 4 + 3] = 255;            // A (must not change)
  }

  const mockImageData = {
    width,
    height,
    data: mockData,
  };

  // Initially, plain image must NOT have SecretPix header
  assert(detectSecretPixHeader(mockImageData) === false, 'Plain image does not detect SecretPix header');

  // Test 3: Embed Payload & Verify Alpha Channel Preservation
  console.log('\n[Test 3] LSB Embedding & Alpha Channel Preservation');
  embedPayloadInImageData(mockImageData, packed);

  // Check header detection immediately
  assert(detectSecretPixHeader(mockImageData) === true, 'Header detection immediately returns true after embedding');

  // Assert Alpha channels were 100% preserved
  let alphaIntact = true;
  for (let i = 0; i < pixelCount; i++) {
    if (mockData[i * 4 + 3] !== 255) {
      alphaIntact = false;
      break;
    }
  }
  assert(alphaIntact === true, 'All alpha channel values strictly preserved at 255');

  // Test 4: Extract Payload from Image
  console.log('\n[Test 4] Payload Extraction from Pixels');
  const extracted = extractPayloadFromImageData(mockImageData);
  assert(extracted.version === 0x01, 'Extracted version matches');
  assert(extracted.salt.every((b, i) => b === mockSalt[i]), 'Extracted salt matches');
  assert(extracted.iv.every((b, i) => b === mockIv[i]), 'Extracted IV matches');
  assert(extracted.ciphertext.every((b, i) => b === mockCiphertext[i]), 'Extracted ciphertext matches bit-for-bit');

  // Test 5: Clean Rejection on Unencoded Image
  console.log('\n[Test 5] Extraction from Unencoded Image');
  const freshPlainData = new Uint8Array(pixelCount * 4);
  const plainImage = { width, height, data: freshPlainData };
  let noPayloadCaught = false;
  try {
    extractPayloadFromImageData(plainImage);
  } catch (err) {
    if (err instanceof NoSecretPixDataError) {
      noPayloadCaught = true;
    }
  }
  assert(noPayloadCaught === true, 'Extracting from unencoded image throws NoSecretPixDataError');

  // Test 6: Capacity Exceeded Guard
  console.log('\n[Test 6] Capacity Exceeded Guard');
  const tinyImage = {
    width: 2,
    height: 2, // 4 pixels * 3 = 12 bits = 1.5 bytes capacity
    data: new Uint8Array(16),
  };
  let capacityOverflowCaught = false;
  try {
    embedPayloadInImageData(tinyImage, packed);
  } catch (err) {
    if (err instanceof CapacityExceededError) {
      capacityOverflowCaught = true;
    }
  }
  assert(capacityOverflowCaught === true, 'Oversized payload throws CapacityExceededError');

  console.log(`\n========================================`);
  console.log(`All ${passed}/${total} Steganography Engine tests PASSED successfully!`);
  console.log(`========================================\n`);
}

runTests();
