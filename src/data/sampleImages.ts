export interface SamplePreset {
  id: string;
  name: string;
  category: string;
  watermarkType: string;
  description: string;
  generator: () => string;
}

/**
 * Generate a scenic mountain lake photo with diagonal stock photo watermark
 */
function generateMountainSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;

  // Sky gradient
  const sky = ctx.createLinearGradient(0, 0, 0, 360);
  sky.addColorStop(0, "#1e3c72");
  sky.addColorStop(0.5, "#2a5298");
  sky.addColorStop(0.85, "#f6d365");
  sky.addColorStop(1, "#fda085");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 900, 360);

  // Distant glowing sun
  const sun = ctx.createRadialGradient(450, 240, 10, 450, 240, 180);
  sun.addColorStop(0, "rgba(255, 255, 240, 0.9)");
  sun.addColorStop(0.3, "rgba(255, 215, 120, 0.6)");
  sun.addColorStop(1, "rgba(255, 160, 80, 0)");
  ctx.fillStyle = sun;
  ctx.beginPath();
  ctx.arc(450, 240, 180, 0, Math.PI * 2);
  ctx.fill();

  // Mountain silhouettes
  function drawMountains(points: [number, number][], color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i][0], points[i][1]);
    }
    ctx.lineTo(900, 400);
    ctx.lineTo(0, 400);
    ctx.closePath();
    ctx.fill();
  }

  // Back mountains
  drawMountains(
    [
      [0, 280],
      [120, 210],
      [240, 260],
      [380, 160],
      [520, 240],
      [680, 180],
      [820, 250],
      [900, 220],
    ],
    "#2e3d52"
  );

  // Foreground mountains with snowy peaks
  drawMountains(
    [
      [0, 320],
      [180, 190],
      [320, 300],
      [460, 220],
      [640, 310],
      [780, 210],
      [900, 290],
    ],
    "#182538"
  );

  // Snow cap highlights
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.moveTo(180, 190);
  ctx.lineTo(150, 230);
  ctx.lineTo(210, 230);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(780, 210);
  ctx.lineTo(750, 250);
  ctx.lineTo(810, 250);
  ctx.closePath();
  ctx.fill();

  // Mirror lake
  const lake = ctx.createLinearGradient(0, 360, 0, 600);
  lake.addColorStop(0, "#1d3557");
  lake.addColorStop(0.3, "#213f68");
  lake.addColorStop(0.7, "#1a2c47");
  lake.addColorStop(1, "#0d1b2a");
  ctx.fillStyle = lake;
  ctx.fillRect(0, 360, 900, 240);

  // Water ripples
  ctx.fillStyle = "rgba(253, 160, 133, 0.25)";
  for (let y = 370; y < 580; y += 12) {
    const rx = 350 + Math.sin(y * 0.1) * 60;
    const rw = 200 + Math.sin(y * 0.05) * 120;
    ctx.fillRect(rx - rw / 2, y, rw, 2);
  }

  // Pine trees foreground
  ctx.fillStyle = "#0c1824";
  for (let x = 20; x < 880; x += 45) {
    const treeH = 60 + Math.sin(x) * 35;
    ctx.beginPath();
    ctx.moveTo(x, 420);
    ctx.lineTo(x + 16, 420);
    ctx.lineTo(x + 8, 420 - treeH);
    ctx.closePath();
    ctx.fill();
  }

  // Add realistic camera noise
  const imgData = ctx.getImageData(0, 0, 900, 600);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    d[i] = Math.max(0, Math.min(255, d[i] + noise));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + noise));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // ================= WATERMARK LAYER =================
  // 1. Diagonal repeating stock text
  ctx.save();
  ctx.translate(450, 300);
  ctx.rotate(-Math.PI / 6);
  ctx.font = "bold 34px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";
  ctx.shadowBlur = 6;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText("STOCK PHOTO PROOF", 0, -80);
  ctx.fillText("DO NOT COPY  ©  2026", 0, 0);
  ctx.fillText("STOCKPHOTO.COM #9841", 0, 80);

  // Concentric circle stamp in watermark
  ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 160, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();

  // 2. Corner watermark copyright stamp
  ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
  ctx.font = "14px monospace";
  ctx.textAlign = "right";
  ctx.fillText("© 2026 NATURE IMAGES PRO - ALL RIGHTS RESERVED", 880, 580);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Generate a cyberpunk city scene with top-right channel logo and broadcast watermark
 */
function generateCyberpunkSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;

  // Dark moody neon background
  const bg = ctx.createLinearGradient(0, 0, 0, 600);
  bg.addColorStop(0, "#080710");
  bg.addColorStop(0.5, "#140b24");
  bg.addColorStop(1, "#091428");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 900, 600);

  // Skyscraper towers with glowing windows
  for (let i = 0; i < 22; i++) {
    const bx = i * 42 - 10;
    const bw = 35 + (i % 3) * 12;
    const bh = 220 + ((i * 47) % 280);
    const by = 600 - bh;

    ctx.fillStyle = `rgb(${15 + (i % 5) * 4}, ${12 + (i % 4) * 3}, ${30 + (i % 6) * 6})`;
    ctx.fillRect(bx, by, bw, bh);

    // Glowing windows
    const winColor =
      i % 3 === 0
        ? "rgba(255, 0, 128, 0.75)"
        : i % 3 === 1
        ? "rgba(0, 240, 255, 0.75)"
        : "rgba(255, 220, 80, 0.75)";
    ctx.fillStyle = winColor;

    for (let wy = by + 15; wy < 580; wy += 14) {
      for (let wx = bx + 6; wx < bx + bw - 6; wx += 8) {
        if (Math.sin(wx * 2 + wy * 3) > 0.1) {
          ctx.fillRect(wx, wy, 4, 6);
        }
      }
    }
  }

  // Neon light beams
  const beam1 = ctx.createRadialGradient(250, 480, 20, 250, 480, 300);
  beam1.addColorStop(0, "rgba(255, 0, 128, 0.4)");
  beam1.addColorStop(1, "transparent");
  ctx.fillStyle = beam1;
  ctx.fillRect(0, 250, 600, 350);

  const beam2 = ctx.createRadialGradient(680, 450, 20, 680, 450, 320);
  beam2.addColorStop(0, "rgba(0, 240, 255, 0.35)");
  beam2.addColorStop(1, "transparent");
  ctx.fillStyle = beam2;
  ctx.fillRect(400, 200, 500, 400);

  // ================= WATERMARK LAYER =================
  // 1. Top right channel broadcast logo badge
  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  ctx.beginPath();
  ctx.roundRect(690, 25, 185, 52, 10);
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Red LIVE dot
  ctx.fillStyle = "#ef4444";
  ctx.beginPath();
  ctx.arc(712, 51, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 15px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("CYBER TV", 726, 45);

  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px sans-serif";
  ctx.fillText("4K ULTRA HD", 726, 62);

  // 2. Translucent diagonal overlay
  ctx.save();
  ctx.translate(450, 300);
  ctx.rotate(-0.35);
  ctx.font = "bold 44px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.28)";
  ctx.textAlign = "center";
  ctx.fillText("© STREAM ARCHIVE", 0, 0);
  ctx.restore();

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Generate pet portrait with bottom-right camera timestamp and photographer handle
 */
function generatePetPortraitSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;

  // Soft warm bokeh meadow background
  const bg = ctx.createRadialGradient(450, 300, 50, 450, 300, 550);
  bg.addColorStop(0, "#bbf7d0");
  bg.addColorStop(0.4, "#86efac");
  bg.addColorStop(0.8, "#4ade80");
  bg.addColorStop(1, "#15803d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 900, 600);

  // Bokeh circles
  for (let i = 0; i < 35; i++) {
    const bx = ((i * 137) % 860) + 20;
    const by = ((i * 191) % 560) + 20;
    const br = 15 + (i % 5) * 12;
    ctx.fillStyle = `rgba(254, 240, 138, ${0.15 + (i % 4) * 0.08})`;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Cute stylized golden puppy face
  // Head
  ctx.fillStyle = "#d97706";
  ctx.beginPath();
  ctx.ellipse(450, 330, 170, 150, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fluffy golden ears
  ctx.fillStyle = "#b45309";
  ctx.beginPath();
  ctx.ellipse(320, 270, 55, 95, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(580, 270, 55, 95, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Snout
  ctx.fillStyle = "#fef3c7";
  ctx.beginPath();
  ctx.ellipse(450, 380, 85, 75, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.ellipse(450, 355, 30, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#1e1b4b";
  ctx.beginPath();
  ctx.arc(385, 300, 22, 0, Math.PI * 2);
  ctx.arc(515, 300, 22, 0, Math.PI * 2);
  ctx.fill();

  // Eye shines
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(390, 295, 7, 0, Math.PI * 2);
  ctx.arc(520, 295, 7, 0, Math.PI * 2);
  ctx.fill();

  // Tongue
  ctx.fillStyle = "#f43f5e";
  ctx.beginPath();
  ctx.ellipse(450, 425, 24, 32, 0, 0, Math.PI * 2);
  ctx.fill();

  // ================= WATERMARK LAYER =================
  // 1. Digital camera date/time stamp in classic orange LED font
  ctx.font = "bold 26px 'Courier New', monospace";
  ctx.fillStyle = "#f97316";
  ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
  ctx.shadowBlur = 4;
  ctx.textAlign = "right";
  ctx.fillText("2026/05/18 16:42:08", 860, 540);

  // 2. Photographer Instagram tag
  ctx.font = "bold 18px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.shadowBlur = 5;
  ctx.fillText("📷 @golden_pups_photography", 860, 572);

  // 3. Center small watermark
  ctx.font = "italic 20px sans-serif";
  ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
  ctx.textAlign = "center";
  ctx.fillText("PREVIEW SAMPLE ONLY", 450, 180);

  return canvas.toDataURL("image/jpeg", 0.92);
}

/**
 * Modern luxury architecture with semi-transparent watermark bar across center
 */
function generateArchitectureSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 600;
  const ctx = canvas.getContext("2d")!;

  // Sunset sky
  const sky = ctx.createLinearGradient(0, 0, 0, 300);
  sky.addColorStop(0, "#475569");
  sky.addColorStop(0.6, "#f472b6");
  sky.addColorStop(1, "#fbbf24");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 900, 300);

  // Sleek minimalist concrete villa
  ctx.fillStyle = "#334155";
  ctx.fillRect(150, 180, 600, 240);

  // Large floor-to-ceiling glass windows
  const glass = ctx.createLinearGradient(180, 200, 180, 380);
  glass.addColorStop(0, "rgba(254, 240, 138, 0.7)");
  glass.addColorStop(1, "rgba(249, 115, 22, 0.4)");
  ctx.fillStyle = glass;
  ctx.fillRect(200, 210, 500, 170);

  // Window mullions
  ctx.fillStyle = "#0f172a";
  for (let x = 200; x <= 700; x += 100) {
    ctx.fillRect(x, 210, 6, 170);
  }

  // Infinity pool foreground
  const pool = ctx.createLinearGradient(0, 420, 0, 600);
  pool.addColorStop(0, "#0284c7");
  pool.addColorStop(0.5, "#0369a1");
  pool.addColorStop(1, "#075985");
  ctx.fillStyle = pool;
  ctx.fillRect(0, 420, 900, 180);

  // Pool deck
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(0, 400, 900, 25);

  // Reflections in pool
  ctx.fillStyle = "rgba(251, 191, 36, 0.3)";
  ctx.fillRect(220, 430, 460, 40);

  // ================= WATERMARK LAYER =================
  // 1. Semi-transparent diagonal banner
  ctx.save();
  ctx.translate(450, 300);
  ctx.rotate(-0.2);

  ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
  ctx.fillRect(-450, -45, 900, 90);

  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.font = "bold 32px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("ARCHITECTURAL DIGEST  •  COPYRIGHT PROTECTED", 0, 0);
  ctx.restore();

  // 2. Corner badge
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
  ctx.font = "13px sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("DO NOT REDISTRIBUTE - ID: ARC-8941", 20, 580);

  return canvas.toDataURL("image/jpeg", 0.92);
}

export const SAMPLE_PRESETS: SamplePreset[] = [
  {
    id: "sample-mountain",
    name: "Mountain Lake Landscape",
    category: "Landscape",
    watermarkType: "Diagonal Stock Pattern & Stamp",
    description: "Features diagonal stock photo proof text and circular seal over a scenic sunset lake.",
    generator: generateMountainSample,
  },
  {
    id: "sample-cyberpunk",
    name: "Cyberpunk City Skyline",
    category: "Futuristic",
    watermarkType: "Channel Logo & Broadcast Stamp",
    description: "Features a top-right TV broadcast badge and diagonal stream copyright notice.",
    generator: generateCyberpunkSample,
  },
  {
    id: "sample-pet",
    name: "Golden Retriever Puppy",
    category: "Portrait",
    watermarkType: "Camera Timestamp & Social Handle",
    description: "Features an orange LED camera date/time stamp and photographer watermark handle.",
    generator: generatePetPortraitSample,
  },
  {
    id: "sample-arch",
    name: "Modern Villa Architecture",
    category: "Architecture",
    watermarkType: "Center Watermark Banner",
    description: "Features a prominent diagonal banner overlay across luxury architectural glass.",
    generator: generateArchitectureSample,
  },
];
