import express, { Request, Response } from "express";
import { detectWatermarks, removeWatermarkWithGemini } from "./geminiService.ts";

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: "50mb" }));
apiRouter.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Health / status endpoint
apiRouter.get("/health", (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY);
  res.json({
    status: "ok",
    hasApiKey: hasKey,
    geminiVisionModel: "gemini-3.8-flash",
    geminiImageModel: "gemini-3.1-flash-lite-image",
  });
});

// Auto-detect watermarks using Gemini 3.8 Flash
apiRouter.post("/detect-watermarks", async (req: Request, res: Response) => {
  try {
    const { image, mimeType } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image base64 data" });
    }

    const result = await detectWatermarks(image, mimeType);
    return res.json({ success: true, ...result });
  } catch (error: any) {
    console.error("API /detect-watermarks error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to detect watermarks",
    });
  }
});

// Generative watermark removal using Gemini
apiRouter.post("/remove-watermark-gemini", async (req: Request, res: Response) => {
  try {
    const { image, mimeType, description } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Missing image base64 data" });
    }

    const result = await removeWatermarkWithGemini(image, mimeType, description);
    return res.json(result);
  } catch (error: any) {
    console.error("API /remove-watermark-gemini error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Failed to process generative removal",
    });
  }
});
