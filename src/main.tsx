import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { reloadOnceOnMobileFirstLoad } from './utils/mobileViewport'
import App from './App.tsx'

if (!reloadOnceOnMobileFirstLoad()) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
