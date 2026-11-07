import React, { useRef, useEffect, useState, useCallback } from "react";
import { WatermarkBox, ToolMode, ViewMode } from "../types";
import { boxToPixelRect, drawBrushLine } from "../utils/canvasHelpers";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  Sliders,
  Move,
  Search,
  Check,
  X,
  Layers,
} from "lucide-react";

interface WatermarkCanvasProps {
  originalImage: HTMLImageElement | null;
  cleanedImage: HTMLImageElement | null;
  maskCanvas: HTMLCanvasElement | null;
  boxes: WatermarkBox[];
  toolMode: ToolMode;
  viewMode: ViewMode;
  brushSize: number;
  onMaskModified: () => void;
  onSelectBox?: (boxId: string) => void;
  onToggleBox?: (boxId: string) => void;
  onAddBox?: (box: [number, number, number, number]) => void;
  onDeleteBox?: (boxId: string) => void;
  isProcessing?: boolean;
}

export const WatermarkCanvas: React.FC<WatermarkCanvasProps> = ({
  originalImage,
  cleanedImage,
  maskCanvas,
  boxes,
  toolMode,
  viewMode,
  brushSize,
  onMaskModified,
  onSelectBox,
  onToggleBox,
  onAddBox,
  onDeleteBox,
  isProcessing = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  // Transform state: zoom and pan
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Split slider position (0.0 to 1.0)
  const [splitPos, setSplitPos] = useState<number>(0.5);
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  // Magnifier loupe
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  // Brush drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

  // Drag box selection state
  const [boxStart, setBoxStart] = useState<{ x: number; y: number } | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<{ x: number; y: number } | null>(null);

  // Active hover box
  const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null);

  // Fit image to container safely with positive dimension checks
  const fitToContainer = useCallback(() => {
    if (!originalImage || !containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth < 40 || clientHeight < 40) return;

    const imgW = originalImage.naturalWidth || originalImage.width;
    const imgH = originalImage.naturalHeight || originalImage.height;
    if (!imgW || !imgH || imgW <= 0 || imgH <= 0) return;

    const padding = 48;
    const availW = Math.max(50, clientWidth - padding);
    const availH = Math.max(50, clientHeight - padding);

    const scaleX = availW / imgW;
    const scaleY = availH / imgH;
    const fitZoom = Math.min(scaleX, scaleY, 1);
    const safeZoom = Math.max(0.05, fitZoom);

    const posX = Math.round((clientWidth - imgW * safeZoom) / 2);
    const posY = Math.round((clientHeight - imgH * safeZoom) / 2);

    setZoom(safeZoom);
    setPan({ x: posX, y: posY });
  }, [originalImage]);

  // Fit image on load and whenever container resizes
  useEffect(() => {
    fitToContainer();

    const t1 = setTimeout(fitToContainer, 40);
    const t2 = setTimeout(fitToContainer, 150);

    if (containerRef.current && window.ResizeObserver) {
      const ro = new ResizeObserver(() => {
        fitToContainer();
      });
      ro.observe(containerRef.current);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        ro.disconnect();
      };
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [fitToContainer]);

  // Convert client mouse event to image-space coordinates
  const clientToImageCoords = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!containerRef.current || !originalImage) return null;
      const rect = containerRef.current.getBoundingClientRect();
      const contX = clientX - rect.left;
      const contY = clientY - rect.top;

      const imgX = (contX - pan.x) / zoom;
      const imgY = (contY - pan.y) / zoom;

      return { x: imgX, y: imgY };
    },
    [pan, zoom, originalImage]
  );

  // Render main canvas view
  useEffect(() => {
    const canvas = displayCanvasRef.current;
    if (!canvas || !originalImage) return;

    const imgW = originalImage.naturalWidth || originalImage.width;
    const imgH = originalImage.naturalHeight || originalImage.height;
    if (!imgW || !imgH) return;

    canvas.width = imgW;
    canvas.height = imgH;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderContent = () => {
      ctx.clearRect(0, 0, imgW, imgH);

      const hasCleaned = Boolean(cleanedImage);

      if (viewMode === "original" || !hasCleaned) {
        // Draw original only
        ctx.drawImage(originalImage, 0, 0);
      } else if (viewMode === "result" && cleanedImage) {
        // Draw cleaned only
        ctx.drawImage(cleanedImage, 0, 0);
      } else if (viewMode === "mask") {
        // Draw semi-transparent original with mask highlighted
        ctx.drawImage(originalImage, 0, 0);
        if (maskCanvas) {
          ctx.save();
          ctx.globalAlpha = 0.65;
          // Paint red tint for mask
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = imgW;
          tempCanvas.height = imgH;
          const tCtx = tempCanvas.getContext("2d")!;
          tCtx.drawImage(maskCanvas, 0, 0);
          tCtx.globalCompositeOperation = "source-in";
          tCtx.fillStyle = "#ef4444";
          tCtx.fillRect(0, 0, imgW, imgH);

          ctx.drawImage(tempCanvas, 0, 0);
          ctx.restore();
        }
      } else if (viewMode === "split" && cleanedImage) {
        // Split view: Left = Original, Right = Cleaned
        const splitX = Math.round(imgW * splitPos);

        // Draw cleaned on right
        ctx.drawImage(cleanedImage, 0, 0);

        // Clip and draw original on left
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, splitX, imgH);
        ctx.clip();
        ctx.drawImage(originalImage, 0, 0);
        ctx.restore();

        // Draw split divider line
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, imgH);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(2, 2 / zoom);
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();
      }

      // Overlay mask preview in brush/eraser/box mode so user sees what is being covered
      if ((toolMode === "brush" || toolMode === "eraser") && maskCanvas) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        const tCanvas = document.createElement("canvas");
        tCanvas.width = imgW;
        tCanvas.height = imgH;
        const tCtx = tCanvas.getContext("2d")!;
        tCtx.drawImage(maskCanvas, 0, 0);
        tCtx.globalCompositeOperation = "source-in";
        tCtx.fillStyle = "#f43f5e";
        tCtx.fillRect(0, 0, imgW, imgH);
        ctx.drawImage(tCanvas, 0, 0);
        ctx.restore();
      }
    };

    if (originalImage.complete) {
      renderContent();
    } else {
      originalImage.onload = renderContent;
    }
  }, [originalImage, cleanedImage, maskCanvas, viewMode, splitPos, toolMode, zoom]);

  // Handle Mouse Down
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!originalImage) return;

    // Check if clicking near the split divider in split mode
    if (viewMode === "split" && cleanedImage) {
      const coords = clientToImageCoords(e.clientX, e.clientY);
      if (coords) {
        const imgW = originalImage.naturalWidth || originalImage.width;
        const currentSplitX = imgW * splitPos;
        const tolerance = 25 / zoom;
        if (Math.abs(coords.x - currentSplitX) <= tolerance) {
          setIsDraggingSplit(true);
          return;
        }
      }
    }

    // Hand / Pan mode or Middle mouse
    if (toolMode === "select" || e.button === 1 || e.buttons === 4) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    // Brush or Eraser mode
    if (toolMode === "brush" || toolMode === "eraser") {
      const coords = clientToImageCoords(e.clientX, e.clientY);
      if (!coords || !maskCanvas) return;

      setIsDrawing(true);
      setLastPoint(coords);

      const ctx = maskCanvas.getContext("2d", { willReadFrequently: true });
      if (ctx) {
        drawBrushLine(
          ctx,
          coords.x,
          coords.y,
          coords.x,
          coords.y,
          brushSize,
          toolMode === "eraser"
        );
        onMaskModified();
      }
      return;
    }

    // Box selection mode
    if (toolMode === "box") {
      const coords = clientToImageCoords(e.clientX, e.clientY);
      if (coords) {
        setBoxStart(coords);
        setBoxCurrent(coords);
      }
    }
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !originalImage) return;
    const rect = containerRef.current.getBoundingClientRect();
    const contX = e.clientX - rect.left;
    const contY = e.clientY - rect.top;

    setCursorPos({ x: contX, y: contY });

    if (isDraggingSplit) {
      const coords = clientToImageCoords(e.clientX, e.clientY);
      if (coords) {
        const imgW = originalImage.naturalWidth || originalImage.width;
        const newPos = Math.max(0.02, Math.min(0.98, coords.x / imgW));
        setSplitPos(newPos);
      }
      return;
    }

    if (isPanning) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
      return;
    }

    if (isDrawing && (toolMode === "brush" || toolMode === "eraser") && maskCanvas && lastPoint) {
      const coords = clientToImageCoords(e.clientX, e.clientY);
      if (coords) {
        const ctx = maskCanvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          drawBrushLine(
            ctx,
            lastPoint.x,
            lastPoint.y,
            coords.x,
            coords.y,
            brushSize,
            toolMode === "eraser"
          );
          setLastPoint(coords);
          onMaskModified();
        }
      }
      return;
    }

    if (boxStart && toolMode === "box") {
      const coords = clientToImageCoords(e.clientX, e.clientY);
      if (coords) {
        setBoxCurrent(coords);
      }
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    if (isDraggingSplit) {
      setIsDraggingSplit(false);
    }
    if (isPanning) {
      setIsPanning(false);
    }
    if (isDrawing) {
      setIsDrawing(false);
      setLastPoint(null);
    }
    if (boxStart && boxCurrent && toolMode === "box" && originalImage) {
      const imgW = originalImage.naturalWidth || originalImage.width;
      const imgH = originalImage.naturalHeight || originalImage.height;

      const minX = Math.max(0, Math.min(boxStart.x, boxCurrent.x));
      const maxX = Math.min(imgW, Math.max(boxStart.x, boxCurrent.x));
      const minY = Math.max(0, Math.min(boxStart.y, boxCurrent.y));
      const maxY = Math.min(imgH, Math.max(boxStart.y, boxCurrent.y));

      // Minimum box size threshold (5x5 px)
      if (maxX - minX > 5 && maxY - minY > 5 && onAddBox) {
        const box2d: [number, number, number, number] = [
          Math.round((minY / imgH) * 1000),
          Math.round((minX / imgW) * 1000),
          Math.round((maxY / imgH) * 1000),
          Math.round((maxX / imgW) * 1000),
        ];
        onAddBox(box2d);
      }

      setBoxStart(null);
      setBoxCurrent(null);
    }
  };

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    const newZoom = Math.min(8, Math.max(0.15, zoom * zoomFactor));

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered on mouse
    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Reset View to fit
  const handleFit = () => {
    fitToContainer();
  };

  // Original image dimensions
  const imgW = originalImage ? originalImage.naturalWidth || originalImage.width : 0;
  const imgH = originalImage ? originalImage.naturalHeight || originalImage.height : 0;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsPanning(false);
        setIsDrawing(false);
        setIsDraggingSplit(false);
        setCursorPos(null);
      }}
      onWheel={handleWheel}
      className={`relative w-full h-full overflow-hidden bg-zinc-950 flex items-center justify-center select-none ${
        toolMode === "select"
          ? isPanning
            ? "cursor-grabbing"
            : "cursor-grab"
          : toolMode === "brush" || toolMode === "eraser"
          ? "cursor-crosshair"
          : toolMode === "box"
          ? "cursor-crosshair"
          : "cursor-default"
      }`}
    >
      {/* Background Subtle Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, #3f3f46 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Render Canvas Layer */}
      {originalImage && (
        <div
          className="absolute origin-top-left"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            width: imgW,
            height: imgH,
          }}
        >
          <canvas
            ref={displayCanvasRef}
            className="block shadow-2xl rounded-sm"
            style={{ width: imgW, height: imgH }}
          />

          {/* Interactive Bounding Box Overlays */}
          {boxes.map((box) => {
            const rect = boxToPixelRect(box.box2d, imgW, imgH);
            const isHovered = hoveredBoxId === box.id;

            return (
              <div
                key={box.id}
                onMouseEnter={() => setHoveredBoxId(box.id)}
                onMouseLeave={() => setHoveredBoxId(null)}
                className={`absolute transition-colors ${
                  box.enabled
                    ? isHovered
                      ? "border-2 border-emerald-400 bg-emerald-500/20"
                      : "border-2 border-amber-400/90 bg-amber-500/15"
                    : "border-2 border-dashed border-zinc-500/60 bg-zinc-800/10"
                }`}
                style={{
                  left: rect.x,
                  top: rect.y,
                  width: rect.width,
                  height: rect.height,
                  boxShadow: box.enabled ? "0 0 12px rgba(251, 191, 36, 0.25)" : "none",
                }}
              >
                {/* Box Tag & Controls */}
                <div
                  className="absolute -top-7 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap shadow-md"
                  style={{
                    backgroundColor: box.enabled ? "#1c1917" : "#27272a",
                    color: box.enabled ? "#fbbf24" : "#a1a1aa",
                    border: `1px solid ${box.enabled ? "#78350f" : "#3f3f46"}`,
                  }}
                >
                  <span>{box.label || "Watermark"}</span>
                  {box.confidence && (
                    <span className="text-[9px] text-zinc-400 font-normal">
                      {Math.round(box.confidence * 100)}%
                    </span>
                  )}
                  {onToggleBox && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBox(box.id);
                      }}
                      className="ml-1 p-0.5 rounded hover:bg-zinc-700 transition-colors"
                      title={box.enabled ? "Disable this watermark" : "Enable this watermark"}
                    >
                      {box.enabled ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <X className="w-3 h-3 text-zinc-400" />
                      )}
                    </button>
                  )}
                  {onDeleteBox && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBox(box.id);
                      }}
                      className="p-0.5 rounded hover:bg-red-950 hover:text-red-400 transition-colors"
                      title="Remove box"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Active Box Drag Drawing Preview */}
          {boxStart && boxCurrent && toolMode === "box" && (
            <div
              className="absolute border-2 border-emerald-400 bg-emerald-500/25 pointer-events-none"
              style={{
                left: Math.min(boxStart.x, boxCurrent.x),
                top: Math.min(boxStart.y, boxCurrent.y),
                width: Math.abs(boxCurrent.x - boxStart.x),
                height: Math.abs(boxCurrent.y - boxStart.y),
              }}
            />
          )}
        </div>
      )}

      {/* Floating Split Labels (In Split Mode) */}
      {viewMode === "split" && cleanedImage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/80 shadow-xl backdrop-blur text-xs font-medium text-zinc-200 pointer-events-none">
          <span className="text-zinc-400">&larr; Original</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400">Cleaned Result &rarr;</span>
        </div>
      )}

      {/* Brush Size Cursor Ring Preview */}
      {(toolMode === "brush" || toolMode === "eraser") && cursorPos && (
        <div
          className="pointer-events-none fixed rounded-full border border-zinc-100/90 -translate-x-1/2 -translate-y-1/2 z-50 transition-transform duration-75"
          style={{
            left: (containerRef.current?.getBoundingClientRect().left || 0) + cursorPos.x,
            top: (containerRef.current?.getBoundingClientRect().top || 0) + cursorPos.y,
            width: brushSize * zoom,
            height: brushSize * zoom,
            backgroundColor:
              toolMode === "brush" ? "rgba(244, 63, 94, 0.2)" : "rgba(255, 255, 255, 0.15)",
          }}
        />
      )}

      {/* Interactive 2.5x Magnifier Loupe */}
      {showMagnifier && cursorPos && originalImage && (
        <div
          className="pointer-events-none fixed rounded-full border-2 border-emerald-400 shadow-2xl overflow-hidden -translate-x-1/2 -translate-y-1/2 z-50"
          style={{
            left: (containerRef.current?.getBoundingClientRect().left || 0) + cursorPos.x,
            top: (containerRef.current?.getBoundingClientRect().top || 0) + cursorPos.y,
            width: 140,
            height: 140,
          }}
        >
          <div
            className="absolute origin-top-left"
            style={{
              width: imgW,
              height: imgH,
              transform: `translate(${-((cursorPos.x - pan.x) / zoom) * 2.5 + 70}px, ${
                -((cursorPos.y - pan.y) / zoom) * 2.5 + 70
              }px) scale(2.5)`,
            }}
          >
            {cleanedImage ? (
              <img src={cleanedImage.src} alt="Magnified" className="block" />
            ) : (
              <img src={originalImage.src} alt="Magnified" className="block" />
            )}
          </div>
          <div className="absolute inset-0 ring-1 ring-inset ring-black/40 rounded-full" />
          <div className="absolute bottom-1 right-1/2 translate-x-1/2 text-[9px] font-bold tracking-widest text-emerald-300 bg-zinc-950/80 px-1.5 py-0.5 rounded">
            2.5X ZOOM
          </div>
        </div>
      )}

      {/* On-Canvas Zoom & View Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1 shadow-xl backdrop-blur text-xs">
        <button
          onClick={() => setZoom((z) => Math.min(8, z * 1.25))}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <span className="px-1 text-[11px] font-mono text-zinc-400">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom((z) => Math.max(0.15, z * 0.8))}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-zinc-700" />
        <button
          onClick={handleFit}
          className="p-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors"
          title="Fit to Window"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-3.5 bg-zinc-700" />
        <button
          onClick={() => setShowMagnifier((m) => !m)}
          className={`p-1.5 rounded transition-colors ${
            showMagnifier
              ? "bg-emerald-950 text-emerald-400 border border-emerald-600/50"
              : "hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100"
          }`}
          title="Toggle 2.5x Pixel Inspector Loupe"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
