import React from "react";
import { SAMPLE_PRESETS, SamplePreset } from "../data/sampleImages";
import { Image as ImageIcon, Sparkles, X } from "lucide-react";

interface SampleBarProps {
  onSelectSample: (preset: SamplePreset) => void;
  onClose?: () => void;
}

export const SampleBar: React.FC<SampleBarProps> = ({ onSelectSample, onClose }) => {
  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800 p-3 sm:p-4 backdrop-blur">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Try Instant Demo Watermarked Images (Click to Test)
            </h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onSelectSample(preset)}
              className="text-left group p-2.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-zinc-200 group-hover:text-emerald-300 transition-colors">
                    {preset.name}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    {preset.category}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 mb-2">
                  {preset.watermarkType}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                <ImageIcon className="w-3 h-3" />
                <span>Load Sample &rarr;</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
