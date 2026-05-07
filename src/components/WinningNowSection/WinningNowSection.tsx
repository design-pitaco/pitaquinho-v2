import { useState, useEffect, useRef, useCallback } from 'react'
import { CaretRightIcon } from '@phosphor-icons/react'
import './WinningNowSection.css'

import imgAviator from '../../assets/imgAviator.png'
import imgRoletaSorte from '../../assets/imgRoletaSorte.png'
import imgFutebolStudio from '../../assets/imgFutebolStudio.png'
import imgRabbit from '../../assets/imgRabbit.png'
import imgTigrinho from '../../assets/imgTigrinho.png'

interface Game {
  id: string
  name: string
  image: string
}

interface Winner {
  id: string
  game: Game
  winner: string
  amount: string
}

const games: Game[] = [
  { id: '1', name: 'Aviator', image: imgAviator },
  { id: '2', name: 'Roleta da Sorte', image: imgRoletaSorte },
  { id: '3', name: 'Futebol Studio', image: imgFutebolStudio },
  { id: '4', name: 'Fortune Rabbit', image: imgRabbit },
  { id: '5', name: 'Fortune Tiger', image: imgTigrinho },
]

// Nomes para gerar aleatoriamente
const randomNames = [
  'Ric', 'Mar', 'Fer', 'Joa', 'Lau', 'Ped', 'Ana', 'Car', 'Luc', 'Gab',
  'Raf', 'Jul', 'Mat', 'Bia', 'Edu', 'Vin', 'Leo', 'Bru', 'Thi', 'Gui'
]

let winnerIdCounter = 0

// Gera um valor aleatório entre min e max
function generateRandomAmount(min: number, max: number): string {
  const value = Math.random() * (max - min) + min
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Gera um nome aleatório com ***
function generateRandomWinner(): string {
  const name = randomNames[Math.floor(Math.random() * randomNames.length)]
  return `${name}***`
}

// Gera um único ganhador aleatório
function generateSingleWinner(): Winner {
  const game = games[Math.floor(Math.random() * games.length)]
  winnerIdCounter++
  return {
    id: `winner-${Date.now()}-${winnerIdCounter}-${Math.random().toString(36).substr(2, 9)}`,
    game,
    winner: generateRandomWinner(),
    amount: generateRandomAmount(50, 15000),
  }
}

// Gera uma lista inicial de ganhadores
function generateInitialWinners(count: number): Winner[] {
  return Array.from({ length: count }, () => generateSingleWinner())
}

const AUTO_PLAY_INTERVAL = 8000 // 8 segundos
const CARD_WIDTH = 288 // min-width (280) + gap (8)

export function WinningNowSection() {
  const [winners, setWinners] = useState<Winner[]>(() => generateInitialWinners(10))
  const [isDragging, setIsDragging] = useState(false)
  const cardsRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Scroll para o próximo card e adiciona novo winner
  const scrollToNext = useCallback(() => {
    if (!cardsRef.current) return

    // Adiciona novo winner no final
    setWinners(prev => [...prev, generateSingleWinner()])

    // Faz scroll para a direita
    cardsRef.current.scrollBy({
      left: CARD_WIDTH,
      behavior: 'smooth'
    })
  }, [])

  // Função para iniciar o auto-play
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    
    autoPlayRef.current = setInterval(() => {
      scrollToNext()
    }, AUTO_PLAY_INTERVAL)
  }, [scrollToNext])

  // Auto-play: inicia quando o componente monta
  useEffect(() => {
    startAutoPlay()

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [startAutoPlay])

  // Pausa o auto-play durante o drag
  const pauseAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }

  // Reinicia o auto-play após interação manual
  const resetAutoPlay = useCallback(() => {
    startAutoPlay()
  }, [startAutoPlay])

  // Centraliza no card mais próximo com sensibilidade ao arraste
  const snapToNearestCard = (dragDelta: number = 0) => {
    if (!cardsRef.current) return
    const currentScroll = cardsRef.current.scrollLeft
    const currentIndex = currentScroll / CARD_WIDTH
    
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
    const maxIndex = Math.max(0, Math.ceil((cardsRef.current.scrollWidth - cardsRef.current.clientWidth) / CARD_WIDTH))
    targetIndex = Math.max(0, Math.min(targetIndex, maxIndex))
    
    const targetScroll = targetIndex * CARD_WIDTH
    
    cardsRef.current.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    })
  }

  // Drag to scroll para mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardsRef.current) return
    setIsDragging(true)
    pauseAutoPlay()
    startX.current = e.pageX - cardsRef.current.offsetLeft
    scrollLeft.current = cardsRef.current.scrollLeft
  }

  const handleMouseUp = () => {
    const delta = cardsRef.current ? cardsRef.current.scrollLeft - scrollLeft.current : 0
    setIsDragging(false)
    snapToNearestCard(delta)
    resetAutoPlay()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardsRef.current) return
    e.preventDefault()
    const x = e.pageX - cardsRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    cardsRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      const delta = cardsRef.current ? cardsRef.current.scrollLeft - scrollLeft.current : 0
      setIsDragging(false)
      snapToNearestCard(delta)
      resetAutoPlay()
    }
  }

  // Touch events para mobile
  const handleTouchStart = () => {
    pauseAutoPlay()
  }

  const handleTouchEnd = () => {
    resetAutoPlay()
  }

  return (
    <section id="section-ganhando" className="winning-now-section">
      {/* Header */}
      <div className="winning-now-section__header">
        <div className="winning-now-section__title">
          <span>Ganhando agora no nosso Cassino</span>
          <CaretRightIcon aria-hidden="true" className="winning-now-section__arrow" weight="bold" />
        </div>
      </div>

      {/* Winners Cards */}
      <div 
        className={`winning-now-section__cards ${isDragging ? 'winning-now-section__cards--dragging' : ''}`}
        ref={cardsRef}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {winners.map((winner) => (
          <div key={winner.id} className="winning-now-section__card">
            <img src={winner.game.image} alt={winner.game.name} className="winning-now-section__card-image" />
            <div className="winning-now-section__card-content">
              <span className="winning-now-section__card-game">{winner.game.name}</span>
              <div className="winning-now-section__card-prize">
                <span className="winning-now-section__card-winner">
                  <strong>{winner.winner}</strong> ganhou o valor de:
                </span>
                <span className="winning-now-section__card-amount">{winner.amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
