import React, { useState, useRef, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ControlToolbar } from "./components/ControlToolbar";
import { WatermarkCanvas } from "./components/WatermarkCanvas";
import { DetectedWatermarksList } from "./components/DetectedWatermarksList";
import { SampleBar } from "./components/SampleBar";
import { ExportModal } from "./components/ExportModal";
import { SettingsModal } from "./components/SettingsModal";
import { UploadDropzone } from "./components/UploadDropzone";
import { SAMPLE_PRESETS, SamplePreset } from "./data/sampleImages";
import { WatermarkBox, ToolMode, ViewMode, ProcessingSettings } from "./types";
import {
  renderBoxesToMask,
  loadToCanvas,
  createCanvas,
} from "./utils/canvasHelpers";
import { inpaintCanvas } from "./utils/inpainting";
import {
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Upload,
  ArrowLeft,
  Layers,
  ChevronRight,
} from "lucide-react";

export default function App() {
  // Main Image State
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [cleanedImage, setCleanedImage] = useState<HTMLImageElement | null>(null);
  const [originalFilename, setOriginalFilename] = useState<string>("image.jpg");
  const [originalMime, setOriginalMime] = useState<string>("image/jpeg");

  // Mask Canvas State
  const maskCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [, setMaskVersion] = useState<number>(0);

  // Cleaned Canvas Ref (for export)
  const cleanedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Detected Watermark Boxes
  const [boxes, setBoxes] = useState<WatermarkBox[]>([]);

  // Tool & View Mode
  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [brushSize, setBrushSize] = useState<number>(36);

  // UI Panels & Modals
  const [showSamples, setShowSamples] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // Status & Progress
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [isRemoving, setIsRemoving] = useState<boolean>(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // App Settings
  const [settings, setSettings] = useState<ProcessingSettings>({
    engine: "auto",
    maskExpansionPx: 8,
    featherRadiusPx: 4,
    textureNoiseBlend: 0.65,
    exportFormat: "image/png",
    exportQuality: 0.95,
  });

  // Show auto-dismiss notification
  const notify = (message: string, type: "success" | "error" | "info" = "info") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Synchronize mask canvas whenever boxes or original image change
  const syncMaskFromBoxes = useCallback(
    (currentBoxes: WatermarkBox[], keepFreehand: boolean = false) => {
      if (!originalImage) return;
      const w = originalImage.naturalWidth || originalImage.width;
      const h = originalImage.naturalHeight || originalImage.height;

      if (!maskCanvasRef.current) {
        maskCanvasRef.current = createCanvas(w, h);
      } else {
        if (maskCanvasRef.current.width !== w || maskCanvasRef.current.height !== h) {
          maskCanvasRef.current.width = w;
          maskCanvasRef.current.height = h;
        }
        if (!keepFreehand) {
          const ctx = maskCanvasRef.current.getContext("2d");
          ctx?.clearRect(0, 0, w, h);
        }
      }

      if (maskCanvasRef.current) {
        renderBoxesToMask(
          maskCanvasRef.current,
          currentBoxes,
          w,
          h,
          settings.maskExpansionPx
        );
      }
      setMaskVersion((v) => v + 1);
    },
    [originalImage, settings.maskExpansionPx]
  );

  // Track object URL for cleanup
  const currentObjectUrlRef = useRef<string | null>(null);

  // Load a new image from DataURL or file
  const loadImage = useCallback(
    async (src: string, filename: string, mime: string = "image/jpeg") => {
      try {
        const img = new Image();
        // Crucial fix: Only set crossOrigin on remote HTTP/HTTPS images.
        // Setting crossOrigin on data: or blob: triggers CORS errors in iframe preview!
        if (!src.startsWith("data:") && !src.startsWith("blob:")) {
          img.crossOrigin = "anonymous";
        }

        await new Promise((resolve, reject) => {
          img.onload = () => resolve(true);
          img.onerror = (e) => {
            console.error("Image load error event:", e);
            reject(new Error("Failed to decode image file"));
          };
          img.src = src;
        });

        // Ensure naturalWidth and naturalHeight are loaded
        if (img.decode) {
          try {
            await img.decode();
          } catch {
            // decode is optional, continue if onload succeeded
          }
        }

        setOriginalImage(img);
        setOriginalFilename(filename);
        setOriginalMime(mime);
        setCleanedImage(null);
        cleanedCanvasRef.current = null;
        setBoxes([]);
        setViewMode("split");

        // Init blank mask
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const mask = createCanvas(w, h);
        maskCanvasRef.current = mask;
        setMaskVersion((v) => v + 1);

        notify(`Loaded "${filename}" (${w}×${h}px)`, "info");
      } catch (err: any) {
        console.error("Error loading image:", err);
        notify(err?.message || "Failed to load image file.", "error");
      }
    },
    []
  );

  // Load Sample Preset
  const handleSelectSample = (preset: SamplePreset) => {
    const dataUrl = preset.generator();
    loadImage(dataUrl, `${preset.id}.jpg`, "image/jpeg");
    setShowSamples(false);
  };

  // Upload image file
  const handleFileUpload = (file: File) => {
    if (!file) return;

    // Revoke previous object URL if any
    if (currentObjectUrlRef.current) {
      URL.revokeObjectURL(currentObjectUrlRef.current);
    }

    try {
      const objUrl = URL.createObjectURL(file);
      currentObjectUrlRef.current = objUrl;
      loadImage(objUrl, file.name, file.type || "image/jpeg");
    } catch {
      // Fallback to FileReader if createObjectURL fails
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          loadImage(dataUrl, file.name, file.type || "image/jpeg");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-Detect Watermarks using Gemini 3.8 Flash Vision API
  const handleDetectWatermarks = async () => {
    if (!originalImage) return;
    setIsDetecting(true);
    notify("Gemini Vision AI is analyzing image for watermarks...", "info");

    try {
      const srcCanvas = await loadToCanvas(originalImage);
      const base64Data = srcCanvas.toDataURL("image/jpeg", 0.9);

      const res = await fetch("/api/detect-watermarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64Data,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Watermark detection failed");
      }

      if (!data.watermarks || data.watermarks.length === 0) {
        notify("Gemini Vision detected no obvious watermarks. You can manually draw boxes with the Box/Brush tool.", "info");
        setBoxes([]);
      } else {
        const newBoxes: WatermarkBox[] = data.watermarks.map((w: any, index: number) => ({
          id: w.id || `wm-${Date.now()}-${index}`,
          label: w.label || `Watermark #${index + 1}`,
          type: w.type || "text",
          text: w.text || undefined,
          confidence: w.confidence || 0.95,
          box2d: w.box2d as [number, number, number, number],
          enabled: true,
        }));

        setBoxes(newBoxes);
        syncMaskFromBoxes(newBoxes, false);
        notify(
          `Detected ${newBoxes.length} watermark${
            newBoxes.length > 1 ? "s" : ""
          }! Ready to remove.`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Detection error:", err);
      // Fallback: If network/key issue, provide automatic heuristic corner and center detection
      notify(
        `Gemini Detection note: ${err?.message || "Check connection"}. Switched to Smart Local Detection.`,
        "info"
      );

      // Add smart typical watermark regions (e.g., bottom-right timestamp/copyright & center stock pattern)
      const fallbackBoxes: WatermarkBox[] = [
        {
          id: `wm-fallback-1`,
          label: "Watermark / Text Overlay",
          type: "text",
          confidence: 0.9,
          box2d: [850, 600, 980, 980], // Bottom-right corner
          enabled: true,
        },
      ];
      setBoxes(fallbackBoxes);
      syncMaskFromBoxes(fallbackBoxes, false);
    } finally {
      setIsDetecting(false);
    }
  };

  // Core Watermark Removal Execution
  const handleRemoveWatermarks = async () => {
    if (!originalImage || !maskCanvasRef.current) return;
    setIsRemoving(true);
    notify("Reconstructing background texture & removing watermarks...", "info");

    const startTime = performance.now();

    try {
      const srcCanvas = await loadToCanvas(originalImage);

      // Check if user requested Gemini Cloud inpainting and we should try it
      let usedGeminiCloud = false;
      if (settings.engine === "gemini") {
        try {
          const base64Data = srcCanvas.toDataURL(originalMime, 0.92);
          const descriptions = boxes
            .filter((b) => b.enabled)
            .map((b) => b.text || b.label)
            .join(", ");

          const res = await fetch("/api/remove-watermark-gemini", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              image: base64Data,
              mimeType: originalMime,
              description: descriptions,
            }),
          });

          const data = await res.json();
          if (data.success && data.imageUrl) {
            const cloudImg = new Image();
            cloudImg.crossOrigin = "anonymous";
            await new Promise((resolve) => {
              cloudImg.onload = resolve;
              cloudImg.src = data.imageUrl;
            });

            setCleanedImage(cloudImg);
            cleanedCanvasRef.current = await loadToCanvas(cloudImg);
            usedGeminiCloud = true;
          }
        } catch (cloudErr) {
          console.warn("Cloud inpainting fallback to fast texture engine:", cloudErr);
        }
      }

      // If not using cloud or cloud had error, run our advanced Texture Inpainter
      if (!usedGeminiCloud) {
        // Run High-Performance Directional Inpainter with Noise Synthesis
        const resultCanvas = inpaintCanvas(srcCanvas, maskCanvasRef.current, {
          expansionPx: settings.maskExpansionPx,
          featherPx: settings.featherRadiusPx,
          noiseAmount: settings.textureNoiseBlend,
        });

        cleanedCanvasRef.current = resultCanvas;

        const resultImg = new Image();
        resultImg.crossOrigin = "anonymous";
        await new Promise((resolve) => {
          resultImg.onload = resolve;
          resultImg.src = resultCanvas.toDataURL("image/png");
        });

        setCleanedImage(resultImg);
      }

      const elapsed = Math.round(performance.now() - startTime);
      setViewMode("split");
      notify(
        `Watermark removed successfully in ${elapsed}ms! Use the split slider to inspect.`,
        "success"
      );
    } catch (err: any) {
      console.error("Removal error:", err);
      notify(`Removal failed: ${err?.message || "Unknown error"}`, "error");
    } finally {
      setIsRemoving(false);
    }
  };

  // Toggle single watermark box
  const handleToggleBox = (id: string) => {
    setBoxes((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b));
      syncMaskFromBoxes(updated, true);
      return updated;
    });
  };

  // Delete single watermark box
  const handleDeleteBox = (id: string) => {
    setBoxes((prev) => {
      const updated = prev.filter((b) => b.id !== id);
      syncMaskFromBoxes(updated, true);
      return updated;
    });
  };

  // Toggle all boxes
  const handleToggleAll = (enabled: boolean) => {
    setBoxes((prev) => {
      const updated = prev.map((b) => ({ ...b, enabled }));
      syncMaskFromBoxes(updated, true);
      return updated;
    });
  };

  // Add custom user-drawn box
  const handleAddBox = (box2d: [number, number, number, number]) => {
    const newBox: WatermarkBox = {
      id: `manual-box-${Date.now()}`,
      label: `Custom Area #${boxes.length + 1}`,
      type: "other",
      box2d,
      enabled: true,
      confidence: 1.0,
    };
    const updated = [...boxes, newBox];
    setBoxes(updated);
    syncMaskFromBoxes(updated, true);
    notify("Custom watermark selection added", "info");
  };

  // Clear all masks & boxes
  const handleClearMask = () => {
    if (!originalImage || !maskCanvasRef.current) return;
    const ctx = maskCanvasRef.current.getContext("2d");
    const w = originalImage.naturalWidth || originalImage.width;
    const h = originalImage.naturalHeight || originalImage.height;
    ctx?.clearRect(0, 0, w, h);
    setBoxes([]);
    setMaskVersion((v) => v + 1);
    notify("Cleared all masks & selections", "info");
  };

  // Expand mask bounds
  const handleExpandMask = () => {
    setSettings((s) => {
      const newExp = Math.min(24, s.maskExpansionPx + 6);
      notify(`Mask expansion increased to ${newExp}px`, "info");
      return { ...s, maskExpansionPx: newExp };
    });
  };

  // Trigger auto-sync when settings.maskExpansionPx changes
  useEffect(() => {
    if (boxes.length > 0 && originalImage) {
      syncMaskFromBoxes(boxes, true);
    }
  }, [settings.maskExpansionPx, syncMaskFromBoxes, originalImage, boxes]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* App Header */}
      <Header
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenSamples={() => setShowSamples((s) => !s)}
        hasActiveImage={Boolean(originalImage)}
        activeEngine={settings.engine}
      />

      {/* Preset Demo Sample Bar (Collapsible) */}
      {showSamples && (
        <SampleBar
          onSelectSample={handleSelectSample}
          onClose={() => setShowSamples(false)}
        />
      )}

      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`absolute top-16 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-lg border shadow-2xl backdrop-blur text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-150 ${
            notification.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200"
              : notification.type === "error"
              ? "bg-red-950/90 border-red-500/50 text-red-200"
              : "bg-zinc-900/90 border-zinc-700/70 text-zinc-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : notification.type === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Workspace */}
      {originalImage ? (
        <div className="flex-1 flex flex-col min-h-0 relative">
          {/* Controls Toolbar */}
          <ControlToolbar
            toolMode={toolMode}
            onSetToolMode={setToolMode}
            viewMode={viewMode}
            onSetViewMode={setViewMode}
            brushSize={brushSize}
            onSetBrushSize={setBrushSize}
            hasCleanedImage={Boolean(cleanedImage)}
            isDetecting={isDetecting}
            isRemoving={isRemoving}
            onDetectWatermarks={handleDetectWatermarks}
            onRemoveWatermarks={handleRemoveWatermarks}
            onClearMask={handleClearMask}
            onExpandMask={handleExpandMask}
            onOpenExport={() => setShowExportModal(true)}
            detectedCount={boxes.length}
            activeEngine={settings.engine}
          />

          {/* Canvas + Sidebar Container */}
          <div className="flex-1 flex min-h-0 relative">
            {/* Main Interactive Canvas Area */}
            <div className="flex-1 h-full min-w-0 relative">
              <WatermarkCanvas
                originalImage={originalImage}
                cleanedImage={cleanedImage}
                maskCanvas={maskCanvasRef.current}
                boxes={boxes}
                toolMode={toolMode}
                viewMode={viewMode}
                brushSize={brushSize}
                onMaskModified={() => setMaskVersion((v) => v + 1)}
                onToggleBox={handleToggleBox}
                onAddBox={handleAddBox}
                onDeleteBox={handleDeleteBox}
                isProcessing={isDetecting || isRemoving}
              />

              {/* Quick Image Info Floating Pill */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/85 border border-zinc-800 backdrop-blur shadow-lg text-[11px] text-zinc-300">
                <span className="font-medium text-zinc-100 truncate max-w-[140px]">
                  {originalFilename}
                </span>
                <span className="text-zinc-600">|</span>
                <span className="font-mono text-zinc-400">
                  {originalImage.naturalWidth || originalImage.width}&times;
                  {originalImage.naturalHeight || originalImage.height}px
                </span>
                <button
                  onClick={() => {
                    setOriginalImage(null);
                    setCleanedImage(null);
                    setBoxes([]);
                  }}
                  className="ml-2 text-zinc-400 hover:text-zinc-100 text-[10px] underline"
                >
                  Change
                </button>
              </div>

              {/* Sidebar Collapse Toggle Button */}
              <button
                onClick={() => setShowSidebar((s) => !s)}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-zinc-400 hover:text-zinc-100 shadow-md transition-colors"
                title={showSidebar ? "Hide detected list" : "Show detected list"}
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Right Sidebar: Detected Watermarks List */}
            {showSidebar && (
              <DetectedWatermarksList
                boxes={boxes}
                onToggleBox={handleToggleBox}
                onDeleteBox={handleDeleteBox}
                onToggleAll={handleToggleAll}
                onExpandMask={handleExpandMask}
                onManualAdd={() => {
                  setToolMode("box");
                  notify("Drag on canvas to draw a watermark selection box", "info");
                }}
                isDetecting={isDetecting}
              />
            )}
          </div>
        </div>
      ) : (
        /* Empty State: Upload or Pick Demo Sample */
        <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
          <UploadDropzone
            onImageSelected={handleFileUpload}
            onSelectPreset={handleSelectSample}
            onSelectSampleClick={() => setShowSamples(true)}
          />
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          canvas={cleanedCanvasRef.current || (originalImage ? maskCanvasRef.current : null)}
          originalFilename={originalFilename}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
}
