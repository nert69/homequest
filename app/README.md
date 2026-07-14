# HomeQuest

A calm, colourful way to track finishing your home, room by room. This is the real, working
version of the "HomeQuest Sticker Board (Gradient Boxes)" design from Claude Design.

## What it is

A mobile web app (installable to your iPhone home screen, no App Store needed) where each room
is a colourful tile that fills in as you tick off jobs. Tap a room to see its to-do list, tap a
job to cycle it through **to do → doing → done**, and add rooms/jobs/costs/steps as you go.
Everything is saved on your phone, and — once sync is set up (below) — kept in sync with your
partner's phone too.

## Running it locally (for whoever maintains the code)

```bash
npm install
npm run dev       # local dev server with hot reload
npm run build     # production build, output in dist/
npm run preview   # serve the production build locally
```

## Installing it on an iPhone

1. Host the contents of `dist/` (after `npm run build`) somewhere reachable over HTTPS —
   e.g. GitHub Pages, Netlify, Vercel, or Cloudflare Pages all have free tiers that work by just
   pointing them at this folder.
2. Open that URL in **Safari** on the iPhone.
3. Tap the Share icon → **Add to Home Screen**.
4. It now behaves like an installed app: its own icon, full-screen, no browser bars.

Repeat step 2–3 on a second phone (e.g. a partner's) to install it there too.

## Setting up sync between your two phones (optional but recommended)

Without this, each phone keeps its own separate copy of the data. To make both phones show the
same live progress:

1. Go to [supabase.com](https://supabase.com) and create a free account (no card needed) and a
   new project.
2. In the project, open **SQL Editor → New query**, paste in the contents of
   [`supabase/setup.sql`](./supabase/setup.sql), and click **Run**. This creates the one table
   the app needs.
3. Open **Settings → API** in the Supabase dashboard. Copy the **Project URL** and the
   **anon public** key.
4. Create a file named `.env` in this folder (copy `.env.example`) and paste those two values in:
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxx
   ```
5. Rebuild (`npm run build`) and redeploy. The app will now show a one-time "Set up your
   household" screen: whoever opens it first taps **Start a new household** and gets a 6-character
   code to share; your partner taps **I have a code from my partner** and enters it. From then on,
   ticking something off on either phone updates the other within a second or two.

There's no per-person login — the household code is the only thing gating access to your data,
similar to a shared link. That's fine for a private renovation checklist between two people, but
worth knowing: anyone who has the code could see (and edit) the list.

## Data & sync notes

- With sync configured: data lives in your Supabase project, and is also cached locally per
  device so the app still works offline (changes sync once back online).
- Without sync configured: data is stored only in that device's browser (`localStorage`) — no
  account, nothing sent anywhere, but no sharing between phones either.
