import * as base64 from "base64-js";

export async function decryptContent(
  encryptedContentB64: string,
  encryptedKeyB64: string,
  ivB64: string,
  privateKeyJWK: JsonWebKey,
): Promise<string> {
  try {
    const encryptedContent = Uint8Array.from(atob(encryptedContentB64), (c) => c.charCodeAt(0));
    const encryptedKey = Uint8Array.from(atob(encryptedKeyB64), (c) => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

    const privateKey = await crypto.subtle.importKey(
      "jwk",
      privateKeyJWK,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"],
    );

    const rawKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedKey);
    const aesKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedContent);
    return base64.fromByteArray(new Uint8Array(decrypted));
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed. Please check your keys and data.");
  }
}

export async function decryptContentRaw(
  encryptedContentB64: string,
  encryptedKeyB64: string,
  ivB64: string,
  privateKeyJWK: JsonWebKey,
): Promise<ArrayBuffer> {
  try {
    const encryptedContent = base64.toByteArray(encryptedContentB64);
    const encryptedKey = base64.toByteArray(encryptedKeyB64);
    const iv = base64.toByteArray(ivB64);

    const privateKey = await crypto.subtle.importKey(
      "jwk",
      privateKeyJWK,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"],
    );

    const rawAesKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedKey);
    const aesKey = await crypto.subtle.importKey("raw", rawAesKey, "AES-GCM", false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedContent);

    return decrypted; // ArrayBuffer
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed. Please check your keys and data.");
  }
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
