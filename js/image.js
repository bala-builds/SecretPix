/**
 * SecretPix — Image Processing & Capacity Engine (HTML5 Canvas API)
 *
 * Implements:
 * - Client-side file validation (JPEG, PNG, WebP) and size limits
 * - Canvas pixel pipeline (1:1 dimension preservation, ImageData extraction)
 * - Steganographic capacity calculation engine
 * - Lossless PNG Blob export and download trigger
 * - Memory leak prevention (Object URL lifecycle management)
 */

import { CONFIG } from './config.js';

export class ImageProcessingError extends Error {
  constructor(message, code = 'IMAGE_PROCESSING_ERROR') {
    super(message);
    this.name = 'ImageProcessingError';
    this.code = code;
  }
}

/**
 * Validate an uploaded image File object
 * @param {File} file
 */
export function validateImageFile(file) {
  if (!file || !(file instanceof File)) {
    throw new ImageProcessingError('No file selected.', 'INVALID_FILE');
  }

  // 1. Check File Size Limit (default 25 MB)
  if (file.size > CONFIG.LIMITS.MAX_IMAGE_FILE_SIZE_BYTES) {
    const maxMb = Math.round(CONFIG.LIMITS.MAX_IMAGE_FILE_SIZE_BYTES / (1024 * 1024));
    throw new ImageProcessingError(
      `File size exceeds the ${maxMb} MB limit to protect memory. Please select a smaller image.`,
      'FILE_TOO_LARGE'
    );
  }

  // 2. Check Supported MIME Type
  const mime = file.type.toLowerCase();
  const isSupported = CONFIG.LIMITS.SUPPORTED_INPUT_MIME_TYPES.includes(mime);
  if (!isSupported) {
    throw new ImageProcessingError(
      `Unsupported format "${file.type || 'unknown'}". Supported formats: PNG, JPG, JPEG, and WebP.`,
      'UNSUPPORTED_FORMAT'
    );
  }

  return true;
}

/**
 * Load a File into an HTMLImageElement
 * Automatically handles Object URL revocation to prevent memory leaks.
 * @param {File} file
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImageElement(file) {
  validateImageFile(file);

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      // Memory cleanup: Revoke URL immediately after image element decodes
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new ImageProcessingError('Failed to decode image data. The file may be corrupted.', 'DECODE_ERROR'));
    };

    img.src = objectUrl;
  });
}

/**
 * Render an HTMLImageElement to an offscreen Canvas and extract its ImageData
 * @param {HTMLImageElement} img
 * @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, imageData: ImageData, width: number, height: number }}
 */
export function extractImageDataFromImage(img) {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  if (!width || !height || width <= 0 || height <= 0) {
    throw new ImageProcessingError('Invalid image dimensions.', 'INVALID_DIMENSIONS');
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new ImageProcessingError('Failed to obtain 2D canvas context.', 'CANVAS_CONTEXT_ERROR');
  }

  // Draw image at native 1:1 pixel scale
  ctx.drawImage(img, 0, 0, width, height);

  // Extract raw RGBA pixel buffer
  const imageData = ctx.getImageData(0, 0, width, height);

  return {
    canvas,
    ctx,
    imageData,
    width,
    height,
  };
}

/**
 * Calculate available LSB steganographic capacity for an image
 *
 * Algorithm:
 * - 3 usable color channels (Red, Green, Blue) per pixel
 * - 1 bit embedded per channel
 * - Raw bits = width * height * 3
 * - Raw bytes = floor(Raw bits / 8)
 * - Usable capacity = Raw bytes - Protocol overhead (54 bytes)
 *
 * @param {number} width - Image pixel width
 * @param {number} height - Image pixel height
 * @param {number} payloadSizeBytes - Estimated payload bytes (optional)
 * @returns {{
 *   rawCapacityBytes: number,
 *   usableCapacityBytes: number,
 *   usedBytes: number,
 *   remainingBytes: number,
 *   usagePercentage: number,
 *   isOverCapacity: boolean
 * }}
 */
export function calculateCapacity(width, height, payloadSizeBytes = 0) {
  if (width <= 0 || height <= 0) {
    return {
      rawCapacityBytes: 0,
      usableCapacityBytes: 0,
      usedBytes: 0,
      remainingBytes: 0,
      usagePercentage: 0,
      isOverCapacity: true,
    };
  }

  const totalPixels = width * height;
  const rawBits = totalPixels * 3; // RGB channels
  const rawCapacityBytes = Math.floor(rawBits / 8);

  const overhead = CONFIG.PROTOCOL.TOTAL_OVERHEAD_BYTES;
  const usableCapacityBytes = Math.max(0, rawCapacityBytes - overhead);

  const usedBytes = Math.max(0, payloadSizeBytes);
  const remainingBytes = Math.max(0, usableCapacityBytes - usedBytes);
  const usagePercentage = usableCapacityBytes > 0
    ? Math.min(100, Math.round((usedBytes / usableCapacityBytes) * 100))
    : 0;

  const isOverCapacity = usedBytes > usableCapacityBytes;

  return {
    rawCapacityBytes,
    usableCapacityBytes,
    usedBytes,
    remainingBytes,
    usagePercentage,
    isOverCapacity,
  };
}

/**
 * Convert an ImageData buffer into a lossless PNG Blob via Canvas
 * @param {ImageData} imageData
 * @returns {Promise<Blob>}
 */
export function exportImageDataToPngBlob(imageData) {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new ImageProcessingError('Failed to get Canvas 2D context for export.');
      }

      ctx.putImageData(imageData, 0, 0);

      // Export strictly as lossless PNG
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new ImageProcessingError('Failed to generate PNG Blob from Canvas.', 'BLOB_EXPORT_ERROR'));
        } else {
          resolve(blob);
        }
      }, CONFIG.LIMITS.OUTPUT_FORMAT);
    } catch (err) {
      reject(new ImageProcessingError(`Export failed: ${err.message}`, 'EXPORT_ERROR'));
    }
  });
}

/**
 * Trigger browser download for a Blob
 * @param {Blob} blob - The file Blob to download
 * @param {string} filename - Target file name
 */
export function triggerFileDownload(blob, filename = 'secretpix-image.png') {
  if (!blob || !(blob instanceof Blob)) {
    throw new ImageProcessingError('Invalid blob for download.');
  }

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();

  // Cleanup anchor and revoke temporary URL
  setTimeout(() => {
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }, 100);
}
