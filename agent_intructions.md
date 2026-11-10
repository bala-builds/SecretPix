# SECRETPIX — MASTER AI AGENT BUILD INSTRUCTIONS

## 1. YOUR ROLE

Act as a senior full-stack engineer, cybersecurity engineer, frontend architect, and premium UI/UX designer.

Your task is to design, develop, test, and deploy a complete, functional web application called **SecretPix**.

Do not create just a landing page, static mockup, or frontend prototype.

Build a fully working application with real encryption, image steganography, message extraction, decryption, file handling architecture, and responsive UI.

You are responsible for:
- Product architecture.
- Frontend development.
- UI/UX design.
- Component architecture.
- Cryptographic implementation.
- Image processing.
- Steganography algorithms.
- Error handling.
- Testing.
- Performance optimization.
- Deployment readiness.

Think like a product engineer building a real cybersecurity product.

---

# 2. PRODUCT DEFINITION

**Product:** SecretPix

**Tagline:** Hide in Plain Sight.

SecretPix is a privacy-focused image steganography and encryption application.

It allows users to hide confidential messages inside ordinary images using:

- AES-256-GCM encryption.
- PBKDF2 password-based key derivation.
- Least Significant Bit (LSB) image steganography.
- HTML Canvas API.
- Web Crypto API.

The recipient can upload the generated image, enter the password, extract the encrypted information, and decrypt the original message.

### Core principle

Everything must happen locally in the browser.

DO NOT:
- Upload user images to a backend.
- Send secret messages to APIs.
- Send passwords to servers.
- Store plaintext messages remotely.
- Introduce unnecessary authentication.
- Add a database just for the core encryption functionality.

The application must work without a backend.

---

# 3. TECH STACK

Use the following stack:

### Frontend
- React.js
- Vite
- TypeScript
- Tailwind CSS
- Lucide React
- Framer Motion

### Image Processing
- HTML Canvas API
- ImageData API
- File API
- Blob API

### Cryptography
- Web Crypto API
- AES-256-GCM
- PBKDF2
- SHA-256
- crypto.getRandomValues()

### Development
- ESLint
- Prettier
- Vitest
- React Testing Library

### Deployment
- Cloudflare Pages or Vercel.

Avoid unnecessary dependencies.

---

# 4. UI/UX DESIGN DIRECTION

You are also responsible for designing the complete product experience.

Do not use generic AI-generated dashboard designs.

The interface should look like a professionally designed premium privacy/security SaaS product.

## Design philosophy

- Premium minimalism.
- Modern and clean.
- Calm and trustworthy.
- Extremely simple workflows.
- Strong typography.
- Subtle animations.
- Plenty of whitespace.
- Clear visual hierarchy.
- Functional design over decoration.

### Color system

Use a sophisticated mint, sage, and pistachio-inspired color palette.

Primary palette:

- Primary: #52796F
- Primary Dark: #354F46
- Secondary: #84A98C
- Mint: #CADFD1
- Pistachio: #DCE8C8
- Background: #F7F9F6
- Surface: #FFFFFF
- Text: #202923
- Secondary Text: #7B877E
- Border: #E7ECE7
- Success: #39845D
- Error: #D9534F

Use green shades selectively.

Avoid:
- Excessive gradients.
- Neon colors.
- Heavy shadows.
- Glassmorphism everywhere.
- Excessive rounded cards.
- Unnecessary illustrations.
- Overloaded dashboards.

## Typography

Use:
- Inter or Geist for interface typography.
- Clear heading hierarchy.
- Medium-weight section headings.
- Comfortable paragraph line heights.
- Monospace font for technical metadata where appropriate.

## Component styling

- Border radius: 12–18px.
- Thin subtle borders.
- Soft neutral backgrounds.
- Minimal shadows.
- Clear hover and focus states.
- Consistent spacing system.
- Consistent icon sizing.
- Responsive layouts.

## Motion

Use Framer Motion for:
- Page transitions.
- Modal animations.
- Upload interactions.
- Processing indicators.
- Success states.
- Button hover feedback.

Keep animations subtle and fast.

Respect prefers-reduced-motion.

---

# 5. APPLICATION STRUCTURE

Create the following main application screens.

## Screen 1: Dashboard

The home screen should immediately explain what SecretPix does.

Layout:

### Header
- SecretPix logo.
- Product name.
- Navigation.
- How it works.
- Privacy information.
- Settings.

### Hero section

Heading:

"Your secrets deserve a better hiding place."

Description:

"Encrypt your private messages and hide them inside ordinary images. Secure, private, and processed entirely on your device."

Primary CTA:
"Hide a Message"

Secondary CTA:
"Reveal a Message"

### Main workspace

Two primary feature cards:

