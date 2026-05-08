import { Home } from './pages/Home'
import { MobileOnly } from './components/MobileOnly'
import { Navbar } from './components/Navbar'

function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, '')
  const isNovoTrilhoRoute = currentPath.endsWith('/novo-trilho')

  return (
    <>
      <MobileOnly />
      <Home railVariant={isNovoTrilhoRoute ? 'competitions' : 'default'} />
      <Navbar />
    </>
  )
}

export default App
