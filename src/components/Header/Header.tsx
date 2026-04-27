import './Header.css'
import { SportRail } from '../SportRail'
import logoReidoPitaco from '../../assets/logoReidoPitaco.svg'
import iconBusca from '../../assets/iconBuscaHeader.svg'
import iconNotificacoes from '../../assets/iconNotificacoesHeader.svg'

interface HeaderProps {
  activeSport?: string | null
  onSportChange?: (sportId: string) => void
}

export function Header({ activeSport, onSportChange }: HeaderProps = {}) {
  const isSportPage = !!activeSport && activeSport !== 'destaques'

  return (
    <header className={`header${isSportPage ? ' header--sport-active' : ''}`}>
      <div className="header__bg-dark" />
      <div className="header__bg-gradient" />

      <div className="header__top">
        <div className="header__logo">
          <img src={logoReidoPitaco} alt="Rei do Pitaco" />
        </div>

        <div className="header__toggle">
          <button className="header__toggle-btn header__toggle-btn--active">
            APOSTAS
          </button>
          <button className="header__toggle-btn">
            CASSINO
          </button>
        </div>

        <div className="header__actions">
          <button className="header__icon-btn" aria-label="Buscar">
            <img src={iconBusca} alt="Buscar" />
          </button>
          <button className="header__icon-btn" aria-label="Notificações">
            <img src={iconNotificacoes} alt="Notificações" />
            <span className="header__badge">8</span>
          </button>
        </div>
      </div>

      <SportRail activeSport={activeSport} onSportChange={onSportChange} />
    </header>
  )
}
