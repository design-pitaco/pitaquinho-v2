import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { CaretRightIcon, SquaresFourIcon } from '@phosphor-icons/react'
import './SportRail.css'

import iconAoVivo from '../../assets/iconAoVivo.png'
import iconDestaque from '../../assets/iconSports/fire.png'
import iconVirtuais from '../../assets/iconVirtuais.png'
import iconBaisebol from '../../assets/iconSports/baseball.png'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconCsgo from '../../assets/iconSports/csgo.png'
import iconDota from '../../assets/iconSports/dota.png'
import iconEbasketball from '../../assets/iconSports/e-basketball.png'
import iconEsoccer from '../../assets/iconSports/e-soccer.png'
import iconF1 from '../../assets/iconSports/f1.png'
import iconFutebol from '../../assets/iconSports/soccer.png'
import iconFutebolAmericano from '../../assets/iconSports/football.png'
import iconHandebol from '../../assets/iconSports/handball.png'
import iconLoL from '../../assets/iconSports/lol.png'
import iconTenis from '../../assets/iconSports/tennis.png'
import iconTenisMesa from '../../assets/iconSports/table-tennis.png'
import iconValorant from '../../assets/iconSports/valorant.png'
import iconVolei from '../../assets/iconSports/volleyball.png'
import { getCompetitionBadge } from '../../data/competitionBadges'
import type { CompetitionLinkTarget } from '../../utils/competitionNavigation'
import { competicaoConfigBySport, isCompetitionEnabled } from '../SportFilterBar/competicaoData'

interface SportItem {
  id: string
  icon: string
  label: string
}

export type SportRailVariant = 'default' | 'competitions' | 'inverted-hierarchy'

interface SportRailBaseItem {
  id: string
  label: string
  icon?: string
}

interface SportRailSportItem extends SportRailBaseItem {
  type: 'sport'
  sportId: string
  clickable: boolean
}

interface SportRailCompetitionItem extends SportRailBaseItem {
  type: 'competition'
  sportId: string
  competitionId: string
  competitionName: string
  clickable: boolean
}

interface SportRailMoreItem extends SportRailBaseItem {
  type: 'more'
}

type SportRailItem = SportRailSportItem | SportRailCompetitionItem | SportRailMoreItem

interface SportRailSection {
  id: string
  className?: string
  items: SportRailItem[]
}

const clickableSports = new Set(['destaques', 'futebol', 'basquete'])

const sports: SportItem[] = [
  { id: 'destaques', icon: iconDestaque, label: 'Destaques' },
  { id: 'futebol', icon: iconFutebol, label: 'Futebol' },
  { id: 'basquete', icon: iconBasquete, label: 'Basquete' },
  { id: 'tenis', icon: iconTenis, label: 'Tênis' },
  { id: 'virtuais', icon: iconVirtuais, label: 'Virtuais' },
  { id: 'f1', icon: iconF1, label: 'F1' },
  { id: 'esoccer', icon: iconEsoccer, label: 'Esoccer' },
  { id: 'futebol-americano', icon: iconFutebolAmericano, label: 'Fut. Americano' },
  { id: 'volei', icon: iconVolei, label: 'Vôlei' },
  { id: 'tenis-mesa', icon: iconTenisMesa, label: 'Tênis Mesa' },
  { id: 'valorant', icon: iconValorant, label: 'Valorant' },
  { id: 'ebasketball', icon: iconEbasketball, label: 'Ebasketball' },
  { id: 'handebol', icon: iconHandebol, label: 'Handebol' },
  { id: 'beisebol', icon: iconBaisebol, label: 'Beisebol' },
  { id: 'dota', icon: iconDota, label: 'Dota 2' },
  { id: 'lol', icon: iconLoL, label: 'LoL' },
]

const defaultRailItems: SportRailItem[] = sports.map((sport) => ({
  ...sport,
  type: 'sport',
  sportId: sport.id,
  clickable: clickableSports.has(sport.id),
}))

const defaultRailSections: SportRailSection[] = [
  { id: 'default', items: defaultRailItems },
]

