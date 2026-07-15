import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

// Without this, an already-installed home-screen app can keep showing an old
// cached version after a new one is deployed until it's force-quit and
// reopened a couple of times. Reload as soon as a new version takes over.
registerSW({ immediate: true, onNeedRefresh() { window.location.reload() } })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
