import { useEffect, useRef, useState, type RefObject } from 'react'
import '../PreMatchSection/PreMatchSection.css'
import '../CalendarSection/CalendarSection.css'
import './CompetitionCalendar.css'

import setaLink from '../../assets/setaLink.png'
import iconAoVivo from '../../assets/iconAoVivo.png'
import reiAntecipaFutebol from '../../assets/reiAntecipaFutebol.png'
import reiAntecipaBasquete from '../../assets/reiAntecipaBasquete.png'

import type { CompetitionMatch } from './competitionData'

interface DateChip {
  id: string
  topLabel: string
  bottomLabel: string
}

const PT_WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const PT_MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function buildDateChips(): DateChip[] {
  const chips: DateChip[] = [{ id: 'agora', topLabel: 'Em alta', bottomLabel: 'Agora' }]
  const today = new Date()
  for (let i = 0; i < 5; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    chips.push({
      id: `day-${i}`,
      topLabel: PT_WEEKDAYS[d.getDay()],
      bottomLabel: `${d.getDate()} ${PT_MONTHS[d.getMonth()]}`,
    })
  }
  return chips
}

const footballMarketChips = [
  { id: 'resultado-final', label: 'Resultado Final' },
  { id: 'dupla-chance', label: 'Dupla Chance' },
  { id: 'ambos-marcam', label: 'Ambos Marcam' },
  { id: 'total-gols', label: 'Total de Gols' },
]

const basketballMarketChips = [
  { id: 'vencedor', label: 'Vencedor' },
  { id: 'total-pontos', label: 'Total de Pontos' },
  { id: 'handicap', label: 'Handicap' },
]

interface CompetitionCalendarProps {
  sport: string
  matches: CompetitionMatch[]
}

