# 🎂 80 Años Mamá — Birthday Music Player

A celebratory, high-fidelity web music player created for Mom's 80th birthday. Built with React 19, Tailwind CSS v4, and Vite 8, featuring an ambient glassmorphic design system, YouTube IFrame API playback, and a mood-based smart shuffle algorithm.

**🌐 Live Demo:** [https://80-birthday.elecodesdata.workers.dev/](https://80-birthday.elecodesdata.workers.dev/)

---

## ✨ Features

- **🎬 YouTube Playback Engine:** Seamless video embedding with autoplay, automatic track progression on end, and error recovery for restricted videos.
- **🎤 Synchronized Karaoke Mode:** Real-time scrolling lyrics synchronized with YouTube playback timestamps, auto-centering on active lines, mood-colored glowing typography, interactive line-seeking (click any line to jump video), and manual sync offset calibration.
- **🎶 80 Curated Songs:** Pre-loaded collection embedded in source code with artist metadata, lyrics, and mood tags (commemorating Mom's 80th birthday).
- **✨ Smart Mood Shuffle:** Greedy tag-similarity algorithm to dynamically sequence songs according to selected mood filters (Happy 🎉, Dance 💃, Romantic 💕, Calm 😌, Energetic 🌟, Nostalgic 🥹).
- **🎨 Glassmorphism & OKLCH Theme:** Modern translucent cards (`backdrop-filter: blur(16px)`), warm ambient glows synchronized with the active track's mood, and fluid micro-animations.
- **📊 Live Audio Visualizer:** Dynamic equalizer bars reacting to music playback.
- **📜 Synced Lyrics & Fallback Reader:** Dynamic LRC fetching from LRCLIB with fuzzy matching, offline bundle fallbacks, and static lyrics fallback.
- **📂 Paginated Collection Drawer:** Instant search by title/artist with a 10-track-per-page windowed paginator.
- **➕ Custom Song Submission:** Modal form to add YouTube songs with real-time URL validation and mood tagging.
- **🔗 Hybrid Persistence & Shareable URLs:** Newly added custom tracks automatically serialize to compact URL-safe query parameters (`?custom=...`) and sync with `localStorage`, enabling persistent track retention across reloads and one-click shareable links ("Copiar Enlace").
- **💾 JSON Export & Reset:** Export custom playlists to JSON or restore the original curated set.

---

## 🏗️ Architecture & Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx             # Festive hero header with tribute branding
│   │   └── Footer.jsx             # Action buttons (export/reset/share link) & dedication
│   ├── player/
│   │   ├── PlayerHero.jsx         # Spotlight card (YouTube frame, metadata, mood glow)
│   │   ├── PlayerControls.jsx     # Tactile navigation, drawer toggles & karaoke trigger
│   │   └── EqualizerBars.jsx      # Animated SVG/CSS equalizer wave
│   ├── playlist/
│   │   ├── PlaylistDrawer.jsx     # Searchable, paginated song collection
│   │   ├── SongItem.jsx           # Song row with mood pill, active state, & delete
│   │   └── Pagination.jsx         # Smart windowed paginator (10 items/page)
│   ├── mood/
│   │   └── MoodFilterSection.jsx  # Interactive mood filter pills & smart shuffle trigger
│   ├── lyrics/
│   │   ├── KaraokeStage.jsx       # Real-time auto-scrolling karaoke view with calibration
│   │   └── LyricsCard.jsx         # Smooth scrollable lyrics reader with copy action
│   ├── forms/
│   │   └── AddSongModal.jsx       # Song creation modal with YouTube URL parser
│   └── ui/
│       ├── Badge.jsx              # Status, count, and mood pill primitives
│       └── Button.jsx             # Tactile button primitives with click physics
├── hooks/
│   └── useKaraoke.js              # Real-time YouTube player clock polling & karaoke state
├── services/
│   └── lyricsService.js           # LRC parser, query normalizer & LRCLIB client
├── App.jsx                        # Central state coordinator & YouTube API manager
├── playlist.js                    # Curated 80-song catalogue & helper utilities
├── persistence.js                 # Hybrid localStorage & URL parameter state sync
├── moods.js                       # Mood definitions, tags, and helper functions
└── index.css                      # Tailwind v4 theme tokens & glassmorphism utilities
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation
```bash
cd birthday-player
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 🛠️ Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite 8](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Typography:** Outfit & Space Mono (Google Fonts)
- **Deployment:** [Cloudflare](https://80-birthday.elecodesdata.workers.dev/)
