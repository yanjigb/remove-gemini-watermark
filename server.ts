import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { apiRouter } from "./server/apiRouter";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use("/api", apiRouter);

// Serve static frontend build in production
const distPath = path.resolve(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`Auto Watermark Remover server listening on port ${port}`);
});
