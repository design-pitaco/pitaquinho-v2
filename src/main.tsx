import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { prepareMobileViewportForFirstRender } from './utils/mobileViewport'
import App from './App.tsx'

const rootElement = document.getElementById('root')!
const root = createRoot(rootElement)

prepareMobileViewportForFirstRender()
  .catch(() => undefined)
  .finally(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  })