**Hide a Message**
- Image icon.
- Short description.
- CTA.
- Subtle green visual treatment.

**Reveal a Message**
- Unlock icon.
- Short description.
- CTA.
- Subtle neutral visual treatment.

### How it works

Show three steps:

1. Upload an image and write your message.
2. Encrypt and hide your message with a password.
3. Share the image and let the recipient unlock it.

### Privacy section

Display:
- No server uploads.
- Local encryption.
- Password protected.
- No account required.

Do not make unsupported claims such as undetectable steganography.

---

# 6. HIDE MESSAGE WORKSPACE

This is one of the most important screens.

Create a professional workspace with a clear step-by-step flow.

### Layout

Use a two-column desktop layout.

LEFT COLUMN:
Image upload and preview.

RIGHT COLUMN:
Message and encryption controls.

On mobile, stack the sections vertically.

### Image upload component

Features:
- Drag-and-drop upload.
- Browse files button.
- JPG/JPEG/PNG/WebP support.
- File size validation.
- Image preview.
- Remove image button.
- Image dimensions display.
- Upload progress or processing state.

Design:
- Dashed border.
- Minimal upload icon.
- Clear instructions.
- Subtle drag-over animation.

### Message editor

Include:
- Message textarea.
- Character count.
- Clear button.
- Optional text formatting disabled.
- Input validation.

### Password section

Include:
- Password input.
- Confirm password input.
- Show/hide toggle.
- Password strength indicator.
- Password requirements.
- Clear validation.

Never store passwords.

### Capacity indicator

Show:
- Total image capacity.
- Current payload size.
- Remaining capacity.
- Capacity percentage.
- Progress bar.

Display a warning when the payload is too large.

### Main action

Button:

"Encrypt & Hide Message"

On click:
1. Validate image.
2. Validate message.
3. Validate password.
4. Calculate capacity.
5. Generate salt and IV.
6. Derive AES key.
7. Encrypt message.
8. Create binary payload.
9. Embed payload using LSB.
10. Export image as PNG.
11. Display success screen.

Disable the button while processing.

---

# 7. ENCODE SUCCESS SCREEN

After successful encoding, show a polished result screen.

Display:
- Generated image preview.
- Success indicator.
- Original image dimensions.
- Payload size.
- Encryption algorithm.
- Processing status.

Primary button:
"Download Secure Image"

Secondary button:
"Create Another"

Optional:
"Copy Security Details"

Explain that the recipient needs the image and password to recover the message.

The generated image must be downloadable as PNG.

Do not alter the encoded image through additional compression or resizing.

---

# 8. REVEAL MESSAGE WORKSPACE

Create a separate extraction and decryption experience.

### Layout

1. Image upload area.
2. Image preview.
3. Extract hidden data button.
4. Payload detection status.
5. Password entry.
6. Decrypt button.
7. Recovered message display.

### Workflow

1. User uploads an encoded PNG.
2. Application reads image pixels.
3. Detects SecretPix magic header.
4. Reads payload length.
5. Extracts embedded bytes.
6. Validates payload structure.
7. Requests password.
8. Derives the AES key using stored salt.
9. Decrypts ciphertext using AES-GCM.
10. Displays original message.

### Recovered message screen

Show:
- Success status.
- Recovered message.
- Copy message button.
- Clear message button.
- Decode another image button.

The recovered message should be displayed in a readable text panel.

### Error handling

Support:
- No hidden payload found.
- Unsupported image.
- Corrupted payload.
- Incorrect password.
- Invalid payload length.
- Unsupported payload version.

Do not expose raw cryptographic errors to users.

---

# 9. CRYPTOGRAPHY IMPLEMENTATION

Implement real cryptography using Web Crypto API.

### Encryption

Use:
- AES-256-GCM.
- PBKDF2.
- SHA-256.
- 600,000 PBKDF2 iterations as the initial configuration.

Generate:
- 16-byte random salt.
- 12-byte random IV.
- 256-bit AES key.

Use crypto.getRandomValues().

Derive the key with PBKDF2.

Encrypt using AES-GCM with a 128-bit authentication tag.

### Decryption

1. Extract salt.
2. Extract IV.
3. Derive the same key from the password.
4. Decrypt ciphertext.
5. Verify authentication.
6. Return plaintext only if authentication succeeds.

Never implement homemade encryption.

Never reuse an IV with the same key.

Keep cryptographic code separate from UI components.

---

# 10. STEGANOGRAPHY IMPLEMENTATION

Implement LSB encoding using Canvas ImageData.

### Encoding

1. Read image pixels.
2. Convert encrypted payload into bytes.
3. Add a versioned payload header.
4. Calculate capacity.
5. Traverse eligible RGB channels in a deterministic order.
6. Replace the least significant bit of each channel with payload bits.
7. Preserve alpha values.
8. Export the modified image as PNG.

