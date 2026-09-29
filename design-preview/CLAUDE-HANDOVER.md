# HomeQuest graphic design preview

This folder contains the latest approved visual experiment. The existing app/ folder is unchanged. Do not replace or deploy the production app without Nathan's explicit approval.

Preview: https://homequest-graphic-phone.nertnert.chatgpt.site (owner-private; screenshots or local execution may be needed).

## Run
From design-preview/: npm ci, then npm run dev. npm run build creates dist/.

## Safety
- Supabase sync is deliberately disabled in src/sync.js.
- Local storage is isolated under homequest-graphic-preview in src/data.js.
- These safeguards are for the test version, not production changes to merge blindly.
- Real household tasks and partner sync belong to the existing app. Preserve them.

## Design
Warm ivory background, flat pale panels, angular colourful editorial illustrations, black sans-serif text and lime completion circles. Keep the homepage and room task screens consistent. No additional glass effects, vintage textures, nested cards or unsolicited layout changes.

## Main files
- src/components/GraphicDashboard.jsx: home grid
- src/components/GraphicRoom.jsx: room tasks, centred SVG ticks
- src/components/GraphicArt.jsx: original illustration crops and two distinct new room assets
- src/graphic*.css: current visual styling and polish
- src/App.jsx: navigation, matching room numbers and home scroll restoration
- public/room-art.png: original mockup artwork source
- public/downstairs-toilet.png and downstairs-hallway.png: new raster illustrations

The image crops use a browser filter to remove the pale source background. Do not reintroduce tight silhouette masks: they previously clipped the brick-balancing hand and other details.

Latest changes: stronger task-circle outlines, centred black line ticks on lime, enlarged new illustrations, consistent room numbers, return-to-home scroll restoration, subtle reduced-motion-aware feedback, and matching Shopping/Done/form styling. Build passed; full real-iPhone regression testing remains needed before production adoption.

Motion pass (src/graphic-motion.css plus small hooks in App.jsx, GraphicDashboard.jsx and GraphicRoom.jsx): the lime fills from the centre and the tick draws on; a just-ticked job holds its place for 650ms before moving to the finished pile, because moving the row cancels its transitions; the room illustration nods when a job is completed; the done count rolls; the room card morphs into the room screen via the View Transitions API (iOS 18+, with an instant switch elsewhere); and the room cards rise in one by one on first open only. Everything is off under Reduce Motion.
