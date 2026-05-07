import './Navbar.css'

import navApostas from '../../assets/navApostas.svg'
import navBusca from '../../assets/navBusca.svg'
import navClub from '../../assets/navClub.svg'
import navHome from '../../assets/navHome.svg'
import navLive from '../../assets/navLive.svg'

interface NavItem {
  id: string
  icon: string
  label: string
}

const navItems: NavItem[] = [
  { id: 'home', icon: navHome, label: 'Início' },
  { id: 'ao-vivo', icon: navLive, label: 'Ao Vivo' },
  { id: 'pitaco-club', icon: navClub, label: 'Pitaco Club' },
  { id: 'apostas', icon: navApostas, label: 'Apostas' },
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
                      className="navbar__icon"
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
              <img src={navBusca} alt="" className="navbar__icon" />
            </span>
            <span className="navbar__label">Buscar</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
