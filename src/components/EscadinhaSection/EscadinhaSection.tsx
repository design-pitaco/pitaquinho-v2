import { useState, useRef } from 'react'
import './EscadinhaSection.css'

import iconDuvida from '../../assets/iconDuvida.png'
import bgEscadinhaJoao from '../../assets/bgEscadinhaJoao.png'
import bgEscadinhaMbape from '../../assets/bgEscadinhaMbape.png'
import escudoChelsea from '../../assets/escudoChelsea.png'
import escudoArsenal from '../../assets/escudoArsenal.png'
import escudoReal from '../../assets/escudoReal.png'
import escudoBarca from '../../assets/escudoBarca.png'
import iconEstatistica from '../../assets/iconEstatistica.png'

interface StatChip {
  id: string
  label: string
}

interface SliderValue {
  value: string
  odd?: string
  isActive?: boolean
}

interface EscadinhaCard {
  id: string
  homeTeam: { name: string; icon: string }
  awayTeam: { name: string; icon: string }
  player: {
    name: string
    position: string
    team: string
    image: string
  }
  background: string
  stats: StatChip[]
  activeStatId: string
  sliderValues: SliderValue[]
  maxOdd: string
}

const escadinhaCards: EscadinhaCard[] = [
  {
    id: '1',
    homeTeam: { name: 'Chelsea', icon: escudoChelsea },
    awayTeam: { name: 'Arsenal', icon: escudoArsenal },
    player: {
      name: 'João Pedro',
      position: 'Atacante',
      team: 'Chelsea',
      image: iconEstatistica,
    },
    background: bgEscadinhaJoao,
    stats: [
      { id: 'finalizacoes-gol', label: 'Finalizações ao gol' },
      { id: 'finalizacoes-total', label: 'Finalizações total' },
      { id: 'faltas', label: 'Faltas' },
      { id: 'desarmes', label: 'Desarmes' },
    ],
    activeStatId: 'finalizacoes-gol',
    sliderValues: [
      { value: '1' },
      { value: '2' },
      { value: '3', odd: '1.22x', isActive: true },
      { value: '4', odd: '1.79x', isActive: true },
      { value: '5', odd: '2.31x', isActive: true },
      { value: '6', odd: '2.43x', isActive: true },
      { value: '7+', odd: '2.88x', isActive: true },
      { value: '8' },
      { value: '9' },
      { value: '10' },
    ],
    maxOdd: '2.88x',
  },
  {
    id: '2',
    homeTeam: { name: 'Real Madrid', icon: escudoReal },
    awayTeam: { name: 'Barcelona', icon: escudoBarca },
    player: {
      name: 'Mbappé',
      position: 'Atacante',
      team: 'Real Madrid',
      image: iconEstatistica,
    },
    background: bgEscadinhaMbape,
    stats: [
      { id: 'finalizacoes-gol', label: 'Finalizações ao gol' },
      { id: 'finalizacoes-totais', label: 'Finalizações totais' },
      { id: 'faltas', label: 'Faltas' },
      { id: 'desarmes', label: 'Desarmes' },
    ],
    activeStatId: 'finalizacoes-gol',
    sliderValues: [
      { value: '1' },
      { value: '2', odd: '1.78x', isActive: true },
      { value: '3', odd: '2.13x', isActive: true },
      { value: '4+', odd: '2.56x', isActive: true },
      { value: '5' },
    ],
    maxOdd: '2.56x',
  },
]

