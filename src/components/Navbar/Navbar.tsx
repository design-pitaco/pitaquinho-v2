import './Navbar.css'

import iconAoVivo from '../../assets/iconFooterAoVivo.png'
import iconBusca from '../../assets/iconBuscaHeader.svg'
import navEntradas from '../../assets/navEntradas.svg'
import navHome from '../../assets/navHome.svg'
import navPitacoClub from '../../assets/navPitacoClub.svg'

interface NavItem {
  id: string
  icon: string
  label: string
  iconClassName?: string
}

const navItems: NavItem[] = [
  { id: 'home', icon: navHome, label: 'Início' },
  { id: 'ao-vivo', icon: iconAoVivo, label: 'Ao Vivo', iconClassName: 'navbar__icon--live' },
  { id: 'pitaco-club', icon: navPitacoClub, label: 'Pitaco Club' },
  { id: 'apostas', icon: navEntradas, label: 'Apostas' },
]

export function Navbar() {
  const activeItem = 'home'

  return (
    <nav className="navbar">
      <div className="navbar__shell">
        <div className="navbar__panel navbar__panel--main">
          <div className="navbar__items">
            {navItems.map((item) => {
              const isActive = activeItem === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`navbar__item${isActive ? ' navbar__item--active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={item.label}
                >
                  <span className="navbar__icon-slot">
                    <img
                      src={item.icon}
                      alt=""
                      className={`navbar__icon${item.iconClassName ? ` ${item.iconClassName}` : ''}`}
                    />
                  </span>
                  <span className="navbar__label">{item.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="navbar__panel navbar__panel--search">
          <button type="button" className="navbar__item navbar__item--search" aria-label="Buscar">
            <span className="navbar__icon-slot">
              <img src={iconBusca} alt="" className="navbar__icon navbar__icon--search" />
            </span>
            <span className="navbar__label">Buscar</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