const competitionRailSections: SportRailSection[] = [
  {
    id: 'destaques',
    className: 'sport-rail__section--lead',
    items: [
      {
        id: 'destaques',
        type: 'sport',
        sportId: 'destaques',
        icon: iconDestaque,
        label: 'Destaques',
        clickable: true,
      },
    ],
  },
  {
    id: 'futebol',
    className: 'sport-rail__section--divided',
    items: [
      {
        id: 'futebol',
        type: 'sport',
        sportId: 'futebol',
        icon: iconFutebol,
        label: 'Futebol',
        clickable: true,
      },
      {
        id: 'competition:fut-brasileiro',
        type: 'competition',
        sportId: 'futebol',
        competitionId: 'fut-brasileiro',
        competitionName: 'Brasileirão Série A',
        icon: getCompetitionBadge('fut-brasileiro', iconFutebol),
        label: 'Brasileirão',
        clickable: true,
      },
      {
        id: 'competition:fut-champions',
        type: 'competition',
        sportId: 'futebol',
        competitionId: 'fut-champions',
        competitionName: 'Champions League',
        icon: getCompetitionBadge('fut-champions', iconFutebol),
        label: 'Champions',
        clickable: true,
      },
      {
        id: 'competition:fut-premier-league',
        type: 'competition',
        sportId: 'futebol',
        competitionId: 'fut-premier-league',
        competitionName: 'Premier League',
        icon: getCompetitionBadge('fut-premier-league', iconFutebol),
        label: 'Premier',
        clickable: true,
      },
      {
        id: 'competition:fut-laliga',
        type: 'competition',
        sportId: 'futebol',
        competitionId: 'fut-laliga',
        competitionName: 'LaLiga',
        icon: getCompetitionBadge('fut-laliga', iconFutebol),
        label: 'La Liga',
        clickable: true,
      },
      {
        id: 'competition:fut-mls',
        type: 'competition',
        sportId: 'futebol',
        competitionId: 'fut-mls',
        competitionName: 'MLS',
        icon: getCompetitionBadge('fut-mls', iconFutebol),
        label: 'MLS',
        clickable: true,
      },
      {
        id: 'competition:fut-bundesliga',
        type: 'competition',
        sportId: 'futebol',
        competitionId: 'fut-bundesliga',
        competitionName: 'Bundesliga',
        icon: getCompetitionBadge('fut-bundesliga', iconFutebol),
        label: 'Bundesliga',
        clickable: true,
      },
    ],
  },
  {
    id: 'basquete',
    className: 'sport-rail__section--divided sport-rail__section--compact',
    items: [
      {
        id: 'basquete',
        type: 'sport',
        sportId: 'basquete',
        icon: iconBasquete,
        label: 'Basquete',
        clickable: true,
      },
      {
        id: 'competition:bsq-nba',
        type: 'competition',
        sportId: 'basquete',
        competitionId: 'bsq-nba',
        competitionName: 'NBA',
        icon: getCompetitionBadge('bsq-nba', iconBasquete),
        label: 'NBA',
        clickable: true,
      },
    ],
  },
  {
    id: 'tenis',
    className: 'sport-rail__section--divided',
    items: [
      {
        id: 'tenis',
        type: 'sport',
        sportId: 'tenis',
        icon: iconTenis,
        label: 'Tênis',
        clickable: false,
      },
      {
        id: 'competition:ten-atp-roma',
        type: 'competition',
        sportId: 'tenis',
        competitionId: 'ten-atp-roma',
        competitionName: 'ATP Roma',
        icon: getCompetitionBadge('ten-atp-roma', iconTenis),
        label: 'ATP Roma',
        clickable: false,
      },
    ],
  },
  {
    id: 'esoccer',
    className: 'sport-rail__section--divided',
    items: [
      {
        id: 'esoccer',
        type: 'sport',
        sportId: 'esoccer',
        icon: iconEsoccer,
        label: 'Esoccer',
        clickable: false,
      },
    ],
  },
  {
    id: 'cs',
    className: 'sport-rail__section--divided',
    items: [
      {
        id: 'cs',
        type: 'sport',
        sportId: 'cs',
        icon: iconCsgo,
        label: 'CS',
        clickable: false,
      },
    ],
  },
  {
    id: 'outros',
    className: 'sport-rail__section--tail',
    items: [
      {
        id: 'outros',
        type: 'more',
        label: 'Outros',
      },
    ],
  },
]

