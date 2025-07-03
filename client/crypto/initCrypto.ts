import { uploadPublicKey } from "@/api/backend";
import { loadOrCreateRSAKeyPair } from "./keyManager";
import { install } from "react-native-quick-crypto";

let cachedKeyPair: Awaited<ReturnType<typeof loadOrCreateRSAKeyPair>> | null = null;

export async function initCrypto(userId: string) {
  install();
  if (!cachedKeyPair) {
    console.log(`Initializing RSA keys for ${userId}...`);
    cachedKeyPair = await loadOrCreateRSAKeyPair();
    try {
      await uploadPublicKey({ userId: userId, publicKey: cachedKeyPair.publicKey });
    } catch (error) {
      console.warn("Failed to upload public key:", error);
      // Invalidate cache on failure to allow retry
      cachedKeyPair = null;
      throw new Error("Could not upload public key.");
    }
    console.log("RSA keys ready");
  }

  return cachedKeyPair;
}

// Optional: access from elsewhere without reloading
export function getCachedKeyPair() {
  return cachedKeyPair;
}
