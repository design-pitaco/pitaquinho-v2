const MOBILE_MEDIA_QUERY = '(max-width: 499px)'
const MOBILE_FIRST_RELOAD_KEY = 'pitaquinho:mobile-first-reload:v1'
const MOBILE_FIRST_RELOAD_DELAY_MS = 120

const isMobileViewport = () => (
  window.matchMedia?.(MOBILE_MEDIA_QUERY).matches ?? window.innerWidth <= 499
)

const hasReloadedThisSession = (key: string) => {
  try {
    return window.sessionStorage.getItem(key) === 'done'
  } catch {
    return true
  }
}

const markReloadedThisSession = (key: string) => {
  try {
    window.sessionStorage.setItem(key, 'done')
  } catch {
    return false
  }

  return true
}

const scheduleReloadAfterFirstPaint = () => {
  const reload = () => {
    window.setTimeout(() => {
      window.location.reload()
    }, MOBILE_FIRST_RELOAD_DELAY_MS)
  }

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(reload)
  })
}

export function reloadOnceOnMobileFirstLoad() {
  if (typeof window === 'undefined' || !isMobileViewport()) return false

  const storageKey = `${MOBILE_FIRST_RELOAD_KEY}:${window.location.pathname}`

  if (hasReloadedThisSession(storageKey)) return false
  if (!markReloadedThisSession(storageKey)) return false

  scheduleReloadAfterFirstPaint()
  return true
}
