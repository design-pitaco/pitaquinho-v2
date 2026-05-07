import { useState, useRef } from 'react'
import { CaretRightIcon } from '@phosphor-icons/react'
import './PromotionSection.css'

// Images for cards
import imgMissaoVerdao from '../../assets/imgMissaoVerdao.png'
import imgPagamentoAntecipado from '../../assets/img-promo-pagamento-antecipado-futebol.png'
import imgFlamengo from '../../assets/bgFlamengo.png'
import imgRatinho from '../../assets/img-ratinho.png'
import imgTesouroRei from '../../assets/img-promo-tesouro-do-rei.png'

interface Promotion {
  id: string
  type: 'missao' | 'vantagem'
  timeLabel: string
  hasTimer: boolean
  label: string[]
  title: string
  description: string
  image: string
}

const promotions: Promotion[] = [
  {
    id: '1',
    type: 'missao',
    timeLabel: 'Termina em 3 dias',
    hasTimer: true,
    label: ['Missão'],
    title: 'Aposte no Verdão e ganhe R$50!',
    description: 'Aposte R$50 no jogo do Palmeiras na Liberta e ganhe R$10 em créditos.',
    image: imgMissaoVerdao,
  },
  {
    id: '2',
    type: 'vantagem',
    timeLabel: 'Só no Rei',
    hasTimer: false,
    label: ['Pagamento', 'Antecipado'],
    title: 'Fature até 200% na múltipla.',
    description: 'Se o time abrir dois gols, seu pagamento já cai na conta.',
    image: imgPagamentoAntecipado,
  },
  {
    id: '3',
    type: 'missao',
    timeLabel: 'Termina em 3 dias',
    hasTimer: true,
    label: ['Missão'],
    title: 'Ganhe R$5 no brasileirão.',
    description: 'Aposte R$50 no jogo do Flamengo e ganhe mais 20 coroas.',
    image: imgFlamengo,
  },
  {
    id: '4',
    type: 'missao',
    timeLabel: 'Termina em 3 dias',
    hasTimer: true,
    label: ['Missão'],
    title: 'Missão Ratinho',
    description: 'Aposte R$20 no jogo do Ratinho Sortudo e ganhe 5 Rodadas.',
    image: imgRatinho,
  },
  {
    id: '5',
    type: 'vantagem',
    timeLabel: 'Só no Rei',
    hasTimer: false,
    label: ['Tesouro', 'do Rei'],
    title: 'Tesouro do Rei',
    description: 'Quanto mais você jogar mais chaves irá conseguir.',
    image: imgTesouroRei,
  },
]

export function PromotionSection() {
  const [isDragging, setIsDragging] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return
    setIsDragging(true)
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleMouseUp = () => {
    setIsDragging(false)
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
      setIsDragging(false)
    }
  }

  return (
    <section id="section-promocoes" className="promotion-section">
      <div className="promotion-section__header">
        <div className="promotion-section__title">
          <span>Promoções</span>
          <CaretRightIcon aria-hidden="true" className="promotion-section__arrow" weight="bold" />
        </div>
      </div>

      <div 
        className={`promotion-section__list ${isDragging ? 'promotion-section__list--dragging' : ''}`}
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {promotions.map((promo) => (
          <div key={promo.id} className="promo-card">
            <div className="promo-card__image-wrapper">
              <img src={promo.image} alt="" className="promo-card__image" />
              <div className="promo-card__label">
                {promo.label.map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
            <div className="promo-card__content">
              <p className="promo-card__description">{promo.description}</p>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}
