Full-size PNG sources for the room illustrations. The app serves the WebP
copies in `public/` (room-art at full size; the two downstairs pieces scaled
to 720px), so regenerate those if these change. Kept out of `public/` so the
service worker doesn't precache 2.6 MB of images.

App icon sources: `app-icon.svg` (home-screen icons) and `app-icon-maskable.svg`
(same art shrunk into the Android safe zone). Render them to the PNG sizes in
`public/icons/` (32, 180, 192, 512 and maskable 512) if they change.