export function EscadinhaSection() {
  const [isDragging, setIsDragging] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  // Centraliza no card mais próximo com sensibilidade ao arraste
  const snapToNearestCard = (dragDelta: number = 0) => {
    if (!scrollRef.current) return
    const cardWidth = 304 + 8 // width + gap
    const currentScroll = scrollRef.current.scrollLeft
    const currentIndex = currentScroll / cardWidth
    
    let targetIndex: number
    // Se arrastou mais que 30px, muda para o próximo/anterior
    if (dragDelta > 30) {
      targetIndex = Math.ceil(currentIndex)
    } else if (dragDelta < -30) {
      targetIndex = Math.floor(currentIndex)
    } else {
      targetIndex = Math.round(currentIndex)
    }
    
    // Limita ao range válido
    const maxIndex = Math.max(0, Math.ceil((scrollRef.current.scrollWidth - scrollRef.current.clientWidth) / cardWidth))
    targetIndex = Math.max(0, Math.min(targetIndex, maxIndex))
    
    const targetScroll = targetIndex * cardWidth
    
    scrollRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  // Drag to scroll para mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleMouseUp = () => {
    const delta = scrollRef.current ? scrollRef.current.scrollLeft - scrollLeft.current : 0
    setIsDragging(false)
    snapToNearestCard(delta)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      const delta = scrollRef.current ? scrollRef.current.scrollLeft - scrollLeft.current : 0
      setIsDragging(false)
      snapToNearestCard(delta)
    }
  }

  // Touch events removidos para usar scroll nativo

  return (
    <section id="section-escadinha" className="escadinha-section">
      {/* Header */}
      <div className="escadinha-section__header">
        <div className="escadinha-section__title">
          <span>Escadinha</span>
          <img src={iconDuvida} alt="Dúvidas" className="escadinha-section__help" />
        </div>
      </div>

      {/* Cards List */}
      <div 
        className={`escadinha-section__list ${isDragging ? 'escadinha-section__list--dragging' : ''}`}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {escadinhaCards.map((card) => (
          <div key={card.id} className="escadinha-card">
            {/* Card Header with Background */}
            <div 
              className="escadinha-card__header"
              style={{ backgroundImage: `url(${card.background})` }}
            >
              <div className="escadinha-card__info">
                {/* Match Info */}
                <div className="escadinha-card__match">
                  <div className="escadinha-card__shields">
                    <img src={card.awayTeam.icon} alt="" className="escadinha-card__shield escadinha-card__shield--back" />
                    <img src={card.homeTeam.icon} alt="" className="escadinha-card__shield escadinha-card__shield--front" />
                  </div>
                  <span className="escadinha-card__match-name">
                    {card.homeTeam.name} vs {card.awayTeam.name}
                  </span>
                </div>

                {/* Player Info */}
                <div className="escadinha-card__player">
                  <div className="escadinha-card__player-name">
                    <span>{card.player.name}</span>
                    <img src={card.player.image} alt="" className="escadinha-card__player-avatar" />
                  </div>
                  <span className="escadinha-card__player-position">
                    {card.player.position} - {card.player.team}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="escadinha-card__body">
              {/* Stats Chips */}
              <div className="escadinha-card__stats-wrapper">
                <div className="escadinha-card__stats">
                  {card.stats.map((stat) => (
                    <button
                      key={stat.id}
                      className={`escadinha-card__stat ${stat.id === card.activeStatId ? 'escadinha-card__stat--active' : ''}`}
                    >
                      {stat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Range Slider */}
              <div className="escadinha-card__slider">
                {/* Track */}
                <div className="escadinha-card__track">
                  {/* Background track */}
                  <div className="escadinha-card__track-bg"></div>
                  
                  {/* Active range highlight */}
                  {(() => {
                    const firstActiveIndex = card.sliderValues.findIndex(v => v.isActive)
                    const lastActiveIndex = card.sliderValues.length - 1 - [...card.sliderValues].reverse().findIndex(v => v.isActive)
                    const totalItems = card.sliderValues.length
                    // Centro de cada item em flex: (index + 0.5) / totalItems * 100
                    const startPercent = ((firstActiveIndex + 0.5) / totalItems) * 100
                    const endPercent = ((lastActiveIndex + 0.5) / totalItems) * 100
                    
                    return (
                      <>
                        <div 
                          className="escadinha-card__track-active"
                          style={{ 
                            left: `${startPercent}%`, 
                            width: `${endPercent - startPercent}%` 
                          }}
                        ></div>
                        <div 
                          className="escadinha-card__handle escadinha-card__handle--start"
                          style={{ left: `${startPercent}%` }}
                        ></div>
                        <div 
                          className="escadinha-card__handle escadinha-card__handle--end"
                          style={{ left: `${endPercent}%` }}
                        ></div>
                      </>
                    )
                  })()}
                  
                  {/* Tick marks */}
                  <div className="escadinha-card__ticks">
                    {card.sliderValues.map((item, index) => (
                      <div 
                        key={index} 
                        className={`escadinha-card__tick ${item.isActive ? 'escadinha-card__tick--active' : ''}`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Values */}
                <div className="escadinha-card__values">
                  {card.sliderValues.map((item, index) => (
                    <div 
                      key={index} 
                      className={`escadinha-card__value ${item.isActive ? 'escadinha-card__value--active' : ''}`}
                    >
                      <span className="escadinha-card__value-number">{item.value}</span>
                      {item.odd && (
                        <span className="escadinha-card__value-odd">{item.odd}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Button */}
              <button className="escadinha-card__button">
                <span className="escadinha-card__button-text">Adicionar</span>
                <span className="escadinha-card__button-odd">Até {card.maxOdd}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
