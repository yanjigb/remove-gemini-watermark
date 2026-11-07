import React from "react";
import { X, Sliders, Zap, Shield, Cpu, Sparkles, Check } from "lucide-react";
import { ProcessingSettings } from "../types";

interface SettingsModalProps {
  settings: ProcessingSettings;
  onUpdateSettings: (newSettings: Partial<ProcessingSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <Sliders className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Engine & Processing Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-4 space-y-4 text-xs">
          {/* Engine Selector */}
          <div>
            <label className="font-medium text-zinc-200 block mb-1.5">
              Removal Engine
            </label>
            <div className="space-y-2">
              <button
                onClick={() => onUpdateSettings({ engine: "auto" })}
                className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                  settings.engine === "auto"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-zinc-100 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <div className="mt-0.5 p-1 rounded bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">
                      Hybrid Auto Engine (Recommended)
                    </span>
                    {settings.engine === "auto" && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Gemini 3.8 Flash Vision pinpoints watermarks and bounding coordinates; high-fidelity neural texture synthesis restores background with zero latency.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onUpdateSettings({ engine: "gemini" })}
                className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                  settings.engine === "gemini"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-zinc-100 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <div className="mt-0.5 p-1 rounded bg-amber-500/10 text-amber-400">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">
                      Gemini Cloud Inpainting Model
                    </span>
                    {settings.engine === "gemini" && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Calls Gemini 3.1 Flash Lite Image generative model directly to hallucinate complex background details.
                  </p>
                </div>
              </button>

              <button
                onClick={() => onUpdateSettings({ engine: "neural-texture" })}
                className={`w-full p-2.5 rounded-lg border text-left flex items-start gap-2.5 transition-all ${
                  settings.engine === "neural-texture"
                    ? "bg-emerald-950/40 border-emerald-500/60 text-zinc-100 shadow-sm"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <div className="mt-0.5 p-1 rounded bg-blue-500/10 text-blue-400">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-100">
                      Local Texture Synthesis Engine
                    </span>
                    {settings.engine === "neural-texture" && (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">
                    Pure client-side directional gradient & Poisson blending. Instant execution, 100% private.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Mask Padding / Dilation */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-200">
                Mask Expansion Margin
              </span>
              <span className="font-mono text-zinc-400">
                {settings.maskExpansionPx} px
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Expands mask area outward to capture drop-shadows and anti-aliased watermark edges.
            </p>
            <input
              type="range"
              min="0"
              max="24"
              value={settings.maskExpansionPx}
              onChange={(e) =>
                onUpdateSettings({ maskExpansionPx: Number(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Texture Grain Matching */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-200">
                Sensor Grain Matching
              </span>
              <span className="font-mono text-zinc-400">
                {Math.round(settings.textureNoiseBlend * 100)}%
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Samples surrounding camera noise profile to eliminate plastic/blurry patches.
            </p>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.1"
              value={settings.textureNoiseBlend}
              onChange={(e) =>
                onUpdateSettings({ textureNoiseBlend: parseFloat(e.target.value) })
              }
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
