# ⚾ PitchLab

AI-powered softball pitcher analysis — installable on iPhone as a home screen app.

---

## What it does

- Detects pitches from a live iPhone camera feed
- Only fires AI analysis when motion is detected (saves battery + cost)
- Plots every pitch on a live 9-zone strike zone grid
- Tracks pitch type, velocity (manual entry), and AI mechanic notes
- Exports a shareable PNG report card after each session

---

## Deploy to iPhone in 4 steps

### Step 1 — Get your Anthropic API key (free to start)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account
3. Go to API Keys → Create Key
4. Copy it — you'll need it in Step 3

---

### Step 2 — Push to GitHub

1. Go to [github.com](https://github.com) and create a free account if you don't have one
2. Click **+** → **New repository** → name it `pitchlab` → **Create**
3. On your computer, open Terminal and run:

```bash
cd pitchlab
git init
git add .
git commit -m "Initial PitchLab"
git remote add origin https://github.com/YOUR_USERNAME/pitchlab.git
git push -u origin main
```

---

### Step 3 — Deploy to Vercel (free hosting + HTTPS)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account
2. Click **Add New → Project**
3. Select your `pitchlab` repo → click **Import**
4. Before deploying, click **Environment Variables** and add:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your key from Step 1
5. Click **Deploy**

Vercel gives you a free URL like `pitchlab-yourname.vercel.app`

---

### Step 4 — Install on iPhone

1. On your iPhone, open **Safari** (must be Safari, not Chrome)
2. Go to your Vercel URL (e.g. `pitchlab-yourname.vercel.app`)
3. Tap the **Share** button (box with arrow at bottom of screen)
4. Tap **Add to Home Screen**
5. Tap **Add**

PitchLab now appears on your home screen as a full app icon.
Camera access works — no iframe restrictions.

---

## Using it at the field

**Camera setup:**
- Behind home plate, slightly elevated above catcher = best for zone tracking
- Side view (1st or 3rd base line) = best for mechanics

**iPhone tips:**
- Set Auto-Lock to **Never** (Settings → Display & Brightness)
- Plug into a battery pack — camera drains phone in ~90 min
- $15 tripod phone clamp on Amazon
- Enable Do Not Disturb

**Velocity (Pocket Radar):**
After each pitch, glance at the radar and type the MPH into the velocity field.
Tap SET → to stamp it onto that pitch. Shows in the log and export report.

---

## Running locally (for development)

```bash
npm install
cp .env.local.example .env.local
# Add your API key to .env.local
npm run dev
# Open http://localhost:3000
```

To test on your iPhone locally, find your computer's IP (System Settings → WiFi → Details)
and open `http://[your-ip]:3000` in iPhone Safari.

---

## Cost

- **Hosting:** Free (Vercel)
- **AI analysis:** ~$2–4 per bullpen session (Claude Haiku)
- **App Store:** Not needed — installs directly from Safari

---

## Project structure

```
pitchlab/
├── app/
│   ├── layout.js              # PWA meta tags + service worker registration
│   ├── page.js                # Entry point
│   ├── globals.css
│   └── api/analyze/route.js   # Server-side Anthropic proxy (API key stays here)
├── components/
│   └── PitchLab.jsx           # Main app
├── public/
│   ├── manifest.json          # PWA manifest (name, icons, display mode)
│   ├── sw.js                  # Service worker (enables installation)
│   └── icons/
│       ├── icon-192.png
│       └── icon-512.png
└── .env.local.example
```
