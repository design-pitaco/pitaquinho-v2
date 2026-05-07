import { Fragment, useRef, useState, useEffect, useMemo } from 'react'
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

export function Home() {
  const homeRef = useRef<HTMLDivElement>(null)
  const [isVariant2, setIsVariant2] = useState(false)
  const [isVariant3, setIsVariant3] = useState(false)
  const [activeSport, setActiveSport] = useState<string | null>(null)
  const [isSportHeaderCompact, setIsSportHeaderCompact] = useState(false)
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

  const handleLiveMatchClick = (payload: LiveEventOpenPayload) => {
    setSelectedLiveMatch(payload)
  }

  const scrollToTop = () => {
    setIsSportHeaderCompact(false)

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

    const updateCompactState = () => {
      frame = null
      const scrollTop = getScrollTop()

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
  }, [activeSport])

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
    isVariant3 ? '' : 'home--no-dividers',
    activeSport ? 'home--sport-active' : '',
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
              competitionMode={!!selectedCompetition}
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
