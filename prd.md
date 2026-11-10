# SecretPix — Product Requirements Document (PRD)

**Product Name:** SecretPix  
**Tagline:** Hide in Plain Sight. Share with Confidence.  
**Version:** 1.0  
**Product Type:** Privacy-focused Web Application  
**Domain:** Cybersecurity, Cryptography, Steganography, Image Processing  
**Platform:** Responsive Web Application  
**Architecture:** Client-side processing (No backend required for core functionality)

---

# 1. Product Overview

SecretPix is a privacy-focused web application that enables users to securely hide confidential messages and small files inside ordinary digital images.

The application combines two security techniques:

- **Cryptography:** AES-256-GCM encryption protects the actual message.
- **Steganography:** Least Significant Bit (LSB) encoding hides encrypted information inside image pixels.

Users can upload an image, enter a secret message, provide a password, and generate an encrypted image. The recipient can upload that image, enter the correct password, and retrieve the original message.

All encryption, decryption, and image-processing operations happen locally inside the user's browser. Images and messages are never uploaded to an application server.

# 2. Problem Statement

Traditional messaging platforms transmit private information in a way that can reveal the existence of sensitive communication.

Encryption protects message contents but does not necessarily conceal the fact that a secret message exists.

SecretPix addresses this problem by combining encryption and image steganography, allowing users to conceal encrypted messages within ordinary-looking images.

# 3. Product Objectives

1. Provide a simple interface for hiding confidential messages inside images.
2. Implement secure password-based AES-256-GCM encryption.
3. Implement pixel-level LSB steganography.
4. Allow recipients to extract and decrypt hidden messages.
5. Ensure all sensitive processing happens locally.
6. Provide image capacity detection and encoding progress.
7. Create a visually polished, responsive user experience.
8. Demonstrate practical cybersecurity concepts through a working application.

# 4. Target Users

- Computer science and cybersecurity students.
- Students demonstrating cryptography and steganography concepts.
- Privacy-conscious individuals.
- Developers and security enthusiasts.
- Users interested in secure image-based communication.

# 5. Core Features

## 5.1 Dashboard

The dashboard is the main entry point.

Requirements:
- Display the SecretPix brand and logo.
- Provide two primary actions:
  - Hide a Message
  - Reveal a Message
- Display a short explanation of how SecretPix works.
- Show privacy and security indicators.
- Display supported image formats.
- Show recent activity only if stored locally and explicitly enabled.

## 5.2 Hide Message (Encryption + Encoding)

This is the primary feature.

**User workflow:**

1. Select an image from the device.
2. Preview the selected image.
3. Enter the secret message.
4. Enter a password.
5. Confirm the password.
6. Display available image capacity.
7. Click Encrypt & Hide.
8. Encrypt the message.
9. Embed encrypted data into image pixels.
10. Generate and preview the output image.
11. Download the resulting PNG image.

Functional requirements:
- Support JPG, JPEG, PNG and WebP as input formats.
- Convert uploaded images to PNG before encoding.
- Use AES-256-GCM encryption.
- Derive encryption keys from passwords using PBKDF2.
- Generate a unique random salt and IV for every encryption.
- Embed encrypted payloads using LSB encoding.
- Display encoding progress.
- Show success or failure messages.
- Allow downloading the encoded image.

## 5.3 Reveal Message (Extraction + Decryption)

This feature retrieves hidden information.

**User workflow:**

1. Upload the encoded image.
2. Preview the image.
3. Click Extract Message.
4. Extract the hidden payload from image pixels.
5. Read the embedded encryption metadata.
6. Ask the user for the password.
7. Derive the encryption key.
8. Decrypt the payload.
9. Display the original secret message.

Functional requirements:
- Detect whether an image contains a valid SecretPix payload.
- Validate the payload header and format.
- Extract encrypted data using the LSB algorithm.
- Decrypt using AES-256-GCM.
- Display a clear error for incorrect passwords.
- Display a clear error for corrupted or unsupported images.
- Allow copying the recovered message.

## 5.4 Password Security

Security requirements:
- Passwords must never be stored or transmitted.
- Use PBKDF2 with SHA-256 and a configurable work factor (initially 600,000 iterations).
- Generate a cryptographically secure random salt.
- Generate a unique 96-bit AES-GCM IV.
- Use AES-256-GCM authenticated encryption.
- Never reuse an IV with the same encryption key.
- Clear sensitive temporary data when the workflow is reset.

