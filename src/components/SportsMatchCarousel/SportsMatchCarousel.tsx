import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import './SportsMatchCarousel.css'
import {
  getCompetitionLiveEventOpenPayload,
  updateCompetitionMatchTime,
  type DisplayedCompetitionEvent,
} from '../CalendarSection'
import type { LiveEventOpenPayload } from '../../pages/LiveEventPage'
import { getTeamLogo } from '../../data/teamLogos'
import iconAoVivo from '../../assets/iconAoVivo.png'
import iconStreaming from '../../assets/iconStreaming.svg'
import iconFutebol from '../../assets/iconFutebol.png'
import iconBasquete from '../../assets/iconBasquete.png'
import escudoDefaultBasquete from '../../assets/escudoDefaultBasquete.png'

interface SportsMatchCarouselProps {
  events: DisplayedCompetitionEvent[]
  matchTimes?: Record<string, string>
  resetKey?: string
  competitionMode?: boolean
  onLiveMatchClick?: (payload: LiveEventOpenPayload) => void
}

const getEventsKey = (events: DisplayedCompetitionEvent[]) =>
  events.map(({ league, event }) => `${league.id}:${event.id}:${event.dateTime}`).join('|')

const getInitialLiveTimes = (events: DisplayedCompetitionEvent[]) =>
  events.reduce<Record<string, string>>((times, { event }) => {
    if (event.isLive) times[event.id] = event.dateTime
    return times
  }, {})

const SPORTS_MATCH_VISIBLE_CARDS = 2.5

const readCssPixelValue = (styles: CSSStyleDeclaration, property: string, fallback: number) => {
  const value = Number.parseFloat(styles.getPropertyValue(property))
  return Number.isFinite(value) ? value : fallback
}

const getShortLeagueName = (name: string) => {
  const withoutCountry = name
    .replace(/^Brasil - /, '')
    .replace(/^Inglaterra - /, '')
    .replace(/^Espanha - /, '')
    .replace(/^Alemanha - /, '')
    .replace(/^Europa - /, '')

  return withoutCountry === 'Serie A' || withoutCountry === 'Série A'
    ? 'Brasileirão'
    : withoutCountry
}

const getPreMatchLabel = (dateTime: string) => {
  const [datePart, timePart] = dateTime.split(',').map((part) => part.trim())

  if (datePart === 'Hoje' || datePart === 'Amanhã') return datePart
  return timePart || datePart
}

const getCompetitionPreMatchHeader = (dateTime: string) => {
  const [datePart, timePart] = dateTime.split(',').map((part) => part.trim())
  return {
    primary: timePart || datePart,
    secondary: datePart,
  }
}

