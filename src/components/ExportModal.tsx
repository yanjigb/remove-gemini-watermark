import React, { useState } from "react";
import { X, Download, Copy, Check, Sparkles, Image as ImageIcon } from "lucide-react";
import { downloadCanvas, copyCanvasToClipboard, formatBytes } from "../utils/canvasHelpers";

interface ExportModalProps {
  canvas: HTMLCanvasElement | null;
  originalFilename: string;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  canvas,
  originalFilename,
  onClose,
}) => {
  const [format, setFormat] = useState<"image/png" | "image/jpeg" | "image/webp">("image/png");
  const [quality, setQuality] = useState<number>(0.95);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  if (!canvas) return null;

  const width = canvas.width;
  const height = canvas.height;

  const getCleanedFilename = () => {
    const base = originalFilename.replace(/\.[^/.]+$/, "");
    const ext = format === "image/png" ? "png" : format === "image/jpeg" ? "jpg" : "webp";
    return `${base}_clean.${ext}`;
  };

  const handleDownload = () => {
    downloadCanvas(canvas, getCleanedFilename(), format, quality);
  };

  const handleCopy = async () => {
    const success = await copyCanvasToClipboard(canvas);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Download className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Export Cleaned Image
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Image Dimensions & Specs */}
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-zinc-400 block text-[11px]">Resolution</span>
              <span className="font-mono text-zinc-100 font-medium">
                {width} &times; {height} px
              </span>
            </div>
            <div className="text-right">
              <span className="text-zinc-400 block text-[11px]">Quality</span>
              <span className="font-medium text-emerald-400">
                Original Preservation
              </span>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1.5">
              File Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setFormat("image/png")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  format === "image/png"
                    ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                PNG
                <span className="block text-[10px] text-zinc-400 font-normal">
                  Lossless
                </span>
              </button>

              <button
                onClick={() => setFormat("image/jpeg")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  format === "image/jpeg"
                    ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                JPEG
                <span className="block text-[10px] text-zinc-400 font-normal">
                  Compact
                </span>
              </button>

              <button
                onClick={() => setFormat("image/webp")}
                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all ${
                  format === "image/webp"
                    ? "bg-emerald-950/60 border-emerald-500/60 text-emerald-300 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                WebP
                <span className="block text-[10px] text-zinc-400 font-normal">
                  Modern
                </span>
              </button>
            </div>
          </div>

          {/* Quality Slider (for JPEG / WEBP) */}
          {format !== "image/png" && (
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-medium text-zinc-300">Image Quality</span>
                <span className="font-mono text-zinc-400">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.0"
                step="0.05"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-semibold text-zinc-100 shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-xs font-medium text-zinc-200 border border-zinc-700 transition-all flex items-center justify-center gap-1.5"
              title="Copy to clipboard"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
