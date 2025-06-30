import { uploadPublicKey } from "@/api/backend";
import { loadOrCreateRSAKeyPair } from "./keyManager";
import { install } from "react-native-quick-crypto";

let cachedKeyPair: Awaited<ReturnType<typeof loadOrCreateRSAKeyPair>> | null = null;

export async function initCrypto() {
  install();
  if (!cachedKeyPair) {
    console.log("🔑 Initializing RSA keys...");
    const uuid = crypto.randomUUID();
    cachedKeyPair = await loadOrCreateRSAKeyPair();
    await uploadPublicKey({ userId: uuid as string, publicKey: cachedKeyPair.publicKey as string });
    console.log("✅ RSA keys ready");
  }

  return cachedKeyPair;
}

// Optional: access from elsewhere without reloading
export function getCachedKeyPair() {
  return cachedKeyPair;
}
