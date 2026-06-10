"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Zone layout (catcher's view, 3x3 + outside)
const PITCH_TYPES = ["Fastball", "Changeup", "Dropball", "Curveball", "Riseball", "Other"];

const RESULT_COLORS = {
  "called-strike": "#0284c7",
  "swinging-strike": "#16a34a",
  "ball": "#dc2626",
  "foul": "#d97706",
  "in-play": "#f59e0b",
};

const RESULT_LABELS = {
  "called-strike": "ꓘ",
  "swinging-strike": "SW",
  "ball": "B",
  "foul": "F",
  "in-play": "IP",
};

const ZONE_CENTERS = {
  1: [16.5, 16.5], 2: [50, 16.5], 3: [83.5, 16.5],
  4: [16.5, 50],   5: [50, 50],   6: [83.5, 50],
  7: [16.5, 83.5], 8: [50, 83.5], 9: [83.5, 83.5],
};

const OUTSIDE_POSITIONS = {
  "high":    { x: 50, y: -12 },
  "low":     { x: 50, y: 112 },
  "inside":  { x: -12, y: 50 },
  "outside": { x: 112, y: 50 },
  "way-out": { x: 50, y: 50 },
};

// Session history stored in localStorage
const HISTORY_KEY = "pitchlab_sessions";

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch { return []; }
}

function saveSession(session) {
  try {
    const history = loadHistory();
    history.unshift(session); // newest first
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))); // keep last 30
  } catch (e) { console.warn("Could not save session:", e); }
}

