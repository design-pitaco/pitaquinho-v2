import { useState, useRef, useEffect } from 'react'
import './BannerCarousel.css'
import { Toast } from '../Toast'
import { 
  BottomSheet, 
  MissionObjective, 
  MissionInfoRow, 
  MissionFaqItem,
  MissionTimer 
} from '../BottomSheet'
import iconAccordion from '../../assets/iconAccordion.png'

// Backgrounds
import bgMissao from '../../assets/bgMissao.png'
import bg1x2 from '../../assets/bg1x2.png'
import bgAumentada from '../../assets/bgAumentada.png'
import bgVirtuais from '../../assets/bgVirtuais.png'
import bgAoVivoBasquete from '../../assets/aoVivoBasquete.png'
import bgAoVivoTenis from '../../assets/bgAoVivoTenis.png'
import bgCombinada from '../../assets/combinada.png'
import iconSuperCombinada from '../../assets/iconSuperCombinada.png'
import iconAoVivo from '../../assets/iconAoVivo.png'
import iconTenis from '../../assets/iconTenis.png'
import iconSaibaMais from '../../assets/iconSaibaMais.svg'
import iconBoostWhite from '../../assets/iconBoostWhite.svg'
import iconAumentada from '../../assets/iconAumentada.png'
import iconAtivo from '../../assets/iconAtivo.svg'
import imgMissaoRodadaGratis from '../../assets/imgMissaoRodadaGratis.png'

// Escudos para Ao Vivo
import escudoKnicksGde from '../../assets/escudoKnicksGde.png'
import escudoMagicGde from '../../assets/escudoMagicGde.png'

// Escudos para 1x2
import escudoBarcelonaGde from '../../assets/escudoBarcelonaGde.png'
import escudoRealGde from '../../assets/escudoRealGde.png'

// Bandeiras
import flagRussia from '../../assets/flagRussia.png'
import flagUSA from '../../assets/flagUSA.png'

// Mission progress type
interface MissionProgress {
  current: number
  target: number
}

interface LiveTeam {
  name: string
  shortName: string
  badge: string
  score: number
}

interface LiveMatch {
  homeTeam: LiveTeam
  awayTeam: LiveTeam
  matchTime: string
  odds: { home: string; draw: string; away: string }
}

interface TennisPlayer {
  name: string
  sets: number
  games: number
  points: string
  isServing: boolean
  flag?: string
}

interface TennisMatch {
  player1: TennisPlayer
  player2: TennisPlayer
  currentSet: string
  setScore: string
  odds: { player1: string; player2: string }
}

interface ComboStat {
  value: string
  label: string
}

interface Banner {
  id: number
  type: 'missao' | '1x2' | 'torneio' | 'aumentada' | 'virtuais' | 'aoVivo' | 'aoVivoTenis' | 'longoPrazo' | 'combinada'
  headerLeft: string
  headerRight: string
  showTimer?: boolean
  background: string
  title: string
  description: string
  buttonText?: string
  showInfoBtn?: boolean
  odds?: { team: string; value: string; badge?: string }[]
  oddBoosted?: { old: string; new: string }
  liveMatch?: LiveMatch
  tennisMatch?: TennisMatch
  comboStats?: ComboStat[]
}

