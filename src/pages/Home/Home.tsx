import { Fragment, useCallback, useRef, useState, useEffect, useLayoutEffect, useMemo } from 'react'
import { Header } from '../../components/Header'
import { TrilhoEBanner } from '../../components/TrilhoEBanner'
import { PromotionSection } from '../../components/PromotionSection'
import { OffersSection } from '../../components/OffersSection'
import { LiveSection } from '../../components/LiveSection'
import { PreMatchSection } from '../../components/PreMatchSection'
import { SportFilterBar } from '../../components/SportFilterBar'
import { CalendarSection, getCalendarDisplayedEvents } from '../../components/CalendarSection'
import { SportsMatchCarousel } from '../../components/SportsMatchCarousel'
import { CompetitionPage } from '../../components/CompetitionPage'
import { LiveEventPage } from '../LiveEventPage'
import type { LiveEventOpenPayload } from '../LiveEventPage'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'
import type { SportRailVariant } from '../../components/SportRail/SportRail'
import './Home.css'

const HEADER_COMPACT_SCROLL_TOP = 28
const HEADER_EXPAND_SCROLL_TOP = 4
const HEADER_MORPH_SCROLL_START = 64
const HEADER_EVENT_RAIL_MORPH_SCROLL_START = 0
const HEADER_MORPH_SCROLL_END = 190
const HEADER_COMPETITION_MORPH_SCROLL_END = 112
const HEADER_INVERTED_MORPH_SCROLL_START = HEADER_EVENT_RAIL_MORPH_SCROLL_START
const HEADER_INVERTED_MORPH_SCROLL_END = HEADER_MORPH_SCROLL_END
const SPORT_RAIL_TEXT_COLLAPSE_SCROLL_DISTANCE = 84
const HEADER_SNAP_IDLE_MS = 160
const HEADER_SNAP_SETTLE_MS = 420
const HEADER_CONTENT_GAP = 20
const EVENT_RAIL_HEIGHT = 112
const EVENT_RAIL_PADDING_BOTTOM = 20
const EVENT_RAIL_COLLAPSE_TRANSLATE_Y = -28
const EVENT_RAIL_VISUAL_COLLAPSE_SCROLL_END = 72
const EVENT_RAIL_DISABLE_INTERACTION_PROGRESS = 0.9
const HIGHLIGHT_HEADER_EXPANDED_BG_HEIGHT = 266
const HIGHLIGHT_HEADER_COMPACT_BG_HEIGHT = 222
const HEADER_TOP_EXPANDED_PADDING_Y = 20
const HEADER_TOP_COMPACT_PADDING_Y = 12
const SPORT_HEADER_EXPANDED_BG_HEIGHT = 362
const SPORT_HEADER_COMPACT_BG_HEIGHT = 222
const SPORT_RAIL_EXPANDED_PADDING_BOTTOM = 20
const SPORT_RAIL_COMPACT_PADDING_BOTTOM = 10
const SPORT_RAIL_EXPANDED_ITEM_GAP = 4
const SPORT_RAIL_COMPACT_ITEM_GAP = 0
const SPORT_RAIL_EXPANDED_LABEL_MAX_HEIGHT = 14
const SPORT_RAIL_COMPACT_LABEL_MAX_HEIGHT = 0
const SPORT_RAIL_EXPANDED_LABEL_TRANSLATE_Y = 0
const SPORT_RAIL_COMPACT_LABEL_TRANSLATE_Y = -4
const SPORT_FILTER_EXPANDED_PADDING_BOTTOM = 20
const SPORT_FILTER_COMPACT_PADDING_BOTTOM = 24
const SPORTS_CAROUSEL_EXPANDED_TEAMS_GAP = 4
const SPORTS_CAROUSEL_COMPACT_TEAMS_GAP = 3
const SPORTS_CAROUSEL_EXPANDED_TEAMS_MIN_HEIGHT = 40
const SPORTS_CAROUSEL_COMPACT_TEAMS_MIN_HEIGHT = 34
const SPORTS_CAROUSEL_EXPANDED_TEAM_ROW_HEIGHT = 13
const SPORTS_CAROUSEL_COMPACT_TEAM_ROW_HEIGHT = 12
const MARKET_STICKY_GAP = 12
const MARKET_STICKY_ROW_HEIGHT = 24
const MARKET_STICKY_BG_GAP = 16
const HEADER_BG_TOP_OFFSET = 72

