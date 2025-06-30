import express from "express";
import routes from "./routes";
import { webcrypto } from "crypto";
import db from "./db";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

app.use("/api", routes);

async function seedTestUsers() {
  const NUM_USERS = 3;

  for (let i = 1; i <= NUM_USERS; i++) {
    const userId = `user${i}`;

    const { publicKey } = await webcrypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    );

    const spki = await webcrypto.subtle.exportKey("spki", publicKey);
    const pem = toPEM(spki);

    db.prepare(
      "INSERT OR REPLACE INTO users (username, public_key) VALUES (?, ?)",
    ).run(userId, pem);

    console.log(`✅ Created test user ${userId}`);
  }
}

// Helper: Convert exported key buffer to PEM string
function toPEM(spki: ArrayBuffer): string {
  const b64 = Buffer.from(spki).toString("base64");
  const chunks = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN PUBLIC KEY-----\n${chunks}\n-----END PUBLIC KEY-----`;
}

// Start the server after seeding
seedTestUsers().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}`);
  });
});
