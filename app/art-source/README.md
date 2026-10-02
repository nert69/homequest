Full-size PNG sources for the room illustrations. The app serves the WebP
copies in `public/` (room-art at full size; the two downstairs pieces scaled
to 720px), so regenerate those if these change. Kept out of `public/` so the
service worker doesn't precache 2.6 MB of images.

App icon sources: `app-icon.svg` (home-screen icons) and `app-icon-maskable.svg`
(same art shrunk into the Android safe zone). Render them to the PNG sizes in
`public/icons/` (32, 180, 192, 512 and maskable 512) if they change.

The six room crops from `room-art.png` are baked into `public/art/*.webp`: the
pale paper is removed with alpha = clamp(15 - 6(r+g+b)) in sRGB (the maths the
old live SVG filter used) and each crop is cut out (the bath crop keeps its
notched outline). Re-run that if `room-art.png` changes.