interface HomeProps {
  railVariant?: SportRailVariant
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothStep = (value: number) => value * value * (3 - 2 * value)
const roundCssNumber = (value: number) => Math.round(value * 1000) / 1000
const getScrollProgress = (scrollTop: number, start: number, end: number) =>
  clamp((scrollTop - start) / (end - start), 0, 1)
const interpolate = (from: number, to: number, progress: number) => from + (to - from) * progress
const marketStickySelector = [
  '.live-section__chips--sticky:not([data-market-sticky-visible="false"])',
  '.prematch-section__chips--sticky:not([data-market-sticky-visible="false"])',
].join(', ')

export function Home({ railVariant = 'default' }: HomeProps = {}) {
  const homeRef = useRef<HTMLDivElement>(null)
  const usesCompetitionRail = railVariant === 'competitions'
  const usesInvertedHierarchy = railVariant === 'inverted-hierarchy'
  const usesShortcutRail = usesCompetitionRail || usesInvertedHierarchy
  const highlightHeaderExpandedBgHeight = usesShortcutRail
    ? 222
    : HIGHLIGHT_HEADER_EXPANDED_BG_HEIGHT
  const highlightHeaderCompactBgHeight = usesShortcutRail
    ? 182
    : HIGHLIGHT_HEADER_COMPACT_BG_HEIGHT
  const sportHeaderExpandedBgHeight = usesShortcutRail
    ? 222
    : SPORT_HEADER_EXPANDED_BG_HEIGHT
  const sportHeaderCompactBgHeight = usesShortcutRail
    ? 182
    : SPORT_HEADER_COMPACT_BG_HEIGHT
  const [isVariant2, setIsVariant2] = useState(false)
  const [isVariant3, setIsVariant3] = useState(false)
  const [activeSport, setActiveSport] = useState<string | null>(null)
  const [isSportHeaderCompact, setIsSportHeaderCompact] = useState(false)
  const [isSportsMatchCarouselCollapsed, setIsSportsMatchCarouselCollapsed] = useState(false)
  const [contentResetKey, setContentResetKey] = useState(0)
  const [selectedCompetition, setSelectedCompetition] = useState<{ id: string; name: string } | null>(null)
  const [selectedLiveMatch, setSelectedLiveMatch] = useState<LiveEventOpenPayload | null>(null)
  const sportsCarouselEvents = useMemo(
    () => activeSport
      ? getCalendarDisplayedEvents({
          sportFilter: activeSport,
          competitionId: selectedCompetition?.id ?? null,
        })
      : [],
    [activeSport, selectedCompetition?.id]
  )
  const sportsCarouselResetKey = `${activeSport ?? 'destaques'}:${selectedCompetition?.id ?? 'todas'}`
  const isCompetitionMode = !!selectedCompetition
  const hasSportsCarouselEvents = !!activeSport && sportsCarouselEvents.length > 0
  const usesContentEventRail = hasSportsCarouselEvents
  const usesHeaderEventRail = hasSportsCarouselEvents && !usesContentEventRail

  const handleLiveMatchClick = (payload: LiveEventOpenPayload) => {
    setSelectedLiveMatch(payload)
  }

  const resetEventRailCollapse = useCallback(() => {
    const homeEl = homeRef.current
    if (!homeEl) return

    homeEl.style.setProperty('--sports-carousel-collapse-max-height', `${EVENT_RAIL_HEIGHT}px`)
    homeEl.style.setProperty('--sports-carousel-collapse-padding-bottom', `${EVENT_RAIL_PADDING_BOTTOM}px`)
    homeEl.style.setProperty('--sports-carousel-collapse-opacity', '1')
    homeEl.style.setProperty('--sports-carousel-collapse-translate-y', '0px')
    homeEl.style.removeProperty('--highlight-header-bg-height')
    homeEl.style.removeProperty('--header-top-padding-y')
    homeEl.style.removeProperty('--sport-header-bg-height')
    homeEl.style.removeProperty('--sport-rail-padding-bottom')
    homeEl.style.removeProperty('--sport-rail-item-gap')
    homeEl.style.removeProperty('--sport-rail-label-max-height')
    homeEl.style.removeProperty('--sport-rail-label-opacity')
    homeEl.style.removeProperty('--sport-rail-label-translate-y')
    homeEl.style.removeProperty('--sport-chip-rail-max-height')
    homeEl.style.removeProperty('--sport-chip-rail-padding-bottom')
    homeEl.style.removeProperty('--sport-chip-rail-opacity')
    homeEl.style.removeProperty('--sport-chip-rail-pointer-events')
    homeEl.style.removeProperty('--sport-chip-rail-translate-y')
    homeEl.style.removeProperty('--home-header-content-padding-top')
    homeEl.removeAttribute('data-header-morph-complete')
    homeEl.style.removeProperty('--sport-filter-padding-bottom')
    homeEl.style.removeProperty('--sports-carousel-teams-gap')
    homeEl.style.removeProperty('--sports-carousel-teams-min-height')
    homeEl.style.removeProperty('--sports-carousel-team-row-height')
  }, [])

  const scrollToTop = () => {
    setIsSportHeaderCompact(false)
    setIsSportsMatchCarouselCollapsed(false)
    resetEventRailCollapse()

    window.requestAnimationFrame(() => {
      homeRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash
      setIsVariant2(hash === '#v2' || hash === '#/2')
      setIsVariant3(hash === '#v3' || hash === '#/3')
    }

    checkHash()
    window.addEventListener('hashchange', checkHash)

    return () => window.removeEventListener('hashchange', checkHash)
  }, [])

  useLayoutEffect(() => {
    const homeEl = homeRef.current
    if (!homeEl) return

    const getScrollTop = () =>
      Math.max(
        homeEl.scrollTop,
        window.scrollY,
        document.documentElement.scrollTop,
        document.body.scrollTop
      )

    let frame: number | null = null
    let headerSnapTimer: number | null = null
    let headerSnapSettleTimer: number | null = null
    let isHeaderSnapScrolling = false
    const headerEl = homeEl.querySelector<HTMLElement>('.header')

    const clearHeaderSnapTimer = () => {
      if (headerSnapTimer === null) return
      window.clearTimeout(headerSnapTimer)
      headerSnapTimer = null
    }

    const clearHeaderSnapSettleTimer = () => {
      if (headerSnapSettleTimer === null) return
      window.clearTimeout(headerSnapSettleTimer)
      headerSnapSettleTimer = null
    }

    const hasEventRailHeader = () => !!activeSport && sportsCarouselEvents.length > 0 && !usesContentEventRail
    const canSnapHeaderMorph = () => {
      if (usesShortcutRail && !activeSport) return false
      if (usesContentEventRail) return true
      if (usesInvertedHierarchy && activeSport) return true
      return !activeSport || hasEventRailHeader()
    }
    const getHeaderMorphScrollStart = () => {
      if (usesContentEventRail) return HEADER_EVENT_RAIL_MORPH_SCROLL_START
      if (usesInvertedHierarchy && activeSport) return HEADER_INVERTED_MORPH_SCROLL_START
      if (hasEventRailHeader()) return HEADER_EVENT_RAIL_MORPH_SCROLL_START
      return HEADER_MORPH_SCROLL_START
    }
    const getHeaderMorphScrollEnd = () => {
      if (isCompetitionMode) return HEADER_COMPETITION_MORPH_SCROLL_END
      if (usesInvertedHierarchy && activeSport) return HEADER_INVERTED_MORPH_SCROLL_END
      return HEADER_MORPH_SCROLL_END
    }

    const scrollToHeaderMorphTarget = (targetScrollTop: number) => {
      homeEl.scrollTo({ top: targetScrollTop, left: 0, behavior: 'smooth' })
      window.scrollTo({ top: targetScrollTop, left: 0, behavior: 'smooth' })
    }

    const scheduleHeaderMorphSnap = () => {
      clearHeaderSnapTimer()

      if (!canSnapHeaderMorph()) return

      headerSnapTimer = window.setTimeout(() => {
        headerSnapTimer = null

        if (!canSnapHeaderMorph()) return

        const scrollTop = getScrollTop()
        const morphProgress = getScrollProgress(
          scrollTop,
          getHeaderMorphScrollStart(),
          getHeaderMorphScrollEnd()
        )

        if (morphProgress <= 0 || morphProgress >= 1) return

        const targetScrollTop = getHeaderMorphScrollEnd()

        if (Math.abs(scrollTop - targetScrollTop) < 1) return

        isHeaderSnapScrolling = true
        clearHeaderSnapSettleTimer()
        scrollToHeaderMorphTarget(targetScrollTop)

        headerSnapSettleTimer = window.setTimeout(() => {
          headerSnapSettleTimer = null
          isHeaderSnapScrolling = false
          scheduleUpdate()
          scheduleHeaderMorphSnap()
        }, HEADER_SNAP_SETTLE_MS)
      }, HEADER_SNAP_IDLE_MS)
    }

    const syncMarketStickyTop = () => {
      if (!headerEl) return
      const stickyAnchorEl =
        headerEl.querySelector<HTMLElement>('.header__highlight-chip--active') ??
        headerEl.querySelector<HTMLElement>('.header__highlight-chip') ??
        headerEl.querySelector<HTMLElement>('.sport-filter-bar__chip--active') ??
        headerEl.querySelector<HTMLElement>('.sport-filter-bar__chip') ??
        headerEl.querySelector<HTMLElement>('.sport-rail__item--active') ??
        headerEl.querySelector<HTMLElement>('.sport-rail__item') ??
        headerEl
      const desiredStickyTop = stickyAnchorEl.getBoundingClientRect().bottom + MARKET_STICKY_GAP
      const homeStyle = window.getComputedStyle(homeEl)
      const homePaddingTop = parseFloat(homeStyle.paddingTop) || 0
      const usesHomeScroll = (
        homeStyle.position === 'fixed' &&
        (homeStyle.overflowY === 'auto' || homeStyle.overflowY === 'scroll')
      )
      const stickyTop = usesHomeScroll
        ? isCompetitionMode
          ? MARKET_STICKY_GAP - HEADER_CONTENT_GAP
          : desiredStickyTop -
            homeEl.getBoundingClientRect().top -
            homePaddingTop
        : desiredStickyTop

      homeEl.style.setProperty(
        '--home-market-sticky-top',
        `${roundCssNumber(stickyTop)}px`
      )
      homeEl.style.setProperty(
        '--home-market-sticky-bg-height',
        `${roundCssNumber(desiredStickyTop + MARKET_STICKY_ROW_HEIGHT + MARKET_STICKY_BG_GAP + HEADER_BG_TOP_OFFSET)}px`
      )
    }

    const getVisibleMarketStickyEl = (stuckOnly = false) => {
      const stickyEls = Array.from(homeEl.querySelectorAll<HTMLElement>(marketStickySelector))
      const visibleStickyEls = stickyEls
        .map((stickyEl) => ({
          stickyEl,
          rect: stickyEl.getBoundingClientRect(),
          style: window.getComputedStyle(stickyEl),
        }))
        .filter(({ rect, stickyEl, style }) => (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          (!stuckOnly || stickyEl.getAttribute('data-market-sticky-stuck') === 'true') &&
          rect.width > 0 &&
          rect.height > 1
        ))
        .sort((first, second) => first.rect.top - second.rect.top)

      return visibleStickyEls[0] ?? null
    }

    const getFirstVisibleContentEl = () => {
      const contentEls = Array.from(homeEl.children)
        .filter((child): child is HTMLElement => child instanceof HTMLElement)
        .filter((child) => !child.classList.contains('header'))
        .map((contentEl) => ({
          contentEl,
          rect: contentEl.getBoundingClientRect(),
          style: window.getComputedStyle(contentEl),
        }))
        .filter(({ rect, style }) => (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          rect.width > 0 &&
          rect.height > 1
        ))

      return contentEls[0] ?? null
    }

    const getSportsCarouselMetrics = (naturalMaxHeight: number, naturalPaddingBottom: number) => {
      const carouselEl = headerEl?.querySelector<HTMLElement>('.sports-match-carousel')
      const clipTarget = usesInvertedHierarchy
        ? getVisibleMarketStickyEl(true)
        : isCompetitionMode
          ? getVisibleMarketStickyEl()
          : getFirstVisibleContentEl()

      if (!carouselEl || !clipTarget) {
        return {
          maxHeight: naturalMaxHeight,
          paddingBottom: naturalPaddingBottom,
          isClipped: false,
        }
      }

      const carouselRect = carouselEl.getBoundingClientRect()
      const clipHeight = clamp(
        clipTarget.rect.top - carouselRect.top,
        0,
        naturalMaxHeight
      )
      const trackRect = carouselEl
        .querySelector<HTMLElement>('.sports-match-carousel__track')
        ?.getBoundingClientRect()
      const clippedPaddingBottom = trackRect
        ? clamp(clipHeight - trackRect.height, 0, naturalPaddingBottom)
        : Math.min(clipHeight, naturalPaddingBottom)

      return {
        maxHeight: clipHeight,
        paddingBottom: clippedPaddingBottom,
        isClipped: clipHeight < naturalMaxHeight,
      }
    }

    const getCompetitionChipHeaderBgHeight = () => {
      if (!headerEl) return sportHeaderCompactBgHeight

      if (usesShortcutRail) {
        const sportHeaderAnchorEl =
          headerEl.querySelector<HTMLElement>('.sport-rail') ??
          headerEl

        return Math.max(
          sportHeaderCompactBgHeight,
          sportHeaderAnchorEl.getBoundingClientRect().bottom + HEADER_BG_TOP_OFFSET
        )
      }

      const competitionChipEl =
        headerEl.querySelector<HTMLElement>('.sport-filter-bar__chip--active') ??
        headerEl.querySelector<HTMLElement>('.sport-filter-bar__chip') ??
        headerEl.querySelector<HTMLElement>('.sport-filter-bar') ??
        headerEl

      return Math.max(
        sportHeaderCompactBgHeight,
        competitionChipEl.getBoundingClientRect().bottom + HEADER_BG_TOP_OFFSET
      )
    }

    const syncHomeHeaderContentPaddingTop = ({
      eventRailMaxHeight = 0,
      eventRailPaddingBottom = 0,
      hasEventRail,
    }: {
      eventRailMaxHeight?: number
      eventRailPaddingBottom?: number
      hasEventRail: boolean
    }) => {
      if (!headerEl) return

      const homeTop = homeEl.getBoundingClientRect().top

      if (hasEventRail) {
        const carouselEl = headerEl.querySelector<HTMLElement>('.sports-match-carousel')
        if (carouselEl) {
          const trackHeight = carouselEl
            .querySelector<HTMLElement>('.sports-match-carousel__track')
            ?.getBoundingClientRect()
            .height ?? eventRailMaxHeight
          const visibleEventRailHeight = Math.min(trackHeight, eventRailMaxHeight)
          const contentOffset = carouselEl.getBoundingClientRect().top - homeTop +
            visibleEventRailHeight +
            eventRailPaddingBottom

          homeEl.style.setProperty(
            '--home-header-content-padding-top',
            `${roundCssNumber(Math.max(contentOffset, 0))}px`
          )
          return
        }
      }

      const headerContentEndEl =
        headerEl.querySelector<HTMLElement>('.sport-filter-bar__chips') ??
        headerEl.querySelector<HTMLElement>('.header__highlight-chip') ??
        headerEl.querySelector<HTMLElement>('.sport-rail__list') ??
        headerEl.querySelector<HTMLElement>('.sport-filter-bar') ??
        headerEl.querySelector<HTMLElement>('.header__highlight-chips') ??
        headerEl.querySelector<HTMLElement>('.sport-rail') ??
        headerEl.querySelector<HTMLElement>('.header__top')

      if (!headerContentEndEl) return

      const contentOffset = headerContentEndEl.getBoundingClientRect().bottom - homeTop + HEADER_CONTENT_GAP
      homeEl.style.setProperty(
        '--home-header-content-padding-top',
        `${roundCssNumber(Math.max(contentOffset, 0))}px`
      )
    }

    const syncHeaderMorph = (scrollTop: number) => {
      const hasHeaderEventRail = hasEventRailHeader()
      const morphScrollStart = hasHeaderEventRail
        ? HEADER_EVENT_RAIL_MORPH_SCROLL_START
        : usesContentEventRail
          ? HEADER_EVENT_RAIL_MORPH_SCROLL_START
        : usesInvertedHierarchy && activeSport
          ? HEADER_INVERTED_MORPH_SCROLL_START
          : HEADER_MORPH_SCROLL_START
      const morphScrollEnd = getHeaderMorphScrollEnd()
      const requestedMorphProgress = smoothStep(
        getScrollProgress(scrollTop, morphScrollStart, morphScrollEnd)
      )
      const morphProgress = requestedMorphProgress
      homeEl.toggleAttribute('data-header-morph-complete', morphProgress >= 1)
      homeEl.dispatchEvent(new CustomEvent('home-header-morph-change'))
      const sportRailTextCollapseStart =
        usesCompetitionRail && !activeSport
          ? HEADER_EVENT_RAIL_MORPH_SCROLL_START
          : morphScrollStart
      const sportRailTextProgress = usesInvertedHierarchy
        ? 0
        : smoothStep(
            getScrollProgress(
              scrollTop,
              sportRailTextCollapseStart,
              Math.min(sportRailTextCollapseStart + SPORT_RAIL_TEXT_COLLAPSE_SCROLL_DISTANCE, morphScrollEnd)
            )
          )
      const sportChipRailProgress = usesInvertedHierarchy
        ? smoothStep(
            getScrollProgress(
              scrollTop,
              morphScrollStart,
              morphScrollStart + SPORT_RAIL_TEXT_COLLAPSE_SCROLL_DISTANCE
            )
          )
        : 0
      const sportRailPaddingBottom = usesInvertedHierarchy
        ? SPORT_RAIL_EXPANDED_PADDING_BOTTOM
        : interpolate(
            SPORT_RAIL_EXPANDED_PADDING_BOTTOM,
            SPORT_RAIL_COMPACT_PADDING_BOTTOM,
            morphProgress
          )
      const sportFilterPaddingBottom = interpolate(
        SPORT_FILTER_EXPANDED_PADDING_BOTTOM,
        SPORT_FILTER_COMPACT_PADDING_BOTTOM,
        morphProgress
      )
      const headerTopPaddingY = interpolate(
        HEADER_TOP_EXPANDED_PADDING_Y,
        HEADER_TOP_COMPACT_PADDING_Y,
        morphProgress
      )
      const highlightHeaderBgHeight = usesInvertedHierarchy
        ? getCompetitionChipHeaderBgHeight()
        : interpolate(
            highlightHeaderExpandedBgHeight,
            highlightHeaderCompactBgHeight,
            morphProgress
          )
      const sportHeaderBgHeight = hasHeaderEventRail || usesContentEventRail || usesInvertedHierarchy
        ? getCompetitionChipHeaderBgHeight()
        : interpolate(sportHeaderExpandedBgHeight, sportHeaderCompactBgHeight, morphProgress)
      const eventRailVisualStart = usesInvertedHierarchy
        ? morphScrollStart
        : HEADER_EVENT_RAIL_MORPH_SCROLL_START
      const eventRailVisualProgress = hasHeaderEventRail
        ? smoothStep(
            getScrollProgress(
              scrollTop,
              eventRailVisualStart,
              eventRailVisualStart + EVENT_RAIL_VISUAL_COLLAPSE_SCROLL_END
            )
          )
        : morphProgress

      homeEl.style.setProperty(
        '--highlight-header-bg-height',
        `${roundCssNumber(highlightHeaderBgHeight)}px`
      )
      homeEl.style.setProperty(
        '--header-top-padding-y',
        `${roundCssNumber(headerTopPaddingY)}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-padding-bottom',
        `${roundCssNumber(sportRailPaddingBottom)}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-item-gap',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_ITEM_GAP, SPORT_RAIL_COMPACT_ITEM_GAP, sportRailTextProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-label-max-height',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_LABEL_MAX_HEIGHT, SPORT_RAIL_COMPACT_LABEL_MAX_HEIGHT, sportRailTextProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-label-opacity',
        `${roundCssNumber(1 - sportRailTextProgress)}`
      )
      homeEl.style.setProperty(
        '--sport-rail-label-translate-y',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_LABEL_TRANSLATE_Y, SPORT_RAIL_COMPACT_LABEL_TRANSLATE_Y, sportRailTextProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-chip-rail-max-height',
        `${roundCssNumber(interpolate(40, 0, sportChipRailProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-chip-rail-padding-bottom',
        `${roundCssNumber(interpolate(12, 0, sportChipRailProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-chip-rail-opacity',
        `${roundCssNumber(1 - sportChipRailProgress)}`
      )
      homeEl.style.setProperty(
        '--sport-chip-rail-pointer-events',
        sportChipRailProgress >= 0.98 ? 'none' : 'auto'
      )
      homeEl.style.setProperty(
        '--sport-chip-rail-translate-y',
        `${roundCssNumber(interpolate(0, -6, sportChipRailProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-filter-padding-bottom',
        `${roundCssNumber(sportFilterPaddingBottom)}px`
      )
      homeEl.style.setProperty(
        '--sport-header-bg-height',
        `${roundCssNumber(sportHeaderBgHeight)}px`
      )
      homeEl.style.setProperty(
        '--sports-carousel-teams-gap',
        `${roundCssNumber(interpolate(SPORTS_CAROUSEL_EXPANDED_TEAMS_GAP, SPORTS_CAROUSEL_COMPACT_TEAMS_GAP, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sports-carousel-teams-min-height',
        `${roundCssNumber(interpolate(SPORTS_CAROUSEL_EXPANDED_TEAMS_MIN_HEIGHT, SPORTS_CAROUSEL_COMPACT_TEAMS_MIN_HEIGHT, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sports-carousel-team-row-height',
        `${roundCssNumber(interpolate(SPORTS_CAROUSEL_EXPANDED_TEAM_ROW_HEIGHT, SPORTS_CAROUSEL_COMPACT_TEAM_ROW_HEIGHT, morphProgress))}px`
      )

      syncMarketStickyTop()

      if (hasHeaderEventRail) {
        const naturalMaxHeight = EVENT_RAIL_HEIGHT * (1 - morphProgress)
        const naturalPaddingBottom = EVENT_RAIL_PADDING_BOTTOM * (1 - morphProgress)
        syncHomeHeaderContentPaddingTop({
          eventRailMaxHeight: naturalMaxHeight,
          eventRailPaddingBottom: naturalPaddingBottom,
          hasEventRail: hasHeaderEventRail,
        })
        const sportsCarouselMetrics = getSportsCarouselMetrics(naturalMaxHeight, naturalPaddingBottom)

        homeEl.style.setProperty(
          '--sports-carousel-collapse-max-height',
          `${roundCssNumber(sportsCarouselMetrics.maxHeight)}px`
        )
        homeEl.style.setProperty(
          '--sports-carousel-collapse-padding-bottom',
          `${roundCssNumber(sportsCarouselMetrics.paddingBottom)}px`
        )
        homeEl.style.setProperty(
          '--sports-carousel-collapse-opacity',
          `${roundCssNumber(1 - eventRailVisualProgress)}`
        )
        homeEl.style.setProperty(
          '--sports-carousel-collapse-translate-y',
          `${roundCssNumber(interpolate(0, EVENT_RAIL_COLLAPSE_TRANSLATE_Y, eventRailVisualProgress))}px`
        )
        homeEl.toggleAttribute('data-market-sticky-rail-clipped', sportsCarouselMetrics.isClipped)
      } else {
        homeEl.style.setProperty('--sports-carousel-collapse-max-height', `${EVENT_RAIL_HEIGHT}px`)
        homeEl.style.setProperty('--sports-carousel-collapse-padding-bottom', `${EVENT_RAIL_PADDING_BOTTOM}px`)
        homeEl.style.setProperty('--sports-carousel-collapse-opacity', '1')
        homeEl.style.setProperty('--sports-carousel-collapse-translate-y', '0px')
        homeEl.removeAttribute('data-market-sticky-rail-clipped')
        syncHomeHeaderContentPaddingTop({ hasEventRail: hasHeaderEventRail })
      }

      setIsSportsMatchCarouselCollapsed((isCollapsed) => {
        const shouldCollapse = hasHeaderEventRail && morphProgress >= EVENT_RAIL_DISABLE_INTERACTION_PROGRESS
        return isCollapsed === shouldCollapse ? isCollapsed : shouldCollapse
      })
    }

    const updateCompactState = () => {
      frame = null
      const scrollTop = getScrollTop()

      syncHeaderMorph(scrollTop)

      setIsSportHeaderCompact((isCompact) => {
        if (!isCompact && scrollTop > HEADER_COMPACT_SCROLL_TOP) return true
        if (isCompact && scrollTop < HEADER_EXPAND_SCROLL_TOP) return false
        return isCompact
      })
    }

    const scheduleUpdate = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(updateCompactState)
    }

    const handleScroll = () => {
      scheduleUpdate()
      if (!isHeaderSnapScrolling) scheduleHeaderMorphSnap()
    }

    scheduleUpdate()
    homeEl.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', scheduleUpdate, { passive: true })

    const resizeObserver = headerEl && typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(scheduleUpdate)
      : null

    if (headerEl) resizeObserver?.observe(headerEl)

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      clearHeaderSnapTimer()
      clearHeaderSnapSettleTimer()
      homeEl.removeAttribute('data-market-sticky-rail-clipped')
      homeEl.removeAttribute('data-header-morph-complete')
      homeEl.removeEventListener('scroll', handleScroll)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', scheduleUpdate)
      resizeObserver?.disconnect()
    }
  }, [
    activeSport,
    highlightHeaderCompactBgHeight,
    highlightHeaderExpandedBgHeight,
    isCompetitionMode,
    resetEventRailCollapse,
    sportHeaderCompactBgHeight,
    sportHeaderExpandedBgHeight,
    sportsCarouselEvents.length,
    usesCompetitionRail,
    usesContentEventRail,
    usesInvertedHierarchy,
    usesShortcutRail,
  ])

  const handleSportChange = (sportId: string) => {
    setContentResetKey((current) => current + 1)
    setSelectedCompetition(null)

    if (sportId === 'destaques') {
      setActiveSport(null)
    } else {
      setActiveSport(sportId)
    }

    scrollToTop()
  }

  const handleSelectCompetition = (id: string, name: string) => {
    setSelectedCompetition({ id, name })
    setContentResetKey((c) => c + 1)
    scrollToTop()
  }

  const handleClearCompetition = () => {
    setSelectedCompetition(null)
    setContentResetKey((c) => c + 1)
    scrollToTop()
  }

  const handleOpenCompetition = (target: CompetitionLinkTarget) => {
    setActiveSport(target.sport)
    setSelectedCompetition({ id: target.id, name: target.name })
    setContentResetKey((c) => c + 1)
    scrollToTop()
  }

  const homeClasses = [
    'home',
    'home--header-morph-active',
    usesShortcutRail ? 'home--novo-trilho' : '',
    usesInvertedHierarchy ? 'home--novo-trilho-02' : '',
    isVariant3 ? '' : 'home--no-dividers',
    activeSport ? 'home--sport-active' : '',
    usesHeaderEventRail ? 'home--event-rail-active' : '',
    usesContentEventRail ? 'home--content-event-rail-active' : '',
    isCompetitionMode ? 'home--competition-active' : '',
    isSportHeaderCompact ? 'home--header-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={homeClasses} ref={homeRef}>
      <Header
        railVariant={railVariant}
        activeSport={activeSport}
        selectedCompetitionId={selectedCompetition?.id ?? null}
        onSportChange={handleSportChange}
        onOpenCompetition={handleOpenCompetition}
      >
        {activeSport && (
          <>
            {!usesShortcutRail && (
              <SportFilterBar
                sport={activeSport}
                selectedCompetitionId={selectedCompetition?.id ?? null}
                onSelectCompetition={handleSelectCompetition}
                onClearCompetition={handleClearCompetition}
              />
            )}
            {!usesContentEventRail && (
              <SportsMatchCarousel
                events={sportsCarouselEvents}
                resetKey={sportsCarouselResetKey}
                competitionMode={isCompetitionMode}
                isCollapsed={isSportsMatchCarouselCollapsed}
                onLiveMatchClick={handleLiveMatchClick}
              />
            )}
          </>
        )}
      </Header>
      {usesContentEventRail && (
        <div className="home__content-event-rail">
          <SportsMatchCarousel
            events={sportsCarouselEvents}
            resetKey={sportsCarouselResetKey}
            competitionMode={isCompetitionMode}
            isCollapsed={false}
            onLiveMatchClick={handleLiveMatchClick}
          />
        </div>
      )}
      <TrilhoEBanner hideBanner={!!activeSport} />
      {activeSport ? (
        <Fragment key={`sport-${activeSport}-${contentResetKey}`}>
          {selectedCompetition ? (
            <CompetitionPage
              sport={activeSport}
              competitionId={selectedCompetition.id}
              onLiveMatchClick={handleLiveMatchClick}
            />
          ) : (
            <>
              <OffersSection sportFilter={activeSport} />
              <CalendarSection
                sportFilter={activeSport}
                onLiveMatchClick={handleLiveMatchClick}
                onOpenCompetition={handleOpenCompetition}
              />
            </>
          )}
        </Fragment>
      ) : (
        <Fragment key={`destaques-${contentResetKey}`}>
          {/* <ContentTabs /> */}
          <PromotionSection />
          <LiveSection
            onMatchClick={handleLiveMatchClick}
            onOpenCompetition={handleOpenCompetition}
          />
          <OffersSection />
          <PreMatchSection
            onOpenCompetition={handleOpenCompetition}
            onMatchClick={handleLiveMatchClick}
          />
          {/* <TreasureSection /> */}
          {/* <WinningNowSection /> */}
        </Fragment>
      )}
      {selectedLiveMatch && (
        <LiveEventPage
          isOpen={true}
          onClose={() => setSelectedLiveMatch(null)}
          matches={selectedLiveMatch.matches}
          railEvents={selectedLiveMatch.railEvents}
          selectedIndex={selectedLiveMatch.selectedIndex}
          currentTimes={selectedLiveMatch.currentTimes}
          leagueName={selectedLiveMatch.leagueName}
          leagueFlag={selectedLiveMatch.leagueFlag}
          sport={selectedLiveMatch.sport}
        />
      )}
    </div>
  )
}
