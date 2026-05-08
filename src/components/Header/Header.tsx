import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ListIcon } from '@phosphor-icons/react'
import './Header.css'
import { SportRail } from '../SportRail'
import logoReidoPitaco from '../../assets/logoReidoPitaco.svg'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import { competicaoConfigBySport } from '../SportFilterBar/competicaoData'
import { getCompetitionBadge } from '../../data/competitionBadges'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'

interface HeaderProps {
  activeSport?: string | null
  onSportChange?: (sportId: string) => void
  onOpenCompetition?: (target: CompetitionLinkTarget) => void
  children?: ReactNode
}

type HeaderToggleOption = 'apostas' | 'cassino'

const highlightCompetitionChips = [
  competicaoConfigBySport.futebol.featuredCompetitions[0],
  competicaoConfigBySport.basquete.featuredCompetitions[0],
  ...competicaoConfigBySport.futebol.featuredCompetitions.slice(1),
].filter(Boolean)

const setHighlightChipIndicator = (
  containerEl: HTMLDivElement | null,
  activeChip: HTMLButtonElement | null | undefined
) => {
  if (!containerEl || !activeChip) {
    containerEl?.classList.remove('header__highlight-chips--indicator-ready')
    return
  }

  const containerRect = containerEl.getBoundingClientRect()
  const chipRect = activeChip.getBoundingClientRect()

  containerEl.style.setProperty('--highlight-chip-active-x', `${chipRect.left - containerRect.left}px`)
  containerEl.style.setProperty('--highlight-chip-active-y', `${chipRect.top - containerRect.top}px`)
  containerEl.style.setProperty('--highlight-chip-active-width', `${chipRect.width}px`)
  containerEl.style.setProperty('--highlight-chip-active-height', `${chipRect.height}px`)
  containerEl.classList.add('header__highlight-chips--indicator-ready')
}

export function Header({
  activeSport,
  onSportChange,
  onOpenCompetition,
  children,
}: HeaderProps = {}) {
  const isSportPage = !!activeSport && activeSport !== 'destaques'
  const [activeToggle, setActiveToggle] = useState<HeaderToggleOption>('apostas')
  const [activeHighlightCompetition, setActiveHighlightCompetition] = useState('')
  const highlightChipsRef = useRef<HTMLDivElement>(null)
  const highlightChipRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handleHighlightCompetitionSelect = (competitionId: string, index: number) => {
    setActiveHighlightCompetition(competitionId)

    const chipEl = highlightChipRefs.current[index]
    const containerEl = highlightChipsRef.current
    if (!chipEl || !containerEl) return

    const chipLeft = chipEl.offsetLeft
    const chipWidth = chipEl.offsetWidth
    const containerWidth = containerEl.offsetWidth
    const containerScroll = containerEl.scrollLeft
    const padding = 12

    if (chipLeft + chipWidth > containerScroll + containerWidth - padding) {
      containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
    } else if (chipLeft < containerScroll + padding) {
      containerEl.scrollTo({ left: chipLeft - padding, behavior: 'smooth' })
    }
  }

  const getHighlightCompetitionSport = (competitionId: string) =>
    competitionId.startsWith('bsq-') ? 'basquete' : 'futebol'

  const getHighlightCompetitionFallbackIcon = (competitionId: string) =>
    getHighlightCompetitionSport(competitionId) === 'basquete' ? iconBasquete : iconFutebol

  const handleSportRailChange = (sportId: string) => {
    if (sportId === 'destaques') setActiveHighlightCompetition('')
    onSportChange?.(sportId)
  }

  useLayoutEffect(() => {
    const activeIndex = highlightCompetitionChips.findIndex((chip) => chip.id === activeHighlightCompetition)
    setHighlightChipIndicator(highlightChipsRef.current, highlightChipRefs.current[activeIndex])
  }, [activeHighlightCompetition])

  useEffect(() => {
    const containerEl = highlightChipsRef.current
    if (!containerEl) return

    const activeIndex = highlightCompetitionChips.findIndex((chip) => chip.id === activeHighlightCompetition)
    const activeChip = highlightChipRefs.current[activeIndex]
    const updateHighlightIndicator = () => {
      setHighlightChipIndicator(containerEl, highlightChipRefs.current[activeIndex])
    }
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateHighlightIndicator)
      : null

    resizeObserver?.observe(containerEl)
    if (activeChip) resizeObserver?.observe(activeChip)
    window.addEventListener('resize', updateHighlightIndicator)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateHighlightIndicator)
    }
  }, [activeHighlightCompetition])

  return (
    <header
      className={[
        'header',
        isSportPage ? 'header--sport-active' : 'header--highlight-chips',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="header__bg-dark" />
      <div className="header__bg-gradient" />

      <div className="header__top">
        <div className="header__logo">
          <img src={logoReidoPitaco} alt="Rei do Pitaco" />
        </div>

        <div
          className={`header__toggle header__toggle--${activeToggle}`}
          role="group"
          aria-label="Alternar entre apostas e cassino"
        >
          <button
            type="button"
            className={`header__toggle-btn${activeToggle === 'apostas' ? ' header__toggle-btn--active' : ''}`}
            aria-pressed={activeToggle === 'apostas'}
            onClick={() => setActiveToggle('apostas')}
          >
            APOSTAS
          </button>
          <button
            type="button"
            className={`header__toggle-btn${activeToggle === 'cassino' ? ' header__toggle-btn--active' : ''}`}
            aria-pressed={activeToggle === 'cassino'}
            onClick={() => setActiveToggle('cassino')}
          >
            CASSINO
          </button>
        </div>

        <div className="header__account-actions">
          <div className="header__balance" aria-label="Saldo disponível">
            <span className="header__balance-label">Saldo</span>
            <span className="header__balance-value">R$ 3.400,00</span>
          </div>
          <button type="button" className="header__menu-btn" aria-label="Abrir menu">
            <ListIcon aria-hidden="true" className="header__menu-icon" weight="bold" />
          </button>
        </div>
      </div>

      <SportRail activeSport={activeSport} onSportChange={handleSportRailChange} />
      {!isSportPage && (
        <div
          className="header__highlight-chips"
          ref={highlightChipsRef}
        >
          <span className="header__highlight-chip-indicator" aria-hidden="true" />
          {highlightCompetitionChips.map((chip, index) => (
            <button
              key={chip.id}
              ref={(el) => { highlightChipRefs.current[index] = el }}
              type="button"
              className={`header__highlight-chip${activeHighlightCompetition === chip.id ? ' header__highlight-chip--active' : ''}`}
              onClick={() => {
                handleHighlightCompetitionSelect(chip.id, index)
                onOpenCompetition?.({
                  id: chip.id,
                  name: chip.name,
                  sport: getHighlightCompetitionSport(chip.id),
                })
              }}
            >
              <img
                src={getCompetitionBadge(chip.id, getHighlightCompetitionFallbackIcon(chip.id))}
                alt=""
                className="header__highlight-chip-icon"
              />
              <span>{chip.name}</span>
            </button>
          ))}
        </div>
      )}
      {children}
    </header>
  )
}
