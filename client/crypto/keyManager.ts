import * as SecureStore from "expo-secure-store";

const PRIVATE_KEY_STORE = "rsa-private-jwk";
const PUBLIC_KEY_STORE = "rsa-public-jwk";

export async function loadOrCreateRSAKeyPair(): Promise<{
  publicKey: JsonWebKey;
  privateKey: JsonWebKey;
}> {
  const rawPriv = await SecureStore.getItemAsync(PRIVATE_KEY_STORE);
  const rawPub = await SecureStore.getItemAsync(PUBLIC_KEY_STORE);

  if (rawPriv && rawPub) {
    // Return stored keys as JWK
    return {
      publicKey: JSON.parse(rawPub),
      privateKey: JSON.parse(rawPriv),
    };
  }

  // Generate new RSA key pair
  const { publicKey, privateKey } = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  // Export keys as JWK
  const jwkPrivate = await crypto.subtle.exportKey("jwk", privateKey);
  const jwkPublic = await crypto.subtle.exportKey("jwk", publicKey);

  // Save to SecureStore
  await SecureStore.setItemAsync(PRIVATE_KEY_STORE, JSON.stringify(jwkPrivate));
  await SecureStore.setItemAsync(PUBLIC_KEY_STORE, JSON.stringify(jwkPublic));

  return {
    publicKey: jwkPublic,
    privateKey: jwkPrivate,
  };
}
