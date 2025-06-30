export async function decryptImage(
  encryptedImageB64: string,
  encryptedKeyB64: string,
  ivB64: string,
  privateKey: CryptoKey,
): Promise<Blob> {
  console.debug("decryptImage called with encryptedImageB64:", encryptedImageB64);
  const encryptedImage = Uint8Array.from(atob(encryptedImageB64), (c) => c.charCodeAt(0));
  const encryptedKey = Uint8Array.from(atob(encryptedKeyB64), (c) => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivB64), (c) => c.charCodeAt(0));

  const rawKey = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, encryptedKey);

  const aesKey = await crypto.subtle.importKey("raw", rawKey, "AES-GCM", false, ["decrypt"]);

  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, aesKey, encryptedImage);

  return new Blob([decrypted]);
}
