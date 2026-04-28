const MOBILE_MEDIA_QUERY = '(max-width: 499px)'

const VIEWPORT_VARIABLES = [
  '--app-viewport-height',
  '--app-viewport-width',
  '--app-visual-viewport-top',
  '--app-visual-viewport-bottom',
]

let isInstalled = false
let rafId: number | null = null
let stabilizationTimers: number[] = []

const getViewportMedia = () => window.matchMedia?.(MOBILE_MEDIA_QUERY)

const clearViewportVariables = () => {
  const root = document.documentElement
  VIEWPORT_VARIABLES.forEach((name) => root.style.removeProperty(name))
}

const measureViewport = () => {
  const media = getViewportMedia()

  if (media && !media.matches) {
    clearViewportVariables()
    return
  }

  const root = document.documentElement
  const visualViewport = window.visualViewport
  const height = visualViewport?.height ?? window.innerHeight
  const width = visualViewport?.width ?? window.innerWidth
  const offsetTop = visualViewport?.offsetTop ?? 0
  const layoutHeight = window.innerHeight || height
  const bottomOffset = Math.max(0, layoutHeight - height - offsetTop)

  root.style.setProperty('--app-viewport-height', `${height}px`)
  root.style.setProperty('--app-viewport-width', `${width}px`)
  root.style.setProperty('--app-visual-viewport-top', `${offsetTop}px`)
  root.style.setProperty('--app-visual-viewport-bottom', `${bottomOffset}px`)
}

const scheduleViewportMeasure = () => {
  if (rafId !== null) return

  rafId = window.requestAnimationFrame(() => {
    rafId = null
    measureViewport()
  })
}

const scheduleStabilizationMeasures = () => {
  stabilizationTimers.forEach((timer) => window.clearTimeout(timer))
  stabilizationTimers = [50, 150, 350, 700].map((delay) => (
    window.setTimeout(scheduleViewportMeasure, delay)
  ))

  scheduleViewportMeasure()
}

export function installMobileViewportFix() {
  if (typeof window === 'undefined' || isInstalled) return

  isInstalled = true
  const media = getViewportMedia()

  measureViewport()
  scheduleStabilizationMeasures()

  window.addEventListener('resize', scheduleStabilizationMeasures)
  window.addEventListener('orientationchange', scheduleStabilizationMeasures)
  window.addEventListener('pageshow', scheduleStabilizationMeasures)
  window.addEventListener('load', scheduleStabilizationMeasures)
  document.addEventListener('visibilitychange', scheduleStabilizationMeasures)

  window.visualViewport?.addEventListener('resize', scheduleStabilizationMeasures)
  window.visualViewport?.addEventListener('scroll', scheduleStabilizationMeasures)

  if (media) {
    const mediaWithLegacyListener = media as MediaQueryList & {
      addListener?: (listener: () => void) => void
    }

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', scheduleStabilizationMeasures)
    } else {
      mediaWithLegacyListener.addListener?.(scheduleStabilizationMeasures)
    }
  }
}