## 5.5 Image Steganography Engine

Implement Least Significant Bit encoding.

Requirements:
- Read image pixel data using HTML Canvas.
- Embed encrypted bytes into RGB channel least significant bits.
- Preserve image dimensions.
- Extract data using the same deterministic pixel traversal.
- Include a payload length header.
- Include a recognizable SecretPix payload identifier and version.
- Validate capacity before encoding.
- Use deterministic extraction rules.

Important: Export encoded images as PNG to prevent lossy compression from destroying embedded information.

## 5.6 Image Capacity Detection

Display:
- Image dimensions.
- Total available pixel channels.
- Maximum payload capacity.
- Current message size.
- Remaining capacity.
- Capacity usage percentage.

Display a warning if the message exceeds the image's capacity.

## 5.7 File Hiding (Future Feature)

Allow users to hide small documents and files inside images.

Planned supported formats:
- PDF
- TXT
- DOCX
- ZIP

Requirements:
- Encrypt files before embedding.
- Preserve original filename and MIME type.
- Extract and download the original file.
- Validate available image capacity.
- Set configurable maximum file size.

This feature is planned for Phase 2 and is not required for the initial MVP.

# 6. Technical Architecture

## Frontend
- React.js
- Vite
- JavaScript or TypeScript
- Tailwind CSS
- Lucide Icons

## Image Processing
- HTML Canvas API
- ImageData API
- File API
- Blob API

## Cryptography
- Web Crypto API
- AES-256-GCM
- PBKDF2
- SHA-256
- crypto.getRandomValues()

## Storage
- No server-side database required.
- No image uploads to external servers.
- Optional local preferences using browser storage.

## Deployment
- Cloudflare Pages
- Vercel
- Netlify

# 7. Application Architecture

The application should follow a modular architecture.

**Main modules:**

1. UI Layer
   - Dashboard
   - Hide Message
   - Reveal Message
   - Settings

2. Image Processing Module
   - Image Upload
   - Image Validation
   - Image Preview
   - Canvas Processing
   - PNG Export

3. Cryptography Module
   - Password Key Derivation
   - Message Encryption
   - Message Decryption
   - Salt and IV Generation

4. Steganography Module
   - Payload Creation
   - LSB Encoding
   - LSB Extraction
   - Capacity Calculation
   - Payload Validation

5. Utility Module
   - Error Handling
   - File Download
   - Clipboard
   - Input Validation

# 8. Payload Format

Use a versioned binary payload structure.

Recommended structure:

- Magic Header: Identifies SecretPix.
- Version: Payload format version.
- Salt: Random PBKDF2 salt.
- IV: AES-GCM initialization vector.
- Metadata: Payload type and length.
- Ciphertext: Encrypted message or file.
- Authentication Tag: AES-GCM authentication data.

The payload must be embedded as binary data rather than plain text.

The payload length and header must be validated before extraction or decryption.

# 9. User Interface Requirements

## Design Direction

Create a premium, minimalist cybersecurity product.

Visual direction:
- Clean and modern.
- Minimal visual clutter.
- Subtle green accents.
- White and light-grey surfaces.
- Dark charcoal typography.
- Rounded cards.
- Subtle borders and shadows.
- Smooth transitions.
- Clear visual hierarchy.

Suggested color palette:

- Primary: #52796F
- Secondary: #84A98C
- Background: #F7F8F6
- Surface: #FFFFFF
- Text: #202824
- Muted: #87918A
- Border: #E5EAE5
- Success: #39845D
- Error: #D9534F

## Required Screens

1. Landing / Dashboard
2. Hide Message
3. Reveal Message
4. Processing State
5. Success State
6. Error State
7. Settings / About

## Hide Message Screen Components

- Image upload dropzone.
- Image preview.
- Message textarea.
- Password input.
- Confirm password input.
- Password visibility toggle.
- Image capacity indicator.
- Encrypt & Hide button.
- Download button.

## Reveal Message Screen Components

- Image upload dropzone.
- Image preview.
- Extract button.
- Password input.
- Decrypt button.
- Recovered message display.
- Copy message button.
- Clear/reset button.

# 10. User Experience Requirements

- Drag-and-drop image uploads.
- Responsive desktop and mobile layouts.
- Clear validation messages.
- Loading indicators during processing.
- Password visibility toggle.
- One-click message copying.
- One-click image downloading.
- Clear success and error states.
- No unnecessary registration or login.
- No complicated configuration required.

# 11. Security Requirements

