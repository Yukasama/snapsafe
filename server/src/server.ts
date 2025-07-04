import express from "express";
import routes from "./routes";

const app = express();
const PORT = 50648;
// listen on all interfaces
const BASE_URL = "127.0.0.1";

app.use(express.json({ limit: "10mb" }));

app.use("/api", routes);

app.listen(PORT, BASE_URL, () => {
  console.log(`🚀 Server ready at http://${BASE_URL}:${PORT}`);
});