const banners: Banner[] = [
  {
    id: 7,
    type: 'aoVivoTenis',
    headerLeft: 'Ao Vivo',
    headerRight: 'Aberto de Madrid',
    showTimer: true,
    background: bgAoVivoTenis,
    title: '',
    description: '',
    tennisMatch: {
      player1: {
        name: 'A. Sabalenka',
        sets: 5,
        games: 5,
        points: '40',
        isServing: true,
        flag: flagRussia,
      },
      player2: {
        name: 'P. Stearns',
        sets: 2,
        games: 2,
        points: '15',
        isServing: false,
        flag: flagUSA,
      },
      currentSet: '1º set',
      setScore: '1 x 0',
      odds: { player1: '1.22x', player2: '4.75x' },
    },
  },
  {
    id: 9,
    type: 'combinada',
    headerLeft: 'Hoje, 17:00',
    headerRight: 'Chelsea x Arsenal',
    background: bgCombinada,
    title: 'Super Combo',
    description: '',
    comboStats: [
      { value: 'CHE', label: 'Resultado Final' },
      { value: 'CHE +2', label: 'Total de Gols' },
      { value: 'ARS +4', label: 'Total de Escanteios' },
    ],
    oddBoosted: { old: '7.50x', new: '10.50x' },
  },
  {
    id: 1,
    type: 'missao',
    headerLeft: 'Missão Rodada Grátis',
    headerRight: 'Termina em 3 dias',
    showTimer: true,
    background: bgMissao,
    title: 'Ganhe 40 rodadas!',
    description: 'Aposte R$100 no jogo SpaceMan e ganhe 40 rodadas grátis.',
    buttonText: 'Ativar Missão',
    showInfoBtn: true,
  },
  {
    id: 6,
    type: 'aoVivo',
    headerLeft: 'Ao Vivo',
    headerRight: 'NBA',
    showTimer: true,
    background: bgAoVivoBasquete,
    title: '',
    description: '',
    liveMatch: {
      homeTeam: {
        name: 'Knicks',
        shortName: 'NYK',
        badge: escudoKnicksGde,
        score: 42,
      },
      awayTeam: {
        name: 'Magic',
        shortName: 'ORL',
        badge: escudoMagicGde,
        score: 38,
      },
      matchTime: "Q2 05:00",
      odds: { home: '1.72x', draw: '', away: '2.15x' },
    },
  },
  {
    id: 2,
    type: '1x2',
    headerLeft: 'Hoje, 17:00',
    headerRight: 'Champions League',
    background: bg1x2,
    title: '',
    description: '',
    odds: [
      { team: 'Real Madrid', value: '1.78x', badge: escudoRealGde },
      { team: 'Empate', value: '3.50x' },
      { team: 'Barcelona', value: '2.10x', badge: escudoBarcelonaGde },
    ],
  },
  {
    id: 4,
    type: 'aumentada',
    headerLeft: '11/09, 16:00',
    headerRight: 'Flamengo vs Racing',
    background: bgAumentada,
    title: 'Aumentada',
    description: 'Pedro\nMais de 3.5\nFinalizações ao gol',
    oddBoosted: { old: '3.87x', new: '4.50x' },
  },
  {
    id: 5,
    type: 'virtuais',
    headerLeft: 'Novidade no Rei',
    headerRight: 'Virtuais',
    background: bgVirtuais,
    title: 'Chegou Virtuais!',
    description: 'Jogos a todo minuto para você não parar de se divertir.',
    buttonText: 'Jogue Agora',
  },
]

const AUTO_PLAY_INTERVAL = 10000 // 10 segundos

// Helper function to parse match time string
function parseMatchTime(timeStr: string): { period: number; minutes: number; seconds: number; isQuarter: boolean } {
  // Check for quarter format (basketball) - Q2 07:12
  const quarterMatch = timeStr.match(/Q(\d) (\d+):(\d+)/)
  if (quarterMatch) {
    return {
      period: parseInt(quarterMatch[1]),
      minutes: parseInt(quarterMatch[2]),
      seconds: parseInt(quarterMatch[3]),
      isQuarter: true,
    }
  }
  // Check for half format (football) - 2T 22:12
  const halfMatch = timeStr.match(/(\d)T (\d+):(\d+)/)
  if (halfMatch) {
    return {
      period: parseInt(halfMatch[1]),
      minutes: parseInt(halfMatch[2]),
      seconds: parseInt(halfMatch[3]),
      isQuarter: false,
    }
  }
  return { period: 1, minutes: 0, seconds: 0, isQuarter: false }
}

// Helper function to format time back to string
function formatMatchTime(period: number, minutes: number, seconds: number, isQuarter: boolean): string {
  const mins = minutes.toString().padStart(2, '0')
  const secs = seconds.toString().padStart(2, '0')
  // Basketball: Q1 07:12, Football: 1T 22:12
  return isQuarter ? `Q${period} ${mins}:${secs}` : `${period}T ${mins}:${secs}`
}

