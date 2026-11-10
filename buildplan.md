# SecretPix — 7-Phase Master Build Plan (Pure Vanilla HTML5 / CSS3 / JavaScript)

> **Product:** SecretPix  
> **Tagline:** Hide in Plain Sight. Share with Confidence.  
> **Architecture:** 100% Client-Side Local Processing (Zero Server Transmission)  
> **Technology Stack:** Pure Vanilla HTML5, CSS3 (Modern Custom Properties & Flex/Grid), Modern JavaScript (ES6+ Modules, Web Crypto API, Canvas API, Web Workers)  
> **Dependencies & Tooling:** Zero build tools, zero external runtime libraries, zero npm dependencies. Runs directly in any modern browser!  
> **Security Stack:** AES-256-GCM + PBKDF2 (SHA-256, 600,000 iterations) + Canvas LSB Steganography  

---

## Executive Summary & Architectural Strategy

This build plan outlines the comprehensive development roadmap for **SecretPix** built with **pure, standard web technologies (HTML5, CSS3, and JavaScript ES6 Modules)**.

By leveraging native browser standards:
1. **Cryptography:** Uses the native [`Web Crypto API`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) (`window.crypto.subtle`) for PBKDF2 key derivation and AES-256-GCM encryption/decryption.
2. **Steganography:** Uses the native [`HTML5 Canvas API`](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) (`CanvasRenderingContext2D`, `getImageData`, `putImageData`, `canvas.toBlob`) for pixel manipulation and lossless PNG generation.
3. **Performance:** Uses a native [`Web Worker`](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) to perform CPU-intensive key derivation (600,000 PBKDF2 iterations) and pixel bit traversals off the main thread, maintaining a fluid 60fps UI.
4. **Portability:** Zero compilation, zero bundlers, zero framework overhead. Can be run locally by opening `index.html` or served via any static host (Cloudflare Pages, GitHub Pages, Vercel).

---

## 7-Phase Execution Matrix

| Phase | Title | Focus Area | Key Deliverables |
|---|---|---|---|
| **Phase 1** | Project Architecture & Vanilla Design System | Scaffolding, CSS System & Layout Shell | Modular folder structure, CSS tokens (mint/sage palette), UI layout, SVG icons |
| **Phase 2** | Cryptographic Engine (Web Crypto API) | Password Derivation & Authenticated Encryption | Native PBKDF2 (600k iterations), AES-256-GCM, salt/IV generation, error mapping |
| **Phase 3** | Image Processing & Capacity Engine | Canvas API & Memory Management | Drag-and-drop ingestion, format conversion, capacity math, lossless PNG exporter |
| **Phase 4** | Steganography Engine & Binary Protocol | LSB Embedding & Extraction | Header packet specification (`SPIX`), bitwise RGB traversal, payload decoder |
| **Phase 5** | Core UI Workspaces & Interactive Workflows | DOM Controllers & Screen States | Dashboard, Hide Workspace, Reveal Workspace, Result modal, Toast notifications |
| **Phase 6** | Web Worker Offloading & Security Hardening | Concurrency, Memory Safety & UX Polish | Dedicated Web Worker for crypto/LSB, zero-persistence state cleanup, CSP setup |
| **Phase 7** | Verification, Test Suite & Deployment | E2E Testing & Static Deployment | `test.html` test suite (roundtrip, emojis, wrong passwords), mobile QA, deployment |

---

## Phase 1: Project Architecture & Vanilla Design System

### 1.1 Objectives
Set up a clean, modular project directory utilizing ES6 Modules, configure CSS Custom Properties for the exact mint/sage/pistachio color scheme, and build the accessible layout shell.

### 1.2 Directory Structure
```
secretpix/
├── index.html              # Main application single-page interface
├── test.html               # In-browser test runner for crypto & steganography
├── css/
│   ├── variables.css       # Design tokens (colors, typography, spacing, shadows)
│   ├── base.css            # Reset, typography, utility classes
│   ├── components.css      # Buttons, cards, dropzones, inputs, progress bars, toasts
│   └── layout.css          # Navigation, hero, two-column workspace layouts, footer
├── js/
│   ├── config.js           # Constants (iterations, magic headers, limits)
│   ├── crypto.js           # Native Web Crypto service (PBKDF2, AES-GCM)
│   ├── image.js            # Canvas operations, image loading, PNG export
│   ├── steganography.js    # Binary payload packing & LSB bit manipulation
│   ├── worker.js           # Web Worker for background encryption & LSB encoding
│   ├── ui.js               # DOM manipulation, tab navigation, notifications, indicators
│   └── app.js              # Application entry point & event wiring
└── assets/
    └── icons/              # Lightweight inline SVGs for security, upload, unlock, copy
```

