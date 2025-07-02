import * as base64 from "base64-js";

export async function decryptContent(
  encryptedContentB64: string,
  encryptedKeyB64: string,
  ivB64: string,
  privateKeyJWK: JsonWebKey,
): Promise<string> {
  const encryptedContent = Uint8Array.from(atob(encryptedContentB64), (c) => c.charCodeAt(0));
  const encryptedKey = Uint8Array.from(atob(encryptedKeyB64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

  const privateKey = await crypto.subtle.importKey("jwk", privateKeyJWK, { name: "RSA-OAEP", hash: "SHA-256" }, false, [
    "decrypt",
  ]);

  const rawKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedKey);
  const aesKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedContent);

  return base64.fromByteArray(new Uint8Array(decrypted));
}
