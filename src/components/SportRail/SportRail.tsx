import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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

interface SportItem {
  id: string
  icon: string
  label: string
}

export type SportRailVariant = 'default' | 'competitions'

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

const getSportRailScrollAnchorId = (item: SportRailItem | undefined) => {
  if (!item) return null
  return item.type === 'competition' ? item.sportId : item.id
}

export function SportRail({
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
  const railSections = useMemo(
    () => isCompetitionVariant ? competitionRailSections : defaultRailSections,
    [isCompetitionVariant]
  )
  const flatRailItems = useMemo(
    () => railSections.flatMap((section) => section.items),
    [railSections]
  )
  const activeSportId = activeSport ?? 'destaques'
  const requestedActiveItemId = selectedCompetitionId
    ? `competition:${selectedCompetitionId}`
    : activeSportId
  const activeRailItemId = flatRailItems.some((item) => item.id === requestedActiveItemId)
    ? requestedActiveItemId
    : activeSportId
  const activeRailItemIndex = flatRailItems.findIndex((item) => item.id === activeRailItemId)
  const activeScrollAnchorItemId = getSportRailScrollAnchorId(flatRailItems[activeRailItemIndex])
  const activeScrollAnchorIndex = flatRailItems.findIndex((item) => item.id === activeScrollAnchorItemId)

  const resetRailUserScrollHint = useCallback(() => {
    hasUserScrolledRailRef.current = false
    setHasUserScrolledRail(false)
    setHasMoreItemsLeft(false)
  }, [])

  useEffect(() => {
    if (isCompetitionVariant) {
      return
    }

    const calculateGap = () => {
      const itemWidth = 56
      const paddingLeft = 12
      const viewportWidth = listRef.current?.parentElement?.clientWidth || window.innerWidth
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
  }, [flatRailItems.length, isCompetitionVariant])

  useLayoutEffect(() => {
    setSportRailActiveIndicator(listRef.current, itemRefs.current[activeRailItemIndex])
  }, [activeRailItemIndex, gap])

  useEffect(() => {
    const listEl = listRef.current
    const containerEl = listEl?.parentElement
    if (!isCompetitionVariant || !listEl || !containerEl) return

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
  }, [flatRailItems.length, isCompetitionVariant])

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
    if (isCompetitionVariant) {
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
    isCompetitionVariant,
    scrollRailItemIntoView,
    scrollRailItemToStart,
  ])

  const isSportPage = !!activeSport && activeSport !== 'destaques'
  const liveSports = ['futebol', 'basquete']

  const getRailItemIndex = (item: SportRailItem) =>
    flatRailItems.findIndex((railItem) => railItem.id === item.id)

  const handleItemClick = (item: SportRailItem) => {
    if (isCompetitionVariant) {
      resetRailUserScrollHint()
      scrollRailItemToStartById(getSportRailScrollAnchorId(item))
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
    const isStatic = isCompetitionVariant && !isClickable
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

  const railListStyle = isCompetitionVariant ? undefined : { gap: `${gap}px` }
  const railClasses = [
    'sport-rail',
    isSportPage ? 'sport-rail--sport-active' : '',
    isCompetitionVariant ? 'sport-rail--competitions' : '',
    isCompetitionVariant && hasMoreItemsLeft ? 'sport-rail--show-left-fade' : '',
    isCompetitionVariant && hasMoreItemsRight ? 'sport-rail--show-right-fade' : '',
  ]
    .filter(Boolean)
    .join(' ')
  const railShellClasses = [
    'sport-rail-shell',
    isCompetitionVariant ? 'sport-rail-shell--competitions' : '',
    isCompetitionVariant && !hasUserScrolledRail && !isRailScrolledFromStart && hasMoreItemsRight
      ? 'sport-rail-shell--show-right-arrow'
      : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={railShellClasses}>
      <div className={railClasses}>
        <div
          className={`sport-rail__list${isCompetitionVariant ? ' sport-rail__list--competitions' : ''}`}
          ref={listRef}
          style={railListStyle}
        >
          <span className="sport-rail__active-indicator" aria-hidden="true" />
          {isCompetitionVariant
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
      {isCompetitionVariant && (
        <span className="sport-rail__scroll-arrow" aria-hidden="true">
          <CaretRightIcon className="sport-rail__scroll-arrow-icon" weight="bold" />
        </span>
      )}
    </div>
  )
}