const tickLive = (time: string) => {
  const halfMatch = time.match(/(\d)T (\d+):(\d+)/)
  if (halfMatch) {
    let mm = Number(halfMatch[2])
    let ss = Number(halfMatch[3]) + 1
    if (ss >= 60) { ss = 0; mm += 1 }
    return `${halfMatch[1]}T ${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }
  const qMatch = time.match(/Q(\d) (\d+):(\d+)/)
  if (qMatch) {
    let mm = Number(qMatch[2])
    let ss = Number(qMatch[3]) - 1
    if (ss < 0) { ss = 59; mm = Math.max(0, mm - 1) }
    return `Q${qMatch[1]} ${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  }
  return time
}

export function CompetitionCalendar({ sport, matches }: CompetitionCalendarProps) {
  const dateChips = buildDateChips()
  const marketChips = sport === 'basquete' ? basketballMarketChips : footballMarketChips

  const [activeDateChip, setActiveDateChip] = useState('agora')
  const [activeMarket, setActiveMarket] = useState(marketChips[0].id)

  const dateChipsRef = useRef<HTMLDivElement>(null)
  const marketChipsRef = useRef<HTMLDivElement>(null)
  const dateChipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const marketChipRefs = useRef<(HTMLButtonElement | null)[]>([])

  const [liveTimes, setLiveTimes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {}
    matches.forEach((m) => {
      if (m.isLive && m.liveTime) map[m.id] = m.liveTime
    })
    return map
  })

  useEffect(() => {
    const i = setInterval(() => {
      setLiveTimes((current) => {
        const next: Record<string, string> = {}
        Object.keys(current).forEach((k) => { next[k] = tickLive(current[k]) })
        return next
      })
    }, 1000)
    return () => clearInterval(i)
  }, [])

  const reiAntecipa = sport === 'basquete' ? reiAntecipaBasquete : reiAntecipaFutebol

  const live = matches.filter((m) => m.isLive).slice(0, 3)
  const preMatch = matches.filter((m) => !m.isLive).slice(0, 5)
  const ordered = [...live, ...preMatch]

  const scrollChipIntoView = (chipsRef: RefObject<HTMLDivElement | null>, chipEl: HTMLButtonElement | null) => {
    const containerEl = chipsRef.current
    if (!chipEl || !containerEl) return
    const chipLeft = chipEl.offsetLeft
    const chipWidth = chipEl.offsetWidth
    const containerWidth = containerEl.offsetWidth
    const containerScroll = containerEl.scrollLeft
    const padding = 20
    if (chipLeft + chipWidth > containerScroll + containerWidth - padding) {
      containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
    } else if (chipLeft < containerScroll + padding) {
      containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
    }
  }

  const renderOdds = (m: CompetitionMatch) => {
    if (sport === 'basquete' || activeMarket === 'vencedor') {
      return (
        <>
          <button className="prematch-section__odd-btn">
            <span className="prematch-section__odd-team">{m.homeName}</span>
            <span className="prematch-section__odd-value">{m.odds.home}</span>
          </button>
          <button className="prematch-section__odd-btn">
            <span className="prematch-section__odd-team">{m.awayName}</span>
            <span className="prematch-section__odd-value">{m.odds.away}</span>
          </button>
        </>
      )
    }
    return (
      <>
        <button className="prematch-section__odd-btn">
          <span className="prematch-section__odd-team">{m.homeName}</span>
          <span className="prematch-section__odd-value">{m.odds.home}</span>
        </button>
        <button className="prematch-section__odd-btn">
          <span className="prematch-section__odd-team">Empate</span>
          <span className="prematch-section__odd-value">{m.odds.draw ?? '-'}</span>
        </button>
        <button className="prematch-section__odd-btn">
          <span className="prematch-section__odd-team">{m.awayName}</span>
          <span className="prematch-section__odd-value">{m.odds.away}</span>
        </button>
      </>
    )
  }

  return (
    <section className="prematch-section calendar-section competition-calendar">
      <div className="prematch-section__header">
        <div className="prematch-section__title">
          <span>Calendário</span>
        </div>
      </div>

      <div className="calendar-section__date-chips" ref={dateChipsRef}>
        {dateChips.map((chip, index) => (
          <button
            key={chip.id}
            ref={(el) => { dateChipRefs.current[index] = el }}
            className={`calendar-date-chip ${activeDateChip === chip.id ? 'calendar-date-chip--active' : ''}`}
            onClick={() => {
              setActiveDateChip(chip.id)
              scrollChipIntoView(dateChipsRef, dateChipRefs.current[index])
            }}
          >
            <span className="calendar-date-chip__top">{chip.topLabel}</span>
            <span className="calendar-date-chip__bottom">{chip.bottomLabel}</span>
          </button>
        ))}
      </div>

      <div className="prematch-section__chips" ref={marketChipsRef}>
        {marketChips.map((chip, index) => (
          <button
            key={chip.id}
            ref={(el) => { marketChipRefs.current[index] = el }}
            className={`prematch-section__chip prematch-section__chip--market ${activeMarket === chip.id ? 'prematch-section__chip--active' : ''}`}
            onClick={() => {
              setActiveMarket(chip.id)
              scrollChipIntoView(marketChipsRef, marketChipRefs.current[index])
            }}
          >
            <span data-text={chip.label}>{chip.label}</span>
          </button>
        ))}
      </div>

      <div className="competition-calendar__matches">
        {ordered.map((m) => (
          <div key={m.id} className={`prematch-section__match ${m.isLive ? 'competition-calendar__match--live' : ''}`}>
            <div className="prematch-section__match-header">
              <div className="prematch-section__teams-compact">
                {m.isLive && (
                  <div className="competition-calendar__live-row">
                    <div className="calendar-section__tag-aovivo">
                      <div className="calendar-section__tag-icon-wrapper">
                        <img src={iconAoVivo} alt="" className="calendar-section__tag-icon" />
                      </div>
                      <span>Ao Vivo</span>
                    </div>
                    <span className="competition-calendar__live-time">{liveTimes[m.id] ?? m.liveTime}</span>
                  </div>
                )}
                <div className="prematch-section__team-row">
                  <img src={m.homeIcon} alt="" className="prematch-section__team-icon" />
                  <span className="prematch-section__team-name">{m.homeName}</span>
                  {m.isLive && (
                    <span className="competition-calendar__score">{m.homeScore ?? 0}</span>
                  )}
                </div>
                <div className="prematch-section__team-row">
                  <img src={m.awayIcon} alt="" className="prematch-section__team-icon" />
                  <span className="prematch-section__team-name">{m.awayName}</span>
                  {m.isLive && (
                    <span className="competition-calendar__score">{m.awayScore ?? 0}</span>
                  )}
                </div>
              </div>
              {!m.isLive && (
                <div className="prematch-section__match-info">
                  <div className="prematch-section__match-info-content">
                    {m.earlyPayout && (
                      <div className="prematch-section__pag-antecipado">
                        <span className="prematch-section__pag-antecipado-label">Pag. Antecipado</span>
                        <img src={reiAntecipa} alt="" className="prematch-section__rei-antecipa" />
                      </div>
                    )}
                    <span className="prematch-section__match-datetime">{m.dateTime}</span>
                  </div>
                  <img src={setaLink} alt="" className="prematch-section__match-arrow" />
                </div>
              )}
              {m.isLive && (
                <img src={setaLink} alt="" className="prematch-section__match-arrow competition-calendar__live-arrow" />
              )}
            </div>

            <div className="prematch-section__odds">
              {renderOdds(m)}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
