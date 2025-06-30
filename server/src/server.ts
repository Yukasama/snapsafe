import express from "express";
import routes from "./routes";
import { webcrypto } from "crypto";
import db from "./db";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

app.use("/api", routes);

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
