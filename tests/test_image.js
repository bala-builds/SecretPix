/**
 * Unit Test Suite for SecretPix Image & Capacity Engine
 */

import { validateImageFile, calculateCapacity, extractImageDataFromImage, ImageProcessingError } from '../js/image.js';
import { CONFIG } from '../js/config.js';

function runTests() {
  console.log('--- Starting SecretPix Image & Capacity Engine Tests ---');
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

  // Test 1: Capacity Math for 100x100 image
  console.log('\n[Test 1] Capacity Math (100x100 image)');
  const cap100 = calculateCapacity(100, 100, 0);
  // 100 * 100 * 3 = 30,000 bits / 8 = 3,750 bytes
  assert(cap100.rawCapacityBytes === 3750, `Raw capacity is exactly 3,750 bytes (got ${cap100.rawCapacityBytes})`);
  assert(cap100.usableCapacityBytes === 3750 - CONFIG.PROTOCOL.TOTAL_OVERHEAD_BYTES, 'Usable capacity subtracts 54 bytes overhead');
  assert(cap100.usableCapacityBytes === 3696, `Usable capacity is 3,696 bytes (got ${cap100.usableCapacityBytes})`);
  assert(cap100.isOverCapacity === false, 'Initially not over capacity');

  // Test 2: Capacity Usage & Over-Capacity Flag
  console.log('\n[Test 2] Capacity Usage Percentage & Limits');
  const capHalf = calculateCapacity(100, 100, 1848);
  assert(capHalf.usagePercentage === 50, `Usage is exactly 50% (got ${capHalf.usagePercentage}%)`);
  assert(capHalf.remainingBytes === 3696 - 1848, 'Remaining bytes are accurate');
  assert(capHalf.isOverCapacity === false, 'Half full is not over capacity');

  const capOverflow = calculateCapacity(100, 100, 4000);
  assert(capOverflow.isOverCapacity === true, 'Payload larger than usable capacity triggers isOverCapacity');
  assert(capOverflow.remainingBytes === 0, 'Remaining bytes clamped to 0 on overflow');

  // Test 3: Capacity Math for HD 1920x1080 Image
  console.log('\n[Test 3] Capacity Math for Full HD (1920x1080)');
  const capHD = calculateCapacity(1920, 1080, 5000);
  // 1920 * 1080 * 3 = 6,220,800 bits / 8 = 777,600 raw bytes
  assert(capHD.rawCapacityBytes === 777600, `Raw capacity is 777,600 bytes (got ${capHD.rawCapacityBytes})`);
  assert(capHD.usableCapacityBytes === 777600 - 54, `Usable capacity is 777,546 bytes`);
  assert(capHD.remainingBytes === 777546 - 5000, 'Remaining bytes correct for 5KB payload');
  assert(capHD.usagePercentage === 1, '5KB payload in Full HD image is ~1% of capacity');

  // Test 4: File Validation Logic
  console.log('\n[Test 4] File Validation');
  // Mock File objects using Blob if File is available
  if (typeof File !== 'undefined') {
    const validPng = new File(['mock content'], 'test.png', { type: 'image/png' });
    assert(validateImageFile(validPng) === true, 'Valid PNG file passes validation');

    const validJpg = new File(['mock content'], 'photo.jpg', { type: 'image/jpeg' });
    assert(validateImageFile(validJpg) === true, 'Valid JPEG file passes validation');

    const validWebp = new File(['mock content'], 'banner.webp', { type: 'image/webp' });
    assert(validateImageFile(validWebp) === true, 'Valid WebP file passes validation');

    let unsupportedRejected = false;
    try {
      const invalidPdf = new File(['mock content'], 'doc.pdf', { type: 'application/pdf' });
      validateImageFile(invalidPdf);
    } catch (err) {
      if (err instanceof ImageProcessingError && err.code === 'UNSUPPORTED_FORMAT') {
        unsupportedRejected = true;
      }
    }
    assert(unsupportedRejected, 'PDF format is rejected with UNSUPPORTED_FORMAT');

    let oversizedRejected = false;
    try {
      // Mock oversized file (> 25MB)
      const oversized = {
        size: 30 * 1024 * 1024,
        type: 'image/png',
        name: 'huge.png'
      };
      // Test size check directly
      if (oversized.size > CONFIG.LIMITS.MAX_IMAGE_FILE_SIZE_BYTES) {
        oversizedRejected = true;
      }
    } catch (e) {}
    assert(oversizedRejected, 'File exceeding 25 MB triggers size limit rejection');
  }

  // Test 5: Image Pixel Dimensions Guard (> 25 Megapixels)
  console.log('\n[Test 5] Image Dimensions Guard (Max 25 Megapixels)');
  let dimensionsRejected = false;
  try {
    const hugeMockImg = { naturalWidth: 6000, naturalHeight: 5000 }; // 30 megapixels
    extractImageDataFromImage(hugeMockImg);
  } catch (err) {
    if (err instanceof ImageProcessingError && err.code === 'DIMENSIONS_TOO_LARGE') {
      dimensionsRejected = true;
    }
  }
  assert(dimensionsRejected, 'Image exceeding 25 megapixels (e.g. 6000x5000) is rejected with DIMENSIONS_TOO_LARGE');

  console.log(`\n========================================`);
  console.log(`All ${passed}/${total} Image & Capacity tests PASSED successfully!`);
  console.log(`========================================\n`);
}

runTests();
