import { config } from "@/config/config";

const baseUrl = config.backendBaseUrl;

// ====== Interfaces ======

export interface PublicKeyUploadRequest {
  userId: string;
  publicKey: string;
}

export interface PublicKeyResponse {
  publicKey: string;
}

export interface EncryptedImageRequest {
  senderId: string;
  recipientId: string;
  iv: string; // base64
  encryptedKey: string; // base64 AES key encrypted with RSA
  image: string; // base64 AES-encrypted image
}

export interface EncryptedMessageResponse {
  from: string;
  iv: string;
  encryptedKey: string;
  image: string;
  timestamp: number;
}

// ====== API Functions ======

export async function uploadPublicKey(data: PublicKeyUploadRequest): Promise<void> {
  console.debug("Uploading public key for user:", data.userId);
  await fetch(`${baseUrl}/keys`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getPublicKey(userId: string): Promise<PublicKeyResponse> {
  console.debug("Fetching public key for user:", userId);
  const res = await fetch(`${baseUrl}/keys/${userId}`);
  if (!res.ok) throw new Error("Public key not found");
  return await res.json();
}

export async function sendEncryptedImage(data: EncryptedImageRequest): Promise<void> {
  console.debug("Sending encrypted image from:", data.senderId, "to:", data.recipientId);
  await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getLatestEncryptedMessage(recipientId: string): Promise<EncryptedMessageResponse> {
  console.debug("Fetching latest encrypted message for recipient:", recipientId);
  const res = await fetch(`${baseUrl}/messages/${recipientId}`);
  if (!res.ok) throw new Error("No messages found");
  return await res.json();
}
