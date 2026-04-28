const MOBILE_MEDIA_QUERY = '(max-width: 499px)'

const VIEWPORT_VARIABLES = [
  '--app-viewport-height',
  '--app-viewport-width',
  '--app-visual-viewport-top',
  '--app-visual-viewport-bottom',
  '--app-fixed-bottom-offset',
]

interface ViewportMetrics {
  height: number
  width: number
  offsetTop: number
  bottomOffset: number
  fixedBottomOffset: number
}

const FIRST_RENDER_MAX_WAIT = 900
const FIRST_RENDER_SAMPLE_INTERVAL = 100
const REQUIRED_STABLE_SAMPLES = 3

let isInstalled = false
let rafId: number | null = null
let stabilizationTimers: number[] = []
let fixedBottomProbe: HTMLDivElement | null = null

const getViewportMedia = () => window.matchMedia?.(MOBILE_MEDIA_QUERY)

const isMobileViewport = () => {
  const media = getViewportMedia()
  return media ? media.matches : window.innerWidth <= 499
}

const clearViewportVariables = () => {
  const root = document.documentElement
  VIEWPORT_VARIABLES.forEach((name) => root.style.removeProperty(name))
}

const getFixedBottomOffset = (visualViewportHeight: number) => {
  if (!document.body) return 0

  if (!fixedBottomProbe) {
    fixedBottomProbe = document.createElement('div')
    fixedBottomProbe.setAttribute('aria-hidden', 'true')
    fixedBottomProbe.style.cssText = [
      'position:fixed',
      'left:0',
      'bottom:0',
      'width:1px',
      'height:0',
      'visibility:hidden',
      'pointer-events:none',
      'z-index:-1',
    ].join(';')
    document.body.appendChild(fixedBottomProbe)
  }

  const fixedBottom = fixedBottomProbe.getBoundingClientRect().bottom
  return Math.max(0, fixedBottom - visualViewportHeight)
}

const measureViewport = (): ViewportMetrics | null => {
  if (!isMobileViewport()) {
    clearViewportVariables()
    return null
  }

  const root = document.documentElement
  const visualViewport = window.visualViewport
  const height = visualViewport?.height ?? window.innerHeight
  const width = visualViewport?.width ?? window.innerWidth
  const offsetTop = visualViewport?.offsetTop ?? 0
  const layoutHeight = window.innerHeight || height
  const bottomOffset = Math.max(0, layoutHeight - height - offsetTop)
  const fixedBottomOffset = getFixedBottomOffset(height)

  root.style.setProperty('--app-viewport-height', `${height}px`)
  root.style.setProperty('--app-viewport-width', `${width}px`)
  root.style.setProperty('--app-visual-viewport-top', `${offsetTop}px`)
  root.style.setProperty('--app-visual-viewport-bottom', `${bottomOffset}px`)
  root.style.setProperty('--app-fixed-bottom-offset', `${fixedBottomOffset}px`)

  return {
    height,
    width,
    offsetTop,
    bottomOffset,
    fixedBottomOffset,
  }
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

const wait = (delay: number) => (
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, delay)
  })
)

const waitForAnimationFrame = () => (
  new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => resolve())
  })
)

const areMetricsStable = (previous: ViewportMetrics | null, current: ViewportMetrics | null) => {
  if (!previous || !current) return false

  return (
    Math.abs(previous.height - current.height) < 1
    && Math.abs(previous.width - current.width) < 1
    && Math.abs(previous.offsetTop - current.offsetTop) < 1
    && Math.abs(previous.fixedBottomOffset - current.fixedBottomOffset) < 1
  )
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

export async function prepareMobileViewportForFirstRender() {
  if (typeof window === 'undefined') return

  installMobileViewportFix()

  if (!isMobileViewport()) return

  const root = document.documentElement
  root.classList.add('app-viewport-stabilizing')

  try {
    let stableSamples = 0
    let previousMetrics = measureViewport()
    const start = window.performance.now()

    await waitForAnimationFrame()

    while (window.performance.now() - start < FIRST_RENDER_MAX_WAIT) {
      await wait(FIRST_RENDER_SAMPLE_INTERVAL)
      await waitForAnimationFrame()

      const currentMetrics = measureViewport()

      if (areMetricsStable(previousMetrics, currentMetrics)) {
        stableSamples += 1
      } else {
        stableSamples = 0
      }

      previousMetrics = currentMetrics

      if (stableSamples >= REQUIRED_STABLE_SAMPLES) {
        break
      }
    }
  } finally {
    scheduleStabilizationMeasures()
    root.classList.remove('app-viewport-stabilizing')
    root.classList.add('app-viewport-ready')
  }
}
