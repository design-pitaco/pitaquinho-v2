import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { CaretDownIcon, XIcon } from '@phosphor-icons/react'
import './SportFilterBar.css'
import { CompeticaoBottomSheet } from '../BottomSheet/CompeticaoBottomSheet'
import {
  competicaoConfigBySport,
  defaultCompeticaoConfig,
  findCompetition,
  isCompetitionEnabled,
} from './competicaoData'
import { getCompetitionBadge } from '../../data/competitionBadges'

interface SportFilterBarProps {
  sport?: string | null
  selectedCompetitionId?: string | null
  onSelectCompetition?: (id: string, name: string) => void
  onClearCompetition?: () => void
}

const setSportFilterActiveIndicator = (
  chipsListEl: HTMLDivElement | null,
  activeChip: HTMLButtonElement | null | undefined
) => {
  if (!chipsListEl || !activeChip) {
    chipsListEl?.classList.remove('sport-filter-bar__chips--indicator-ready')
    return
  }

  const listRect = chipsListEl.getBoundingClientRect()
  const chipRect = activeChip.getBoundingClientRect()

  chipsListEl.style.setProperty('--sport-filter-active-x', `${chipRect.left - listRect.left}px`)
  chipsListEl.style.setProperty('--sport-filter-active-y', `${chipRect.top - listRect.top}px`)
  chipsListEl.style.setProperty('--sport-filter-active-width', `${chipRect.width}px`)
  chipsListEl.style.setProperty('--sport-filter-active-height', `${chipRect.height}px`)
  chipsListEl.classList.add('sport-filter-bar__chips--indicator-ready')
}

