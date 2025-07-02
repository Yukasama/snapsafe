-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL
);

-- Encrypted messages
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_id TEXT NOT NULL,
  recipient_id TEXT NOT NULL,
  encrypted_key BLOB NOT NULL,
  iv TEXT NOT NULL,
  content BLOB NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('text', 'image')),
  timestamp INTEGER DEFAULT (strftime('%s','now'))
);