Security is a core product requirement.

1. No plaintext messages should be transmitted to a server.
2. No passwords should be saved.
3. Use cryptographically secure random values.
4. Use authenticated encryption.
5. Validate all uploaded image data.
6. Protect against malformed payloads and invalid lengths.
7. Limit maximum input sizes to prevent memory exhaustion.
8. Avoid exposing sensitive data in browser logs.
9. Clear application state when the user resets the workflow.
10. Do not claim that steganography makes a message undetectable.

Important technical limitations:
- LSB steganography can be detected through steganalysis.
- Image resizing, editing, and lossy compression can destroy hidden data.
- The application should use PNG for encoded output.
- Users should retain the original downloaded encoded image.
- Local browser processing reduces server exposure but does not protect against malware or compromised devices.

# 12. Non-Functional Requirements

**Performance**
- Process images without unnecessary server requests.
- Show progress for large images.
- Avoid blocking the UI during heavy processing.
- Use Web Workers if necessary.

**Reliability**
- Correctly extract payloads from valid encoded images.
- Detect corrupted image data.
- Handle incorrect passwords gracefully.

**Compatibility**
- Chrome
- Safari
- Firefox
- Microsoft Edge
- Modern Android browsers
- Modern iOS browsers

**Accessibility**
- Keyboard-accessible controls.
- Appropriate contrast.
- Clear labels.
- Screen-reader-friendly messages.

# 13. MVP Scope

The first release should focus on the essential workflow.

**Must Have**
- Image upload.
- Image preview.
- Secret message input.
- Password-based encryption.
- AES-256-GCM.
- LSB encoding.
- Capacity detection.
- PNG image export.
- Image upload for extraction.
- LSB decoding.
- Password-based decryption.
- Copy recovered message.
- Local-only processing.

**Should Have**
- Drag-and-drop uploads.
- Processing progress.
- Password strength indicator.
- Image metadata display.
- Responsive design.
- Detailed error messages.

**Future Scope**
- PDF and document hiding.
- Multiple message support.
- QR-based sharing.
- Batch image processing.
- Additional steganography algorithms.
- Optional local history.

# 14. Development Roadmap

**Phase 1 — Foundation**
- Set up React and Vite.
- Configure Tailwind CSS.
- Create application layout.
- Build navigation and dashboard.

**Phase 2 — Image Processing**
- Implement image upload.
- Implement preview.
- Implement Canvas processing.
- Implement PNG export.
- Implement capacity detection.

**Phase 3 — Cryptography**
- Implement password-based key derivation.
- Implement AES-256-GCM encryption.
- Implement decryption.
- Implement secure metadata generation.

**Phase 4 — Steganography**
- Implement binary payload format.
- Implement LSB encoding.
- Implement LSB extraction.
- Validate data integrity.

**Phase 5 — Integration**
- Connect encryption with image encoding.
- Connect extraction with decryption.
- Implement error handling.
- Implement download and clipboard functions.

**Phase 6 — Testing and Deployment**
- Test valid and invalid passwords.
- Test corrupted images.
- Test capacity limits.
- Test different image formats.
- Test browser compatibility.
- Deploy to Cloudflare Pages or Vercel.

# 15. Acceptance Criteria

The MVP is considered complete when:

- Users can upload an image.
- Users can enter a secret message and password.
- The application encrypts messages using AES-256-GCM.
- Encrypted data can be embedded into image pixels.
- Encoded images can be downloaded as PNG files.
- A recipient can upload the downloaded image.
- The application can extract the encrypted payload.
- The correct password restores the original message.
- An incorrect password produces a safe error.
- Corrupted images are rejected.
- Capacity limitations are correctly handled.
- All core processing works without sending images or messages to a backend.
- The interface works on desktop and mobile.

# 16. Success Metrics

- 100% successful round-trip encryption and extraction for valid test cases.
- No plaintext message or password sent to a server.
- Correct rejection of invalid passwords.
- Correct capacity calculation.
- Successful processing of supported image formats.
- No loss of hidden data during PNG export and re-import.

# 17. Final Product Vision

SecretPix aims to demonstrate that privacy and secure communication can be achieved through the combination of cryptography and image steganography.

The final product should feel like a simple, premium privacy tool rather than a complicated cybersecurity utility.

A user should be able to hide a confidential message inside an image in less than a minute, share that image, and allow the recipient to recover the message using the correct password.

**SecretPix — Your Message. Your Image. Your Privacy.**