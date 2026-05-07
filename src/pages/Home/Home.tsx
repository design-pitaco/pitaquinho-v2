import { Fragment, useCallback, useRef, useState, useEffect, useMemo } from 'react'
import { Header } from '../../components/Header'
import { TrilhoEBanner } from '../../components/TrilhoEBanner'
import { PromotionSection } from '../../components/PromotionSection'
import { OffersSection } from '../../components/OffersSection'
import { LiveSection } from '../../components/LiveSection'
import { EscadinhaSection } from '../../components/EscadinhaSection'
import { PreMatchSection } from '../../components/PreMatchSection'
import { SportFilterBar } from '../../components/SportFilterBar'
import { CalendarSection, getCalendarDisplayedEvents } from '../../components/CalendarSection'
import { SportsMatchCarousel } from '../../components/SportsMatchCarousel'
import { CompetitionPage } from '../../components/CompetitionPage'
import { LiveEventPage } from '../LiveEventPage'
import type { LiveEventOpenPayload } from '../LiveEventPage'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'
import './Home.css'

const HEADER_COMPACT_SCROLL_TOP = 28
const HEADER_EXPAND_SCROLL_TOP = 4
const HEADER_MORPH_SCROLL_START = 64
const HEADER_MORPH_SCROLL_END = 190
const EVENT_RAIL_HEIGHT = 112
const EVENT_RAIL_PADDING_BOTTOM = 20
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

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const smoothStep = (value: number) => value * value * (3 - 2 * value)
const roundCssNumber = (value: number) => Math.round(value * 1000) / 1000
const getScrollProgress = (scrollTop: number, start: number, end: number) =>
  clamp((scrollTop - start) / (end - start), 0, 1)
const interpolate = (from: number, to: number, progress: number) => from + (to - from) * progress

