import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface DetectedWatermark {
  id: string;
  label: string;
  type: "text" | "logo" | "pattern" | "timestamp" | "signature" | "other";
  text?: string;
  confidence?: number;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  recommendedAction?: string;
}

export interface DetectionResult {
  detected: boolean;
  watermarks: DetectedWatermark[];
  imageDescription?: string;
  recommendations?: string;
}

/**
 * Detect watermarks, logos, text stamps using Gemini 3.8 Flash Vision
 */
export async function detectWatermarks(
  base64Data: string,
  mimeType: string = "image/jpeg"
): Promise<DetectionResult> {
  // Strip data URL prefix if present
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || "image/jpeg",
          },
        },
        {
          text: `You are an expert computer vision system for digital image restoration.
Scan this image meticulously to detect ALL watermarks, logos, brand emblems, copyright text, stock photo watermark grids/patterns, social media handles, timestamps, signatures, or camera date stamps.

For each detected watermark or overlay:
1. Provide accurate bounding box coordinates in [ymin, xmin, ymax, xmax] format normalized between 0 and 1000 (0=top/left, 1000=bottom/right).
2. Specify the type: "text", "logo", "pattern", "timestamp", "signature", or "other".
3. Provide descriptive label and any readable text.
4. Estimate confidence (0.0 to 1.0).

If no watermarks or overlays are found, return detected: false and watermarks: [].
Output must conform strictly to the JSON schema.`,
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detected: { type: Type.BOOLEAN },
            watermarks: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  label: { type: Type.STRING },
                  type: { type: Type.STRING },
                  text: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  box2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                  },
                  recommendedAction: { type: Type.STRING },
                },
                required: ["id", "label", "type", "box2d"],
              },
            },
            imageDescription: { type: Type.STRING },
            recommendations: { type: Type.STRING },
          },
          required: ["detected", "watermarks"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      return { detected: false, watermarks: [] };
    }

    const parsed = JSON.parse(text) as DetectionResult;
    return parsed;
  } catch (error: any) {
    console.error("Gemini watermark detection error:", error);
    throw error;
  }
}

/**
 * Remove watermark using Gemini image generation/editing model
 */
export async function removeWatermarkWithGemini(
  base64Data: string,
  mimeType: string = "image/jpeg",
  watermarkDescription?: string
): Promise<{ success: boolean; imageUrl?: string; message?: string; modelUsed?: string }> {
  const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

  const prompt = watermarkDescription
    ? `Task: Clean inpainting and watermark removal. Remove the following watermark: "${watermarkDescription}". Reconstruct the underlying background texture, geometry, lighting, and details seamlessly without leaving any blur, artifact, or remnants. Maintain original resolution, colors, and content outside the watermark.`
    : `Task: Seamless watermark and text removal. Completely erase all watermarks, logos, text overlays, and stamps from this image. Inpaint and restore the covered background with photographic realism, consistent texture, and accurate lighting. Output only the clean restored image.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const outBase64 = part.inlineData.data;
        const outMime = part.inlineData.mimeType ?? "image/png";
        return {
          success: true,
          imageUrl: `data:${outMime};base64,${outBase64}`,
          modelUsed: "gemini-3.1-flash-lite-image",
        };
      }
    }

    return {
      success: false,
      message: "No image was returned by the generative model.",
    };
  } catch (error: any) {
    console.error("Gemini generative removal error:", error);
    return {
      success: false,
      message: error?.message || "Error calling Gemini image model",
    };
  }
}
