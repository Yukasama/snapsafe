import { Request, Response, Router } from "express";
import db from "./db";

const router = Router();

interface PublicKeyRow {
  public_key: string;
}

interface MessageRow {
  sender_id: string;
  iv: string;
  encrypted_key: Buffer;
  image: Buffer;
  timestamp: number;
}

// Upload or update a public key
router.post("/keys", (req: Request, res: Response): void => {
  const { userId, publicKey } = req.body;
  if (!userId || !publicKey) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const stmt = db.prepare(
    "INSERT OR REPLACE INTO users (uername, public_key) VALUES (?, ?)",
  );
  stmt.run(userId, publicKey);
  res.status(201).json({ success: true });
});

// Fetch a public key by user ID
router.get("/keys/:userId", (req: Request, res: Response): void => {
  const row = db
    .prepare("SELECT public_key FROM users WHERE username = ?")
    .get(req.params.userId) as PublicKeyRow | undefined;
  if (!row) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ publicKey: row.public_key });
});

// Store encrypted image + AES key
router.post("/messages", (req: Request, res: Response): void => {
  const { senderId, recipientId, iv, encryptedKey, image } = req.body;
  if (!senderId || !recipientId || !iv || !encryptedKey || !image) {
    res.status(400).json({ error: "Missing fields" });
    return;
  }

  const stmt = db.prepare(`
    INSERT INTO messages (sender_id, recipient_id, encrypted_key, iv, image)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(
    senderId,
    recipientId,
    Buffer.from(encryptedKey, "base64"),
    iv,
    Buffer.from(image, "base64"),
  );

  res.json({ success: true });
});

// Fetch most recent message for recipient
router.get("/messages/:recipientId", (req: Request, res: Response): void => {
  const stmt = db.prepare(
    "SELECT * FROM messages WHERE recipient_id = ? ORDER BY timestamp DESC LIMIT 1",
  );
  const msg = stmt.get(req.params.recipientId) as MessageRow | undefined;
  if (!msg) {
    res.status(404).json({ error: "No messages" });
    return;
  }

  res.json({
    from: msg.sender_id,
    iv: msg.iv,
    encryptedKey: Buffer.from(msg.encrypted_key).toString("base64"),
    image: Buffer.from(msg.image).toString("base64"),
    timestamp: msg.timestamp,
  });
});

export default router;