function StrikeZone({ pitches }) {
  const zoneSize = 220;
  const padding = 50;
  const total = zoneSize + padding * 2;

  return (
    <svg viewBox={`0 0 ${total} ${total}`} style={{ width: "100%", maxWidth: 320, display: "block", margin: "0 auto" }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="dotglow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Home plate silhouette */}
      <polygon points={`${total/2-18},${total-8} ${total/2+18},${total-8} ${total/2+18},${total-18} ${total/2},${total-4} ${total/2-18},${total-18}`}
        fill="#1e2a3a" stroke="#475569" strokeWidth="1" />

      {/* Outside zone border */}
      <rect x={padding - 20} y={padding - 20} width={zoneSize + 40} height={zoneSize + 40}
        fill="none" stroke="#1e2a3a" strokeWidth="1" strokeDasharray="4 4" rx="2" />

      {/* Strike zone background */}
      <rect x={padding} y={padding} width={zoneSize} height={zoneSize}
        fill="#0d1424" stroke="#00e5ff" strokeWidth="1.5" rx="2" />

      {/* Zone grid lines */}
      {[1, 2].map(i => (
        <g key={i}>
          <line x1={padding + (zoneSize / 3) * i} y1={padding} x2={padding + (zoneSize / 3) * i} y2={padding + zoneSize}
            stroke="#1e2a3a" strokeWidth="1" />
          <line x1={padding} y1={padding + (zoneSize / 3) * i} x2={padding + zoneSize} y2={padding + (zoneSize / 3) * i}
            stroke="#1e2a3a" strokeWidth="1" />
        </g>
      ))}

      {/* Zone number labels */}
      {Object.entries(ZONE_CENTERS).map(([zone, [px, py]]) => (
        <text key={zone}
          x={padding + (px / 100) * zoneSize}
          y={padding + (py / 100) * zoneSize + 3}
          textAnchor="middle" fontSize="9" fill="#475569" fontFamily="monospace">
          {zone}
        </text>
      ))}

      {/* Pitch dots */}
      {pitches.map((p, i) => {
        let cx, cy;
        const isInside = typeof p.zone === "number";
        if (isInside) {
          const [px, py] = ZONE_CENTERS[p.zone] || [50, 50];
          cx = padding + (px / 100) * zoneSize + (Math.random() * 10 - 5);
          cy = padding + (py / 100) * zoneSize + (Math.random() * 10 - 5);
        } else {
          const pos = OUTSIDE_POSITIONS[p.zone] || { x: 50, y: 50 };
          cx = padding + (pos.x / 100) * zoneSize;
          cy = padding + (pos.y / 100) * zoneSize;
        }
        const color = RESULT_COLORS[p.result] || "#888";
        const isLatest = i === pitches.length - 1;
        return (
          <g key={i} filter={isLatest ? "url(#dotglow)" : undefined}>
            <circle cx={cx} cy={cy} r={isLatest ? 10 : 7}
              fill={color + (isLatest ? "cc" : "88")} stroke={color} strokeWidth={isLatest ? 1.5 : 1} />
            <text x={cx} y={cy + 3.5} textAnchor="middle" fontSize={isLatest ? "8" : "7"}
              fill="#ffffff" fontFamily="monospace" fontWeight="bold">
              {RESULT_LABELS[p.result] || "?"}
            </text>
          </g>
        );
      })}

      {/* Strike zone border glow */}
      <rect x={padding} y={padding} width={zoneSize} height={zoneSize}
        fill="none" stroke="#00e5ff" strokeWidth="1.5" rx="2" filter="url(#glow)" />

      {/* Labels */}
      <text x={total / 2} y={padding - 28} textAnchor="middle" fontSize="9" fill="#64748b" fontFamily="monospace" letterSpacing="2">CATCHER'S VIEW</text>
      <text x={padding - 22} y={padding + zoneSize / 2 + 3} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">IN</text>
      <text x={padding + zoneSize + 22} y={padding + zoneSize / 2 + 3} textAnchor="middle" fontSize="8" fill="#64748b" fontFamily="monospace">OUT</text>
    </svg>
  );
}

function StatBox({ label, value, sub, accent }) {
  return (
    <div style={{ flex: 1, background: "#111827", border: "1px solid #1e2a3a", borderRadius: 8, padding: "10px 8px", textAlign: "center", minWidth: 60 }}>
      <div style={{ fontSize: 9, color: "#64748b", letterSpacing: 2, fontFamily: "monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 26, color: accent || "#e2e8f0", lineHeight: 1, fontFamily: "'Barlow Condensed', 'Impact', sans-serif", letterSpacing: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "#64748b", marginTop: 2, fontFamily: "monospace" }}>{sub}</div>}
    </div>
  );
}

export default function ZoePitcher() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const motionCanvasRef = useRef(null);
  const prevPixelsRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const analyzingRef = useRef(false);
  const isLoadingRef = useRef(false);

  const [cameraActive, setCameraActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [pitches, setPitches] = useState([]);
  const [lastPitch, setLastPitch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [watchState, setWatchState] = useState("idle");
  const [motionLevel, setMotionLevel] = useState(0);
  const [selectedType, setSelectedType] = useState("Fastball");
  const [pitcherName, setPitcherName] = useState("Zoe");
  const [totalCost, setTotalCost] = useState(0);
  const [tab, setTab] = useState("zone"); // "zone" | "log" | "history" | "setup"
  const [cameraAngle, setCameraAngle] = useState("behind");
  const [veloInput, setVeloInput] = useState("");
  const [veloFlash, setVeloFlash] = useState(false);
  const [history, setHistory] = useState([]);

  // Load history on mount
  useEffect(() => { setHistory(loadHistory()); }, []);

  const addPitch = useCallback((pitch) => {
    setPitches(prev => [...prev, pitch]);
    setLastPitch(pitch);
  }, []);

  // Stamp velocity onto the most recent pitch
  const stampVelo = useCallback((mph) => {
    const v = parseInt(mph);
    if (!v || v < 20 || v > 100) return;
    setPitches(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], velo: v };
      setLastPitch(updated[updated.length - 1]);
      return updated;
    });
    setVeloFlash(true);
    setTimeout(() => setVeloFlash(false), 600);
    setVeloInput("");
  }, []);

  const loadDemo = useCallback(() => {
    const demo = [
      { result: "called-strike",   zone: 5,        type: "Fastball",  velo: 58, mechanic: "Good hip rotation, consistent release point", time: "4:01:02 PM" },
      { result: "ball",            zone: "outside", type: "Fastball",  velo: 57, mechanic: null, time: "4:01:18 PM" },
      { result: "swinging-strike", zone: 8,        type: "Dropball",  velo: 52, mechanic: "Drop breaking sharply at the knees", time: "4:01:35 PM" },
      { result: "called-strike",   zone: 2,        type: "Fastball",  velo: 59, mechanic: null, time: "4:01:52 PM" },
      { result: "ball",            zone: "high",   type: "Riseball",  velo: 54, mechanic: "Arm speed slightly slower — watch release", time: "4:02:08 PM" },
      { result: "foul",            zone: 6,        type: "Changeup",  velo: 44, mechanic: null, time: "4:02:25 PM" },
      { result: "called-strike",   zone: 4,        type: "Fastball",  velo: 60, mechanic: "Inside corner — good location", time: "4:02:41 PM" },
      { result: "ball",            zone: "low",    type: "Dropball",  velo: 51, mechanic: null, time: "4:02:58 PM" },
      { result: "swinging-strike", zone: 9,        type: "Changeup",  velo: 43, mechanic: "Speed differential working well", time: "4:03:14 PM" },
      { result: "in-play",         zone: 5,        type: "Fastball",  velo: 58, mechanic: null, time: "4:03:30 PM" },
      { result: "called-strike",   zone: 3,        type: "Curveball", velo: 48, mechanic: "Curve breaking late — hard to track", time: "4:03:47 PM" },
      { result: "ball",            zone: "inside", type: "Fastball",  velo: 56, mechanic: null, time: "4:04:03 PM" },
      { result: "swinging-strike", zone: 7,        type: "Dropball",  velo: 53, mechanic: null, time: "4:04:19 PM" },
      { result: "called-strike",   zone: 1,        type: "Riseball",  velo: 55, mechanic: "Rise not breaking as much as usual", time: "4:04:35 PM" },
      { result: "foul",            zone: 5,        type: "Fastball",  velo: 59, mechanic: null, time: "4:04:52 PM" },
      { result: "ball",            zone: "way-out", type: "Curveball", velo: 47, mechanic: "Curve started too far outside", time: "4:05:08 PM" },
      { result: "called-strike",   zone: 6,        type: "Changeup",  velo: 45, mechanic: null, time: "4:05:24 PM" },
      { result: "swinging-strike", zone: 2,        type: "Fastball",  velo: 62, mechanic: "Fastest pitch of session — good arm speed", time: "4:05:41 PM" },
      { result: "ball",            zone: "high",   type: "Riseball",  velo: 53, mechanic: null, time: "4:05:57 PM" },
      { result: "called-strike",   zone: 8,        type: "Dropball",  velo: 52, mechanic: "Consistent drop location — bottom of zone", time: "4:06:13 PM" },
    ];
    setPitches(demo);
    setLastPitch(demo[demo.length - 1]);
  }, []);

  const detectMotion = useCallback(() => {
    const video = videoRef.current;
    const mc = motionCanvasRef.current;
    if (!video || !mc || video.readyState < 2) return 0;
    const W = 80, H = 60;
    mc.width = W; mc.height = H;
    const ctx = mc.getContext("2d");
    ctx.drawImage(video, 0, 0, W, H);
    const pixels = ctx.getImageData(0, 0, W, H).data;
    const prev = prevPixelsRef.current;
    prevPixelsRef.current = new Uint8ClampedArray(pixels);
    if (!prev) return 0;
    let changed = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (Math.abs(pixels[i] - prev[i]) + Math.abs(pixels[i+1] - prev[i+1]) + Math.abs(pixels[i+2] - prev[i+2]) > 25) changed++;
    }
    return Math.round((changed / (W * H)) * 100);
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) return null;
    canvas.width = 640; canvas.height = 480;
    canvas.getContext("2d").drawImage(video, 0, 0, 640, 480);
    return canvas.toDataURL("image/jpeg", 0.65).split(",")[1];
  }, []);

  const analyzeFrame = useCallback(async () => {
    if (isLoadingRef.current) return;
    const frame = captureFrame();
    if (!frame) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    const angleNote = cameraAngle === "behind"
      ? "Camera is positioned BEHIND HOME PLATE at catcher level, looking out toward the pitcher. You see the ball coming toward the camera."
      : "Camera is positioned on the SIDE (first or third base line), perpendicular to the pitch. You see the ball traveling left-to-right or right-to-left.";

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1000,
          system: `You are an expert softball pitching analyst. ${angleNote}

Analyze this frame to determine if a pitch was just delivered. Return ONLY valid JSON, no markdown.

JSON structure:
{
  "pitch_detected": true/false,
  "result": "called-strike" | "swinging-strike" | "ball" | "foul" | "in-play" | null,
  "zone": 1-9 (inside strike zone) or "high" | "low" | "inside" | "outside" | "way-out" (outside zone) | null,
  "pitch_type": "Fastball" | "Changeup" | "Dropball" | "Curveball" | "Riseball" | "Other" | null,
  "mechanic_note": "One short observation about release point, arm speed, stride, or hip rotation — or null",
  "confidence": "high" | "medium" | "low"
}

Zone grid (from catcher's view):
1=top-inside  2=top-middle  3=top-outside
4=mid-inside  5=center      6=mid-outside
7=bot-inside  8=bot-middle  9=bot-outside

If no pitch is visible or it's between pitches, set pitch_detected to false.`,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: frame } },
              { type: "text", text: "Analyze this softball pitching frame." }
            ]
          }]
        })
      });

      const data = await res.json();
      if (data.usage) {
        setTotalCost(p => p + (data.usage.input_tokens / 1e6) * 1.00 + (data.usage.output_tokens / 1e6) * 5.00);
      }

      const raw = data.content?.find(b => b.type === "text")?.text || "";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

      if (parsed.pitch_detected && parsed.result) {
        addPitch({
          result: parsed.result,
          zone: parsed.zone,
          type: parsed.pitch_type || selectedType,
          mechanic: parsed.mechanic_note,
          confidence: parsed.confidence,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [captureFrame, addPitch, selectedType, cameraAngle]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: 1280, height: 720 }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
    } catch (e) {
      const isIframe = window.self !== window.top;
      const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
      if (isIOS && isIframe) {
        alert("📱 iPhone Camera Limitation\n\nSafari blocks camera access inside embedded apps like Claude.ai artifacts.\n\nTo use live analysis on your iPhone:\n1. Download the pitchlab.zip from this chat\n2. Run it as a standalone app (see README)\n\nIn the meantime, tap DEMO to preview the full app.");
      } else {
        alert("Camera error: " + e.message + "\n\nMake sure you've allowed camera access for this site in your browser settings.");
      }
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    clearInterval(intervalRef.current);
    analyzingRef.current = false;
    setCameraActive(false);
    setAnalyzing(false);
    setWatchState("idle");
  };

  const toggleAnalysis = useCallback(() => {
    if (analyzing) {
      clearInterval(intervalRef.current);
      analyzingRef.current = false;
      setAnalyzing(false);
      setWatchState("idle");
    } else {
      analyzingRef.current = true;
      setAnalyzing(true);
      setWatchState("watching");
      intervalRef.current = setInterval(() => {
        if (!analyzingRef.current) return;
        const motion = detectMotion();
        setMotionLevel(motion);
        if (motion >= 10) {
          setWatchState("active");
          analyzeFrame();
        } else {
          setWatchState("watching");
        }
      }, 1500);
    }
  }, [analyzing, analyzeFrame, detectMotion]);

  useEffect(() => () => { clearInterval(intervalRef.current); streamRef.current?.getTracks().forEach(t => t.stop()); }, []);

  // Stats
  const total = pitches.length;
  const strikes = pitches.filter(p => p.result === "called-strike" || p.result === "swinging-strike").length;
  const balls = pitches.filter(p => p.result === "ball").length;
  const fouls = pitches.filter(p => p.result === "foul").length;
  const inPlay = pitches.filter(p => p.result === "in-play").length;
  const strikesPct = total > 0 ? Math.round((strikes / total) * 100) : 0;
  const zoneHits = pitches.filter(p => typeof p.zone === "number").length;
  const zonePct = total > 0 ? Math.round((zoneHits / total) * 100) : 0;
  const byType = PITCH_TYPES.reduce((acc, t) => { acc[t] = pitches.filter(p => p.type === t).length; return acc; }, {});
  const veloReadings = pitches.map(p => p.velo).filter(v => v > 0);
  const maxVelo = veloReadings.length > 0 ? Math.max(...veloReadings) : null;
  const avgVelo = veloReadings.length > 0 ? Math.round(veloReadings.reduce((a,b) => a+b, 0) / veloReadings.length) : null;

  const [exporting, setExporting] = useState(false);

  const exportReport = useCallback(async () => {
    if (pitches.length === 0) { alert("No pitches to export yet."); return; }
    setExporting(true);

    const W = 800, H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext("2d");

    const hex = (h, a = 1) => {
      const r = parseInt(h.slice(1,3),16), g = parseInt(h.slice(3,5),16), b = parseInt(h.slice(5,7),16);
      return `rgba(${r},${g},${b},${a})`;
    };

    // Background
    c.fillStyle = "#f5f7fa"; c.fillRect(0, 0, W, H);

    // Subtle grid texture
    c.strokeStyle = "rgba(30,48,80,0.3)"; c.lineWidth = 0.5;
    for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x,0); c.lineTo(x,H); c.stroke(); }
    for (let y = 0; y < H; y += 40) { c.beginPath(); c.moveTo(0,y); c.lineTo(W,y); c.stroke(); }

    // Header bar
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, 90);
    c.strokeStyle = "#e2e8f0"; c.lineWidth = 1; c.beginPath(); c.moveTo(0,90); c.lineTo(W,90); c.stroke();

    // Cyan accent bar
    c.fillStyle = "#00e5ff"; c.fillRect(0, 0, 4, 90);

    // Title
    c.fillStyle = "#00e5ff"; c.font = "bold 32px monospace"; c.fillText("PITCH", 24, 42);
    c.fillStyle = "#00e5ff"; c.fillText("LAB", 105, 42);
    c.fillStyle = "#475569"; c.font = "11px monospace"; c.fillText("PITCHER ANALYSIS REPORT", 24, 62);

    // Pitcher name + date
    c.fillStyle = "#1e293b"; c.font = "bold 28px monospace"; c.textAlign = "right";
    c.fillText(pitcherName.toUpperCase(), W - 24, 42);
    c.fillStyle = "#334155"; c.font = "11px monospace";
    c.fillText(new Date().toLocaleDateString("en-US", { weekday:"short", year:"numeric", month:"short", day:"numeric" }), W - 24, 62);
    c.textAlign = "left";

    // Stats row
    const stats = [
      { label: "PITCHES", value: String(total) },
      { label: "STRIKE %", value: `${strikesPct}%`, color: strikesPct >= 60 ? "#16a34a" : strikesPct >= 50 ? "#ca8a04" : "#dc2626" },
      { label: "ZONE %", value: `${zonePct}%`, color: "#0284c7" },
      { label: "TOP MPH", value: maxVelo ? String(maxVelo) : "—", color: "#ca8a04" },
      { label: "AVG MPH", value: avgVelo ? String(avgVelo) : "—", color: "#ca8a0488" },
      { label: "BALLS", value: String(balls), color: "#dc2626" },
    ];
    const sw = (W - 48) / stats.length;
    stats.forEach(({ label, value, color }, i) => {
      const x = 24 + i * sw, y = 100;
      c.fillStyle = "#f8fafc"; c.beginPath(); c.roundRect(x, y, sw - 8, 70, 6); c.fill();
      c.strokeStyle = "#cbd5e1"; c.lineWidth = 1; c.beginPath(); c.roundRect(x, y, sw - 8, 70, 6); c.stroke();
      c.fillStyle = "#64748b"; c.font = "9px monospace"; c.fillText(label, x + 10, y + 18);
      c.fillStyle = color || "#1e293b"; c.font = "bold 28px monospace"; c.fillText(value, x + 10, y + 52);
    });

    // ---- Strike Zone ----
    const ZX = 60, ZY = 195, ZW = 300, ZH = 300;
    const PAD = 55;

    // Outside dashed border
    c.strokeStyle = "#cbd5e1"; c.lineWidth = 1; c.setLineDash([4,4]);
    c.strokeRect(ZX + PAD - 20, ZY + PAD - 20, ZW - PAD*2 + 40, ZH - PAD*2 + 40);
    c.setLineDash([]);

    // Zone background
    c.fillStyle = "#eef2f7"; c.strokeStyle = "#93c5fd"; c.lineWidth = 1.5;
    c.beginPath(); c.roundRect(ZX + PAD, ZY + PAD, ZW - PAD*2, ZH - PAD*2, 2); c.fill(); c.stroke();

    // Grid lines
    const iZW = ZW - PAD*2, iZH = ZH - PAD*2;
    c.strokeStyle = "#e2e8f0"; c.lineWidth = 1;
    [1,2].forEach(i => {
      c.beginPath(); c.moveTo(ZX+PAD + (iZW/3)*i, ZY+PAD); c.lineTo(ZX+PAD + (iZW/3)*i, ZY+PAD+iZH); c.stroke();
      c.beginPath(); c.moveTo(ZX+PAD, ZY+PAD + (iZH/3)*i); c.lineTo(ZX+PAD+iZW, ZY+PAD + (iZH/3)*i); c.stroke();
    });

    // Zone labels
    c.fillStyle = "#64748b"; c.font = "9px monospace";
    Object.entries(ZONE_CENTERS).forEach(([z, [px,py]]) => {
      c.fillText(z, ZX+PAD + (px/100)*iZW - 3, ZY+PAD + (py/100)*iZH + 3);
    });

    // Axis labels
    c.fillStyle = "#64748b"; c.font = "9px monospace";
    c.fillText("IN", ZX + PAD - 18, ZY + PAD + iZH/2 + 3);
    c.fillText("OUT", ZX + PAD + iZW + 8, ZY + PAD + iZH/2 + 3);
    c.fillText("CATCHER'S VIEW", ZX + PAD + iZW/2 - 42, ZY + PAD - 12);

    // Home plate
    c.fillStyle = "#e2e8f0"; c.beginPath();
    const hx = ZX + ZW/2, hy = ZY + ZH - 6;
    c.moveTo(hx-14,hy-12); c.lineTo(hx+14,hy-12); c.lineTo(hx+14,hy-4); c.lineTo(hx,hy+2); c.lineTo(hx-14,hy-4); c.closePath(); c.fill();

    // Pitch dots
    const usedPositions = [];
    pitches.forEach((p, i) => {
      let dx, dy;
      if (typeof p.zone === "number") {
        const [px, py] = ZONE_CENTERS[p.zone] || [50,50];
        dx = ZX+PAD + (px/100)*iZW + (Math.random()*16-8);
        dy = ZY+PAD + (py/100)*iZH + (Math.random()*16-8);
      } else {
        const pos = OUTSIDE_POSITIONS[p.zone] || {x:50,y:50};
        dx = ZX+PAD + (pos.x/100)*iZW;
        dy = ZY+PAD + (pos.y/100)*iZH;
      }
      const color = RESULT_COLORS[p.result] || "#888";
      const isLatest = i === pitches.length - 1;
      const r = isLatest ? 11 : 8;

      // Glow
      if (isLatest) {
        const g = c.createRadialGradient(dx,dy,0,dx,dy,20);
        g.addColorStop(0, hex(color, 0.3)); g.addColorStop(1, "transparent");
        c.fillStyle = g; c.beginPath(); c.arc(dx,dy,20,0,Math.PI*2); c.fill();
      }

      c.fillStyle = hex(color, isLatest ? 0.85 : 0.6);
      c.beginPath(); c.arc(dx, dy, r, 0, Math.PI*2); c.fill();
      c.strokeStyle = color; c.lineWidth = isLatest ? 1.5 : 1;
      c.beginPath(); c.arc(dx, dy, r, 0, Math.PI*2); c.stroke();

      // Label
      c.fillStyle = "#fff"; c.font = `bold ${isLatest ? 8 : 7}px monospace`; c.textAlign = "center";
      c.fillText(RESULT_LABELS[p.result] || "?", dx, dy + 3);
      c.textAlign = "left";
    });

    // Legend
    let lx = ZX, ly = ZY + ZH + 8;
    Object.entries(RESULT_COLORS).forEach(([r, col]) => {
      c.fillStyle = hex(col, 0.15); c.beginPath(); c.roundRect(lx, ly, 90, 22, 11); c.fill();
      c.strokeStyle = hex(col, 0.4); c.lineWidth = 1; c.beginPath(); c.roundRect(lx, ly, 90, 22, 11); c.stroke();
      c.fillStyle = col; c.font = "9px monospace";
      c.fillText(`${RESULT_LABELS[r]} ${resultLabel(r)}`, lx + 8, ly + 15);
      lx += 98; if (lx > W - 120) { lx = ZX; ly += 28; }
    });

    // ---- Right panel: Pitch Mix + Notes ----
    const RX = 400, RY = 195;
    c.fillStyle = "#334155"; c.font = "10px monospace"; c.letterSpacing = "2px";
    c.fillText("PITCH MIX", RX, RY - 6);

    const activePitchTypes = PITCH_TYPES.filter(t => byType[t] > 0);
    activePitchTypes.forEach((t, i) => {
      const by = RY + i * 42;
      const pct = total > 0 ? byType[t] / total : 0;
      c.fillStyle = "#f8fafc"; c.beginPath(); c.roundRect(RX, by, W - RX - 24, 34, 4); c.fill();
      c.strokeStyle = "#cbd5e1"; c.lineWidth = 1; c.beginPath(); c.roundRect(RX, by, W - RX - 24, 34, 4); c.stroke();
      // Bar fill
      c.fillStyle = "#0284c722"; c.beginPath(); c.roundRect(RX, by, (W - RX - 24) * pct, 34, 4); c.fill();
      c.fillStyle = "#1e293b"; c.font = "12px monospace"; c.fillText(t, RX + 10, by + 22);
      c.fillStyle = "#64748b"; c.font = "11px monospace"; c.textAlign = "right";
      c.fillText(`${byType[t]} (${Math.round(pct*100)}%)`, W - 30, by + 22);
      c.textAlign = "left";
    });

    // Mechanic notes
    const noteY = RY + Math.max(activePitchTypes.length, 1) * 42 + 20;
    const mechanics = pitches.filter(p => p.mechanic).slice(-6);
    if (mechanics.length > 0) {
      c.fillStyle = "#334155"; c.font = "10px monospace"; c.fillText("MECHANIC NOTES", RX, noteY);
      mechanics.forEach((p, i) => {
        const ny = noteY + 16 + i * 44;
        c.fillStyle = "#f8fafc"; c.beginPath(); c.roundRect(RX, ny, W - RX - 24, 36, 4); c.fill();
        c.strokeStyle = hex(RESULT_COLORS[p.result] || "#888", 0.2); c.lineWidth = 1;
        c.beginPath(); c.roundRect(RX, ny, 3, 36, 2); c.fill();
        c.strokeStyle = "#cbd5e1"; c.beginPath(); c.roundRect(RX, ny, W - RX - 24, 36, 4); c.stroke();
        c.fillStyle = "#64748b"; c.font = "9px monospace";
        c.fillText(`${p.type} · ${p.time}`, RX + 10, ny + 14);
        c.fillStyle = "#334155"; c.font = "10px monospace";
        const note = p.mechanic.length > 60 ? p.mechanic.slice(0,58)+"…" : p.mechanic;
        c.fillText(note, RX + 10, ny + 29);
      });
    }

    // Footer
    c.fillStyle = "#ffffff"; c.fillRect(0, H - 40, W, 40);
    c.strokeStyle = "#e2e8f0"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H-40); c.lineTo(W, H-40); c.stroke();
    c.fillStyle = "#64748b"; c.font = "9px monospace";
    c.fillText("GENERATED BY PITCHLAB · POWERED BY CLAUDE AI", 24, H - 14);
    c.textAlign = "right";
    c.fillText(`${total} PITCHES · ${strikesPct}% STRIKES`, W - 24, H - 14);
    c.textAlign = "left";

    // Download
    const link = document.createElement("a");
    link.download = `${pitcherName.replace(/\s+/g,"-")}-pitchlab-${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setExporting(false);
  }, [pitches, pitcherName, total, strikesPct, zonePct, balls, fouls, inPlay, byType, maxVelo, avgVelo]);

  const resultColor = (r) => RESULT_COLORS[r] || "#888";
  const resultLabel = (r) => ({ "called-strike": "Called K", "swinging-strike": "Swing K", "ball": "Ball", "foul": "Foul", "in-play": "In Play" }[r] || r);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#e2e8f0", fontFamily: "'Barlow Condensed', 'Impact', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@300;400;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; } ::-webkit-scrollbar-thumb { background: #1e2a3a; }
        .tab { cursor: pointer; padding: 8px 16px; font-size: 12px; letter-spacing: 2px; border: none; background: transparent; font-family: 'DM Mono', monospace; transition: all 0.15s; }
        .tab.active { color: #00e5ff; border-bottom: 2px solid #00e5ff; }
        .tab:not(.active) { color: #64748b; border-bottom: 2px solid transparent; }
        .tab:hover:not(.active) { color: #94a3b8; }
        .pill { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-family: 'DM Mono', monospace; }
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .pop { animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
      `}</style>

      {/* Header */}
      <div style={{ background: "#0d1424", borderBottom: "1px solid #1e2a3a", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 30, letterSpacing: 4, color: "#00e5ff", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, lineHeight: 1 }}>
            <span>⚾</span> PITCH<span>LAB</span>
          </div>
          <div style={{ height: 2, background: "linear-gradient(90deg, #00e5ff55, transparent)", marginTop: 4, marginBottom: 3, width: 160 }} />
          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", letterSpacing: 2 }}>
            PITCHER ANALYSIS SYSTEM
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <input value={pitcherName} onChange={e => setPitcherName(e.target.value)}
            style={{ background: "transparent", border: "none", color: "#e2e8f0", fontSize: 18, letterSpacing: 2, textAlign: "right", width: 120, fontFamily: "'Barlow Condensed', sans-serif" }} />
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", letterSpacing: 1 }}>TAP TO EDIT NAME</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: "#0d1424", borderBottom: "1px solid #1e2a3a", display: "flex" }}>
        {["zone", "log", "history", "setup"].map(t => (
          <button key={t} className={`tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t === "zone" ? "ZONE MAP" : t === "log" ? "PITCH LOG" : t === "history" ? `HISTORY${history.length > 0 ? ` (${history.length})` : ""}` : "SETUP"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", padding: "8px 12px", fontSize: 10, color: "#64748b", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#22c55e" }}>${totalCost.toFixed(4)}</span>
          <span>{total} pitches</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>

        {/* Camera strip */}
        <div style={{ position: "relative", background: "#080d18", height: 200, overflow: "hidden" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", opacity: cameraActive ? 1 : 0.3 }} />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <canvas ref={motionCanvasRef} style={{ display: "none" }} />

          {!cameraActive && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, color: "#475569", fontFamily: "monospace", letterSpacing: 3 }}>NO FEED — START CAMERA</span>
            </div>
          )}

          {/* Status badge */}
          {analyzing && (
            <div style={{ position: "absolute", top: 10, left: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: watchState === "active" ? "#16a34a" : "#475569",
                boxShadow: watchState === "active" ? "0 0 8px #00ff88" : "none", transition: "all 0.3s" }} />
              <span style={{ fontSize: 10, fontFamily: "monospace", color: watchState === "active" ? "#16a34a" : "#94a3b8", letterSpacing: 2 }}>
                {watchState === "active" ? "PITCH DETECTED" : "WATCHING"}
              </span>
            </div>
          )}

          {isLoading && (
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: "#00e5ff", letterSpacing: 2 }}>ANALYZING...</span>
            </div>
          )}

          {/* Last pitch result flash */}
          {lastPitch && (
            <div className="pop" key={pitches.length} style={{
              position: "absolute", bottom: 10, right: 10,
              background: resultColor(lastPitch.result) + "22",
              border: `1px solid ${resultColor(lastPitch.result)}`,
              borderRadius: 6, padding: "6px 12px",
            }}>
              <span style={{ fontSize: 16, color: resultColor(lastPitch.result), letterSpacing: 2 }}>
                {resultLabel(lastPitch.result).toUpperCase()}
              </span>
              {lastPitch.zone && <span style={{ fontSize: 11, color: "#64748b", marginLeft: 8, fontFamily: "monospace" }}>
                ZONE {lastPitch.zone}
              </span>}
            </div>
          )}

          {/* Motion bar */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 3, background: "#1e2a3a" }}>
            <div style={{ height: "100%", width: `${Math.min(motionLevel * 3, 100)}%`, background: motionLevel >= 10 ? "#00e5ff" : "#334155", transition: "width 0.3s" }} />
          </div>
        </div>

        {/* Camera controls */}
        <div style={{ background: "#0d1424", padding: "10px 16px", display: "flex", gap: 8, borderBottom: "1px solid #1e2a3a" }}>
          <button onClick={cameraActive ? stopCamera : startCamera}
            style={{ flex: 1, padding: "9px", background: cameraActive ? "#1a0808" : "#111827", color: cameraActive ? "#dc2626" : "#64748b",
              border: `1px solid ${cameraActive ? "#dc262644" : "#1e2a3a"}`, borderRadius: 6, cursor: "pointer", fontSize: 12, letterSpacing: 2, fontFamily: "monospace" }}>
            {cameraActive ? "■ STOP" : "● CAMERA"}
          </button>
          <button onClick={toggleAnalysis} disabled={!cameraActive}
            style={{ flex: 2, padding: "9px", background: analyzing ? "#041a0d" : "#111827", color: analyzing ? "#16a34a" : cameraActive ? "#e2e8f0" : "#334155",
              border: `1px solid ${analyzing ? "#16a34a44" : cameraActive ? "#1e2a3a" : "#1e2a3a"}`, borderRadius: 6, cursor: cameraActive ? "pointer" : "not-allowed",
              fontSize: 12, letterSpacing: 2, fontFamily: "monospace" }}>
            {analyzing ? "⏸ PAUSE ANALYSIS" : "▶ START ANALYSIS"}
          </button>
        </div>

        {/* Velocity Input */}
        <div style={{ background: "#0d1424", padding: "10px 16px", borderBottom: "1px solid #1e2a3a", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 2, marginBottom: 5 }}>RADAR GUN MPH → LAST PITCH</div>
            <div style={{ display: "flex", gap: 6 }}>
              <input type="number" min="20" max="100" placeholder="e.g. 58"
                value={veloInput} onChange={e => setVeloInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && stampVelo(veloInput)}
                style={{ flex: 1, background: "#0a0f1e", border: "1px solid #1e2a3a", borderRadius: 6, color: "#e2e8f0",
                  fontSize: 22, padding: "7px 12px", fontFamily: "monospace", outline: "none", WebkitAppearance: "none" }} />
              <button onClick={() => stampVelo(veloInput)} style={{
                padding: "7px 16px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontFamily: "monospace", letterSpacing: 1, transition: "all 0.2s",
                background: veloFlash ? "#041a0d" : "#001929",
                color: veloFlash ? "#16a34a" : "#00e5ff",
                border: `1px solid ${veloFlash ? "#16a34a44" : "#00e5ff33"}`,
              }}>{veloFlash ? "✓ SET" : "SET →"}</button>
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: 64, paddingLeft: 8, borderLeft: "1px solid #1e2a3a" }}>
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 1, marginBottom: 2 }}>TOP</div>
            <div style={{ fontSize: 30, color: maxVelo ? "#fbbf24" : "#475569", fontFamily: "monospace", lineHeight: 1 }}>{maxVelo ?? "—"}</div>
            <div style={{ fontSize: 9, color: avgVelo ? "#22c55e" : "#475569", fontFamily: "monospace", marginTop: 2 }}>AVG {avgVelo ?? "—"}</div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 6, padding: "10px 16px", background: "#0a0f1e", borderBottom: "1px solid #1e2a3a" }}>
          <StatBox label="PITCHES" value={total} />
          <StatBox label="STR %" value={`${strikesPct}%`} accent={strikesPct >= 60 ? "#16a34a" : strikesPct >= 50 ? "#f59e0b" : "#dc2626"} />
          <StatBox label="ZONE %" value={`${zonePct}%`} accent="#00e5ff" />
          <StatBox label="BALLS" value={balls} accent="#dc2626" />
          <StatBox label="FOULS" value={fouls} accent="#d97706" />
        </div>

        {/* Tab content */}
        {tab === "zone" && (
          <div style={{ padding: "16px" }}>
            {/* Pitch type selector */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 2, marginBottom: 8 }}>PITCH TYPE OVERRIDE</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {PITCH_TYPES.map(t => (
                  <button key={t} onClick={() => setSelectedType(t)} style={{
                    padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer", letterSpacing: 1, fontFamily: "monospace",
                    background: selectedType === t ? "#001929" : "transparent",
                    color: selectedType === t ? "#00e5ff" : "#64748b",
                    border: `1px solid ${selectedType === t ? "#00e5ff44" : "#1e2a3a"}`,
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Strike zone */}
            <StrikeZone pitches={pitches} />

            {/* Legend */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14, justifyContent: "center" }}>
              {Object.entries(RESULT_COLORS).map(([r, c]) => (
                <div key={r} className="pill" style={{ background: c + "18", border: `1px solid ${c}44`, color: c }}>
                  <span>{RESULT_LABELS[r]}</span>
                  <span style={{ color: "#64748b" }}>{resultLabel(r)}</span>
                </div>
              ))}
            </div>

            {/* Pitch type breakdown */}
            {total > 0 && (
              <div style={{ marginTop: 16, background: "#111827", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e2a3a" }}>
                <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>PITCH MIX</div>
                {PITCH_TYPES.filter(t => byType[t] > 0).map(t => (
                  <div key={t} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", width: 80 }}>{t}</span>
                    <div style={{ flex: 1, height: 4, background: "#1e2a3a", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(byType[t] / total) * 100}%`, background: "#00e5ff44", borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 11, color: "#e2e8f0", fontFamily: "monospace", width: 20, textAlign: "right" }}>{byType[t]}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => {
                if (pitches.length > 0 && confirm("Save session to history and clear?")) {
                  const session = {
                    id: Date.now(),
                    date: new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
                    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                    pitcher: pitcherName,
                    total: pitches.length,
                    strikesPct,
                    zonePct,
                    maxVelo,
                    avgVelo,
                    pitchData: pitches,
                  };
                  saveSession(session);
                  setHistory(loadHistory());
                  setPitches([]); setLastPitch(null); setTotalCost(0);
                }
              }} style={{ flex: 1, padding: "8px", background: "transparent", color: "#64748b", border: "1px solid #1e2a3a", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: 1 }}>
                SAVE + CLEAR
              </button>
              <button onClick={loadDemo}
                style={{ flex: 1, padding: "8px", background: "#111827", color: "#f59e0b", border: "1px solid #f59e0b22", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: 1 }}>
                DEMO
              </button>
              <button onClick={() => addPitch({ result: "called-strike", zone: 5, type: selectedType, mechanic: null, confidence: "manual", time: new Date().toLocaleTimeString() })}
                style={{ flex: 1, padding: "8px", background: "#041a0d", color: "#16a34a", border: "1px solid #00ff8822", borderRadius: 6, cursor: "pointer", fontSize: 11, fontFamily: "monospace", letterSpacing: 1 }}>
                + PITCH
              </button>
            </div>
            <button onClick={exportReport} disabled={exporting || pitches.length === 0}
              style={{ width: "100%", marginTop: 8, padding: "11px", borderRadius: 6, cursor: pitches.length === 0 ? "not-allowed" : "pointer",
                background: pitches.length > 0 ? "#001929" : "#111827",
                color: pitches.length > 0 ? "#00e5ff" : "#334155",
                border: `1px solid ${pitches.length > 0 ? "#00e5ff44" : "#1e2a3a"}`,
                fontSize: 12, fontFamily: "monospace", letterSpacing: 2,
              }}>
              {exporting ? "GENERATING..." : "↓ EXPORT REPORT (PNG)"}
            </button>
          </div>
        )}

        {tab === "log" && (
          <div style={{ padding: "16px" }}>
            {pitches.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", fontFamily: "monospace", fontSize: 11, padding: "40px 0" }}>NO PITCHES RECORDED YET</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[...pitches].reverse().map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
                    background: "#111827", borderRadius: 6, border: `1px solid ${resultColor(p.result)}18` }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: resultColor(p.result) + "22",
                      border: `1.5px solid ${resultColor(p.result)}`, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, color: resultColor(p.result), fontFamily: "monospace", flexShrink: 0 }}>
                      {RESULT_LABELS[p.result]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0", letterSpacing: 1 }}>
                        {resultLabel(p.result)} · <span style={{ color: "#64748b" }}>Zone {p.zone || "—"}</span>
                        {p.velo ? <span style={{ color: "#fbbf24", marginLeft: 8, fontFamily: "monospace" }}>{p.velo} mph</span> : null}
                      </div>
                      <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace" }}>
                        {p.type}{p.mechanic ? ` · ${p.mechanic}` : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 9, color: "#475569", fontFamily: "monospace" }}>{p.time}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "history" && (
          <div style={{ padding: "16px" }}>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", color: "#64748b", fontFamily: "monospace", fontSize: 11, padding: "40px 0" }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>📋</div>
                NO SESSIONS SAVED YET<br />
                <span style={{ color: "#334155", fontSize: 10, marginTop: 8, display: "block" }}>
                  Sessions are saved when you tap SAVE + CLEAR
                </span>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {history.map((s, i) => {
                  const sp = s.strikesPct || 0;
                  return (
                    <div key={s.id} style={{ background: "#111827", borderRadius: 8, padding: "12px 14px", border: "1px solid #1e2a3a" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, color: "#e2e8f0", letterSpacing: 1 }}>{s.pitcher}</div>
                          <div style={{ fontSize: 10, color: "#64748b", fontFamily: "monospace", marginTop: 2 }}>{s.date} · {s.time}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 22, color: sp >= 60 ? "#16a34a" : sp >= 50 ? "#f59e0b" : "#dc2626", fontFamily: "monospace" }}>{sp}%</div>
                          <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace" }}>STRIKES</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { label: "PITCHES", value: s.total },
                          { label: "ZONE %", value: `${s.zonePct || 0}%`, color: "#00e5ff" },
                          { label: "TOP MPH", value: s.maxVelo || "—", color: "#fbbf24" },
                          { label: "AVG MPH", value: s.avgVelo || "—" },
                        ].map(({ label, value, color }) => (
                          <div key={label} style={{ flex: 1, background: "#0d1424", borderRadius: 6, padding: "6px 4px", textAlign: "center" }}>
                            <div style={{ fontSize: 8, color: "#64748b", fontFamily: "monospace", letterSpacing: 1 }}>{label}</div>
                            <div style={{ fontSize: 16, color: color || "#e2e8f0", fontFamily: "monospace" }}>{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => { if (confirm("Delete all session history?")) { localStorage.removeItem(HISTORY_KEY); setHistory([]); } }}
                  style={{ padding: "8px", background: "transparent", color: "#475569", border: "1px solid #1e2a3a", borderRadius: 6, cursor: "pointer", fontSize: 10, fontFamily: "monospace", letterSpacing: 1, marginTop: 4 }}>
                  CLEAR ALL HISTORY
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "setup" && (
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#111827", borderRadius: 10, padding: "14px", border: "1px solid #1e2a3a" }}>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>CAMERA ANGLE</div>
              {[
                { id: "behind", label: "Behind Home Plate", desc: "Best for pitch location & zone tracking. Set up a tripod behind the catcher, slightly elevated. This is the recommended setup." },
                { id: "side", label: "Side View", desc: "Best for mechanics analysis — stride, arm circle, hip rotation. Position along the first or third base line." },
              ].map(opt => (
                <div key={opt.id} onClick={() => setCameraAngle(opt.id)} style={{
                  padding: "10px 12px", borderRadius: 8, marginBottom: 8, cursor: "pointer",
                  background: cameraAngle === opt.id ? "#001929" : "#0d1424",
                  border: `1px solid ${cameraAngle === opt.id ? "#00e5ff44" : "#1e2a3a"}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: cameraAngle === opt.id ? "#00e5ff" : "#334155", transition: "all 0.2s" }} />
                    <span style={{ fontSize: 13, color: cameraAngle === opt.id ? "#00e5ff" : "#64748b", letterSpacing: 1 }}>{opt.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", lineHeight: 1.5, marginLeft: 18 }}>{opt.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ background: "#111827", borderRadius: 10, padding: "14px", border: "1px solid #1e2a3a" }}>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>📱 IPHONE TIPS</div>
              {[
                "Set Auto-Lock to Never while recording (Settings → Display & Brightness)",
                "Plug into a battery pack — camera + screen drains in ~90 min",
                "Use a tripod clamp mount, ~$15 on Amazon",
                "Shoot landscape. Keep the pitcher AND home plate in frame",
                "Shade the phone screen if in direct sun to prevent overheating",
                "Enable Do Not Disturb to prevent notifications from pausing the session",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ fontSize: 10, color: "#00e5ff", fontFamily: "monospace", marginTop: 1, flexShrink: 0 }}>0{i + 1}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", lineHeight: 1.5 }}>{tip}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#111827", borderRadius: 10, padding: "14px", border: "1px solid #1e2a3a" }}>
              <div style={{ fontSize: 9, color: "#64748b", fontFamily: "monospace", letterSpacing: 2, marginBottom: 10 }}>MOTION SENSITIVITY</div>
              <p style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace", lineHeight: 1.6 }}>
                The app checks for motion every 1.5 seconds using pixel comparison — zero cost. The Claude AI only fires when movement is detected (threshold: 10% pixel change). During idle time between pitches, no API calls are made, saving battery and cost.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
