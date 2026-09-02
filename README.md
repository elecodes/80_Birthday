# 🎂 80 Años Mamá — Birthday Music Player

A celebratory, high-fidelity web music player created for Mom's 80th birthday. Built with React 19, Tailwind CSS v4, and Vite 8, featuring an ambient glassmorphic design system, YouTube IFrame API playback, and a mood-based smart shuffle algorithm.

---

## ✨ Features

- **🎬 YouTube Playback Engine:** Seamless video embedding with autoplay, automatic track progression on end, and error recovery for restricted videos.
- **🎶 71 Curated Songs:** Pre-loaded collection embedded in source code with artist metadata, lyrics, and mood tags.
- **✨ Smart Mood Shuffle:** Greedy tag-similarity algorithm to dynamically sequence songs according to selected mood filters (Happy 🎉, Dance 💃, Romantic 💕, Calm 😌, Energetic 🌟, Nostalgic 🥹).
- **🎨 Glassmorphism & OKLCH Theme:** Modern translucent cards (`backdrop-filter: blur(16px)`), warm ambient glows synchronized with the active track's mood, and fluid micro-animations.
- **📊 Live Audio Visualizer:** Dynamic equalizer bars reacting to music playback.
- **📜 Lyrics Reader:** Collapsible typography card with one-click clipboard copy.
- **📂 Paginated Collection Drawer:** Instant search by title/artist with a 10-track-per-page windowed paginator.
- **➕ Custom Song Submission:** Modal form to add YouTube songs with real-time URL validation and mood tagging.
- **💾 JSON Export & Reset:** Export custom playlists to JSON or restore the original curated set.

---

## 🏗️ Architecture & Component Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx             # Festive hero header with tribute branding
│   │   └── Footer.jsx             # Action buttons (export/reset) & dedication
│   ├── player/
│   │   ├── PlayerHero.jsx         # Spotlight card (YouTube frame, metadata, mood glow)
│   │   ├── PlayerControls.jsx     # Tactile navigation & drawer toggles
│   │   └── EqualizerBars.jsx      # Animated SVG/CSS equalizer wave
│   ├── playlist/
│   │   ├── PlaylistDrawer.jsx     # Searchable, paginated song collection
│   │   ├── SongItem.jsx           # Song row with mood pill, active state, & delete
│   │   └── Pagination.jsx         # Smart windowed paginator (10 items/page)
│   ├── mood/
│   │   └── MoodFilterSection.jsx  # Interactive mood filter pills & smart shuffle trigger
│   ├── lyrics/
│   │   └── LyricsCard.jsx         # Smooth scrollable lyrics reader with copy action
│   ├── forms/
│   │   └── AddSongModal.jsx       # Song creation modal with YouTube URL parser
│   └── ui/
│       ├── Badge.jsx              # Status, count, and mood pill primitives
│       └── Button.jsx             # Tactile button primitives with click physics
├── App.jsx                        # Central state coordinator & YouTube API manager
├── playlist.js                    # Initial 71-song catalogue & helper utilities
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
- **Deployment:** GitHub Pages
