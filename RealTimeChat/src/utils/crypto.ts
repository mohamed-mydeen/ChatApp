/**
 * End-to-end encryption using Web Crypto API
 *
 * Protocol:
 *   - ECDH P-256  → key exchange (derive shared secret)
 *   - AES-GCM 256 → symmetric message encryption
 *
 * The server NEVER sees plaintext. It only relays ciphertext + IV.
 */

// ─── Key Generation ────────────────────────────────────────────────────────────

/**
 * Generate an ECDH key pair for this session.
 * Call once on login; store in memory (not localStorage — private key stays in memory only).
 */
export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,          // extractable so we can export the public key
    ['deriveKey']  // only used for key derivation
  );
}

/**
 * Export a public key to Base64 so it can be sent over the wire.
 */
export async function exportPublicKey(publicKey: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey('spki', publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(raw)));
}

/**
 * Import a Base64 public key received from another user.
 */
export async function importPublicKey(b64: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'spki',
    raw,
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    [] // public key has no usages
  );
}

// ─── Shared Secret Derivation ──────────────────────────────────────────────────

/**
 * Derive a shared AES-GCM key from our private key + their public key.
 * Both sides independently derive the SAME key — no secret travels the wire.
 */
export async function deriveSharedKey(
  myPrivateKey: CryptoKey,
  theirPublicKey: CryptoKey
): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: 'ECDH', public: theirPublicKey },
    myPrivateKey,
    { name: 'AES-GCM', length: 256 },
    false,       // not extractable — stays in memory
    ['encrypt', 'decrypt']
  );
}

// ─── Encrypt / Decrypt ─────────────────────────────────────────────────────────

/**
 * Encrypt a plaintext message.
 * Returns: { ciphertext: string, iv: string } — both Base64 encoded.
 * A random 12-byte IV is generated per message (critical for AES-GCM security).
 */
export async function encryptMessage(
  sharedKey: CryptoKey,
  plaintext: string
): Promise<{ ciphertext: string; iv: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    sharedKey,
    encoded
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertextBuffer))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

/**
 * Decrypt a ciphertext received from another user.
 * Returns the original plaintext string.
 */
export async function decryptMessage(
  sharedKey: CryptoKey,
  ciphertext: string,
  iv: string
): Promise<string> {
  const ciphertextBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const plaintextBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBytes },
    sharedKey,
    ciphertextBytes
  );

  return new TextDecoder().decode(plaintextBuffer);
}
