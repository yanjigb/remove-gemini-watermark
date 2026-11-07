import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, Plus, ArrowRight } from "lucide-react";
import { SAMPLE_PRESETS, SamplePreset } from "../data/sampleImages";

interface UploadDropzoneProps {
  onImageSelected: (file: File) => void;
  onSelectPreset: (preset: SamplePreset) => void;
  onSelectSampleClick: () => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({
  onImageSelected,
  onSelectPreset,
  onSelectSampleClick,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Support pasting image directly from clipboard anywhere on screen
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            onImageSelected(file);
            break;
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [onImageSelected]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith("image/") || file.name.match(/\.(jpg|jpeg|png|webp|bmp|gif)$/i)) {
        onImageSelected(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      onImageSelected(file);
      e.target.value = "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 flex flex-col items-center justify-center select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hero Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
          isDragging
            ? "border-emerald-400 bg-emerald-950/20 shadow-2xl shadow-emerald-500/10 scale-[1.01]"
            : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900/90 hover:border-zinc-700"
        }`}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500/10 via-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-base font-semibold text-zinc-100 mb-1">
          Drop your watermarked image here, or browse
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-5 leading-relaxed">
          Supports JPG, PNG, WebP up to 50MB. Preserves original photographic resolution & color space.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-xs font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Select Image File</span>
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-wrap items-center justify-center gap-4 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Gemini Vision Detection</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Photorealistic Inpainting</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Paste from Clipboard (Ctrl+V)</span>
          </div>
        </div>
      </div>

      {/* Quick Test Demo Samples Row */}
      <div className="w-full mt-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Or Try a Demo Watermarked Photo (Click to Test)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="p-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-850 border border-zinc-800 hover:border-emerald-500/50 transition-all text-left flex flex-col justify-between group active:scale-98"
            >
              <div>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 mb-1.5 inline-block">
                  {preset.category}
                </span>
                <h4 className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {preset.name}
                </h4>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-tight">
                  {preset.watermarkType}
                </p>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                <span>Load & Test</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
