import { useState } from 'react'
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

interface SportFilterBarProps {
  selectLabel?: string
  sport?: string | null
  selectedCompetitionId?: string | null
  liveOnly?: boolean
  onSelectCompetition?: (id: string, name: string) => void
  onClearCompetition?: () => void
  onLiveOnlyChange?: (liveOnly: boolean) => void
}

export function SportFilterBar({
  selectLabel = 'Escolha a competição',
  sport,
  selectedCompetitionId,
  liveOnly = false,
  onSelectCompetition,
  onClearCompetition,
  onLiveOnlyChange,
}: SportFilterBarProps) {
  const [showCompeticao, setShowCompeticao] = useState(false)

  const config =
    (sport && competicaoConfigBySport[sport]) || defaultCompeticaoConfig

  const selectedName = selectedCompetitionId
    ? findCompetition(config, selectedCompetitionId)?.name ?? null
    : null

  const handleSelectCompetition = (id: string) => {
    if (!isCompetitionEnabled(id)) return
    const comp = findCompetition(config, id)
    if (!comp) return
    onSelectCompetition?.(id, comp.name)
    setShowCompeticao(false)
  }

  const handleToggleLiveOnly = () => {
    onLiveOnlyChange?.(!liveOnly)
  }

  return (
    <div className="sport-filter-bar">
      <div className="sport-filter-bar__left">
        {selectedName && (
          <button
            type="button"
            className="sport-filter-bar__clear"
            onClick={onClearCompetition}
            aria-label="Limpar competição"
          >
            <img src={iconFecharPeq} alt="" className="sport-filter-bar__clear-icon" />
          </button>
        )}
        <button
          type="button"
          className={`sport-filter-bar__select ${selectedName ? 'sport-filter-bar__select--selected' : ''}`}
          onClick={() => setShowCompeticao(true)}
        >
          <span className="sport-filter-bar__select-label">{selectedName ?? selectLabel}</span>
          <img src={arrowDown} alt="" className="sport-filter-bar__select-icon" />
        </button>
      </div>

      <label className="sport-filter-bar__toggle" onClick={handleToggleLiveOnly}>
        <span
          className={`sport-filter-bar__switch ${liveOnly ? 'sport-filter-bar__switch--on' : ''}`}
          role="switch"
          aria-checked={liveOnly}
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            handleToggleLiveOnly()
          }}
        >
          <span className="sport-filter-bar__switch-thumb" />
        </span>
        <span className="sport-filter-bar__toggle-label">Só Ao Vivo</span>
      </label>

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
