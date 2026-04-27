import './Navbar.css'

import navActiveBlur from '../../assets/navActiveBlur.svg'
import navEntradas from '../../assets/navEntradas.svg'
import navHome from '../../assets/navHome.svg'
import navPitacoClub from '../../assets/navPitacoClub.svg'

interface NavItem {
  id: string
  icon?: string
  label: string
  balance?: string
}

const navItems: NavItem[] = [
  { id: 'home', icon: navHome, label: 'Início' },
  { id: 'pitaco-club', icon: navPitacoClub, label: 'Pitaco Club' },
  { id: 'entradas', icon: navEntradas, label: 'Entradas' },
  { id: 'perfil', label: 'Meu Perfil', balance: 'R$ 3.400,89' },
]

export function Navbar() {
  // Por enquanto, o item ativo é fixo em "home"
  const activeItem = 'home'

  return (
    <nav className="navbar">
      <div className="navbar__container">
        {navItems.map((item) => {
          const isActive = activeItem === item.id

          return (
            <button
              key={item.id}
              type="button"
              className={`navbar__item ${isActive ? 'navbar__item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              {isActive ? <img src={navActiveBlur} alt="" className="navbar__active-blur" /> : null}

              {item.icon ? (
                <span className="navbar__icon-slot">
                  <img src={item.icon} alt="" className="navbar__icon" />
                </span>
              ) : (
                <span className="navbar__balance-slot">
                  <span className="navbar__balance">{item.balance}</span>
                </span>
              )}

              <span className="navbar__label">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
