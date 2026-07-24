import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// With `manifest: false`, vite-plugin-pwa still injects a bare
// `<link rel="manifest">` with no href. Strip it so iOS sees no manifest at
// all and honours the Apple status-bar meta tag instead.
function stripEmptyManifestLink() {
  return {
    name: 'strip-empty-manifest-link',
    enforce: 'post',
    transformIndexHtml(html) {
      return html.replace(/<link rel="manifest"\s*>/g, '')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      // No web app manifest on purpose. When one is present, iOS drives the
      // Home Screen app's status bar from the manifest (painting a solid strip
      // in its theme_color) and ignores apple-mobile-web-app-status-bar-style,
      // so the page can never run edge-to-edge under the clock. Without it,
      // the Apple meta tags in index.html govern instead — they already supply
      // the app name, icon, and standalone behaviour on iOS.
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
      },
    }),
    stripEmptyManifestLink(),
  ],
})
