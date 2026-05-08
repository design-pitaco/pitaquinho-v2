import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { ListIcon } from '@phosphor-icons/react'
import './Header.css'
import { SportRail } from '../SportRail'
import type { SportRailVariant } from '../SportRail/SportRail'
import logoReidoPitaco from '../../assets/logoReidoPitaco.svg'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import { competicaoConfigBySport } from '../SportFilterBar/competicaoData'
import { getCompetitionBadge } from '../../data/competitionBadges'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'

interface HeaderProps {
  railVariant?: SportRailVariant
  activeSport?: string | null
  selectedCompetitionId?: string | null
  onSportChange?: (sportId: string) => void
  onOpenCompetition?: (target: CompetitionLinkTarget) => void
  children?: ReactNode
}

type HeaderToggleOption = 'apostas' | 'cassino'

const balanceDisplayOptions = ['R$ 3.400,00', 'R$ 3.400', 'R$ 3.4k']
const headerLogoExpandedWidth = 103
const headerLogoCompactWidth = 96
const headerMinimumControlGap = 20

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
  railVariant = 'default',
  activeSport,
  selectedCompetitionId,
  onSportChange,
  onOpenCompetition,
  children,
}: HeaderProps = {}) {
  const isSportPage = !!activeSport && activeSport !== 'destaques'
  const usesCompetitionRail = railVariant === 'competitions'
  const [activeToggle, setActiveToggle] = useState<HeaderToggleOption>('apostas')
  const [activeHighlightCompetition, setActiveHighlightCompetition] = useState('')
  const [balanceDisplayValue, setBalanceDisplayValue] = useState(balanceDisplayOptions[0])
  const [accountActionsWidth, setAccountActionsWidth] = useState(124)
  const [isLogoCompact, setIsLogoCompact] = useState(false)
  const headerTopRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const accountActionsRef = useRef<HTMLDivElement>(null)
  const highlightChipsRef = useRef<HTMLDivElement>(null)
  const highlightChipRefs = useRef<(HTMLButtonElement | null)[]>([])
  const balanceRef = useRef<HTMLDivElement>(null)
  const balanceLabelRef = useRef<HTMLSpanElement>(null)
  const balanceValueRef = useRef<HTMLSpanElement>(null)
  const balanceMeasureRefs = useRef<(HTMLSpanElement | null)[]>([])

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

  const handleToggleClick = () => {
    setActiveToggle((current) => current === 'apostas' ? 'cassino' : 'apostas')
  }

  useLayoutEffect(() => {
    const activeIndex = highlightCompetitionChips.findIndex((chip) => chip.id === activeHighlightCompetition)
    setHighlightChipIndicator(highlightChipsRef.current, highlightChipRefs.current[activeIndex])
  }, [activeHighlightCompetition])

  useLayoutEffect(() => {
    let isDisposed = false

    const updateHeaderLayout = () => {
      const headerTopEl = headerTopRef.current
      const toggleEl = toggleRef.current
      const accountActionsEl = accountActionsRef.current
      const menuEl = accountActionsEl?.querySelector<HTMLElement>('.header__menu-btn')
      if (!headerTopEl || !toggleEl || !accountActionsEl || !menuEl) return

      const headerTopRect = headerTopEl.getBoundingClientRect()
      const headerTopStyle = window.getComputedStyle(headerTopEl)
      const accountActionsStyle = window.getComputedStyle(accountActionsEl)
      const contentWidth = headerTopRect.width
        - (parseFloat(headerTopStyle.paddingLeft) || 0)
        - (parseFloat(headerTopStyle.paddingRight) || 0)
      const toggleWidth = toggleEl.getBoundingClientRect().width
      const menuWidth = menuEl.getBoundingClientRect().width
      const accountGap = parseFloat(accountActionsStyle.columnGap || accountActionsStyle.gap) || 0
      const balanceLabelWidth = balanceLabelRef.current?.getBoundingClientRect().width ?? 0

      const getBalanceTextWidth = (option: string, index: number) => {
        const measureEl = balanceMeasureRefs.current[index]
        if (!measureEl) return 0

        measureEl.textContent = option
        return measureEl.getBoundingClientRect().width
      }

      const getLayoutOption = (logoWidth: number) => {
        for (let index = 0; index < balanceDisplayOptions.length; index += 1) {
          const option = balanceDisplayOptions[index]
          const balanceTextWidth = getBalanceTextWidth(option, index)
          const nextAccountActionsWidth = Math.ceil(Math.max(balanceTextWidth, balanceLabelWidth) + accountGap + menuWidth)
          const requiredWidth =
            logoWidth +
            toggleWidth +
            nextAccountActionsWidth +
            headerMinimumControlGap * 2

          if (contentWidth + 0.5 >= requiredWidth) {
            return {
              accountActionsWidth: nextAccountActionsWidth,
              balanceDisplayValue: option,
            }
          }
        }

        return null
      }

      const expandedLayout = getLayoutOption(headerLogoExpandedWidth)
      const compactLayout = expandedLayout ?? getLayoutOption(headerLogoCompactWidth)
      const fallbackLayout = compactLayout ?? {
        accountActionsWidth: Math.ceil(
          Math.max(
            getBalanceTextWidth(balanceDisplayOptions[balanceDisplayOptions.length - 1], balanceDisplayOptions.length - 1),
            balanceLabelWidth
          ) + accountGap + menuWidth
        ),
        balanceDisplayValue: balanceDisplayOptions[balanceDisplayOptions.length - 1],
      }

      setIsLogoCompact((currentValue) => (
        currentValue === !expandedLayout ? currentValue : !expandedLayout
      ))
      setAccountActionsWidth((currentValue) => (
        currentValue === fallbackLayout.accountActionsWidth ? currentValue : fallbackLayout.accountActionsWidth
      ))
      setBalanceDisplayValue((currentValue) => (
        currentValue === fallbackLayout.balanceDisplayValue ? currentValue : fallbackLayout.balanceDisplayValue
      ))
    }

    updateHeaderLayout()

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateHeaderLayout)
      : null

    if (headerTopRef.current) resizeObserver?.observe(headerTopRef.current)
    if (toggleRef.current) resizeObserver?.observe(toggleRef.current)
    if (accountActionsRef.current) resizeObserver?.observe(accountActionsRef.current)
    window.addEventListener('resize', updateHeaderLayout)
    void document.fonts?.ready.then(() => {
      if (!isDisposed) updateHeaderLayout()
    })

    return () => {
      isDisposed = true
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateHeaderLayout)
    }
  }, [])

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
        usesCompetitionRail ? 'header--competition-rail' : '',
        isLogoCompact ? 'header--compact-logo' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="header__bg-dark" />
      <div className="header__bg-gradient" />

      <div className="header__top" ref={headerTopRef}>
        <div className="header__logo">
          <img src={logoReidoPitaco} alt="Rei do Pitaco" />
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={`header__toggle header__toggle--${activeToggle}`}
          aria-label={`Alternar para ${activeToggle === 'apostas' ? 'cassino' : 'apostas'}`}
          aria-pressed={activeToggle === 'cassino'}
          onClick={handleToggleClick}
        >
          <span
            className={`header__toggle-btn${activeToggle === 'apostas' ? ' header__toggle-btn--active' : ''}`}
          >
            APOSTAS
          </span>
          <span
            className={`header__toggle-btn${activeToggle === 'cassino' ? ' header__toggle-btn--active' : ''}`}
          >
            CASSINO
          </span>
        </button>

        <div
          className="header__account-actions"
          ref={accountActionsRef}
          style={{ width: `${accountActionsWidth}px` }}
        >
          <div className="header__balance" aria-label={`Saldo disponível: ${balanceDisplayOptions[0]}`} ref={balanceRef}>
            <span className="header__balance-label" ref={balanceLabelRef}>Saldo</span>
            <span className="header__balance-value" ref={balanceValueRef}>{balanceDisplayValue}</span>
            <span className="header__balance-measure" aria-hidden="true">
              {balanceDisplayOptions.map((option, index) => (
                <span
                  key={option}
                  className="header__balance-measure-option"
                  ref={(el) => { balanceMeasureRefs.current[index] = el }}
                >
                  {option}
                </span>
              ))}
            </span>
          </div>
          <button type="button" className="header__menu-btn" aria-label="Abrir menu">
            <ListIcon aria-hidden="true" className="header__menu-icon" weight="bold" />
          </button>
        </div>
      </div>

      <SportRail
        variant={railVariant}
        activeSport={activeSport}
        selectedCompetitionId={selectedCompetitionId}
        onSportChange={handleSportRailChange}
        onOpenCompetition={onOpenCompetition}
      />
      {!isSportPage && !usesCompetitionRail && (
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