const competitionLabelOverrides: Record<string, string> = {
  'fut-brasileiro': 'Brasileirão',
  'fut-champions': 'Champions',
  'fut-premier-league': 'Premier',
  'fut-laliga': 'La Liga',
  'fut-mls': 'MLS',
  'fut-bundesliga': 'Bundesliga',
  'ten-atp-roma': 'ATP',
}

const invertedHighlightCompetitionOrder = [
  { sportId: 'futebol', competitionId: 'fut-brasileiro' },
  { sportId: 'basquete', competitionId: 'bsq-nba' },
  { sportId: 'futebol', competitionId: 'fut-champions' },
  { sportId: 'futebol', competitionId: 'fut-premier-league' },
  { sportId: 'futebol', competitionId: 'fut-laliga' },
  { sportId: 'futebol', competitionId: 'fut-mls' },
  { sportId: 'futebol', competitionId: 'fut-bundesliga' },
  { sportId: 'tenis', competitionId: 'ten-atp-roma', clickable: false },
]

const getExistingCompetitionItem = (competitionId: string) => {
  const flatItems = competitionRailSections.flatMap((section) => section.items)
  return flatItems.find((item): item is SportRailCompetitionItem => (
    item.type === 'competition' && item.competitionId === competitionId
  ))
}

const createInvertedCompetitionItem = ({
  clickable,
  competitionId,
  sportId,
}: {
  clickable?: boolean
  competitionId: string
  sportId: string
}): SportRailCompetitionItem | null => {
  const existingItem = getExistingCompetitionItem(competitionId)
  if (existingItem) {
    return {
      ...existingItem,
      clickable: clickable ?? existingItem.clickable,
      label: competitionLabelOverrides[competitionId] ?? existingItem.label,
    }
  }

  const sportConfig = competicaoConfigBySport[sportId]
  const competition = sportConfig?.featuredCompetitions.find((item) => item.id === competitionId)
  if (!sportConfig || !competition) return null

  return {
    id: `competition:${competition.id}`,
    type: 'competition',
    sportId,
    competitionId: competition.id,
    competitionName: competition.name,
    icon: getCompetitionBadge(competition.id, sportConfig.sportIcon),
    label: competitionLabelOverrides[competition.id] ?? competition.name,
    clickable: clickable ?? isCompetitionEnabled(competition.id),
  }
}

const getInvertedSportCompetitionItems = (sportId: string) => {
  const sportConfig = competicaoConfigBySport[sportId]
  if (!sportConfig) return []

  return sportConfig.featuredCompetitions
    .map((competition) => createInvertedCompetitionItem({
      sportId,
      competitionId: competition.id,
    }))
    .filter((item): item is SportRailCompetitionItem => !!item)
}

const getInvertedCompetitionRailSections = (activeSportId: string): SportRailSection[] => {
  const items = activeSportId === 'destaques'
    ? invertedHighlightCompetitionOrder
        .map((item) => createInvertedCompetitionItem(item))
        .filter((item): item is SportRailCompetitionItem => !!item)
    : getInvertedSportCompetitionItems(activeSportId)

  return [
    {
      id: `inverted-${activeSportId}`,
      className: 'sport-rail__section--lead sport-rail__section--inverted',
      items,
    },
  ]
}

interface SportRailProps {
  variant?: SportRailVariant
  activeSport?: string | null
  selectedCompetitionId?: string | null
  onSportChange?: (sportId: string) => void
  onOpenCompetition?: (target: CompetitionLinkTarget) => void
}

