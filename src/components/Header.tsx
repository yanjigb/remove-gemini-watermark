import React from "react";
import { Sparkles, Sliders, Image as ImageIcon, Zap, Layers } from "lucide-react";

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenSamples: () => void;
  hasActiveImage: boolean;
  activeEngine: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenSamples,
  hasActiveImage,
  activeEngine,
}) => {
  return (
    <header className="h-14 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-zinc-100 tracking-tight">
              Auto Watermark Remover
            </h1>
            <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-400">
              Gemini Vision AI
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 hidden sm:block">
            Automatic watermark detection & photorealistic inpainting
          </p>
        </div>
      </div>

      {/* Engine & Quick Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSamples}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 hover:text-zinc-100 border border-zinc-700/60 transition-colors"
          title="Try with demo watermarked photos"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Samples</span>
        </button>

        <div className="hidden md:flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-xs text-zinc-400">
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span>Engine:</span>
          <span className="font-medium text-zinc-200 capitalize">
            {activeEngine === "gemini" ? "Gemini Inpaint" : "Dual Vision + Fast Texture"}
          </span>
        </div>

        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
          title="Settings & Processing Engine"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
