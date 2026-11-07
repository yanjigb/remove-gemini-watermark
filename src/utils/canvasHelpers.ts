import { WatermarkBox } from "../types";
export { createCanvas, loadToCanvas } from "./inpainting";

/**
 * Convert normalized [ymin, xmin, ymax, xmax] (0-1000) to pixel rect
 */
export function boxToPixelRect(
  box: [number, number, number, number],
  width: number,
  height: number
): { x: number; y: number; width: number; height: number } {
  const [ymin, xmin, ymax, xmax] = box;
  const x = Math.max(0, Math.round((xmin / 1000) * width));
  const y = Math.max(0, Math.round((ymin / 1000) * height));
  const w = Math.min(width - x, Math.round(((xmax - xmin) / 1000) * width));
  const h = Math.min(height - y, Math.round(((ymax - ymin) / 1000) * height));
  return { x, y, width: Math.max(1, w), height: Math.max(1, h) };
}

/**
 * Render enabled watermark boxes onto a mask canvas
 */
export function renderBoxesToMask(
  maskCanvas: HTMLCanvasElement,
  boxes: WatermarkBox[],
  imageWidth: number,
  imageHeight: number,
  paddingPx: number = 8
) {
  const ctx = maskCanvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "rgba(255, 255, 255, 1.0)";

  for (const box of boxes) {
    if (!box.enabled) continue;
    const rect = boxToPixelRect(box.box2d, imageWidth, imageHeight);
    const px = Math.max(0, rect.x - paddingPx);
    const py = Math.max(0, rect.y - paddingPx);
    const pw = Math.min(imageWidth - px, rect.width + paddingPx * 2);
    const ph = Math.min(imageHeight - py, rect.height + paddingPx * 2);

    ctx.fillRect(px, py, pw, ph);
  }
}

/**
 * Draw smooth line on canvas with rounded caps
 */
export function drawBrushLine(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size: number,
  isEraser: boolean = false
) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = size;

  if (isEraser) {
    ctx.globalCompositeOperation = "destination-out";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(255, 255, 255, 1.0)";
    ctx.strokeStyle = "rgba(255, 255, 255, 1.0)";
  }

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  // Draw circle at end point to ensure smooth stroke
  ctx.beginPath();
  ctx.arc(toX, toY, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Format bytes to readable string (e.g. 1.4 MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

/**
 * Download canvas as image file
 */
export function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType: string = "image/png",
  quality: number = 0.95
) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL(mimeType, quality);
  link.click();
}

/**
 * Copy canvas image to user's system clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return false;
    await navigator.clipboard.write([
      new ClipboardItem({
        "image/png": blob,
      }),
    ]);
    return true;
  } catch (err) {
    console.warn("Clipboard write failed:", err);
    return false;
  }
}
