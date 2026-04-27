import { Fragment, useState, useEffect } from 'react'
import { Header } from '../../components/Header'
import { TrilhoEBanner } from '../../components/TrilhoEBanner'
import { PromotionSection } from '../../components/PromotionSection'
import { OffersSection } from '../../components/OffersSection'
import { LiveSection } from '../../components/LiveSection'
import { EscadinhaSection } from '../../components/EscadinhaSection'
import { PreMatchSection } from '../../components/PreMatchSection'
import { TreasureSection } from '../../components/TreasureSection'
import { WinningNowSection } from '../../components/WinningNowSection'
import { SportFilterBar } from '../../components/SportFilterBar'
import { CalendarSection } from '../../components/CalendarSection'
import { CompetitionPage } from '../../components/CompetitionPage'
import { LiveEventPage } from '../LiveEventPage'
import type { LiveEventOpenPayload } from '../LiveEventPage'
import './Home.css'

export function Home() {
  const [isVariant2, setIsVariant2] = useState(false)
  const [isVariant3, setIsVariant3] = useState(false)
  const [activeSport, setActiveSport] = useState<string | null>(null)
  const [contentResetKey, setContentResetKey] = useState(0)
  const [selectedCompetition, setSelectedCompetition] = useState<{ id: string; name: string } | null>(null)
  const [selectedLiveMatch, setSelectedLiveMatch] = useState<LiveEventOpenPayload | null>(null)

  const handleLiveMatchClick = (payload: LiveEventOpenPayload) => {
    setSelectedLiveMatch(payload)
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

  const handleSportChange = (sportId: string) => {
    setContentResetKey((current) => current + 1)
    setSelectedCompetition(null)

    if (sportId === 'destaques') {
      setActiveSport(null)
    } else {
      setActiveSport((current) => (current === sportId ? null : sportId))
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }

  const handleSelectCompetition = (id: string, name: string) => {
    setSelectedCompetition({ id, name })
    setContentResetKey((c) => c + 1)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }

  const handleClearCompetition = () => {
    setSelectedCompetition(null)
    setContentResetKey((c) => c + 1)
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    })
  }

  return (
    <div className={`home ${isVariant3 ? '' : 'home--no-dividers'}`}>
      <Header activeSport={activeSport} onSportChange={handleSportChange} />
      <TrilhoEBanner hideBanner={!!activeSport} />
      {activeSport ? (
        <Fragment key={`sport-${activeSport}-${contentResetKey}`}>
          <SportFilterBar
            sport={activeSport}
            selectedCompetitionId={selectedCompetition?.id ?? null}
            onSelectCompetition={handleSelectCompetition}
            onClearCompetition={handleClearCompetition}
          />
          {selectedCompetition ? (
            <CompetitionPage
              sport={activeSport}
              competitionId={selectedCompetition.id}
              onLiveMatchClick={handleLiveMatchClick}
            />
          ) : (
            <>
              <OffersSection sportFilter={activeSport} />
              <CalendarSection sportFilter={activeSport} onLiveMatchClick={handleLiveMatchClick} />
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
          <LiveSection onMatchClick={handleLiveMatchClick} />
          <EscadinhaSection />
          <PreMatchSection />
          <TreasureSection />
          <WinningNowSection />
        </Fragment>
      )}
      <main className="home__content" />

      {selectedLiveMatch && (
        <LiveEventPage
          isOpen={true}
          onClose={() => setSelectedLiveMatch(null)}
          matches={selectedLiveMatch.matches}
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
