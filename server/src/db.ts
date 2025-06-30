import Database from "better-sqlite3";
import fs from "fs";

const db = new Database("e2ee.db");

// Load schema on first run
const schema = fs.readFileSync("schema.sql", "utf8");
db.exec(schema);

export default db;