const setSportRailActiveIndicator = (
  listEl: HTMLDivElement | null,
  activeItem: HTMLElement | null | undefined
) => {
  const activeIcon = activeItem?.querySelector<HTMLElement>('.sport-rail__icon')

  if (!listEl || !activeIcon) {
    listEl?.classList.remove('sport-rail__list--indicator-ready')
    return
  }

  const listRect = listEl.getBoundingClientRect()
  const iconRect = activeIcon.getBoundingClientRect()

  listEl.style.setProperty('--sport-rail-active-x', `${iconRect.left - listRect.left}px`)
  listEl.style.setProperty('--sport-rail-active-y', `${iconRect.top - listRect.top}px`)
  listEl.style.setProperty('--sport-rail-active-width', `${iconRect.width}px`)
  listEl.style.setProperty('--sport-rail-active-height', `${iconRect.height}px`)
  listEl.classList.add('sport-rail__list--indicator-ready')
}

const setSportChipActiveIndicator = (
  chipsListEl: HTMLDivElement | null,
  activeChip: HTMLButtonElement | null | undefined
) => {
  if (!chipsListEl || !activeChip) {
    chipsListEl?.classList.remove('sport-rail__sport-chip-list--indicator-ready')
    return
  }

  const chipsRect = chipsListEl.getBoundingClientRect()
  const chipRect = activeChip.getBoundingClientRect()

  chipsListEl.style.setProperty('--sport-chip-active-x', `${chipRect.left - chipsRect.left}px`)
  chipsListEl.style.setProperty('--sport-chip-active-y', `${chipRect.top - chipsRect.top}px`)
  chipsListEl.style.setProperty('--sport-chip-active-width', `${chipRect.width}px`)
  chipsListEl.style.setProperty('--sport-chip-active-height', `${chipRect.height}px`)
  chipsListEl.classList.add('sport-rail__sport-chip-list--indicator-ready')
}

const getSportRailScrollAnchorId = (item: SportRailItem | undefined) => {
  if (!item) return null
  return item.type === 'competition' ? item.sportId : item.id
}

export function SportRail(props: SportRailProps = {}) {
  if (props.variant === 'inverted-hierarchy') {
    return <InvertedHierarchyRail {...props} />
  }

  return <ClassicSportRail {...props} />
}