export function SportsMatchCarousel({
  events,
  matchTimes,
  resetKey,
  competitionMode = false,
  onLiveMatchClick,
}: SportsMatchCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const eventsKey = useMemo(() => getEventsKey(events), [events])
  const initialLiveTimes = useMemo(() => getInitialLiveTimes(events), [events])
  const [localLiveTimesState, setLocalLiveTimesState] = useState(() => ({
    key: eventsKey,
    times: initialLiveTimes,
  }))
  const localLiveTimes = localLiveTimesState.key === eventsKey
    ? localLiveTimesState.times
    : initialLiveTimes
  const currentTimes = matchTimes ?? localLiveTimes

  useEffect(() => {
    if (matchTimes || events.length === 0) return

    const interval = setInterval(() => {
      setLocalLiveTimesState((current) => {
        const sourceTimes = current.key === eventsKey ? current.times : initialLiveTimes
        const next: Record<string, string> = {}
        events.forEach(({ event }) => {
          if (event.isLive) {
            next[event.id] = updateCompetitionMatchTime(sourceTimes[event.id] ?? event.dateTime)
          }
        })
        return { key: eventsKey, times: next }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [events, eventsKey, initialLiveTimes, matchTimes])

  useLayoutEffect(() => {
    carouselRef.current?.scrollTo({ left: 0, top: 0, behavior: 'auto' })
  }, [resetKey])

  useLayoutEffect(() => {
    if (events.length === 0) return

    const carouselEl = carouselRef.current
    if (!carouselEl) return

    const updateCardWidth = () => {
      const styles = window.getComputedStyle(carouselEl)
      const sidePadding = readCssPixelValue(styles, '--sports-carousel-track-padding-x', 12)
      const cardGap = readCssPixelValue(styles, '--sports-carousel-card-gap', 8)
      const cardWidth = (carouselEl.clientWidth - sidePadding - cardGap * 2) / SPORTS_MATCH_VISIBLE_CARDS

      carouselEl.style.setProperty('--sports-carousel-card-width', `${Math.max(0, cardWidth)}px`)
    }

    updateCardWidth()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateCardWidth)
      : null

    resizeObserver?.observe(carouselEl)
    window.addEventListener('resize', updateCardWidth)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateCardWidth)
    }
  }, [events.length])

  if (events.length === 0) return null

  const renderTeamIcon = (
    icon: string,
    teamName: string,
    sport: string,
    side: 'home' | 'away'
  ) => {
    const teamIcon = getTeamLogo(teamName, icon)
    const isBasketballFallback = sport === 'basquete' && (!teamIcon || teamIcon === escudoDefaultBasquete)
    const isFootballFallback = sport === 'futebol' && teamIcon === iconFutebol

    if (isFootballFallback) {
      return (
        <img
          src={teamIcon}
          alt=""
          className={`sports-match-carousel__team-icon sports-match-carousel__team-icon--sport-${side}`}
        />
      )
    }

    if (!isBasketballFallback && teamIcon) {
      return <img src={teamIcon} alt="" className="sports-match-carousel__team-icon" />
    }

    if (sport === 'basquete') {
      return (
        <img
          src={iconBasquete}
          alt=""
          className={`sports-match-carousel__team-icon sports-match-carousel__team-icon--basketball-${side}`}
        />
      )
    }

    return <span className="sports-match-carousel__team-icon sports-match-carousel__team-icon--placeholder" />
  }

  return (
    <div className="sports-match-carousel" ref={carouselRef} aria-label="Jogos">
      <div className="sports-match-carousel__track">
        {events.map(({ league, event }) => {
          const currentTime = currentTimes[event.id] ?? event.dateTime
          const leagueName = getShortLeagueName(league.name)
          const preMatchHeader = competitionMode
            ? getCompetitionPreMatchHeader(event.dateTime)
            : { primary: getPreMatchLabel(event.dateTime), secondary: leagueName }
          const canOpenLiveEvent = !!onLiveMatchClick && !!event.isLive && league.sport === 'futebol'
          const openLiveEvent = () => {
            const payload = getCompetitionLiveEventOpenPayload({
              league,
              selectedEventId: event.id,
              matchTimes: currentTimes,
            })

            if (payload) onLiveMatchClick?.(payload)
          }
          const handleLiveEventKeyDown = (keyEvent: KeyboardEvent<HTMLElement>) => {
            if (keyEvent.key !== 'Enter' && keyEvent.key !== ' ') return
            keyEvent.preventDefault()
            openLiveEvent()
          }

          return (
            <article
              key={`${league.id}-${event.id}`}
              className={[
                'sports-match-carousel__card',
                event.isLive ? 'sports-match-carousel__card--live' : '',
                canOpenLiveEvent ? 'sports-match-carousel__card--clickable' : '',
              ].filter(Boolean).join(' ')}
              onClick={canOpenLiveEvent ? openLiveEvent : undefined}
              onKeyDown={canOpenLiveEvent ? handleLiveEventKeyDown : undefined}
              role={canOpenLiveEvent ? 'button' : undefined}
              tabIndex={canOpenLiveEvent ? 0 : undefined}
              aria-label={canOpenLiveEvent ? `Abrir ${event.homeName} contra ${event.awayName}` : undefined}
            >
              <div className="sports-match-carousel__card-header">
                {event.isLive ? (
                  <>
                    <div className="sports-match-carousel__live-meta">
                      <span className="sports-match-carousel__live-icon-wrap" aria-hidden="true">
                        <img src={iconAoVivo} alt="" className="sports-match-carousel__live-icon" />
                      </span>
                      <span className="sports-match-carousel__header-primary">{currentTime}</span>
                    </div>
                    <img src={iconStreaming} alt="" className="sports-match-carousel__stream-icon" />
                  </>
                ) : (
                  <>
                    <span className="sports-match-carousel__header-primary">{preMatchHeader.primary}</span>
                    <span className="sports-match-carousel__header-secondary">{preMatchHeader.secondary}</span>
                  </>
                )}
              </div>

              <div className="sports-match-carousel__teams">
                <div className="sports-match-carousel__team-list">
                  <div className="sports-match-carousel__team-row">
                    {renderTeamIcon(event.homeIcon, event.homeName, league.sport, 'home')}
                    <span className="sports-match-carousel__team-name">{event.homeName}</span>
                  </div>
                  <div className="sports-match-carousel__team-row">
                    {renderTeamIcon(event.awayIcon, event.awayName, league.sport, 'away')}
                    <span className="sports-match-carousel__team-name">{event.awayName}</span>
                  </div>
                </div>
                {event.isLive && (
                  <div className="sports-match-carousel__score-column" aria-label="Placar">
                    <span className="sports-match-carousel__team-score">{event.homeScore ?? 0}</span>
                    <span className="sports-match-carousel__team-score">{event.awayScore ?? 0}</span>
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