export function Home() {
  const homeRef = useRef<HTMLDivElement>(null)
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

  const handleLiveMatchClick = (payload: LiveEventOpenPayload) => {
    setSelectedLiveMatch(payload)
  }

  const resetEventRailCollapse = useCallback(() => {
    const homeEl = homeRef.current
    if (!homeEl) return

    homeEl.style.setProperty('--sports-carousel-collapse-max-height', `${EVENT_RAIL_HEIGHT}px`)
    homeEl.style.setProperty('--sports-carousel-collapse-padding-bottom', `${EVENT_RAIL_PADDING_BOTTOM}px`)
    homeEl.style.setProperty('--sports-carousel-collapse-opacity', '1')
    homeEl.style.removeProperty('--highlight-header-bg-height')
    homeEl.style.removeProperty('--header-top-padding-y')
    homeEl.style.removeProperty('--sport-header-bg-height')
    homeEl.style.removeProperty('--sport-rail-padding-bottom')
    homeEl.style.removeProperty('--sport-rail-item-gap')
    homeEl.style.removeProperty('--sport-rail-label-max-height')
    homeEl.style.removeProperty('--sport-rail-label-opacity')
    homeEl.style.removeProperty('--sport-rail-label-translate-y')
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

  useEffect(() => {
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

    const syncHeaderMorph = (scrollTop: number) => {
      const requestedMorphProgress = smoothStep(
        getScrollProgress(scrollTop, HEADER_MORPH_SCROLL_START, HEADER_MORPH_SCROLL_END)
      )
      const hasEventRail = !!activeSport
      const morphProgress = requestedMorphProgress

      if (hasEventRail) {
        homeEl.style.setProperty(
          '--sports-carousel-collapse-max-height',
          `${roundCssNumber(EVENT_RAIL_HEIGHT * (1 - morphProgress))}px`
        )
        homeEl.style.setProperty(
          '--sports-carousel-collapse-padding-bottom',
          `${roundCssNumber(EVENT_RAIL_PADDING_BOTTOM * (1 - morphProgress))}px`
        )
        homeEl.style.setProperty(
          '--sports-carousel-collapse-opacity',
          `${roundCssNumber(1 - morphProgress)}`
        )
      } else {
        homeEl.style.setProperty('--sports-carousel-collapse-max-height', `${EVENT_RAIL_HEIGHT}px`)
        homeEl.style.setProperty('--sports-carousel-collapse-padding-bottom', `${EVENT_RAIL_PADDING_BOTTOM}px`)
        homeEl.style.setProperty('--sports-carousel-collapse-opacity', '1')
      }

      homeEl.style.setProperty(
        '--highlight-header-bg-height',
        `${roundCssNumber(interpolate(HIGHLIGHT_HEADER_EXPANDED_BG_HEIGHT, HIGHLIGHT_HEADER_COMPACT_BG_HEIGHT, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--header-top-padding-y',
        `${roundCssNumber(interpolate(HEADER_TOP_EXPANDED_PADDING_Y, HEADER_TOP_COMPACT_PADDING_Y, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-header-bg-height',
        `${roundCssNumber(interpolate(SPORT_HEADER_EXPANDED_BG_HEIGHT, SPORT_HEADER_COMPACT_BG_HEIGHT, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-padding-bottom',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_PADDING_BOTTOM, SPORT_RAIL_COMPACT_PADDING_BOTTOM, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-item-gap',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_ITEM_GAP, SPORT_RAIL_COMPACT_ITEM_GAP, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-label-max-height',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_LABEL_MAX_HEIGHT, SPORT_RAIL_COMPACT_LABEL_MAX_HEIGHT, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-rail-label-opacity',
        `${roundCssNumber(1 - morphProgress)}`
      )
      homeEl.style.setProperty(
        '--sport-rail-label-translate-y',
        `${roundCssNumber(interpolate(SPORT_RAIL_EXPANDED_LABEL_TRANSLATE_Y, SPORT_RAIL_COMPACT_LABEL_TRANSLATE_Y, morphProgress))}px`
      )
      homeEl.style.setProperty(
        '--sport-filter-padding-bottom',
        `${roundCssNumber(interpolate(SPORT_FILTER_EXPANDED_PADDING_BOTTOM, SPORT_FILTER_COMPACT_PADDING_BOTTOM, morphProgress))}px`
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

      setIsSportsMatchCarouselCollapsed((isCollapsed) => {
        const shouldCollapse = hasEventRail && morphProgress >= EVENT_RAIL_DISABLE_INTERACTION_PROGRESS
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

    scheduleUpdate()
    homeEl.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('scroll', scheduleUpdate, { passive: true })

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      homeEl.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('scroll', scheduleUpdate)
    }
  }, [activeSport, resetEventRailCollapse])

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
    isVariant3 ? '' : 'home--no-dividers',
    activeSport ? 'home--sport-active' : '',
    isCompetitionMode ? 'home--competition-active' : '',
    isSportHeaderCompact ? 'home--header-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={homeClasses} ref={homeRef}>
      <Header
        activeSport={activeSport}
        onSportChange={handleSportChange}
        onOpenCompetition={handleOpenCompetition}
      >
        {activeSport && (
          <>
            <SportFilterBar
              sport={activeSport}
              selectedCompetitionId={selectedCompetition?.id ?? null}
              onSelectCompetition={handleSelectCompetition}
              onClearCompetition={handleClearCompetition}
            />
            <SportsMatchCarousel
              events={sportsCarouselEvents}
              resetKey={sportsCarouselResetKey}
              competitionMode={isCompetitionMode}
              isCollapsed={isSportsMatchCarouselCollapsed}
              onLiveMatchClick={handleLiveMatchClick}
            />
          </>
        )}
      </Header>
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
          {isVariant2 ? (
            <>
              <OffersSection />
              <PromotionSection />
            </>
          ) : (
            <>
              <PromotionSection />
              <OffersSection />
            </>
          )}
          <LiveSection
            onMatchClick={handleLiveMatchClick}
            onOpenCompetition={handleOpenCompetition}
          />
          <EscadinhaSection />
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
