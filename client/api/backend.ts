import { config } from "@/config/config";
import { JWK } from "react-native-quick-crypto/lib/typescript/src/keys";

const baseUrl = config.backendBaseUrl;

// ====== Interfaces ======

export interface PublicKeyUploadRequest {
  userId: string;
  publicKey: JsonWebKey;
}

export interface PublicKeyResponse {
  publicKey: JsonWebKey;
}

export interface EncryptedMessageRequest {
  senderId: string;
  recipientId: string;
  iv: string; // base64
  encryptedKey: string; // base64 AES key encrypted with RSA
  content: string; // base64 AES-encrypted image
  type: "image" | "text";
  timestamp: number;
}

export interface EncryptedMessageResponse {
  from: string;
  iv: string;
  encryptedKey: string;
  content: string;
  type: "image" | "text";
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
  const data = await res.json();

  return {
    publicKey: JSON.parse(data.publicKey) as JsonWebKey,
  } as PublicKeyResponse;
}

export async function sendEncryptedMessage(data: EncryptedMessageRequest): Promise<void> {
  console.debug("Sending encrypted message from:", data.senderId, "to:", data.recipientId);
  await fetch(`${baseUrl}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function getLatestEncryptedMessages(recipientId: string): Promise<EncryptedMessageResponse[]> {
  console.debug("Fetching latest encrypted message for recipient:", recipientId);
  const res = await fetch(`${baseUrl}/messages/${recipientId}`);
  if (!res.ok) throw new Error("No messages found");
  const messages = await res.json();
  console.debug("Received messages:", messages.length);
  return messages as EncryptedMessageResponse[];
}
