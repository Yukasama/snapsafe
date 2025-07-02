import { uploadPublicKey } from "@/api/backend";
import { loadOrCreateRSAKeyPair } from "./keyManager";
import { install } from "react-native-quick-crypto";
import { config } from "@/config/config";

let cachedKeyPair: Awaited<ReturnType<typeof loadOrCreateRSAKeyPair>> | null = null;

export async function initCrypto() {
  install();
  if (!cachedKeyPair) {
    console.log("Initializing RSA keys...");
    cachedKeyPair = await loadOrCreateRSAKeyPair();
    try {
      await uploadPublicKey({ userId: config.username, publicKey: cachedKeyPair.publicKey });
    } catch (error) {
      console.warn("Failed to upload public key");
      return;
    }
    console.log("RSA keys ready");
  }

  return cachedKeyPair;
}

// Optional: access from elsewhere without reloading
export function getCachedKeyPair() {
  return cachedKeyPair;
}
