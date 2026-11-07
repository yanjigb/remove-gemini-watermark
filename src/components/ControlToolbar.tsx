import React from "react";
import { ToolMode, ViewMode } from "../types";
import {
  Sparkles,
  Wand2,
  Hand,
  Square,
  Paintbrush,
  Eraser,
  Columns,
  Image as ImageIcon,
  CheckCircle,
  Download,
  Trash2,
  Maximize2,
  RefreshCw,
  Plus,
  Zap,
} from "lucide-react";

interface ControlToolbarProps {
  toolMode: ToolMode;
  onSetToolMode: (mode: ToolMode) => void;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  brushSize: number;
  onSetBrushSize: (size: number) => void;
  hasCleanedImage: boolean;
  isDetecting: boolean;
  isRemoving: boolean;
  onDetectWatermarks: () => void;
  onRemoveWatermarks: () => void;
  onClearMask: () => void;
  onExpandMask: () => void;
  onOpenExport: () => void;
  detectedCount: number;
  activeEngine: string;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  toolMode,
  onSetToolMode,
  viewMode,
  onSetViewMode,
  brushSize,
  onSetBrushSize,
  hasCleanedImage,
  isDetecting,
  isRemoving,
  onDetectWatermarks,
  onRemoveWatermarks,
  onClearMask,
  onExpandMask,
  onOpenExport,
  detectedCount,
  activeEngine,
}) => {
  return (
    <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2.5 z-20 select-none">
      {/* Left: AI Actions */}
      <div className="flex items-center gap-2">
        {/* Auto Detect Button */}
        <button
          onClick={onDetectWatermarks}
          disabled={isDetecting || isRemoving}
          className="relative group overflow-hidden px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-950 bg-gradient-to-r from-amber-400 via-emerald-400 to-teal-300 hover:opacity-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50 transition-all flex items-center gap-1.5 active:scale-95"
        >
          {isDetecting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Scanning with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-zinc-950" />
              <span>Auto Detect Watermarks</span>
              {detectedCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-zinc-950/20 text-[10px] font-bold">
                  {detectedCount}
                </span>
              )}
            </>
          )}
        </button>

        {/* Remove Watermarks Button */}
        <button
          onClick={onRemoveWatermarks}
          disabled={isDetecting || isRemoving}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-100 bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          {isRemoving ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              <span>Restoring Texture...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5 text-emerald-200" />
              <span>Remove Watermarks</span>
            </>
          )}
        </button>
      </div>

      {/* Middle: Canvas Drawing Tools */}
      <div className="flex items-center gap-1 bg-zinc-950/80 p-1 rounded-lg border border-zinc-800/90">
        <button
          onClick={() => onSetToolMode("select")}
          className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
            toolMode === "select"
              ? "bg-zinc-800 text-zinc-100 shadow"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
          title="Pan / Hand tool (Drag to move canvas)"
        >
          <Hand className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pan</span>
        </button>

        <button
          onClick={() => onSetToolMode("box")}
          className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
            toolMode === "box"
              ? "bg-zinc-800 text-amber-300 shadow"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
          title="Box Selection tool (Drag rectangle to mark watermark)"
        >
          <Square className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Box</span>
        </button>

        <button
          onClick={() => onSetToolMode("brush")}
          className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
            toolMode === "brush"
              ? "bg-rose-950/80 text-rose-300 border border-rose-800/50"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
          title="Brush Mask (Paint over watermarks)"
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Brush</span>
        </button>

        <button
          onClick={() => onSetToolMode("eraser")}
          className={`p-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1 ${
            toolMode === "eraser"
              ? "bg-zinc-800 text-zinc-100 shadow"
              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
          }`}
          title="Eraser (Remove mask strokes)"
        >
          <Eraser className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Eraser</span>
        </button>

        {/* Brush Size Slider (when brush or eraser is active) */}
        {(toolMode === "brush" || toolMode === "eraser") && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-zinc-800">
            <span className="text-[10px] text-zinc-400 font-mono">Size</span>
            <input
              type="range"
              min="4"
              max="120"
              value={brushSize}
              onChange={(e) => onSetBrushSize(Number(e.target.value))}
              className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
            <span className="text-[10px] text-zinc-300 font-mono w-5">
              {brushSize}
            </span>
          </div>
        )}
      </div>

      {/* Right: View Modes & Export */}
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-0.5 bg-zinc-950/80 p-0.5 rounded-lg border border-zinc-800/90 text-xs">
          <button
            onClick={() => onSetViewMode("split")}
            disabled={!hasCleanedImage}
            className={`px-2 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
              viewMode === "split" && hasCleanedImage
                ? "bg-zinc-800 text-emerald-400 font-medium"
                : "text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
            }`}
            title="Split Comparison Slider"
          >
            <Columns className="w-3 h-3" />
            <span className="hidden md:inline">Split</span>
          </button>

          <button
            onClick={() => onSetViewMode("result")}
            disabled={!hasCleanedImage}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "result" && hasCleanedImage
                ? "bg-zinc-800 text-emerald-400 font-medium"
                : "text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
            }`}
            title="Cleaned Result"
          >
            Cleaned
          </button>

          <button
            onClick={() => onSetViewMode("original")}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "original"
                ? "bg-zinc-800 text-zinc-200 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Original Image"
          >
            Original
          </button>

          <button
            onClick={() => onSetViewMode("mask")}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              viewMode === "mask"
                ? "bg-zinc-800 text-rose-400 font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
            title="Mask Highlight"
          >
            Mask
          </button>
        </div>

        {/* Clear Mask Button */}
        <button
          onClick={onClearMask}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
          title="Clear all masks"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {/* Export / Download Button */}
        <button
          onClick={onOpenExport}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 active:scale-95 border border-zinc-700 transition-all flex items-center gap-1.5"
          title="Export and Download Image"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>Export</span>
        </button>
      </div>
    </div>
  );
};
