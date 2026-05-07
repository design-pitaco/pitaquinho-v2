import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './SportRail.css'

import iconAoVivo from '../../assets/iconAoVivo.png'
import iconDestaque from '../../assets/iconDestaque.png'
import iconFutebol from '../../assets/iconFutebol.png'
import iconBasquete from '../../assets/iconBasquete.png'
import iconVirtuais from '../../assets/iconVirtuais.png'
import iconF1 from '../../assets/iconF1.png'
import iconTenis from '../../assets/iconTenis.png'
import iconEsoccer from '../../assets/iconEsoccer.png'
import iconFutebolAmericano from '../../assets/iconFutebolAmericano.png'
import iconVolei from '../../assets/iconVolei.png'
import iconTenisMesa from '../../assets/iconTenisMesa.png'
import iconValorant from '../../assets/iconValorant.png'
import iconEbasketball from '../../assets/iconEbasketball.png'
import iconHandebol from '../../assets/iconHandebol.png'
import iconBaisebol from '../../assets/iconBaisebol.png'
import iconDota from '../../assets/iconDota.png'
import iconLoL from '../../assets/iconLoL.png'

interface SportItem {
  id: string
  icon: string
  label: string
}

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

interface SportRailProps {
  activeSport?: string | null
  onSportChange?: (sportId: string) => void
}

const setSportRailActiveIndicator = (
  listEl: HTMLDivElement | null,
  activeItem: HTMLButtonElement | null | undefined
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

export function SportRail({ activeSport, onSportChange }: SportRailProps = {}) {
  const [gap, setGap] = useState(12)
  const listRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const activeSportId = activeSport ?? 'destaques'

  useEffect(() => {
    const calculateGap = () => {
      const itemWidth = 56
      const paddingLeft = 12
      const viewportWidth = window.innerWidth
      const minGap = 8
      const maxGap = 24

      for (let fullItems = 8; fullItems >= 1; fullItems--) {
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
  }, [])

  useLayoutEffect(() => {
    const activeIndex = sports.findIndex((sport) => sport.id === activeSportId)
    setSportRailActiveIndicator(listRef.current, itemRefs.current[activeIndex])
  }, [activeSportId, gap])

  useEffect(() => {
    const listEl = listRef.current
    if (!listEl) return

    const activeIndex = sports.findIndex((sport) => sport.id === activeSportId)
    const activeItem = itemRefs.current[activeIndex]
    const updateActiveIndicator = () => {
      setSportRailActiveIndicator(listEl, itemRefs.current[activeIndex])
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
  }, [activeSportId])

  useEffect(() => {
    const index = sports.findIndex((s) => s.id === activeSportId)
    const itemEl = itemRefs.current[index]
    const containerEl = listRef.current?.parentElement
    if (itemEl && containerEl) {
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
    }
  }, [activeSportId])

  const isSportPage = !!activeSport && activeSport !== 'destaques'
  const liveSports = ['futebol', 'basquete']

  return (
    <div className={`sport-rail${isSportPage ? ' sport-rail--sport-active' : ''}`}>
      <div
        className="sport-rail__list"
        ref={listRef}
        style={{ gap: `${gap}px` }}
      >
        <span className="sport-rail__active-indicator" aria-hidden="true" />
        {sports.map((sport, index) => {
          const isActive = activeSportId === sport.id
          return (
            <button
              key={sport.id}
              ref={(el) => { itemRefs.current[index] = el }}
              className={`sport-rail__item${isActive ? ' sport-rail__item--active' : ''}`}
              onClick={() => {
                const clickable = ['destaques', 'futebol', 'basquete']
                if (clickable.includes(sport.id)) onSportChange?.(sport.id)
              }}
            >
              <div className={`sport-rail__icon${isActive ? ' sport-rail__icon--active' : ''}`}>
                <img src={sport.icon} alt={sport.label} />
                {liveSports.includes(sport.id) && (
                  <span className="sport-rail__live-indicator" aria-label="Ao vivo">
                    <img src={iconAoVivo} alt="" className="sport-rail__live-icon" />
                  </span>
                )}
              </div>
              <span className="sport-rail__label">{sport.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
