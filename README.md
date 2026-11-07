# Auto Watermark Remover AI with Gemini

An AI-powered web application for automatic watermark and logo detection, interactive mask refinement, and photorealistic inpainting using Google Gemini vision models and high-performance local texture synthesis.

---

## Features

### 1. Gemini Vision AI Auto-Detection
- **Multimodal Scanning**: Powered by `gemini-3.8-flash`, automatically detecting stock photo watermarks, TV channel logos, camera date/time stamps, copyright notices, and translucent pattern grids.
- **Normalized Coordinates**: Extracts precise bounding boxes `[ymin, xmin, ymax, xmax]` normalized to image dimensions, confidence scores, and recognized text strings.
- **Individual Watermark Controls**: Toggle, isolate, or delete individual watermark detections before processing.

### 2. Dual Inpainting Engines
- **Hybrid Auto Engine (Default)**: Combines Gemini Vision detection with local directional gradient inpainting and Poisson texture synthesis for sub-second background reconstruction.
- **Gemini Generative Inpainting (`gemini-3.1-flash-lite-image`)**: Cloud AI model for synthesizing and hallucinating complex background geometry, portraits, or scenic landscapes.
- **Local In-Browser Texture Engine**: Client-side multi-pass boundary peeling with bilateral edge preservation and boundary noise variance matching to eliminate artificial plastic blur.

### 3. Interactive Canvas Workspace
- **Before / After Split Slider**: Draggable vertical divider for side-by-side inspection of original and restored results.
- **Precision Mask Editing Tools**:
  - **Pan / Hand Tool**: Smooth panning across large images.
  - **Box Select Tool**: Drag rectangles to manually define watermark bounds.
  - **Magic Brush**: Custom stroke size (4px–120px) to paint freehand masks over irregular signatures or stamps.
  - **Eraser Tool**: Refine and subtract from the active mask.
- **2.5x Magnifier Loupe**: Floating pixel inspection circle to verify seam-free inpainting quality.
- **Zoom & Pan**: Smooth mouse wheel zooming (15% to 800%) and instant window fit.

### 4. Built-in Demo Presets
Test the application immediately without uploading files:
- **Mountain Lake**: Diagonal stock photo proof watermark grid and circular seal.
- **Cyberpunk Skyline**: Top-right broadcast channel badge and stream archive overlay.
- **Golden Retriever Puppy**: Orange LED camera timestamp and photographer watermark handle.
- **Modern Villa Architecture**: Translucent center watermark banner across architectural glass.

### 5. Multi-Format Export & Sharing
- Export in **PNG** (lossless), **JPEG** (compact), or **WebP** (modern web) with adjustable quality.
- **Copy to Clipboard**: One-click copying for pasting directly into Figma, Photoshop, or messaging apps.

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons
- **Backend**: Express API middleware integrated with Vite dev server
- **AI / SDK**: `@google/genai` TypeScript SDK (server-side only)
  - `gemini-3.8-flash`: Multimodal watermark detection and structured schema output
  - `gemini-3.1-flash-lite-image`: Generative image editing and inpainting

---

## Project Structure

```
├── server/
│   ├── apiRouter.ts         # Express API endpoints (/api/detect-watermarks, /api/remove-watermark-gemini)
│   └── geminiService.ts     # Server-side Gemini client initialization and structured prompts
├── src/
│   ├── components/
│   │   ├── ControlToolbar.tsx       # Action buttons, tool selectors, brush size, view modes
│   │   ├── DetectedWatermarksList.tsx# Sidebar listing detected watermark cards with toggles
│   │   ├── ExportModal.tsx          # Export modal with format, quality, download, and copy
│   │   ├── Header.tsx               # App bar with branding, engine status, and settings
│   │   ├── SampleBar.tsx            # Preset demo samples selector
│   │   ├── SettingsModal.tsx        # Engine preferences, mask expansion, and grain matching
│   │   ├── UploadDropzone.tsx       # Drag-and-drop zone with clipboard paste support
│   │   └── WatermarkCanvas.tsx      # High-DPI canvas with split slider, loupe, and brush tools
│   ├── data/
│   │   └── sampleImages.ts          # Procedural canvas generators for test images
│   ├── utils/
│   │   ├── canvasHelpers.ts         # Coordinate transforms, line drawing, and clipboard helpers
│   │   └── inpainting.ts            # Local directional inpainting and noise synthesis engine
│   ├── App.tsx                      # Core state coordination and image lifecycle
│   ├── index.css                    # Tailwind CSS imports
│   ├── main.tsx                     # React root mount
│   └── types.ts                     # TypeScript definitions
├── server.ts                        # Full-stack production server entrypoint
├── vite.config.ts                   # Vite configuration with Express API plugin
└── metadata.json                    # AI Studio metadata and server capabilities
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Environment Variables

Configure your Gemini API key in `.env`:

```bash
# GEMINI_API_KEY: Required for Gemini Vision and inpainting API calls.
GEMINI_API_KEY="your-gemini-api-key"
```

In Google AI Studio, this key is automatically injected at runtime via the **Settings > Secrets** panel.

### Development

Install dependencies and start the development server on port 3000:

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

---

## API Endpoints

### `GET /api/health`
Returns server status and configured Gemini models.

**Response:**
```json
{
  "status": "ok",
  "hasApiKey": true,
  "geminiVisionModel": "gemini-3.8-flash",
  "geminiImageModel": "gemini-3.1-flash-lite-image"
}
```

### `POST /api/detect-watermarks`
Accepts a base64-encoded image and returns detected watermark regions with bounding box coordinates.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg"
}
```

**Response:**
```json
{
  "success": true,
  "detected": true,
  "watermarks": [
    {
      "id": "wm-1",
      "label": "Stock photo watermark",
      "type": "text",
      "text": "SHUTTERSTOCK PREVIEW",
      "confidence": 0.98,
      "box2d": [380, 210, 620, 790]
    }
  ]
}
```

### `POST /api/remove-watermark-gemini`
Calls `gemini-3.1-flash-lite-image` to generative inpaint and restore masked watermark areas.

**Request Body:**
```json
{
  "image": "data:image/jpeg;base64,...",
  "mimeType": "image/jpeg",
  "description": "Stock photo watermark text and corner stamp"
}
```

---

## Security & Privacy

- **Server-Side API Calls**: All interactions with `@google/genai` are handled on the server. API keys are never included in client bundles or exposed to the browser.
- **Local Fallback**: The client-side texture synthesis engine allows image inpainting to run entirely within the user's browser without transferring image data externally if desired.
