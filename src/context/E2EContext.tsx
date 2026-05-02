import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  deriveSharedKey,
  encryptMessage,
  decryptMessage,
} from '../utils/crypto';

interface E2EContextType {
  /** Encrypt a message to a specific contact */
  encrypt: (receiverId: string, plaintext: string) => Promise<{ ciphertext: string; iv: string } | null>;
  /** Decrypt a message from a specific contact */
  decrypt: (senderId: string, ciphertext: string, iv: string) => Promise<string>;
  /** Export our public key as Base64 (share this via the server) */
  getMyPublicKey: () => Promise<string | null>;
  /** Register a contact's public key — derive shared secret immediately */
  registerPeerKey: (peerId: string, publicKeyB64: string) => Promise<void>;
}

const E2EContext = createContext<E2EContextType | null>(null);

export function E2EProvider({ children }: { children: React.ReactNode }) {
  const keyPairRef = useRef<CryptoKeyPair | null>(null);
  // Map peerId → shared AES-GCM key
  const sharedKeysRef = useRef<Map<string, CryptoKey>>(new Map());
  const [ready, setReady] = useState(false);

  // Generate our ECDH key pair once on mount
  useEffect(() => {
    generateKeyPair().then(kp => {
      keyPairRef.current = kp;
      setReady(true);
      console.log('[E2E] Key pair generated ✅');
    });
  }, []);

  const getMyPublicKey = async (): Promise<string | null> => {
    if (!keyPairRef.current) return null;
    return exportPublicKey(keyPairRef.current.publicKey);
  };

  const registerPeerKey = async (peerId: string, publicKeyB64: string): Promise<void> => {
    if (!keyPairRef.current) throw new Error('Keys not ready yet');
    const theirPublicKey = await importPublicKey(publicKeyB64);
    const shared = await deriveSharedKey(keyPairRef.current.privateKey, theirPublicKey);
    sharedKeysRef.current.set(peerId, shared);
    console.log(`[E2E] Shared key derived for peer ${peerId} ✅`);
  };

  const encrypt = async (receiverId: string, plaintext: string) => {
    const sharedKey = sharedKeysRef.current.get(receiverId);
    if (!sharedKey) {
      console.warn(`[E2E] No shared key for ${receiverId} — sending unencrypted`);
      return null; // Fallback: caller should handle
    }
    return encryptMessage(sharedKey, plaintext);
  };

  const decrypt = async (senderId: string, ciphertext: string, iv: string): Promise<string> => {
    const sharedKey = sharedKeysRef.current.get(senderId);
    if (!sharedKey) {
      console.warn(`[E2E] No shared key for ${senderId} — returning raw`);
      return ciphertext; // Fallback
    }
    try {
      return await decryptMessage(sharedKey, ciphertext, iv);
    } catch (e) {
      console.error('[E2E] Decryption failed:', e);
      return '[Encrypted message — cannot decrypt]';
    }
  };

  if (!ready) return null;

  return (
    <E2EContext.Provider value={{ encrypt, decrypt, getMyPublicKey, registerPeerKey }}>
      {children}
    </E2EContext.Provider>
  );
}

export function useE2E() {
  const ctx = useContext(E2EContext);
  if (!ctx) throw new Error('useE2E must be used inside E2EProvider');
  return ctx;
}