### Extraction

1. Read image pixels.
2. Follow the exact same channel traversal order.
3. Extract header.
4. Validate magic identifier.
5. Extract payload length.
6. Extract payload bytes.
7. Validate the binary structure.
8. Pass ciphertext to the decryption module.

### Important

Do not use JPEG for encoded output.

Lossy compression can destroy embedded information.

Do not resize encoded images.

Use a versioned payload format so future versions remain compatible.

Include robust validation against malformed headers and excessive declared lengths.

Use a consistent, documented bit ordering.

---

# 11. IMAGE CAPACITY CALCULATION

Implement capacity detection.

For RGB LSB with one bit per channel:

Available raw capacity:

(width × height × 3) / 8 bytes.

Subtract:
- Payload header.
- Encryption metadata.
- Salt.
- IV.
- Other required metadata.

Display actual usable payload capacity.

Ensure calculations use safe integer arithmetic.

The UI must prevent encoding when payload size exceeds capacity.

---

# 12. FILE HIDING — ARCHITECTURE PREPARATION

Do not prioritize file hiding over the working message workflow.

However, design the binary payload format so that it supports multiple payload types:

- TEXT
- FILE

For future file support, include:
- Original filename.
- MIME type.
- File size.
- Encrypted binary contents.

Never store file contents as plaintext inside the image.

Keep the architecture extensible.

---

# 13. COMPONENT ARCHITECTURE

Create reusable components.

Suggested components:

### Layout
- AppLayout
- Navbar
- Footer
- PageContainer

### Dashboard
- HeroSection
- FeatureCard
- HowItWorks
- PrivacyFeatures

### Upload
- ImageDropzone
- ImagePreview
- ImageMetadata
- UploadError

### Encryption
- MessageEditor
- PasswordInput
- PasswordStrength
- CapacityIndicator
- EncryptionProgress

### Decryption
- ExtractPanel
- PayloadStatus
- DecryptionForm
- RecoveredMessage

### Shared
- Button
- Card
- Modal
- Tooltip
- Toast
- ProgressBar
- LoadingState
- EmptyState
- ErrorState

Use reusable components instead of writing everything inside one large component.

---

# 14. PROJECT STRUCTURE

Use a modular project structure:

src/
  app/
    App.tsx
    routes.tsx

  components/
    common/
      Button.tsx
      Card.tsx
      Modal.tsx
      Toast.tsx
      ProgressBar.tsx

    layout/
      Navbar.tsx
      Footer.tsx
      AppLayout.tsx

    upload/
      ImageDropzone.tsx
      ImagePreview.tsx
      ImageMetadata.tsx

    encryption/
      MessageEditor.tsx
      PasswordInput.tsx
      CapacityIndicator.tsx

    decryption/
      ExtractPanel.tsx
      RecoveredMessage.tsx

  pages/
    Dashboard.tsx
    HideMessage.tsx
    RevealMessage.tsx
    About.tsx
    NotFound.tsx

  services/
    crypto/
      keyDerivation.ts
      encryption.ts
      decryption.ts

    steganography/
      encoder.ts
      decoder.ts
      capacity.ts
      payload.ts

    image/
      imageLoader.ts
      canvasProcessor.ts
      imageExporter.ts

  hooks/
    useImageUpload.ts
    useEncryption.ts
    useDecryption.ts

  utils/
    validation.ts
    formatting.ts
    errors.ts

  types/
    crypto.ts
    image.ts
    payload.ts

  styles/
    globals.css

  tests/
    crypto.test.ts
    steganography.test.ts
    capacity.test.ts
    integration.test.ts

Do not put cryptographic logic directly into React components.

---

# 15. FUNCTIONAL TESTING

You must test actual functionality, not just whether the interface renders.

### Encryption tests

- Correct password encrypts successfully.
- Different encryptions produce different salts and IVs.
- Incorrect passwords fail authentication.
- Empty messages are handled according to validation rules.
- Unicode and emoji messages work.
- Large messages are validated.

### Steganography tests

- Encode and decode a short message.
- Encode and decode a long message.
- Preserve image dimensions.
- Extract exact payload bytes.
- Reject invalid images.
- Reject corrupted payloads.
- Detect insufficient capacity.
- Verify PNG export and re-import.

### Integration tests

Perform the complete workflow:

1. Select an image.
2. Enter a message.
3. Enter a password.
4. Encrypt and hide.
5. Download PNG.
6. Reload the application.
7. Upload the PNG.
8. Extract.
9. Enter the password.
10. Decrypt.
11. Verify the exact original message.

Test Unicode, punctuation, newlines, and emoji.

---

# 16. PERFORMANCE AND SECURITY

Requirements:

- Process images locally.
- Use Web Workers for expensive operations when necessary.
- Avoid blocking the UI.
- Limit image dimensions and file sizes.
- Revoke temporary object URLs.
- Clean up event listeners.
- Clear sensitive application state when requested.
- Avoid logging secrets.
- Validate all payload lengths before allocating memory.
- Never execute extracted content.
- Do not trust uploaded file extensions alone.
- Avoid third-party analytics that could expose sensitive usage information.

Use a Content Security Policy and secure deployment headers where supported.

Do not claim that image steganography guarantees undetectability.

---

# 17. DEVELOPMENT EXECUTION PLAN

Follow this exact development order.

### Step 1 — Project setup
- Initialize React, Vite and TypeScript.
- Install dependencies.
- Configure Tailwind.
- Configure routing.
- Create project structure.

### Step 2 — Design system
- Define colors.
- Define typography.
- Define spacing.
- Create reusable UI components.
- Implement responsive layout.

### Step 3 — Frontend screens
- Dashboard.
- Hide Message.
- Reveal Message.
- Success states.
- Error states.
- About page.

### Step 4 — Image processing
- Image upload.
- Image preview.
- Canvas conversion.
- Capacity detection.
- PNG export.

### Step 5 — Cryptography
- PBKDF2.
- AES-256-GCM encryption.
- AES-256-GCM decryption.
- Salt and IV generation.

### Step 6 — Steganography
- Binary payload structure.
- LSB encoding.
- LSB extraction.
- Validation.

### Step 7 — Integration
- Connect all modules.
- Implement loading states.
- Implement error handling.
- Implement downloads.

### Step 8 — Testing
- Unit tests.
- Integration tests.
- Browser tests.
- Security validation.

### Step 9 — Production optimization
- Responsive testing.
- Performance optimization.
- Accessibility.
- Security headers.

### Step 10 — Deployment
- Build production version.
- Fix all build errors.
- Deploy to Cloudflare Pages or Vercel.
- Verify the hosted application.
- Test encryption and decryption on the deployed URL.

---

# 18. STRICT AGENT RULES

Follow these rules throughout development:

1. Do not stop after building the dashboard.
2. Do not create fake functionality.
3. Do not use mock encryption.
4. Do not simulate message extraction.
5. Do not use placeholder buttons.
6. Do not leave important features unfinished.
7. Do not use a backend for core processing.
8. Do not compromise cryptographic security for convenience.
9. Do not hardcode secret values.
10. Do not put the entire application in one file.
11. Do not ignore mobile responsiveness.
12. Do not sacrifice functionality for visual design.
13. Do not sacrifice security for visual design.
14. Test every primary user workflow.
15. Fix all console errors and build errors.
16. Maintain consistent UI components.
17. Handle edge cases.
18. Keep the code readable and maintainable.
19. Do not claim a feature is complete until it has been tested.
20. Do not claim deployment success until the live URL has been verified.

If something fails, investigate and fix it instead of hiding the error.

Make reasonable engineering decisions without repeatedly asking for approval.

---

# 19. FINAL DELIVERABLES

At completion, provide:

1. Complete source code.
2. Working responsive frontend.
3. Functional encryption engine.
4. Functional LSB steganography engine.
5. Functional extraction and decryption.
6. Capacity detection.
7. PNG download functionality.
8. Unit and integration tests.
9. README with installation instructions.
10. Technical architecture documentation.
11. Security implementation documentation.
12. Production build.
13. Live hosted URL.

### Final verification checklist

Before declaring completion, verify:

- [ ] Dashboard works.
- [ ] Hide Message screen works.
- [ ] Reveal Message screen works.
- [ ] Image upload works.
- [ ] Image preview works.
- [ ] AES-256-GCM works.
- [ ] PBKDF2 works.
- [ ] LSB encoding works.
- [ ] LSB decoding works.
- [ ] Capacity detection works.
- [ ] PNG export works.
- [ ] PNG re-import works.
- [ ] Correct password decrypts.
- [ ] Incorrect password is rejected.
- [ ] Unicode messages work.
- [ ] No backend transmission of sensitive data.
- [ ] Mobile layout works.
- [ ] Production build succeeds.
- [ ] Hosted URL is accessible.
- [ ] Full end-to-end test passes.

---

# 20. FINAL INSTRUCTION

Start building SecretPix immediately.

First inspect the existing project directory. If a project already exists, understand its architecture before making changes. Do not overwrite existing working functionality unnecessarily.

Then implement the product in the development order specified above.

Prioritize a premium, minimalist, mint-and-sage UI/UX while ensuring the cryptography and steganography are genuinely functional.

The finished result must look like a polished, professional cybersecurity product and function as a real application.

**SECRETPIX — Hide in Plain Sight.**