### 1.3 Design System & CSS Tokens (`css/variables.css`)
- **Color Palette (Mint, Sage, Pistachio & Charcoal):**
  - `--color-primary`: `#52796F`
  - `--color-primary-dark`: `#354F46`
  - `--color-secondary`: `#84A98C`
  - `--color-mint`: `#CADFD1`
  - `--color-pistachio`: `#DCE8C8`
  - `--color-background`: `#F7F9F6`
  - `--color-surface`: `#FFFFFF`
  - `--color-text`: `#202923`
  - `--color-text-secondary`: `#7B877E`
  - `--color-border`: `#E7ECE7`
  - `--color-success`: `#39845D`
  - `--color-error`: `#D9534F`
- **Typography & Geometry:**
  - Font family: `Inter`, system-ui, -apple-system, sans-serif.
  - Monospace font: `ui-monospace`, monospace for cryptographic stats and byte sizes.
  - Border radii: `12px` to `18px` for cards and inputs.
  - Subtle shadows: `0 4px 20px -2px rgba(53, 79, 70, 0.05)`.
- **Reusable Component Classes:**
  - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-outline` with active/hover/disabled states.
  - `.card`, `.card-surface`, `.card-mint` for consistent containers.
  - `.toast` container for transient user feedback.
  - `.progress-bar` for encoding progress and capacity meters.

### 1.4 Exit Criteria
- [ ] Clean semantic HTML structure rendering the navigation bar, hero banner, workspace tabs, and footer.
- [ ] CSS design tokens working smoothly with responsive media queries (mobile $\le$ 768px and desktop $\ge$ 1024px).
- [ ] Zero console errors on loading `index.html`.

---

## Phase 2: Cryptographic Engine (Web Crypto API)

### 2.1 Objectives
Implement a pure, self-contained cryptographic module in `js/crypto.js` using `window.crypto.subtle`.

### 2.2 Tasks & Work Breakdown
1. **Cryptographically Secure Random Generation:**
   - Generate a 16-byte (128-bit) random PBKDF2 salt: `crypto.getRandomValues(new Uint8Array(16))`.
   - Generate a 12-byte (96-bit) random AES-GCM IV: `crypto.getRandomValues(new Uint8Array(12))`.
   - Guarantee a fresh salt and IV for every encryption call.
2. **PBKDF2 Key Derivation:**
   - Convert password string to bytes via `TextEncoder("utf-8")`.
   - Import password into a base key: `crypto.subtle.importKey("raw", passwordBytes, "PBKDF2", false, ["deriveKey"])`.
   - Derive 256-bit AES-GCM key:
     - Algorithm: `PBKDF2`.
     - Hash: `SHA-256`.
     - Iterations: `600,000` (NIST-aligned security work factor).
     - Target algorithm: `AES-GCM` with length 256.
3. **AES-256-GCM Encryption:**
   - Encrypt arbitrary UTF-8 plaintext with `crypto.subtle.encrypt`:
     - Algorithm parameters: `{ name: "AES-GCM", iv, tagLength: 128 }`.
   - Return raw `ciphertext` with integrated 128-bit authentication tag.
4. **AES-256-GCM Decryption:**
   - Re-derive the key from the user-entered password and the extracted salt using the identical 600,000 PBKDF2 iterations.
   - Decrypt with `crypto.subtle.decrypt`.
   - Automatic integrity check: If the password is wrong or even a single bit of the ciphertext/tag was altered, Web Crypto rejects the operation.
   - Catch decryption errors and map them to clean user-facing messages (e.g., `Incorrect password or corrupted data`).
   - Decode decrypted buffer via `TextDecoder("utf-8")`.

### 2.3 Exit Criteria
- [ ] Crypto functions pass round-trip tests (encrypting strings and recovering them with the correct password).
- [ ] Incorrect password or modified ciphertext triggers a controlled rejection.
- [ ] Support for multi-byte Unicode strings, punctuation, multiline text, and emoji characters.

---

## Phase 3: Image Processing & Capacity Engine (Canvas API)

### 3.1 Objectives
Implement client-side image reading, dimension extraction, format normalization, capacity calculation, and lossless PNG exporting in `js/image.js`.

### 3.2 Tasks & Work Breakdown
1. **File Ingestion & Validation:**
   - Handle file selection from drag-and-drop or `<input type="file">`.
   - Validate input formats: JPEG, JPG, PNG, WebP.
   - Guard against oversized images ($> 25\text{ MB}$) to prevent browser memory exhaustion.
   - Load file into an `Image` object using `URL.createObjectURL(file)`.
2. **Canvas Pixel Pipeline:**
   - Create an in-memory `<canvas>` matching the image's natural dimensions (`naturalWidth`, `naturalHeight`).
   - Draw image to canvas context: `ctx.drawImage(img, 0, 0)`.
   - Extract raw RGBA pixel data: `ctx.getImageData(0, 0, width, height)`.
3. **Capacity Math Engine:**
   - Compute total raw channel bits:
     $$\text{Raw Bits} = \text{width} \times \text{height} \times 3 \quad (\text{RGB channels only, Alpha ignored})$$
     $$\text{Raw Bytes} = \lfloor \text{Raw Bits} / 8 \rfloor$$
   - Compute usable payload capacity by subtracting protocol header overhead (magic, version, salt, IV, length, auth tag $\approx 50\text{ bytes}$):
     $$\text{Usable Capacity (Bytes)} = \text{Raw Bytes} - 50$$
   - Provide helper for the UI: current message bytes, max capacity bytes, remaining bytes, and percentage used.
4. **Lossless PNG Exporter:**
   - Write updated pixel buffer back: `ctx.putImageData(imageData, 0, 0)`.
   - Convert canvas to a lossless PNG Blob: `canvas.toBlob(blob => ..., 'image/png')`.
   - Provide download trigger helper (`downloadBlob(blob, filename)`).
5. **Memory Hygiene:**
   - Immediately revoke object URLs (`URL.revokeObjectURL(url)`) once the image is loaded into Canvas to avoid memory leaks.

### 3.3 Exit Criteria
- [ ] Successfully loads JPG/PNG/WebP and reads accurate pixel data.
- [ ] Correctly calculates usable byte capacity across small and high-resolution images.
- [ ] Canvas renders and exports pure PNG without visual distortion or loss of pixel accuracy.

---

## Phase 4: Steganography Engine & Binary Protocol

### 4.1 Objectives
Develop the binary payload packaging protocol and pixel-level LSB embedding and extraction algorithms in `js/steganography.js`.

### 4.2 Tasks & Work Breakdown
1. **Binary Protocol Structure:**
   - Define the standardized binary packet:
     ```
     [0..3]   : Magic Header (4 bytes: 'S','P','I','X' -> 0x53, 0x50, 0x49, 0x58)
     [4]      : Version (1 byte: 0x01)
     [5]      : Payload Type (1 byte: 0x01 = TEXT, extensible to 0x02 = FILE)
     [6..21]  : Salt (16 bytes: PBKDF2 random salt)
     [22..33] : IV (12 bytes: AES-GCM initialization vector)
     [34..37] : Payload Length (4 bytes: Uint32 Big-Endian length of ciphertext)
     [38..N]  : Ciphertext + Auth Tag (N bytes)
     ```
   - Implement `packPayload(salt, iv, ciphertext)` returning a single `Uint8Array`.
   - Implement `unpackPayload(bytes)` extracting headers, validating magic bytes, checking version, and verifying payload length bounds.
2. **LSB Embedding Algorithm:**
   - Verify: `payloadBytes.length * 8 <= width * height * 3`.
   - Convert payload bytes into a stream of individual bits.
   - Traverse the `ImageData.data` buffer sequentially:
     - For each pixel:
       - Red: `data[i * 4 + 0] = (data[i * 4 + 0] & 0xFE) | bit`
       - Green: `data[i * 4 + 1] = (data[i * 4 + 1] & 0xFE) | bit`
       - Blue: `data[i * 4 + 2] = (data[i * 4 + 2] & 0xFE) | bit`
       - **Alpha channel (`data[i * 4 + 3]`) remains completely unaltered.**
   - Terminate once all payload bits are written.
3. **LSB Extraction Algorithm:**
   - Stream bits sequentially from the RGB channels.
   - Step 1: Read the first 4 bytes (32 bits). Validate against the `SPIX` magic identifier. If it doesn't match, fail fast with a `NoSecretPixDataError`.
   - Step 2: Read Version and Payload Type bytes.
   - Step 3: Extract the 16-byte Salt and 12-byte IV.
   - Step 4: Extract 4-byte Uint32 payload length. Validate that declared length does not exceed maximum image capacity (prevents memory attacks).
   - Step 5: Extract the exact ciphertext bytes.
   - Return `{ salt, iv, ciphertext }` ready for the crypto decryption module.

### 4.3 Exit Criteria
- [ ] Bit-exact payload serialization and deserialization.
- [ ] Embedded payloads accurately recovered from canvas ImageData.
- [ ] Non-SecretPix images immediately detected and rejected at the magic header stage.

---

## Phase 5: Core UI Workspaces & Interactive Workflows

### 5.1 Objectives
Build the complete interactive frontend in `index.html` and `js/ui.js`, delivering a clean, intuitive, mint-and-sage cybersecurity application.

### 5.2 Tasks & Work Breakdown
1. **Dashboard & Navigation:**
   - Clean top navbar with logo, tagline, view switchers, and security status pill (*"100% Client-Side"*).
   - Hero banner: *"Your secrets deserve a better hiding place."*
   - Interactive feature selection cards:
     - **Hide a Message:** Leads to encryption/steganography workspace.
     - **Reveal a Message:** Leads to extraction/decryption workspace.
   - "How it works" visual cards (Upload $\rightarrow$ Encrypt $\rightarrow$ Share $\rightarrow$ Unlock).
2. **Hide Message Workspace:**
   - Two-column responsive desktop layout (stacks on mobile screens).
   - **Left Column (Image Area):**
     - Drag-and-drop dropzone with file picker button.
     - Image preview with dimensions badge, file name, and reset button.
   - **Right Column (Message & Security Controls):**
     - Secret message textarea with live character counter.
     - Password input with visibility toggle (show/hide).
     - Password confirmation input with match indicator.
     - Password strength meter (calculating entropy based on length, mixed cases, digits, symbols).
     - Live **Capacity Indicator**: dynamic progress bar showing used bytes, max available bytes, and percentage, with warning when capacity is exceeded.
     - Primary Action: *"Encrypt & Hide Message"* button with loading state.
3. **Encode Success Modal / Screen:**
   - Encoded image preview thumbnail.
   - Security metadata chips: `AES-256-GCM`, `PBKDF2 600,000`, `SHA-256`, `Lossless PNG`.
   - Primary action: *"Download Secure Image"* (initiates `secretpix-[timestamp].png` download).
   - Secondary action: *"Encode Another"*.
4. **Reveal Message Workspace:**
   - Dropzone for the encoded PNG image.
   - Instant header scanner: automatically inspects image pixels upon upload and displays detection badge:
     - *Green Badge:* "SecretPix Encrypted Payload Detected".
     - *Gray/Red Badge:* "No hidden SecretPix data found in this image".
   - Password entry field with show/hide toggle.
   - Primary action: *"Decrypt Message"* button.
   - **Recovered Message Card:**
     - Clean text area displaying original message.
     - One-click *"Copy Message"* button with animated confirmation toast.
     - Word count and character count stats.
     - Reset button to clear view.
5. **About & Security Principles View:**
   - Clear explanations of AES-256-GCM and LSB steganography.
   - Honest security advice: explain why social media compression (e.g. WhatsApp, Twitter/X) strips LSB bits and instruct users to share as lossless files/documents.

### 5.3 Exit Criteria
- [ ] Both Hide and Reveal workspaces fully operational with zero console errors.
- [ ] Smooth switching between views with active tab states.
- [ ] Mobile responsive layout tested and functioning smoothly.

---

## Phase 6: Web Worker Offloading & Security Hardening

### 6.1 Objectives
Ensure the user interface remains snappy and responsive during intensive computations by delegating crypto and LSB operations to a Web Worker (`js/worker.js`), and apply privacy and security hardening.

### 6.2 Tasks & Work Breakdown
1. **Dedicated Web Worker Implementation (`js/worker.js`):**
   - Offload the following heavy tasks from the main UI thread:
     - PBKDF2 600,000 iterations key derivation.
     - Large pixel-buffer traversal during LSB encoding and decoding.
   - Structured communication protocol using `postMessage`:
     - `{ action: 'encryptAndEmbed', imageData, message, password }`
     - `{ action: 'extractAndDecrypt', imageData, password }`
     - Progress updates: `{ type: 'progress', percent: number, stage: string }`
     - Completion results or structured errors.
   - Fallback: Graceful synchronous fallback if Web Workers are restricted in certain environments.
2. **Error Normalization & Security Messages:**
   - Catch all potential exceptions and display clear, sanitized feedback via toast notifications:
     - Wrong password $\rightarrow$ *"Decryption failed: Incorrect password or damaged image."*
     - Corrupted or resized image $\rightarrow$ *"No SecretPix payload detected. The image may have been compressed or edited."*
     - Image too small $\rightarrow$ *"Image capacity exceeded. Choose a larger image or shorten your message."*
   - Avoid leaking raw cryptographic stack traces to the UI.
3. **Zero-Persistence & Memory Hygiene:**
   - Strict rule: **Never** store passwords, plaintexts, or keys in `localStorage`, `sessionStorage`, or cookies.
   - Automatically wipe sensitive memory (clear textarea and password variables) when user clicks "Clear" or "Start Over".
   - XSS defense: Ensure recovered secret message is strictly injected via `element.textContent` or safe text nodes, never `innerHTML`.

### 6.3 Exit Criteria
- [ ] Main UI thread never stutters or freezes while deriving keys or embedding large messages.
- [ ] Toast notification system informs user of progress, warnings, and errors.
- [ ] No sensitive state persists after clearing or refreshing the page.

---

## Phase 7: Verification, Test Suite & Static Deployment

### 7.1 Objectives
Validate complete end-to-end functionality across diverse image types and payloads using an in-browser automated test runner (`test.html`), conduct cross-browser QA, and prepare for zero-build static hosting.

### 7.2 Tasks & Work Breakdown
1. **Automated In-Browser Test Suite (`test.html`):**
   - Build a lightweight, self-executing test runner testing:
     - **Test 1 (Crypto Roundtrip):** Encrypt plaintext $\rightarrow$ Decrypt with correct password $\rightarrow$ Assert exact string equality.
     - **Test 2 (Crypto Integrity):** Verify that wrong password throws authentication failure.
     - **Test 3 (Tampering Detection):** Flip a single ciphertext bit $\rightarrow$ Verify AES-GCM tag authentication rejection.
     - **Test 4 (Unicode & Emoji):** Test multi-byte payloads (e.g., `Hello 🌍 🔒 SecretPix 🚀`).
     - **Test 5 (Steganography Roundtrip):** Pack payload $\rightarrow$ Embed in synthetic `ImageData` $\rightarrow$ Extract payload $\rightarrow$ Verify byte-for-byte fidelity.
     - **Test 6 (Capacity Limits):** Test capacity boundary calculations and rejection on overflow.
     - **Test 7 (Full E2E Flow):** Create synthetic image $\rightarrow$ Encrypt & hide message $\rightarrow$ Export to PNG Blob $\rightarrow$ Re-read Blob $\rightarrow$ Extract & decrypt $\rightarrow$ Verify match.
2. **Cross-Browser & Device Verification:**
   - Test in Chrome, Firefox, Safari, and Microsoft Edge.
   - Test touch interactions and viewport scaling on mobile devices (iOS Safari and Android Chrome).
3. **Deployment Preparation:**
   - Create documentation: `README.md` with product overview, architecture diagram, and instructions for running locally or deploying.
   - Add static hosting configs (e.g. `_headers` for Cloudflare Pages / Netlify or `vercel.json` for Vercel) defining strict Content Security Policy headers:
     ```http
     Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; worker-src 'self' blob:; connect-src 'none';
     X-Content-Type-Options: nosniff
     X-Frame-Options: DENY
     Referrer-Policy: no-referrer
     ```
     *(The `connect-src 'none'` policy provides mathematical proof that the app cannot make outbound network requests).*

### 7.3 Exit Criteria
- [ ] All 7 automated test suites pass with 100% success rate in `test.html`.
- [ ] Application can be run locally by double-clicking `index.html` or serving with any basic static file server.
- [ ] Ready for immediate one-click deployment to GitHub Pages, Cloudflare Pages, or Vercel.

---

## Final Verification Checklist

- [ ] **Native Standards:** Built purely with HTML5, CSS3, and ES6 JavaScript (zero frameworks, zero build steps).
- [ ] **Web Crypto:** PBKDF2 derivation with SHA-256 and 600,000 iterations.
- [ ] **Authenticated Encryption:** AES-256-GCM with 128-bit authentication tag.
- [ ] **Fresh Salts & IVs:** Cryptographically unique 16-byte salt and 12-byte IV for every encryption.
- [ ] **Deterministic LSB:** Bits embedded solely into RGB channels; Alpha channel untouched.
- [ ] **Capacity Engine:** Accurately computes usable capacity and enforces limits.
- [ ] **Lossless Output:** Exports exclusively as uncompressed PNG.
- [ ] **Detection:** Instant payload header (`SPIX`) validation on file upload.
- [ ] **Integrity Rejection:** Wrong passwords or tampered images cleanly rejected.
- [ ] **Unicode & Emoji:** Complete preservation of accents, symbols, emojis, and multiline text.
- [ ] **Web Worker:** Heavy crypto and pixel operations executed off the main thread.
- [ ] **Zero Data Leaks:** Zero server uploads, zero remote APIs, zero persistent storage of secrets.
- [ ] **Responsive Design:** Polished mint/sage aesthetic working smoothly across desktop and mobile.
