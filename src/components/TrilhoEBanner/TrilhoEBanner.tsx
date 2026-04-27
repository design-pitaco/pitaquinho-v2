import { BannerCarousel } from '../BannerCarousel'
import './TrilhoEBanner.css'

interface TrilhoEBannerProps {
  hideBanner?: boolean
}

export function TrilhoEBanner({ hideBanner }: TrilhoEBannerProps = {}) {
  if (hideBanner) return null
  return (
    <section className="trilho-e-banner">
      <BannerCarousel />
    </section>
  )
}
