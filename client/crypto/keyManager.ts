import * as SecureStore from "expo-secure-store";

const PRIVATE_KEY_STORE = "rsa-private-jwk";
const PUBLIC_KEY_STORE = "rsa-public-jwk";

export async function loadOrCreateRSAKeyPair() {
  // 1) Try loading
  const rawPriv = await SecureStore.getItemAsync(PRIVATE_KEY_STORE);
  const rawPub = await SecureStore.getItemAsync(PUBLIC_KEY_STORE);
  if (rawPriv && rawPub) {
    const privateKey = await importJWKPrivateKey();
    return { publicKey: JSON.parse(rawPub), privateKey };
  }

  // 2) Generate new
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );

  // 3) Export to JWK
  const jwkPrivate = await crypto.subtle.exportKey("jwk", privateKey);
  const jwkPublic = await crypto.subtle.exportKey("jwk", publicKey);

  // 4) Persist
  await SecureStore.setItemAsync(PRIVATE_KEY_STORE, JSON.stringify(jwkPrivate));
  await SecureStore.setItemAsync(PUBLIC_KEY_STORE, JSON.stringify(jwkPublic));

  return { publicKey: jwkPublic, privateKey };
}

async function importJWKPrivateKey(): Promise<CryptoKey> {
  const raw = await SecureStore.getItemAsync(PRIVATE_KEY_STORE);
  const jwk = JSON.parse(raw!);
  return crypto.subtle.importKey("jwk", jwk, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["decrypt"]);
}
