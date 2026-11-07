export interface WatermarkBox {
  id: string;
  label: string;
  type: "text" | "logo" | "pattern" | "timestamp" | "signature" | "other";
  text?: string;
  confidence?: number;
  box2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  enabled: boolean;
}

export interface ImageItem {
  id: string;
  name: string;
  originalUrl: string;
  originalWidth: number;
  originalHeight: number;
  mimeType: string;
  sizeBytes: number;
  detectedBoxes: WatermarkBox[];
  cleanedUrl?: string;
  cleanedEngine?: "gemini" | "neural-texture" | "hybrid";
  status: "idle" | "detecting" | "detected" | "removing" | "completed" | "error";
  errorMessage?: string;
  processingTimeMs?: number;
}

export type ToolMode = "select" | "box" | "brush" | "eraser";

export type ViewMode = "split" | "side-by-side" | "original" | "result" | "mask";

export interface ProcessingSettings {
  engine: "auto" | "gemini" | "neural-texture";
  maskExpansionPx: number;
  featherRadiusPx: number;
  textureNoiseBlend: number;
  exportFormat: "image/png" | "image/jpeg" | "image/webp";
  exportQuality: number;
}
