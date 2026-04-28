const MOBILE_MEDIA_QUERY = '(max-width: 499px)'
const MOBILE_AFTER_LOAD_RELOAD_KEY = 'pitaquinho:mobile-after-load-reload:v2'
const MOBILE_AFTER_LOAD_RELOAD_DELAY_MS = 700

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

const scheduleReloadAfterLoad = () => {
  const reload = () => {
    window.setTimeout(() => {
      window.location.reload()
    }, MOBILE_AFTER_LOAD_RELOAD_DELAY_MS)
  }

  if (document.readyState === 'complete') {
    reload()
    return
  }

  window.addEventListener('load', reload, { once: true })
}

export function reloadOnceAfterMobileLoad() {
  if (typeof window === 'undefined' || !isMobileViewport()) return

  const storageKey = `${MOBILE_AFTER_LOAD_RELOAD_KEY}:${window.location.pathname}`

  if (hasReloadedThisSession(storageKey)) return
  if (!markReloadedThisSession(storageKey)) return

  scheduleReloadAfterLoad()
}
