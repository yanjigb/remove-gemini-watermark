import React from "react";
import { WatermarkBox } from "../types";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  Trash2,
  Maximize2,
  Tag,
  ShieldCheck,
  Plus,
  Info,
} from "lucide-react";

interface DetectedWatermarksListProps {
  boxes: WatermarkBox[];
  onToggleBox: (id: string) => void;
  onDeleteBox: (id: string) => void;
  onToggleAll: (enabled: boolean) => void;
  onExpandMask: () => void;
  onManualAdd: () => void;
  isDetecting: boolean;
}

export const DetectedWatermarksList: React.FC<DetectedWatermarksListProps> = ({
  boxes,
  onToggleBox,
  onDeleteBox,
  onToggleAll,
  onExpandMask,
  onManualAdd,
  isDetecting,
}) => {
  const enabledCount = boxes.filter((b) => b.enabled).length;

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full select-none">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider">
            Detected Watermarks
          </h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
            {enabledCount}/{boxes.length}
          </span>
        </div>

        {boxes.length > 0 && (
          <div className="flex items-center gap-1 text-[11px]">
            <button
              onClick={() => onToggleAll(true)}
              className="text-zinc-400 hover:text-emerald-400 px-1 py-0.5 rounded hover:bg-zinc-900 transition-colors"
            >
              All
            </button>
            <span className="text-zinc-600">/</span>
            <button
              onClick={() => onToggleAll(false)}
              className="text-zinc-400 hover:text-zinc-200 px-1 py-0.5 rounded hover:bg-zinc-900 transition-colors"
            >
              None
            </button>
          </div>
        )}
      </div>

      {/* List or Empty State */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {isDetecting ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-xs font-medium text-zinc-200 mb-1">
              Gemini Vision AI Scanning
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Analyzing text overlays, corner stamps, logos, and translucent watermark grids...
            </p>
          </div>
        ) : boxes.length === 0 ? (
          <div className="py-10 px-4 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
              <Tag className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-zinc-300 mb-1">
              No Watermarks Detected Yet
            </p>
            <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
              Click <strong>Auto Detect Watermarks</strong> above, or use the <strong>Box</strong> or <strong>Brush</strong> tool to manually highlight watermark areas.
            </p>
            <button
              onClick={onManualAdd}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Draw Selection Box</span>
            </button>
          </div>
        ) : (
          boxes.map((box, idx) => (
            <div
              key={box.id}
              onClick={() => onToggleBox(box.id)}
              className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                box.enabled
                  ? "bg-zinc-900/90 border-emerald-500/40 hover:border-emerald-500/60 shadow-sm"
                  : "bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={box.enabled}
                    onChange={() => onToggleBox(box.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-3.5 h-3.5 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer accent-emerald-500"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-zinc-100">
                        {box.label || `Watermark #${idx + 1}`}
                      </span>
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {box.type}
                      </span>
                    </div>

                    {box.text && (
                      <p className="text-[11px] text-emerald-400/90 font-mono mt-0.5 line-clamp-1">
                        "{box.text}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {box.confidence && (
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {Math.round(box.confidence * 100)}%
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteBox(box.id);
                    }}
                    className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                    title="Remove box"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Coordinates Preview */}
              <div className="mt-2 pt-1.5 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                <span>Coordinates: [{box.box2d.join(", ")}]</span>
                <span className={box.enabled ? "text-emerald-400" : "text-zinc-500"}>
                  {box.enabled ? "Active" : "Skipped"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Actions */}
      {boxes.length > 0 && (
        <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 space-y-2">
          <button
            onClick={onExpandMask}
            className="w-full py-1.5 px-2.5 rounded-md text-xs font-medium text-zinc-300 hover:text-zinc-100 bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-1.5"
            title="Expand mask bounds to cover glow & anti-aliased edges"
          >
            <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Expand Mask Margins (+8px)</span>
          </button>

          <div className="flex items-start gap-1.5 text-[10px] text-zinc-400 leading-tight">
            <Info className="w-3 h-3 shrink-0 mt-0.5 text-zinc-400" />
            <span>
              Tip: Uncheck boxes if you want to keep specific logos or timestamps intact.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
