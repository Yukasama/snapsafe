import * as base64 from "base64-js";

export async function encryptImage(
  imageData: ArrayBuffer,
  recipientPublicPEM: string,
): Promise<{ encryptedImage: string; iv: string; encryptedAESKey: string }> {
  console.debug("encryptImage called with recipientPublicPEM:", recipientPublicPEM);
  const aesKey = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKeyObj = await crypto.subtle.importKey("raw", aesKey, "AES-GCM", false, ["encrypt"]);

  const encryptedImage = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKeyObj, imageData);

  const recipientKey = await importPEMPublicKey(recipientPublicPEM);

  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientKey, aesKey);

  return {
    //encryptedImage: Buffer.from(encryptedImage).toString("base64"),
    encryptedImage: base64.fromByteArray(new Uint8Array(encryptedImage)),
    // encryptedAESKey: Buffer.from(encryptedKey).toString("base64"),
    encryptedAESKey: base64.fromByteArray(new Uint8Array(encryptedKey)),
    // iv: Buffer.from(iv).toString("base64"),
    iv: base64.fromByteArray(iv),
  };
}

async function importPEMPublicKey(pem: string): Promise<CryptoKey> {
  const b64 = pem.replace(/-----(BEGIN|END) PUBLIC KEY-----/g, "").replace(/\n/g, "");
  const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("spki", binary.buffer, { name: "RSA-OAEP", hash: "SHA-256" }, false, ["encrypt"]);
}
