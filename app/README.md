# HomeQuest

A calm, colourful way to track finishing your home, room by room. This is the real, working
version of the "HomeQuest Sticker Board (Gradient Boxes)" design from Claude Design.

## What it is

A mobile web app (installable to your iPhone home screen, no App Store needed) where each room
is a colourful tile that fills in as you tick off jobs. Tap a room to see its to-do list, tap a
job to cycle it through **to do → doing → done**, and add rooms/jobs/costs/steps as you go.
Everything is saved on your phone (no account, no internet needed after the first load).

## Running it locally (for whoever maintains the code)

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build, output in dist/
npm run preview   # serve the production build locally
```

No other setup is required — it's a static site once built.

## Installing it on an iPhone

1. Host the contents of `dist/` (after `npm run build`) somewhere reachable over HTTPS —
   e.g. GitHub Pages, Netlify, Vercel, or Cloudflare Pages all have free tiers that work by just
   pointing them at this folder.
2. Open that URL in **Safari** on the iPhone.
3. Tap the Share icon → **Add to Home Screen**.
4. It now behaves like an installed app: its own icon, full-screen, no browser bars.

Repeat step 2–3 on a second phone (e.g. a partner's) to install it there too — each phone keeps
its own local copy of the data (see note below).

## Data & sync

Room/job data is stored locally in the browser (`localStorage`), per device. Two phones will
each have their **own independent copy** — there is no server, so progress made on one phone
will not automatically show up on the other. If shared progress across devices turns out to
matter, that would need a small backend (e.g. a free Supabase/Firebase project) added later.
