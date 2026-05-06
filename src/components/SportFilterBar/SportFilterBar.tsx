import { useCallback, useEffect, useRef, useState } from 'react'
import './SportFilterBar.css'
import arrowDown from '../../assets/arrowDown.png'
import iconFecharPeq from '../../assets/iconFecharPeq.svg'
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

export function SportFilterBar({
  sport,
  selectedCompetitionId,
  onSelectCompetition,
  onClearCompetition,
}: SportFilterBarProps) {
  const [showCompeticao, setShowCompeticao] = useState(false)
  const chipsContainerRef = useRef<HTMLDivElement>(null)
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
    scrollChipIntoView(chipRefs.current[id])
    handleSelectCompetition(id)
  }

  const handleClearCompetition = () => {
    resetChipScroll()
    onClearCompetition?.()

    window.requestAnimationFrame(resetChipScroll)
  }

  useEffect(() => {
    if (!selectedCompetitionId) {
      resetChipScroll()
      return
    }

    const frame = window.requestAnimationFrame(() => {
      scrollChipIntoView(chipRefs.current[selectedCompetitionId])
    })

    return () => window.cancelAnimationFrame(frame)
  }, [resetChipScroll, scrollChipIntoView, selectedCompetitionId])

  return (
    <div className="sport-filter-bar" ref={chipsContainerRef}>
      <div className="sport-filter-bar__chips" aria-label={`Campeonatos de ${config.sportLabel}`}>
        {selectedCompetitionId && onClearCompetition && (
          <button
            type="button"
            className="sport-filter-bar__clear"
            onClick={handleClearCompetition}
            aria-label="Limpar competição"
          >
            <img src={iconFecharPeq} alt="" className="sport-filter-bar__clear-icon" />
          </button>
        )}

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
          <img src={arrowDown} alt="" className="sport-filter-bar__chip-icon" />
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
