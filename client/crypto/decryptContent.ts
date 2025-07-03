import * as base64 from "base64-js";

export async function decryptContentRaw(
  encryptedContentB64: string,
  encryptedKeyB64: string,
  ivB64: string,
  privateKeyJWK: JsonWebKey,
): Promise<ArrayBuffer> {
  const encryptedContent = base64.toByteArray(encryptedContentB64);
  const encryptedKey = base64.toByteArray(encryptedKeyB64);
  const iv = base64.toByteArray(ivB64);

  const privateKey = await crypto.subtle.importKey("jwk", privateKeyJWK, { name: "RSA-OAEP", hash: "SHA-256" }, false, [
    "decrypt",
  ]);

  const rawAesKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedKey);

  const aesKey = await crypto.subtle.importKey("raw", rawAesKey, "AES-GCM", false, ["decrypt"]);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedContent);

  return decrypted; // ArrayBuffer
}

export async function decryptText(
  encryptedContentB64: string,
  encryptedKeyB64: string,
  ivB64: string,
  privateKeyJWK: JsonWebKey,
): Promise<string> {
  const buffer = await decryptContentRaw(encryptedContentB64, encryptedKeyB64, ivB64, privateKeyJWK);
  return new TextDecoder().decode(buffer);
}
