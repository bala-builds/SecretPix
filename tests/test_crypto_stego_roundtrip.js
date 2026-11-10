/**
 * Integration Test: End-to-End Crypto + Steganography Engine Round-Trip
 */

import { encryptMessage, decryptMessage } from '../js/crypto.js';
import { packPayload, embedPayloadInImageData, extractPayloadFromImageData } from '../js/steganography.js';

async function runRoundtripTest() {
  console.log('--- Testing Integrated Crypto + Stego Engine ---');

  const secretMessage = '🚀 SecretPix Confidential Message: Operation Green Mint is GO! \nCoordinates: 37.7749° N, 122.4194° W';
  const password = 'SuperSecretP@ssw0rd!2026';

  console.log('1. Encrypting message using AES-256-GCM + PBKDF2 (600k rounds)...');
  const { ciphertext, salt, iv } = await encryptMessage(secretMessage, password);
  console.log(`   Ciphertext produced: ${ciphertext.length} bytes`);

  console.log('2. Packing into versioned binary payload...');
  const payload = packPayload(salt, iv, ciphertext);
  console.log(`   Packed binary payload: ${payload.length} bytes`);

  console.log('3. Generating synthetic 200x200 pixel image...');
  const width = 200;
  const height = 200;
  const pixelData = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    pixelData[i * 4 + 0] = (i * 3) % 256;
    pixelData[i * 4 + 1] = (i * 5) % 256;
    pixelData[i * 4 + 2] = (i * 7) % 256;
    pixelData[i * 4 + 3] = 255;
  }
  const imageData = { width, height, data: pixelData };

  console.log('4. Embedding payload bits into RGB LSBs...');
  embedPayloadInImageData(imageData, payload);
  console.log('   Embedding complete.');

  console.log('5. Extracting payload from image pixels...');
  const extracted = extractPayloadFromImageData(imageData);
  console.log(`   Extracted salt: ${extracted.salt.length}B, IV: ${extracted.iv.length}B, Ciphertext: ${extracted.ciphertext.length}B`);

  console.log('6. Decrypting extracted ciphertext with password...');
  const decryptedMessage = await decryptMessage(extracted.ciphertext, extracted.salt, extracted.iv, password);

  if (decryptedMessage === secretMessage) {
    console.log('\n🎉 SUCCESS: Decrypted message matches original secret with 100% fidelity!');
    console.log(`Recovered message:\n"${decryptedMessage}"\n`);
  } else {
    throw new Error('Decrypted message does NOT match original secret!');
  }
}

runRoundtripTest().catch(err => {
  console.error('Roundtrip failed:', err);
  process.exit(1);
});
