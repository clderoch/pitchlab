# ⚾ PitchLab

AI-powered softball pitcher analysis. Point your iPhone at a bullpen session and get real-time pitch location, type detection, velocity tracking, and mechanic notes — plotted live on a strike zone map and exportable as a coach report.

---

## How It Works

### Step 1 — Motion Detection (free, every 1.5 seconds)
The app takes a tiny 80×60 pixel snapshot and compares it to the previous one. If more than 10% of pixels changed, it knows something is moving — a pitcher winding up, a ball in flight. No API call, no cost.

### Step 2 — Frame Capture
When motion is detected, a full 640×480 JPEG is captured from the camera feed, compressed to ~60% quality, and prepared for analysis.

### Step 3 — Send to Vercel Server
The image goes to your `/api/analyze` endpoint on Vercel. Your server adds the Anthropic API key and forwards it to Claude. The key never touches the browser.

### Step 4 — Claude Haiku Analyzes the Frame
Claude receives the image and answers:
- Was a pitch just thrown?
- Ball or strike? (called, swinging, foul, in-play)
- Which of the 9 zones did it cross? (3×3 grid, catcher's view)
- Pitch type? (fastball, changeup, dropball, curveball, riseball)
- Any mechanic observation? (release point, arm speed, stride, hip rotation)

Returns JSON in under 2 seconds.

### Step 5 — Zone Map Updates
A colored dot is plotted on the strike zone:
- 🔵 Cyan = Called strike
- 🟢 Green = Swinging strike
- 🔴 Red = Ball
- 🟠 Orange = Foul
- 🟡 Yellow = In play

### Step 6 — Stats Update Live
- Total pitches
- Strike percentage
- Zone percentage
- Balls and fouls
- Top MPH and average MPH (via manual radar entry)

### Step 7 — Velocity Entry
After each pitch, glance at your Pocket Radar, type the MPH, tap SET. Stamps onto that pitch and feeds into speed stats.

### Step 8 — Session History
Every completed session is saved automatically. Compare this bullpen to last week's — track strike % trends, zone consistency, and velocity changes over time.

### Step 9 — Export Report
Tap Export Report for a PNG containing:
- Pitcher name and date
- Full stats header (pitches, strike %, zone %, top MPH, avg MPH)
- Complete zone map with every pitch plotted
- Pitch mix breakdown
- Mechanic notes from the session

---

## Model

**Claude Haiku 4.5** (`claude-haiku-4-5-20251001`)
- Fastest and cheapest Anthropic vision model
- ~$0.002–0.003 per pitch analyzed
- ~$0.35 per 60-pitch bullpen session
- ~$20 covers roughly 57 full sessions

---

## Setup

### 1. Get an Anthropic API key
Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key

### 2. Push to GitHub
```bash
git init
git add .
git commit -m "PitchLab initial commit"
git remote add origin https://github.com/YOUR_USERNAME/pitchlab.git
git push -u origin master
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Add New Project
2. Import your GitHub repo
3. Settings → Build and Deployment → Framework Preset → **Next.js**
4. Settings → Build and Deployment → Root Directory → `pitchlab`
5. Settings → Environment Variables → Add `ANTHROPIC_API_KEY`
6. Deploy

### 4. Install on iPhone
1. Open Safari on iPhone
2. Go to your Vercel URL (e.g. `pitchlab-nine.vercel.app`)
3. Tap Share → Add to Home Screen → Add
4. PitchLab appears on your home screen with full camera access

---

## Camera Setup at the Field

**Behind home plate (recommended)**
Best for pitch location and zone tracking. Tripod behind the catcher, slightly elevated. Keep pitcher AND home plate in frame.

**Side view**
Best for mechanics — stride, arm circle, hip rotation. Position along first or third base line.

**iPhone tips**
- Set Auto-Lock to Never (Settings → Display & Brightness)
- Plug into a battery pack — camera drains in ~90 min
- $15 tripod phone clamp on Amazon
- Enable Do Not Disturb

---

## Project Structure

```
pitchlab/
├── app/
│   ├── layout.js              # PWA meta tags + service worker
│   ├── page.js                # Entry point
│   ├── globals.css
│   └── api/analyze/route.js   # Server-side Anthropic proxy
├── components/
│   └── PitchLab.jsx           # Main app component
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service worker
│   └── icons/                 # App icons
└── .env.local.example
```

---

## What It Can't Do (Yet)
- Detect velocity automatically (needs radar gun)
- Identify individual batters or game situations
- Work on every single pitch — fast pitches at odd angles may be missed

---

## Built With
- [Next.js 14](https://nextjs.org/)
- [Claude Haiku 4.5](https://anthropic.com)
- Canvas API for zone visualization and report export
- WebRTC for live camera access
- PWA for iPhone home screen installation
