import { Request, Response, Router } from "express";
import db from "./db";
import { JsonWebKey } from "crypto";

const router = Router();

interface PublicKeyRow {
  public_key: JsonWebKey;
}

interface MessageRow {
  sender_id: string;
  iv: string;
  encrypted_key: Buffer;
  content: Buffer;
  type: string;
  timestamp: number;
}

// Upload or update a public key
router.post("/keys", (req: Request, res: Response): void => {
  console.debug("Received request to upload public key");
  const { userId, publicKey } = req.body;
  console.debug(`User ID: ${userId}, Public Key: ${JSON.stringify(publicKey)}`);
  if (!userId || !publicKey) {
    console.error("Missing userId or publicKey in request body");
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const stmt = db.prepare("INSERT OR REPLACE INTO users (username, public_key) VALUES (?, ?)");
  stmt.run(userId, JSON.stringify(publicKey));
  res.status(201).json({ success: true });
  console.debug(`Public key for user ${userId} stored successfully`);
});

// Fetch a public key by user ID
router.get("/keys/:userId", (req: Request, res: Response): void => {
  console.debug(`Fetching public key for user: ${req.params.userId}`);
  const row = db.prepare("SELECT public_key FROM users WHERE username = ?").get(req.params.userId) as
    | PublicKeyRow
    | undefined;
  if (!row) {
    console.debug(`No public key found for user ${req.params.userId}`);
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ publicKey: row.public_key });
});

// Store encrypted image + AES key
router.post("/messages", (req: Request, res: Response): void => {
  console.debug("Received request to store message");
  const { senderId, recipientId, iv, encryptedKey, content, type } = req.body;
  if (!senderId || !recipientId || !iv || !encryptedKey || !content || !type) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, encrypted_key, iv, content, type)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(senderId, recipientId, Buffer.from(encryptedKey, "base64"), iv, Buffer.from(content, "base64"), type);

  res.json({ success: true });
});

// Fetch most recent message for recipient
router.get("/messages/:recipientId", (req: Request, res: Response): void => {
  console.debug(`Fetching most recent message for recipient: ${req.params.recipientId}`);

  const stmt = db.prepare("SELECT * FROM messages WHERE recipient_id = ? ORDER BY timestamp DESC");
  const messages = stmt.all(req.params.recipientId) as MessageRow[] | undefined;
  console.debug(`Messages fetched: ${typeof messages}`);
  if (!messages || messages.length === 0) {
    res.status(404).json({ error: "No messages" });
    return;
  }

  console.debug(`Found ${messages.length} messages for recipient ${req.params.recipientId}`);

  // Delete messages after fetching
  const deleteStmt = db.prepare("DELETE FROM messages WHERE recipient_id = ?");
  deleteStmt.run(req.params.recipientId);

  console.debug(`Deleted messages for recipient ${req.params.recipientId}`);

  const result_messages = [];
  for (const msg of messages) {
    result_messages.push({
      from: msg.sender_id,
      iv: msg.iv,
      encryptedKey: Buffer.from(msg.encrypted_key).toString("base64"),
      content: Buffer.from(msg.content).toString("base64"),
      type: msg.type,
      timestamp: msg.timestamp,
    });
  }

  res.json(result_messages);
});

export default router;
