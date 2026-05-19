# Classica — Classical Music Identifier & Collection

A mobile-first web app that identifies classical music, organizes your collection chronologically by era and composer, finds sheet music on IMSLP, and surfaces YouTube performances.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or browser.

## API Keys

Copy `.env.example` to `.env.local` and add your keys:

| Service | Purpose | Get it at |
|---------|---------|-----------|
| **ACRCloud** | Music identification (like Shazam) | [acrcloud.com](https://www.acrcloud.com) — free tier: 100 req/day |
| **YouTube Data API** | Performance video search | [console.cloud.google.com](https://console.cloud.google.com) — free tier: 10,000 units/day |

The app works without API keys — music identification and YouTube search will be unavailable, but you can still browse composers and manually explore IMSLP/YouTube via direct links.

## Features

- **Identify** — Record audio to identify classical music via ACRCloud
- **Collect** — Save identified pieces to your personal chronological collection
- **Practice Journal** — Record practice videos, reflect with guided prompts, and save notes
- **Timeline** — Browse composers across Baroque, Classical, Romantic, and Modern eras
- **Sheet Music** — Find free sheet music on IMSLP for any piece
- **Performances** — Watch YouTube videos of different artists performing each piece
- **Composer Bios** — Read about composers with data from Wikipedia

## Tech Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS
- Framer Motion
- localStorage for persistence (no backend needed)
