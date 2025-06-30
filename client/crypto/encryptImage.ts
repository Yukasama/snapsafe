import * as base64 from "base64-js";

export async function encryptImage(
  imageData: ArrayBuffer,
  recipientPublicKey: JsonWebKey,
): Promise<{ encryptedImage: string; iv: string; encryptedAESKey: string }> {
  console.debug("encryptImage called");

  const aesKey = crypto.getRandomValues(new Uint8Array(32));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const aesKeyObj = await crypto.subtle.importKey("raw", aesKey, "AES-GCM", false, ["encrypt"]);

  const encryptedImage = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKeyObj, imageData);

  const recipientKey = await crypto.subtle.importKey(
    "jwk",
    recipientPublicKey,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );

  const encryptedKey = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, recipientKey, aesKey);

  return {
    encryptedImage: base64.fromByteArray(new Uint8Array(encryptedImage)),
    encryptedAESKey: base64.fromByteArray(new Uint8Array(encryptedKey)),
    iv: base64.fromByteArray(iv),
  };
}
