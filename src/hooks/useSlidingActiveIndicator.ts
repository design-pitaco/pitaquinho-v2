import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'

interface UseSlidingActiveIndicatorOptions {
  activeKey: string | null | undefined
  containerRef: RefObject<HTMLElement | null>
  getActiveElement: () => HTMLElement | null | undefined
  readyClassName?: string
  variablePrefix?: string
}

export function setSlidingActiveIndicator(
  containerEl: HTMLElement | null,
  activeEl: HTMLElement | null | undefined,
  readyClassName = 'sliding-chip-group--indicator-ready',
  variablePrefix = 'sliding-chip'
) {
  if (!containerEl || !activeEl) {
    containerEl?.classList.remove(readyClassName)
    return
  }

  const containerRect = containerEl.getBoundingClientRect()
  const activeRect = activeEl.getBoundingClientRect()
  const activeX = activeRect.left - containerRect.left + containerEl.scrollLeft
  const activeY = activeRect.top - containerRect.top + containerEl.scrollTop

  containerEl.style.setProperty(`--${variablePrefix}-active-x`, `${activeX}px`)
  containerEl.style.setProperty(`--${variablePrefix}-active-y`, `${activeY}px`)
  containerEl.style.setProperty(`--${variablePrefix}-active-width`, `${activeRect.width}px`)
  containerEl.style.setProperty(`--${variablePrefix}-active-height`, `${activeRect.height}px`)
  containerEl.classList.add(readyClassName)
}

export function useSlidingActiveIndicator({
  activeKey,
  containerRef,
  getActiveElement,
  readyClassName = 'sliding-chip-group--indicator-ready',
  variablePrefix = 'sliding-chip',
}: UseSlidingActiveIndicatorOptions) {
  const getActiveElementRef = useRef(getActiveElement)

  useLayoutEffect(() => {
    getActiveElementRef.current = getActiveElement
  }, [getActiveElement])

  useLayoutEffect(() => {
    setSlidingActiveIndicator(
      containerRef.current,
      getActiveElementRef.current(),
      readyClassName,
      variablePrefix
    )
  }, [activeKey, containerRef, readyClassName, variablePrefix])

  useEffect(() => {
    const containerEl = containerRef.current
    if (!containerEl) return

    const updateIndicator = () => {
      setSlidingActiveIndicator(
        containerEl,
        getActiveElementRef.current(),
        readyClassName,
        variablePrefix
      )
    }
    const activeEl = getActiveElementRef.current()
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateIndicator)
      : null

    resizeObserver?.observe(containerEl)
    if (activeEl) resizeObserver?.observe(activeEl)
    window.addEventListener('resize', updateIndicator)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateIndicator)
    }
  }, [activeKey, containerRef, readyClassName, variablePrefix])
}