// Helper function to update time by 1 second (basketball: countdown, football: count up)
function updateMatchTime(timeStr: string): string {
  if (timeStr === 'Intervalo' || timeStr === 'INT') {
    return timeStr
  }

  const { period, minutes, seconds, isQuarter } = parseMatchTime(timeStr)

  if (isQuarter) {
    // Basketball: countdown (regressive)
    let newSeconds = seconds - 1
    let newMinutes = minutes

    if (newSeconds < 0) {
      newSeconds = 59
      newMinutes -= 1
    }

    // If time reaches 0:00, change to Intervalo
    if (newMinutes <= 0 && newSeconds <= 0) {
      return 'Intervalo'
    }

    return formatMatchTime(period, newMinutes, newSeconds, isQuarter)
  } else {
    // Football: count up (progressive)
    let newSeconds = seconds + 1
    let newMinutes = minutes

    if (newSeconds >= 60) {
      newSeconds = 0
      newMinutes += 1
    }

    return formatMatchTime(period, newMinutes, newSeconds, isQuarter)
  }
}

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [activatedMissions, setActivatedMissions] = useState<Record<number, MissionProgress>>({})
  const [showToast, setShowToast] = useState(false)
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)
  const [liveMatchTime, setLiveMatchTime] = useState("Q2 05:00")
  const scrollRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const dragDistance = useRef(0)
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleActivateMission = (bannerId: number, target: number) => {
    if (activatedMissions[bannerId]) return // Already activated
    
    setActivatedMissions(prev => ({
      ...prev,
      [bannerId]: { current: 0, target }
    }))
    setShowToast(true)
  }

  const isMissionActivated = (bannerId: number) => {
    return bannerId in activatedMissions
  }

  const getMissionProgress = (bannerId: number) => {
    return activatedMissions[bannerId]
  }

  const handleOpenMissionInfo = (banner: Banner) => {
    setSelectedBanner(banner)
    setIsBottomSheetOpen(true)
  }

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false)
    setTimeout(() => {
      setSelectedBanner(null)
    }, 350)
  }

  const handleActivateMissionFromBS = () => {
    if (selectedBanner) {
      const bannerId = selectedBanner.id
      const isAlreadyActivated = isMissionActivated(bannerId)
      
      setIsBottomSheetOpen(false)
      
      if (isAlreadyActivated) {
        setTimeout(() => {
          setSelectedBanner(null)
        }, 350)
        return
      }
      
      // Atualiza o estado imediatamente para o banner mudar
      setActivatedMissions(prev => ({
        ...prev,
        [bannerId]: { current: 0, target: 100 }
      }))
      setShowToast(true)
      
      setTimeout(() => {
        setSelectedBanner(null)
      }, 350)
    }
  }

  // Função para iniciar o auto-play
  const startAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
    }
    
    autoPlayRef.current = setInterval(() => {
      if (scrollRef.current) {
        const cardWidth = scrollRef.current.offsetWidth - 24 + 20
        const currentScroll = scrollRef.current.scrollLeft
        const currentIndex = Math.round(currentScroll / cardWidth)
        const nextIndex = (currentIndex + 1) % banners.length
        
        scrollRef.current.scrollTo({
          left: nextIndex * cardWidth,
          behavior: 'smooth'
        })
      }
    }, AUTO_PLAY_INTERVAL)
  }

  // Auto-play: inicia quando o componente monta
  useEffect(() => {
    startAutoPlay()

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [])

  // Atualiza o tempo do jogo ao vivo a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveMatchTime(prev => updateMatchTime(prev))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Pausa o auto-play durante o drag
  const pauseAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
  }

  // Reinicia o auto-play após interação manual - reseta completamente o timer
  const resetAutoPlay = () => {
    // Primeiro limpa qualquer intervalo existente
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      autoPlayRef.current = null
    }
    // Inicia um novo ciclo de autoplay
    startAutoPlay()
  }

  const handleScroll = () => {
    if (scrollRef.current) {
      const currentScrollLeft = scrollRef.current.scrollLeft
      const cardWidth = scrollRef.current.offsetWidth - 24 + 20
      const newIndex = Math.round(currentScrollLeft / cardWidth)
      setActiveIndex(Math.min(newIndex, banners.length - 1))
    }
  }

  // Centraliza no banner mais próximo com sensibilidade ao arraste
  const snapToNearestBanner = (dragDelta: number = 0) => {
    if (!scrollRef.current) return
    const cardWidth = scrollRef.current.offsetWidth - 24 + 20
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
    pauseAutoPlay()
    dragDistance.current = 0
    startX.current = e.pageX - scrollRef.current.offsetLeft
    scrollLeft.current = scrollRef.current.scrollLeft
  }

  const handleMouseUp = () => {
    if (!isDragging) return
    const delta = dragDistance.current
    setIsDragging(false)
    snapToNearestBanner(delta)
    resetAutoPlay()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return
    e.preventDefault()
    const x = e.pageX - scrollRef.current.offsetLeft
    const walk = (x - startX.current) * 1.5
    dragDistance.current = -walk // Negativo porque walk é invertido
    scrollRef.current.scrollLeft = scrollLeft.current - walk
  }

  const handleMouseLeave = () => {
    if (isDragging) {
      const delta = dragDistance.current
      setIsDragging(false)
      snapToNearestBanner(delta)
      resetAutoPlay()
    }
  }

  // Touch events para mobile
  const handleTouchStart = () => {
    pauseAutoPlay()
  }

  const handleTouchEnd = () => {
    // Aguarda o scroll terminar antes de reiniciar o autoplay
    setTimeout(() => {
    resetAutoPlay()
    }, 300)
  }

  return (
    <div className="banner-carousel">
      <div 
        className={`banner-carousel__list ${isDragging ? 'banner-carousel__list--dragging' : ''}`}
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner) => (
          <div key={banner.id} className="banner-card">
            {/* Header */}
            <div className="banner-card__header">
              {banner.type === 'aoVivo' || banner.type === 'aoVivoTenis' ? (
                <>
                  <div className="banner-card__header-left-live">
                    <div className="banner-card__tag-aovivo">
                      <div className="banner-card__tag-icon-wrapper">
                        <img src={iconAoVivo} alt="" className="banner-card__tag-icon" />
                      </div>
                      <span>Ao Vivo</span>
                    </div>
                    {banner.type === 'aoVivoTenis' ? (
                      <>
                        <span className="banner-card__match-time">{banner.tennisMatch?.currentSet}</span>
                        <span className="banner-card__header-dot" />
                        <span className="banner-card__match-time">{banner.tennisMatch?.setScore}</span>
                      </>
                    ) : (
                      <span className="banner-card__match-time">{liveMatchTime}</span>
                    )}
                  </div>
                  <span className="banner-card__header-right-text">{banner.headerRight}</span>
                </>
              ) : (
                <>
              <span className="banner-card__header-left">{banner.headerLeft}</span>
              <div className="banner-card__header-right">
                {banner.showTimer && <span className="banner-card__timer-dot" />}
                <span>{banner.headerRight}</span>
              </div>
                </>
              )}
            </div>

            {/* Content */}
            <div 
              className={`banner-card__content ${banner.type === 'aoVivo' || banner.type === 'aoVivoTenis' ? 'banner-card__content--live' : ''}`}
              style={{ backgroundImage: `url(${banner.background})` }}
            >
              {/* Ao Vivo Tennis Content */}
              {banner.type === 'aoVivoTenis' && banner.tennisMatch && (
                <div className="banner-card__live-content">
                  <div className="banner-card__tennis-scores">
                    <div className="banner-card__tennis-player">
                      <div className="banner-card__tennis-score-group">
                        <div className="banner-card__tennis-score-box banner-card__tennis-score-box--filled">
                          {banner.tennisMatch.player1.isServing && (
                            <img src={iconTenis} alt="" className="banner-card__tennis-serve" />
                          )}
                          <span>{banner.tennisMatch.player1.games}</span>
                        </div>
                        <div className="banner-card__tennis-score-box">
                          <span>{banner.tennisMatch.player1.points}</span>
                        </div>
                      </div>
                      <span className="banner-card__tennis-dot" />
                      {banner.tennisMatch.player1.flag && (
                        <img src={banner.tennisMatch.player1.flag} alt="" className="banner-card__tennis-flag" />
                      )}
                      <span className="banner-card__tennis-player-name">{banner.tennisMatch.player1.name}</span>
                    </div>
                    <div className="banner-card__tennis-player">
                      <div className="banner-card__tennis-score-group">
                        <div className="banner-card__tennis-score-box banner-card__tennis-score-box--filled">
                          {banner.tennisMatch.player2.isServing && (
                            <img src={iconTenis} alt="" className="banner-card__tennis-serve" />
                          )}
                          <span>{banner.tennisMatch.player2.games}</span>
                        </div>
                        <div className="banner-card__tennis-score-box">
                          <span>{banner.tennisMatch.player2.points}</span>
                        </div>
                      </div>
                      <span className="banner-card__tennis-dot" />
                      {banner.tennisMatch.player2.flag && (
                        <img src={banner.tennisMatch.player2.flag} alt="" className="banner-card__tennis-flag" />
                      )}
                      <span className="banner-card__tennis-player-name">{banner.tennisMatch.player2.name}</span>
                    </div>
                  </div>
                  <div className="banner-card__live-odds">
                    <button className="banner-card__live-odd-btn">
                      <span className="banner-card__live-odd-team">{banner.tennisMatch.player1.name}</span>
                      <span className="banner-card__live-odd-value">{banner.tennisMatch.odds.player1}</span>
                    </button>
                    <button className="banner-card__live-odd-btn">
                      <span className="banner-card__live-odd-team">{banner.tennisMatch.player2.name}</span>
                      <span className="banner-card__live-odd-value">{banner.tennisMatch.odds.player2}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Ao Vivo Content */}
              {banner.type === 'aoVivo' && banner.liveMatch && (
                <div className="banner-card__live-content">
                  <div className="banner-card__live-scores">
                    <div className="banner-card__live-team">
                      <span className="banner-card__live-score">{banner.liveMatch.homeTeam.score}</span>
                      <span className="banner-card__live-dot" />
                      <img src={banner.liveMatch.homeTeam.badge} alt="" className="banner-card__live-badge" />
                      <span className="banner-card__live-team-name">{banner.liveMatch.homeTeam.name}</span>
                    </div>
                    <div className="banner-card__live-team">
                      <span className="banner-card__live-score">{banner.liveMatch.awayTeam.score}</span>
                      <span className="banner-card__live-dot" />
                      <img src={banner.liveMatch.awayTeam.badge} alt="" className="banner-card__live-badge" />
                      <span className="banner-card__live-team-name">{banner.liveMatch.awayTeam.name}</span>
                    </div>
                  </div>
                  <div className="banner-card__live-odds">
                    <button className="banner-card__live-odd-btn">
                      <span className="banner-card__live-odd-team">{banner.liveMatch.homeTeam.name}</span>
                      <span className="banner-card__live-odd-value">{banner.liveMatch.odds.home}</span>
                    </button>
                    {banner.liveMatch.odds.draw && (
                      <button className="banner-card__live-odd-btn">
                        <span className="banner-card__live-odd-team">Empate</span>
                        <span className="banner-card__live-odd-value">{banner.liveMatch.odds.draw}</span>
                      </button>
                    )}
                    <button className="banner-card__live-odd-btn">
                      <span className="banner-card__live-odd-team">{banner.liveMatch.awayTeam.name}</span>
                      <span className="banner-card__live-odd-value">{banner.liveMatch.odds.away}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Combinada Content */}
              {banner.type === 'combinada' && banner.comboStats && (
                <div className="banner-card__combinada">
                  <div className="banner-card__combinada-text">
                    <div className="banner-card__combinada-title">
                      <img src={iconSuperCombinada} alt="" className="banner-card__combinada-icon" />
                      <span>{banner.title}</span>
                    </div>
                    <div className="banner-card__combinada-stats">
                      {banner.comboStats.map((stat, i) => (
                        <div key={i} className="banner-card__combinada-stat">
                          <span className="banner-card__combinada-stat-value">{stat.value}</span>
                          <span className="banner-card__combinada-stat-dot"> - </span>
                          <span className="banner-card__combinada-stat-label">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {banner.oddBoosted && (
                    <button className="banner-card__combinada-btn">
                      <span className="banner-card__combinada-old-odd">{banner.oddBoosted.old}</span>
                      <img src={iconBoostWhite} alt="" className="banner-card__combinada-arrow" />
                      <span className="banner-card__combinada-new-odd">{banner.oddBoosted.new}</span>
                    </button>
                  )}
                </div>
              )}

              {/* Regular Content */}
              {banner.type !== 'aoVivo' && banner.type !== 'aoVivoTenis' && banner.type !== 'combinada' && (
              <div className={`banner-card__info ${banner.odds ? 'banner-card__info--full' : ''}`}>

                {/* Times com escudo (1x2) */}
                {banner.type === '1x2' && banner.odds ? (
                  <div className="banner-card__teams">
                    {banner.odds.filter(o => o.badge).map((odd, i) => (
                      <div key={i} className="banner-card__live-team">
                        <img src={odd.badge} alt="" className="banner-card__live-badge" />
                        <span className="banner-card__live-team-name">{odd.team}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                <div className="banner-card__text">
                  <h3 className={`banner-card__title${['aumentada', 'missao', 'virtuais'].includes(banner.type) ? ' banner-card__title--aumentada' : ''}`}>
                    {banner.type === 'aumentada' && (
                      <img src={iconAumentada} alt="" className="banner-card__boost-icon" />
                    )}
                    {banner.title}
                  </h3>
                  <p className="banner-card__description">
                    {banner.description.split('\n').map((line, i) => (
                      <span key={i}>{line}<br /></span>
                    ))}
                  </p>
                </div>
                )}

                {/* Botões padrão */}
                {banner.buttonText && (
                  <div className="banner-card__buttons">
                    {banner.type === 'missao' && isMissionActivated(banner.id) ? (
                      <button 
                        className="banner-card__btn-activated"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenMissionInfo(banner)
                        }}
                      >
                        <div className="banner-card__btn-activated-left">
                          <img src={iconAtivo} alt="" className="banner-card__btn-activated-icon" />
                          <span>Acompanhar</span>
                        </div>
                        <div className="banner-card__btn-activated-divider" />
                        <div className="banner-card__btn-activated-right">
                          <span className="banner-card__btn-activated-label">Progresso</span>
                          <span className="banner-card__btn-activated-value">
                            R${getMissionProgress(banner.id)?.current || 0} de R${getMissionProgress(banner.id)?.target || 100}
                          </span>
                        </div>
                      </button>
                    ) : (
                      <>
                        <button 
                          className="banner-card__btn"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (banner.type === 'missao') {
                              handleActivateMission(banner.id, 100)
                            }
                          }}
                        >
                          {banner.buttonText}
                        </button>
                        {banner.showInfoBtn && (
                          <button 
                            className="banner-card__btn banner-card__btn--icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              if (banner.type === 'missao') {
                                handleOpenMissionInfo(banner)
                              }
                            }}
                          >
                            <img src={iconSaibaMais} alt="Saiba mais" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Odds 1x2 */}
                {banner.odds && (
                  <div className="banner-card__odds">
                    {banner.odds.map((odd, i) => (
                      <button key={i} className="banner-card__odd-btn">
                        <span className="banner-card__odd-team">{odd.team}</span>
                        <span className="banner-card__odd-value">{odd.value}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Odd aumentada */}
                {banner.oddBoosted && (
                  <button className="banner-card__boosted-btn">
                    <span className="banner-card__old-odd">{banner.oddBoosted.old}</span>
                    <img src={iconBoostWhite} alt="" className="banner-card__arrow" />
                    <span className="banner-card__new-odd">{banner.oddBoosted.new}</span>
                  </button>
                )}
              </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bullets */}
      <div className="banner-carousel__bullets">
        {banners.map((_, index) => (
          <span 
            key={index} 
            className={`banner-carousel__bullet ${index === activeIndex ? 'banner-carousel__bullet--active' : ''}`}
          >
            {index === activeIndex && (
              <span 
                key={activeIndex}
                className="banner-carousel__bullet-progress" 
              />
            )}
          </span>
        ))}
      </div>

      {/* Success Toast */}
      <Toast
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        title="Missão Ativada"
        message="Cumpra os objetivos para ganhar o seu bônus!"
      />

      {/* Mission Bottom Sheet */}
      {selectedBanner && selectedBanner.type === 'missao' && (
        <BottomSheet
          isOpen={isBottomSheetOpen}
          onClose={closeBottomSheet}
          title={selectedBanner.title}
          titleIcon={imgMissaoRodadaGratis}
          footerContent={
            <button className="bottom-sheet__btn-primary" onClick={handleActivateMissionFromBS}>
              <span>{isMissionActivated(selectedBanner.id) ? 'Jogar' : 'Ativar Missão'}</span>
            </button>
          }
        >
          {/* Mission Description */}
          <p className="mission-description">{selectedBanner.description}</p>

          {/* Mission Box */}
          <div className="mission-box">
            <div className="mission-box__header">
              <MissionTimer text={selectedBanner.headerRight} />
            </div>
            <div className="mission-box__content">
              {isMissionActivated(selectedBanner.id) && (
                <div className="mission-progress">
                  <div className="mission-progress__header">
                    <span className="mission-progress__label">Progresso:</span>
                    <span className="mission-progress__value">
                      R${getMissionProgress(selectedBanner.id)?.current || 0} de R${getMissionProgress(selectedBanner.id)?.target || 100}
                    </span>
                  </div>
                  <div className="mission-progress__bar">
                    <div 
                      className="mission-progress__fill"
                      style={{ 
                        width: `${((getMissionProgress(selectedBanner.id)?.current || 0) / (getMissionProgress(selectedBanner.id)?.target || 100)) * 100}%` 
                      }}
                    />
                    <div 
                      className="mission-progress__dot"
                      style={{ 
                        left: `${((getMissionProgress(selectedBanner.id)?.current || 0) / (getMissionProgress(selectedBanner.id)?.target || 100)) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              )}
              <p className="mission-box__title">Objetivos da missão</p>
              <MissionObjective text="Apostar R$100 no jogo SpaceMan" />
            </div>
          </div>

          {/* Mission Info Section */}
          <div className="mission-info-section">
            <div className="mission-info-header">
              <span className="mission-info-header__title">Informações sobre a Missão</span>
              <img src={iconAccordion} alt="" className="mission-info-header__icon" />
            </div>
            <div className="mission-info-rows">
              <MissionInfoRow label="Tipo de Aposta" value="Jogo Crash" />
              <MissionInfoRow label="Valor Mínimo por Aposta" value="Pelo menos R$100" />
              <MissionInfoRow label="Valor do Bônus" value="40" />
              <MissionInfoRow label="Forma de Recebimento" value="Giros Grátis" />
              <MissionInfoRow label="Validade do Bônus" value="7 dias após o recebimento" />
            </div>

            {/* FAQ Section */}
            <div className="mission-faq">
              <MissionFaqItem question="Como posso participar da missão" />
              <MissionFaqItem question="Preciso ativar a missão para participar?" />
              <MissionFaqItem question="Quais jogos participam da promoção?" />
              <MissionFaqItem question="Quando recebo meu bônus?" />
              <MissionFaqItem question="Posso acumular essa missão com outras?" />
              <MissionFaqItem question="Termos e Condições" />
            </div>
          </div>
        </BottomSheet>
      )}
    </div>
  )
}
