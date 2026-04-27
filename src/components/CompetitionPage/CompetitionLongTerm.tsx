import { useState } from 'react'
import './CompetitionLongTerm.css'
import setaLink from '../../assets/setaLink.png'

import type { LongTermOdd } from './competitionData'

interface CompetitionLongTermProps {
  tabs: { id: string; label: string }[]
  oddsByTab: Record<string, LongTermOdd[]>
}

export function CompetitionLongTerm({ tabs, oddsByTab }: CompetitionLongTermProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? '')
  const odds = oddsByTab[activeTab] ?? []

  return (
    <section className="competition-longterm">
      <div className="competition-longterm__header">
        <span>Longo Prazo</span>
      </div>

      <div className="competition-longterm__chips">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`competition-longterm__chip ${activeTab === tab.id ? 'competition-longterm__chip--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="competition-longterm__list">
        {odds.map((row) => (
          <button key={row.id} type="button" className="competition-longterm__row">
            {row.icon ? (
              <img src={row.icon} alt="" className="competition-longterm__row-icon" />
            ) : (
              <span className="competition-longterm__row-icon competition-longterm__row-icon--placeholder" />
            )}
            <span className="competition-longterm__row-copy">
              <span className="competition-longterm__row-label">{row.label}</span>
              <span className="competition-longterm__row-market">{row.market}</span>
            </span>
            <span className="competition-longterm__row-odd">{row.odd}</span>
            <img src={setaLink} alt="" className="competition-longterm__row-arrow" />
          </button>
        ))}
      </div>
    </section>
  )
}
