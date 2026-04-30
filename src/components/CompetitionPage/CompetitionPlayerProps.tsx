import { useRef, useState, type CSSProperties, type PointerEvent, type WheelEvent } from 'react'
import './CompetitionPlayerProps.css'

import type { PlayerPropCard, PlayerPropOption } from './competitionData'

interface CompetitionPlayerPropsProps {
  statChips: { id: string; label: string }[]
  cards: PlayerPropCard[]
}

const getInitialOptionIndex = (options: PlayerPropOption[]) => {
  const activeIndex = options.findIndex((opt) => opt.active)
  return activeIndex >= 0 ? activeIndex : Math.floor(options.length / 2)
}

const getCardOptions = (card: PlayerPropCard, activeStat: string) =>
  card.optionsByStat[activeStat] ?? Object.values(card.optionsByStat)[0] ?? []

const getOptionKey = (cardId: string, activeStat: string) => `${cardId}:${activeStat}`

const renderMatchLabel = (card: PlayerPropCard) => {
  const [home, away] = card.matchLabel.split(' X ')
  if (!home || !away) return card.matchLabel

  return (
    <>
      <span className={home === card.highlightedTeam ? 'competition-players__match-team--active' : ''}>
        {home}
      </span>
      <span className="competition-players__match-separator"> X </span>
      <span className={away === card.highlightedTeam ? 'competition-players__match-team--active' : ''}>
        {away}
      </span>
    </>
  )
}

const getPlayerImageStyle = (card: PlayerPropCard) => {
  const adjustment = card.playerImageAdjustment ?? { scale: 1, x: 0, y: 0 }

  return {
    '--player-scale': adjustment.scale,
    '--player-x': `${adjustment.x}px`,
    '--player-y': `${adjustment.y}px`,
  } as CSSProperties
}

export function CompetitionPlayerProps({ statChips, cards }: CompetitionPlayerPropsProps) {
  const [activeStat, setActiveStat] = useState(statChips[0]?.id ?? '')
  const [activeOptionByKey, setActiveOptionByKey] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      cards.flatMap((card) =>
        Object.entries(card.optionsByStat).map(([statId, options]) => [
          getOptionKey(card.id, statId),
          getInitialOptionIndex(options),
        ])
      )
    )
  )
  const optionGestureStart = useRef<Record<string, { x: number; y: number } | null>>({})
  const suppressOptionClick = useRef<Record<string, boolean>>({})
  const wheelLock = useRef<Record<string, number>>({})
  const chipsRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([])

  const scrollChipIntoView = (chipEl: HTMLButtonElement | null) => {
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

  const resetOptionsForStat = (statId: string) => {
    setActiveOptionByKey((current) => {
      const next = { ...current }
      cards.forEach((card) => {
        const options = getCardOptions(card, statId)
        next[getOptionKey(card.id, statId)] = getInitialOptionIndex(options)
      })
      return next
    })
  }

  const centerOption = (optionKey: string, index: number) => {
    setActiveOptionByKey((current) => ({ ...current, [optionKey]: index }))
  }

  const stepOption = (optionKey: string, optionsLength: number, direction: number) => {
    setActiveOptionByKey((current) => {
      const currentIndex = current[optionKey] ?? 0
      const nextIndex = Math.min(optionsLength - 1, Math.max(0, currentIndex + direction))
      return currentIndex === nextIndex ? current : { ...current, [optionKey]: nextIndex }
    })
  }

  const handleOptionPointerDown = (cardId: string, event: PointerEvent<HTMLDivElement>) => {
    optionGestureStart.current[cardId] = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleOptionPointerUp = (
    cardId: string,
    optionsLength: number,
    event: PointerEvent<HTMLDivElement>
  ) => {
    const start = optionGestureStart.current[cardId]
    optionGestureStart.current[cardId] = null
    if (!start) return

    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 18 || Math.abs(dx) < Math.abs(dy)) return

    suppressOptionClick.current[cardId] = true
    stepOption(getOptionKey(cardId, activeStat), optionsLength, dx < 0 ? 1 : -1)
  }

  const handleOptionWheel = (
    cardId: string,
    optionsLength: number,
    event: WheelEvent<HTMLDivElement>
  ) => {
    const movement = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
    if (Math.abs(movement) < 12) return

    const now = event.timeStamp
    if (now - (wheelLock.current[cardId] ?? 0) < 220) return
    wheelLock.current[cardId] = now

    stepOption(getOptionKey(cardId, activeStat), optionsLength, movement > 0 ? 1 : -1)
  }

  return (
    <section className="competition-players">
      <div className="competition-players__header">
        <span>Jogadores</span>
      </div>

      <div className="competition-players__chips" ref={chipsRef}>
        {statChips.map((chip, index) => (
          <button
            key={chip.id}
            ref={(el) => { chipRefs.current[index] = el }}
            className={`competition-players__chip ${activeStat === chip.id ? 'competition-players__chip--active' : ''}`}
            onClick={() => {
              setActiveStat(chip.id)
              resetOptionsForStat(chip.id)
              scrollChipIntoView(chipRefs.current[index])
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="competition-players__list">
        {cards.map((card) => {
          const options = getCardOptions(card, activeStat)
          const optionKey = getOptionKey(card.id, activeStat)
          const activeOptionIndex = activeOptionByKey[optionKey] ?? getInitialOptionIndex(options)

          return (
          <div key={card.id} className="competition-players__card">
            <div className="competition-players__card-header">
              <div className="competition-players__match-row">
                <span className="competition-players__match-label">{renderMatchLabel(card)}</span>
                <span className="competition-players__match-time">{card.matchTime}</span>
              </div>
              <div className="competition-players__player-image-wrapper">
                <img
                  src={card.playerImage}
                  alt=""
                  className="competition-players__player-image"
                  style={getPlayerImageStyle(card)}
                />
              </div>
            </div>
            <div className="competition-players__card-name">{card.playerName}</div>
            <div
              className="competition-players__card-options"
              aria-label={`Odds de ${card.playerName}`}
              onPointerDown={(e) => handleOptionPointerDown(card.id, e)}
              onPointerUp={(e) => handleOptionPointerUp(card.id, options.length, e)}
              onPointerCancel={() => { optionGestureStart.current[card.id] = null }}
              onWheel={(e) => handleOptionWheel(card.id, options.length, e)}
            >
              <div
                className="competition-players__options-scroll"
              >
                <div
                  className="competition-players__options-track"
                  style={{ '--active-index': activeOptionIndex } as CSSProperties}
                >
                  {options.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`competition-players__option ${activeOptionIndex === idx ? 'competition-players__option--active' : ''}`}
                      onClick={(e) => {
                        if (suppressOptionClick.current[card.id]) {
                          suppressOptionClick.current[card.id] = false
                          e.preventDefault()
                          return
                        }
                        centerOption(optionKey, idx)
                      }}
                    >
                      <span className="competition-players__option-label">{opt.label}</span>
                      <span className="competition-players__option-odd">{opt.odd}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </section>
  )
}
