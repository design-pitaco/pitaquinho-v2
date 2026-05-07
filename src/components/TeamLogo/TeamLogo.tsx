import { getTeamLogo } from '../../data/teamLogos'
import { useSportsDbTeamLogo } from '../../hooks/useSportsDbTeamLogo'
import { isSportsDbTeamLogoUrl } from '../../services/theSportsDbTeamLogos'
import iconBasquete from '../../assets/iconSports/basketball.png'
import iconFutebol from '../../assets/iconSports/soccer.png'

function getSportFallbackLogo(sport: string) {
  if (sport === 'basquete') return iconBasquete
  if (sport === 'futebol') return iconFutebol
  return ''
}

interface TeamLogoProps {
  teamName: string
  sport: string
  currentLogo?: string
  className: string
  fallbackClassName?: string
  placeholderClassName?: string
  alt?: string
}

export function TeamLogo({
  teamName,
  sport,
  currentLogo,
  className,
  fallbackClassName = '',
  placeholderClassName = '',
  alt = '',
}: TeamLogoProps) {
  const mappedLogo = getTeamLogo(teamName)
  const sportsDbLogo = mappedLogo || (isSportsDbTeamLogoUrl(currentLogo) ? currentLogo : undefined)
  const fallbackLogo = getSportFallbackLogo(sport)
  const resolvedLogo = useSportsDbTeamLogo(teamName, sportsDbLogo, sport, fallbackLogo || undefined)

  if (!resolvedLogo) {
    return placeholderClassName ? <span className={placeholderClassName} /> : null
  }

  const isFallback = fallbackLogo && resolvedLogo === fallbackLogo
  const logoClassName = [
    className,
    isFallback ? fallbackClassName : '',
  ].filter(Boolean).join(' ')

  return <img src={resolvedLogo} alt={alt} className={logoClassName} />
}