export function SportFilterBar({
  sport,
  selectedCompetitionId,
  onSelectCompetition,
  onClearCompetition,
}: SportFilterBarProps) {
  const [showCompeticao, setShowCompeticao] = useState(false)
  const chipsContainerRef = useRef<HTMLDivElement>(null)
  const chipsListRef = useRef<HTMLDivElement>(null)
  const clearSlotRef = useRef<HTMLSpanElement>(null)
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({})

  const config =
    (sport && competicaoConfigBySport[sport]) || defaultCompeticaoConfig

  const selectedCompetition = selectedCompetitionId
    ? findCompetition(config, selectedCompetitionId)?.name ?? null
    : null
  const featuredCompetitions = config.featuredCompetitions.slice(0, 4)
  const isSelectedCompetition = (id: string, name: string) =>
    !!selectedCompetitionId &&
    (selectedCompetitionId === id || selectedCompetition === name)
  const selectedInFeatured = featuredCompetitions.some((competition) =>
    isSelectedCompetition(competition.id, competition.name)
  )
  const chipCompetitions =
    selectedCompetitionId && selectedCompetition && !selectedInFeatured
      ? [
          ...featuredCompetitions.slice(0, 3),
          { id: selectedCompetitionId, name: selectedCompetition },
        ]
      : featuredCompetitions
  const activeChipId =
    chipCompetitions.find((competition) => isSelectedCompetition(competition.id, competition.name))?.id ?? null
  const firstChipId = chipCompetitions[0]?.id ?? null
  const hasClearCompetition = !!selectedCompetitionId && !!onClearCompetition

  const handleSelectCompetition = (id: string) => {
    if (!isCompetitionEnabled(id)) return
    const comp = findCompetition(config, id)
    if (!comp) return
    onSelectCompetition?.(id, comp.name)
    setShowCompeticao(false)
  }

  const scrollChipIntoView = useCallback((chipEl: HTMLButtonElement | null) => {
    const containerEl = chipsContainerRef.current
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
  }, [])

  const resetChipScroll = useCallback(() => {
    chipsContainerRef.current?.scrollTo({ left: 0, behavior: 'auto' })
  }, [])

  const handleChipSelect = (id: string) => {
    if (id === firstChipId) {
      resetChipScroll()
      handleSelectCompetition(id)
      window.requestAnimationFrame(resetChipScroll)
      return
    }

    scrollChipIntoView(chipRefs.current[id])
    handleSelectCompetition(id)
  }

  const handleClearCompetition = () => {
    resetChipScroll()
    onClearCompetition?.()

    window.requestAnimationFrame(resetChipScroll)
  }

  useLayoutEffect(() => {
    setSportFilterActiveIndicator(
      chipsListRef.current,
      activeChipId ? chipRefs.current[activeChipId] : null
    )
  }, [activeChipId])

  useEffect(() => {
    const chipsListEl = chipsListRef.current
    if (!chipsListEl) return

    const activeChip = activeChipId ? chipRefs.current[activeChipId] : null
    const updateActiveIndicator = () => {
      setSportFilterActiveIndicator(
        chipsListEl,
        activeChipId ? chipRefs.current[activeChipId] : null
      )
    }
    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateActiveIndicator)
      : null

    resizeObserver?.observe(chipsListEl)
    if (activeChip) resizeObserver?.observe(activeChip)
    window.addEventListener('resize', updateActiveIndicator)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateActiveIndicator)
    }
  }, [activeChipId])

  useEffect(() => {
    const clearSlotEl = clearSlotRef.current
    if (!clearSlotEl) return

    const updateIndicator = () => {
      setSportFilterActiveIndicator(
        chipsListRef.current,
        activeChipId ? chipRefs.current[activeChipId] : null
      )
    }
    let frame: number | null = null
    let settleTimer: number | null = null

    if (hasClearCompetition) {
      frame = window.requestAnimationFrame(() => {
        clearSlotEl.classList.add('sport-filter-bar__clear-slot--visible')
        updateIndicator()
        settleTimer = window.setTimeout(updateIndicator, 240)
      })
    } else {
      clearSlotEl.classList.remove('sport-filter-bar__clear-slot--visible')
      updateIndicator()
      settleTimer = window.setTimeout(updateIndicator, 240)
    }

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      if (settleTimer !== null) window.clearTimeout(settleTimer)
    }
  }, [activeChipId, hasClearCompetition])

  useEffect(() => {
    if (!activeChipId) {
      resetChipScroll()
      return
    }

    const frame = window.requestAnimationFrame(() => {
      scrollChipIntoView(chipRefs.current[activeChipId])
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeChipId, resetChipScroll, scrollChipIntoView])

  return (
    <div className="sport-filter-bar" ref={chipsContainerRef}>
      <div
        className="sport-filter-bar__chips"
        ref={chipsListRef}
        aria-label={`Campeonatos de ${config.sportLabel}`}
      >
        <span className="sport-filter-bar__active-indicator" aria-hidden="true" />
        <span
          ref={clearSlotRef}
          className="sport-filter-bar__clear-slot"
          aria-hidden={!hasClearCompetition}
        >
          <button
            type="button"
            className="sport-filter-bar__clear"
            onClick={handleClearCompetition}
            aria-label="Limpar competição"
            disabled={!hasClearCompetition}
            tabIndex={hasClearCompetition ? 0 : -1}
          >
            <XIcon aria-hidden="true" className="sport-filter-bar__clear-icon" weight="bold" />
          </button>
        </span>

        {chipCompetitions.map((competition) => {
          const active = isSelectedCompetition(competition.id, competition.name)
          return (
            <button
              key={competition.id}
              ref={(el) => { chipRefs.current[competition.id] = el }}
              type="button"
              className={`sport-filter-bar__chip${active ? ' sport-filter-bar__chip--active' : ''}`}
              aria-pressed={active}
              onClick={() => handleChipSelect(competition.id)}
            >
              <img
                src={getCompetitionBadge(competition.id, config.sportIcon)}
                alt=""
                className="sport-filter-bar__competition-icon"
              />
              <span className="sport-filter-bar__chip-label">{competition.name}</span>
            </button>
          )
        })}

        <button
          type="button"
          className="sport-filter-bar__chip sport-filter-bar__chip--more"
          onClick={() => setShowCompeticao(true)}
          aria-label="Escolha a competição"
        >
          <CaretDownIcon aria-hidden="true" className="sport-filter-bar__chip-icon" weight="bold" />
        </button>
      </div>

      <CompeticaoBottomSheet
        isOpen={showCompeticao}
        onClose={() => setShowCompeticao(false)}
        sportLabel={config.sportLabel}
        sportIcon={config.sportIcon}
        topCompetitions={config.topCompetitions}
        countries={config.countries}
        onSelectCompetition={handleSelectCompetition}
        isCompetitionEnabled={isCompetitionEnabled}
      />
    </div>
  )
}
