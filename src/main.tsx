import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { installMobileViewportFix } from './utils/mobileViewport'
import App from './App.tsx'

installMobileViewportFix()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
