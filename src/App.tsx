import { Home } from './pages/Home'
import { MobileOnly } from './components/MobileOnly'
import { Navbar } from './components/Navbar'

function App() {
  const currentPath = window.location.pathname.replace(/\/+$/, '')
  const isNovoTrilhoRoute = currentPath.endsWith('/novo-trilho')
  const isNovoTrilho02Route = currentPath.endsWith('/novo-trilho-02')
  const railVariant = isNovoTrilho02Route
    ? 'inverted-hierarchy'
    : isNovoTrilhoRoute
      ? 'competitions'
      : 'default'

  return (
    <>
      <MobileOnly />
      <Home railVariant={railVariant} />
      <Navbar />
    </>
  )
}

export default App
