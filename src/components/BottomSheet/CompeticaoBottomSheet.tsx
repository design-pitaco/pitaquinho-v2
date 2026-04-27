import { useMemo, useState } from 'react'
import { BottomSheet } from './BottomSheet'
import './CompeticaoBottomSheet.css'

import iconBusca from '../../assets/iconBuscaHeader.svg'
import iconAccordion from '../../assets/iconAccordion.png'
import setaLink from '../../assets/setaLink.png'

export interface Competition {
  id: string
  name: string
}

export interface CompetitionCountry {
  id: string
  name: string
  flag: string
  competitions: Competition[]
}

interface CompeticaoBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  sportLabel: string
  sportIcon: string
  topCompetitions: Competition[]
  countries: CompetitionCountry[]
  onSelectCompetition?: (competitionId: string) => void
  isCompetitionEnabled?: (competitionId: string) => boolean
}

export function CompeticaoBottomSheet({
  isOpen,
  onClose,
  sportLabel,
  sportIcon,
  topCompetitions,
  countries,
  onSelectCompetition,
  isCompetitionEnabled = () => true,
}: CompeticaoBottomSheetProps) {
  const [search, setSearch] = useState('')
  const [topOpen, setTopOpen] = useState(true)
  const [openCountries, setOpenCountries] = useState<string[]>([])

  const normalized = search.trim().toLowerCase()

  const filteredTop = useMemo(() => {
    if (!normalized) return topCompetitions
    return topCompetitions.filter((c) => c.name.toLowerCase().includes(normalized))
  }, [normalized, topCompetitions])

  const filteredCountries = useMemo(() => {
    if (!normalized) return countries
    return countries
      .map((country) => {
        const matchesCountry = country.name.toLowerCase().includes(normalized)
        const matchesComps = country.competitions.filter((c) =>
          c.name.toLowerCase().includes(normalized)
        )
        if (matchesCountry) return country
        if (matchesComps.length > 0) {
          return { ...country, competitions: matchesComps }
        }
        return null
      })
      .filter(Boolean) as CompetitionCountry[]
  }, [normalized, countries])

  const toggleCountry = (id: string) => {
    setOpenCountries((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    )
  }

  const handleSelect = (id: string) => {
    if (!isCompetitionEnabled(id)) return
    onSelectCompetition?.(id)
  }

  const footer = (
    <button type="button" className="competicao-bs__footer-btn" onClick={onClose}>
      Fechar
    </button>
  )

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      blurBackdrop
      bodyClassName="competicao-bs__body"
      footerContent={footer}
    >
      <h2 className="competicao-bs__title">Selecione uma competição</h2>

      <div className="competicao-bs__search">
        <div className="competicao-bs__search-icon-box">
          <img src={iconBusca} alt="" className="competicao-bs__search-icon" />
        </div>
        <div className="competicao-bs__search-input-box">
          <input
            type="text"
            className="competicao-bs__search-input"
            placeholder="Busque por uma competição"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredTop.length > 0 && (
        <div className={`competicao-bs__group${topOpen ? ' competicao-bs__group--open' : ''}`}>
          <button
            type="button"
            className={`competicao-bs__group-header ${topOpen ? 'competicao-bs__group-header--open' : ''}`}
            onClick={() => setTopOpen((v) => !v)}
          >
            <img src={sportIcon} alt={sportLabel} className="competicao-bs__group-icon" />
            <span className="competicao-bs__group-label">Principais escolhas</span>
            <img
              src={iconAccordion}
              alt=""
              className={`competicao-bs__group-chevron ${topOpen ? 'competicao-bs__group-chevron--open' : ''}`}
            />
          </button>

          {topOpen && (
            <ul className="competicao-bs__list">
              {filteredTop.map((c) => {
                const enabled = isCompetitionEnabled(c.id)
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={`competicao-bs__row ${enabled ? '' : 'competicao-bs__row--disabled'}`}
                      onClick={() => handleSelect(c.id)}
                      disabled={!enabled}
                    >
                      <span className="competicao-bs__row-label">{c.name}</span>
                      {enabled && <img src={setaLink} alt="" className="competicao-bs__row-arrow" />}
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      <ul className="competicao-bs__countries">
        {filteredCountries.map((country) => {
          const isOpenCountry = openCountries.includes(country.id) || !!normalized
          return (
            <li key={country.id} className="competicao-bs__country">
              <button
                type="button"
                className="competicao-bs__country-header"
                onClick={() => toggleCountry(country.id)}
              >
                <img src={country.flag} alt="" className="competicao-bs__country-flag" />
                <span className="competicao-bs__country-label">{country.name}</span>
                <img
                  src={iconAccordion}
                  alt=""
                  className={`competicao-bs__country-chevron ${isOpenCountry ? 'competicao-bs__country-chevron--open' : ''}`}
                />
              </button>

              {isOpenCountry && country.competitions.length > 0 && (
                <ul className="competicao-bs__list competicao-bs__list--nested">
                  {country.competitions.map((c) => {
                    const enabled = isCompetitionEnabled(c.id)
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          className={`competicao-bs__row ${enabled ? '' : 'competicao-bs__row--disabled'}`}
                          onClick={() => handleSelect(c.id)}
                          disabled={!enabled}
                        >
                          <span className="competicao-bs__row-label">{c.name}</span>
                          {enabled && <img src={setaLink} alt="" className="competicao-bs__row-arrow" />}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {filteredTop.length === 0 && filteredCountries.length === 0 && (
        <p className="competicao-bs__empty">
          Nenhuma competição encontrada para "{search}".
        </p>
      )}
    </BottomSheet>
  )
}