function SportChipRow({
  activeSport,
  onSportChange,
}: Pick<SportRailProps, 'activeSport' | 'onSportChange'>) {
  const activeSportId = activeSport ?? 'destaques'
  const chipsContainerRef = useRef<HTMLDivElement>(null)
  const chipsListRef = useRef<HTMLDivElement>(null)
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const scrollSportChipToStart = useCallback((sportId: string, behavior: ScrollBehavior = 'smooth') => {
    const chipEl = chipRefs.current[sportId]
    const containerEl = chipsContainerRef.current
    if (!chipEl || !containerEl) return

    const targetLeft = chipEl.offsetLeft - 12
    const maxScrollLeft = Math.max(containerEl.scrollWidth - containerEl.clientWidth, 0)
    const nextScrollLeft = Math.min(Math.max(targetLeft, 0), maxScrollLeft)

    containerEl.scrollTo({ left: nextScrollLeft, behavior })
  }, [])

  const handleSportClick = (sportId: string, clickable: boolean) => {
    if (!clickable || activeSportId === sportId) return
    scrollSportChipToStart(sportId)
    onSportChange?.(sportId)
  }

  useLayoutEffect(() => {
    setSportChipActiveIndicator(chipsListRef.current, chipRefs.current[activeSportId])
  }, [activeSportId])

  useEffect(() => {
    const chipsEl = chipsListRef.current
    const activeChip = chipRefs.current[activeSportId]
    if (!chipsEl || !activeChip) return

    const updateActiveIndicator = () => {
      setSportChipActiveIndicator(chipsEl, chipRefs.current[activeSportId])
    }
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateActiveIndicator)
      : null

    resizeObserver?.observe(chipsEl)
    resizeObserver?.observe(activeChip)
    window.addEventListener('resize', updateActiveIndicator)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateActiveIndicator)
    }
  }, [activeSportId])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      scrollSportChipToStart(activeSportId)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeSportId, scrollSportChipToStart])

  return (
    <div className="sport-rail__sport-chips" ref={chipsContainerRef} aria-label="Esportes">
      <div className="sport-rail__sport-chip-list" ref={chipsListRef}>
        <span className="sport-rail__sport-chip-indicator" aria-hidden="true" />
        {sports.map((sport) => {
          const isActive = activeSportId === sport.id
          const isClickable = clickableSports.has(sport.id)
          const className = [
            'sport-rail__sport-chip',
            isActive ? 'sport-rail__sport-chip--active' : '',
            !isClickable ? 'sport-rail__sport-chip--disabled' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={sport.id}
              ref={(el) => { chipRefs.current[sport.id] = el }}
              type="button"
              className={className}
              aria-pressed={isActive}
              aria-disabled={!isClickable || isActive}
              onClick={() => handleSportClick(sport.id, isClickable)}
            >
              <img src={sport.icon} alt="" className="sport-rail__sport-chip-icon" />
              <span className="sport-rail__sport-chip-label">{sport.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function InvertedHierarchyRail({
  activeSport,
  onSportChange,
  ...props
}: SportRailProps = {}) {
  return (
    <div className="sport-rail-inverted-hierarchy">
      <SportChipRow activeSport={activeSport} onSportChange={onSportChange} />
      <ClassicSportRail
        {...props}
        activeSport={activeSport}
        onSportChange={onSportChange}
        variant="inverted-hierarchy"
      />
    </div>
  )
}

function ClassicSportRail({
  variant = 'default',
  activeSport,
  selectedCompetitionId,
  onSportChange,
  onOpenCompetition,
}: SportRailProps = {}) {
  const [gap, setGap] = useState(12)
  const [hasMoreItemsLeft, setHasMoreItemsLeft] = useState(false)
  const [hasMoreItemsRight, setHasMoreItemsRight] = useState(false)
  const [hasUserScrolledRail, setHasUserScrolledRail] = useState(false)
  const [isRailScrolledFromStart, setIsRailScrolledFromStart] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLElement | null)[]>([])
  const hasUserScrolledRailRef = useRef(false)
  const isCompetitionVariant = variant === 'competitions'
  const isInvertedHierarchyVariant = variant === 'inverted-hierarchy'
  const isCircularRailVariant = isCompetitionVariant || isInvertedHierarchyVariant
  const activeSportId = activeSport ?? 'destaques'
  const previousActiveSportIdRef = useRef(activeSportId)
  const railSections = useMemo(
    () => {
      if (isInvertedHierarchyVariant) return getInvertedCompetitionRailSections(activeSportId)
      return isCompetitionVariant ? competitionRailSections : defaultRailSections
    },
    [activeSportId, isCompetitionVariant, isInvertedHierarchyVariant]
  )
  const flatRailItems = useMemo(
    () => railSections.flatMap((section) => section.items),
    [railSections]
  )
  const requestedActiveItemId = selectedCompetitionId
    ? `competition:${selectedCompetitionId}`
    : activeSportId
  const activeRailItemId = flatRailItems.some((item) => item.id === requestedActiveItemId)
    ? requestedActiveItemId
    : activeSportId
  const activeRailItemIndex = flatRailItems.findIndex((item) => item.id === activeRailItemId)
  const activeScrollAnchorItemId = isInvertedHierarchyVariant
    ? activeRailItemId
    : getSportRailScrollAnchorId(flatRailItems[activeRailItemIndex])
  const activeScrollAnchorIndex = flatRailItems.findIndex((item) => item.id === activeScrollAnchorItemId)

  const resetRailUserScrollHint = useCallback(() => {
    hasUserScrolledRailRef.current = false
    setHasUserScrolledRail(false)
    setHasMoreItemsLeft(false)
  }, [])

  useEffect(() => {
    const calculateGap = () => {
      const itemWidth = 56
      const paddingLeft = 12
      const viewportWidth = listRef.current?.parentElement?.clientWidth || window.innerWidth

      if (isCircularRailVariant) {
        const fullVisibleItems = 5
        const visibleItems = fullVisibleItems + 0.5
        const calculatedGap = (viewportWidth - paddingLeft - visibleItems * itemWidth) / fullVisibleItems
        setGap(Math.max(0, calculatedGap))
        return
      }

      const minGap = 8
      const maxGap = 24
      const maxFullItems = Math.min(Math.max(flatRailItems.length - 1, 1), 8)

      for (let fullItems = maxFullItems; fullItems >= 1; fullItems--) {
        const calculatedGap = (viewportWidth - paddingLeft - (fullItems + 0.5) * itemWidth) / fullItems
        if (calculatedGap >= minGap && calculatedGap <= maxGap) {
          setGap(calculatedGap)
          return
        }
      }

      setGap(12)
    }

    calculateGap()
    window.addEventListener('resize', calculateGap)
    return () => window.removeEventListener('resize', calculateGap)
  }, [flatRailItems.length, isCircularRailVariant])

  useLayoutEffect(() => {
    setSportRailActiveIndicator(listRef.current, itemRefs.current[activeRailItemIndex])
  }, [activeRailItemIndex, gap])

  useEffect(() => {
    const listEl = listRef.current
    const containerEl = listEl?.parentElement
    if (!isCircularRailVariant || !listEl || !containerEl) return

    let frame: number | null = null

    const updateScrollHint = () => {
      frame = null
      const nextIsRailScrolledFromStart = containerEl.scrollLeft > 2
      const nextHasMoreItemsLeft =
        hasUserScrolledRailRef.current && nextIsRailScrolledFromStart
      const nextHasMoreItemsRight =
        containerEl.scrollLeft + containerEl.clientWidth < containerEl.scrollWidth - 2

      setIsRailScrolledFromStart((current) => (
        current === nextIsRailScrolledFromStart ? current : nextIsRailScrolledFromStart
      ))
      setHasMoreItemsLeft((current) => (
        current === nextHasMoreItemsLeft ? current : nextHasMoreItemsLeft
      ))
      setHasMoreItemsRight((current) => (
        current === nextHasMoreItemsRight ? current : nextHasMoreItemsRight
      ))
    }

    const scheduleUpdate = () => {
      if (frame !== null) return
      frame = window.requestAnimationFrame(updateScrollHint)
    }

    const markUserScrolledRail = () => {
      if (!hasUserScrolledRailRef.current) {
        hasUserScrolledRailRef.current = true
        setHasUserScrolledRail(true)
      }

      scheduleUpdate()
    }

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > 0 || (event.shiftKey && Math.abs(event.deltaY) > 0)) {
        markUserScrolledRail()
      }
    }

    let isPointerDown = false
    const handlePointerDown = () => {
      isPointerDown = true
    }
    const handlePointerMove = () => {
      if (isPointerDown) markUserScrolledRail()
    }
    const handlePointerUp = () => {
      isPointerDown = false
    }

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(scheduleUpdate)
      : null

    scheduleUpdate()
    containerEl.addEventListener('scroll', scheduleUpdate, { passive: true })
    containerEl.addEventListener('wheel', handleWheel, { passive: true })
    containerEl.addEventListener('touchmove', markUserScrolledRail, { passive: true })
    containerEl.addEventListener('pointerdown', handlePointerDown)
    containerEl.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('resize', scheduleUpdate)
    resizeObserver?.observe(containerEl)
    resizeObserver?.observe(listEl)

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      containerEl.removeEventListener('scroll', scheduleUpdate)
      containerEl.removeEventListener('wheel', handleWheel)
      containerEl.removeEventListener('touchmove', markUserScrolledRail)
      containerEl.removeEventListener('pointerdown', handlePointerDown)
      containerEl.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('resize', scheduleUpdate)
      resizeObserver?.disconnect()
    }
  }, [flatRailItems.length, isCircularRailVariant])

  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) return

    const activeItem = itemRefs.current[activeRailItemIndex]
    const updateActiveIndicator = () => {
      setSportRailActiveIndicator(listEl, itemRefs.current[activeRailItemIndex])
    }
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateActiveIndicator)
      : null

    resizeObserver?.observe(listEl)
    if (activeItem) resizeObserver?.observe(activeItem)
    window.addEventListener('resize', updateActiveIndicator)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateActiveIndicator)
    }
  }, [activeRailItemIndex])

  const scrollRailItemToStart = useCallback((itemIndex: number, behavior: ScrollBehavior = 'smooth') => {
    const itemEl = itemRefs.current[itemIndex]
    const containerEl = listRef.current?.parentElement
    if (!itemEl || !containerEl) return

    const itemRect = itemEl.getBoundingClientRect()
    const containerRect = containerEl.getBoundingClientRect()
    const containerStyle = window.getComputedStyle(containerEl)
    const paddingLeft = parseFloat(containerStyle.paddingLeft) || 0
    const targetLeft = containerEl.scrollLeft + itemRect.left - containerRect.left - paddingLeft
    const maxScrollLeft = Math.max(containerEl.scrollWidth - containerEl.clientWidth, 0)
    const nextScrollLeft = Math.min(Math.max(targetLeft, 0), maxScrollLeft)

    containerEl.scrollTo({ left: nextScrollLeft, behavior })
  }, [])

  const scrollRailItemIntoView = useCallback((itemIndex: number) => {
    const itemEl = itemRefs.current[itemIndex]
    const containerEl = listRef.current?.parentElement
    if (!itemEl || !containerEl) return

    const itemLeft = itemEl.offsetLeft
    const itemWidth = itemEl.offsetWidth
    const containerWidth = containerEl.offsetWidth
    const containerScroll = containerEl.scrollLeft
    const padding = 20

    if (itemLeft + itemWidth > containerScroll + containerWidth - padding) {
      containerEl.scrollTo({ left: itemLeft - padding, behavior: 'smooth' })
    } else if (itemLeft < containerScroll + padding) {
      containerEl.scrollTo({ left: itemLeft - padding, behavior: 'smooth' })
    }
  }, [])

  const scrollRailItemToStartById = useCallback((itemId: string | null, behavior: ScrollBehavior = 'smooth') => {
    if (!itemId) return

    const itemIndex = flatRailItems.findIndex((item) => item.id === itemId)
    if (itemIndex < 0) return

    scrollRailItemToStart(itemIndex, behavior)
  }, [flatRailItems, scrollRailItemToStart])

  useEffect(() => {
    if (!isInvertedHierarchyVariant) {
      previousActiveSportIdRef.current = activeSportId
      return
    }

    const hasActiveSportChanged = previousActiveSportIdRef.current !== activeSportId
    previousActiveSportIdRef.current = activeSportId

    if (!hasActiveSportChanged) return

    hasUserScrolledRailRef.current = false
    window.requestAnimationFrame(() => {
      setHasUserScrolledRail(false)
      setHasMoreItemsLeft(false)
    })

    if (activeScrollAnchorIndex >= 0) {
      scrollRailItemToStart(activeScrollAnchorIndex, 'auto')
      return
    }

    listRef.current?.parentElement?.scrollTo({ left: 0, behavior: 'auto' })
  }, [
    activeScrollAnchorIndex,
    activeSportId,
    isInvertedHierarchyVariant,
    scrollRailItemToStart,
  ])

  useEffect(() => {
    if (isCircularRailVariant) {
      if (activeScrollAnchorIndex < 0) return
      scrollRailItemToStart(activeScrollAnchorIndex)
      return
    }

    if (activeRailItemIndex < 0) return
    scrollRailItemIntoView(activeRailItemIndex)
  }, [
    activeRailItemIndex,
    activeScrollAnchorIndex,
    gap,
    isCircularRailVariant,
    scrollRailItemIntoView,
    scrollRailItemToStart,
  ])

  const isSportPage = !!activeSport && activeSport !== 'destaques'
  const liveSports = ['futebol', 'basquete']

  const getRailItemIndex = (item: SportRailItem) =>
    flatRailItems.findIndex((railItem) => railItem.id === item.id)

  const handleItemClick = (item: SportRailItem) => {
    const itemIndex = getRailItemIndex(item)
    const isActive = activeRailItemIndex === itemIndex

    if (isActive) return

    if (isCircularRailVariant) {
      resetRailUserScrollHint()
      scrollRailItemToStartById(
        isInvertedHierarchyVariant ? item.id : getSportRailScrollAnchorId(item),
      )
    }

    if (item.type === 'sport') {
      if (item.clickable) onSportChange?.(item.sportId)
      return
    }

    if (item.type === 'competition' && item.clickable) {
      onOpenCompetition?.({
        id: item.competitionId,
        name: item.competitionName,
        sport: item.sportId,
      })
    }
  }

  const renderIcon = (item: SportRailItem, isActive: boolean) => (
    <div className={`sport-rail__icon${isActive ? ' sport-rail__icon--active' : ''}`}>
      {item.type === 'more' ? (
        <SquaresFourIcon
          aria-hidden="true"
          className="sport-rail__more-icon"
          weight="fill"
        />
      ) : (
        <>
          <img src={item.icon} alt={item.label} />
          {liveSports.includes(item.id) && (
            <span className="sport-rail__live-indicator" aria-label="Ao vivo">
              <img src={iconAoVivo} alt="" className="sport-rail__live-icon" />
            </span>
          )}
        </>
      )}
    </div>
  )

  const renderItem = (item: SportRailItem) => {
    const itemIndex = getRailItemIndex(item)
    const isActive = activeRailItemIndex === itemIndex
    const isClickable = item.type !== 'more' && item.clickable
    const isStatic = isCircularRailVariant && (!isClickable || isActive)
    const className = [
      'sport-rail__item',
      isActive ? 'sport-rail__item--active' : '',
      isStatic ? 'sport-rail__item--static' : '',
    ]
      .filter(Boolean)
      .join(' ')

    if (isStatic) {
      return (
        <div
          key={item.id}
          ref={(el) => { itemRefs.current[itemIndex] = el }}
          className={className}
          aria-disabled="true"
        >
          {renderIcon(item, isActive)}
          <span className="sport-rail__label">{item.label}</span>
        </div>
      )
    }

    return (
      <button
        key={item.id}
        ref={(el) => { itemRefs.current[itemIndex] = el }}
        type="button"
        className={className}
        aria-pressed={isActive}
        onClick={() => handleItemClick(item)}
      >
        {renderIcon(item, isActive)}
        <span className="sport-rail__label">{item.label}</span>
      </button>
    )
  }

  const railListStyle = isCircularRailVariant
    ? { '--sport-rail-competition-item-gap': `${gap}px` } as CSSProperties
    : { gap: `${gap}px` }
  const railClasses = [
    'sport-rail',
    isSportPage ? 'sport-rail--sport-active' : '',
    isCircularRailVariant ? 'sport-rail--competitions' : '',
    isInvertedHierarchyVariant ? 'sport-rail--inverted-hierarchy' : '',
    isCircularRailVariant && hasMoreItemsLeft ? 'sport-rail--show-left-fade' : '',
    isCircularRailVariant && hasMoreItemsRight ? 'sport-rail--show-right-fade' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const railShellClasses = [
    'sport-rail-shell',
    isCircularRailVariant ? 'sport-rail-shell--competitions' : '',
    isInvertedHierarchyVariant ? 'sport-rail-shell--inverted-hierarchy' : '',
    isCircularRailVariant && !isInvertedHierarchyVariant && !hasUserScrolledRail && !isRailScrolledFromStart && hasMoreItemsRight
      ? 'sport-rail-shell--show-right-arrow'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={railShellClasses}>
      <div className={railClasses}>
        <div
          className={`sport-rail__list${isCircularRailVariant ? ' sport-rail__list--competitions' : ''}`}
          ref={listRef}
          style={railListStyle}
        >
          <span className="sport-rail__active-indicator" aria-hidden="true" />
          {isCircularRailVariant
            ? railSections.map((section) => (
                <div
                  key={section.id}
                  className={`sport-rail__section${section.className ? ` ${section.className}` : ''}`}
                >
                  {section.items.map(renderItem)}
                </div>
              ))
            : defaultRailItems.map(renderItem)}
        </div>
      </div>
      {isCircularRailVariant && !isInvertedHierarchyVariant && (
        <span className="sport-rail__scroll-arrow" aria-hidden="true">
          <CaretRightIcon className="sport-rail__scroll-arrow-icon" weight="bold" />
        </span>
      )}
    </div>
  )
}
