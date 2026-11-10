# SecretPix – Secure Image-Based Message Encryption and Decryption

**Project Overview**

SecretPix is a privacy-focused application that allows users to securely hide secret messages inside digital images using **Image Steganography and Cryptography**. It combines encryption and data hiding techniques to provide an additional layer of security for private communication.

Users can enter a text message, encrypt it using a password, and embed the encrypted data into an image without visibly changing its appearance. The generated image can then be shared with others. The recipient can upload the image, enter the correct password, extract the hidden data, and decrypt it to retrieve the original message.

**Key Features**
- **Message Encryption:** Encrypt secret messages using AES-256-GCM.
- **Image Steganography:** Hide encrypted messages inside image pixels using the Least Significant Bit (LSB) technique.
- **Message Decryption:** Extract and decrypt hidden messages using the correct password.
- **Image Upload and Download:** Support uploading original images and downloading encoded images.
- **File Hiding:** Optionally hide documents and other small files inside images.
- **Capacity Detection:** Display how much information an image can securely hold.
- **Privacy:** Process images and messages locally without requiring a server.

**Technology Stack**
- Frontend: React.js, HTML, CSS, JavaScript
- Image Processing: HTML Canvas API
- Encryption: AES-256-GCM
- Steganography: LSB Algorithm
- Cryptography: Web Crypto API

**Expected Outcome**

The project aims to demonstrate how cryptography and steganography can work together to create a secure communication system. It provides a practical application of cybersecurity concepts by allowing users to exchange confidential information through ordinary-looking digital images.

**Project Domain:** Cybersecurity, Cryptography, Image Processing and Data Security.