import type { PlayerImageAdjustment } from '../components/CompetitionPage/competitionData'

export interface SportsDbPlayer {
  id: string
  name: string
  teamName: string
  imageUrl: string
  imageAdjustment: PlayerImageAdjustment
}

export type SportsDbPlayerSport = 'football' | 'basketball'

interface SportsDbTeamRecord {
  idTeam?: string | null
}

interface SportsDbTeamResponse {
  teams?: SportsDbTeamRecord[] | null
}

interface SportsDbPlayerRecord {
  idPlayer?: string | null
  strPlayer?: string | null
  strTeam?: string | null
  strStatus?: string | null
  strPosition?: string | null
  strCutout?: string | null
  strRender?: string | null
  strThumb?: string | null
}

interface SportsDbPlayersResponse {
  player?: SportsDbPlayerRecord[] | null
}

const API_KEY = '3'
const API_BASE_URL = import.meta.env.DEV
  ? `/sportsdb/api/v1/json/${API_KEY}`
  : `https://www.thesportsdb.com/api/v1/json/${API_KEY}`
const REQUEST_TIMEOUT_MS = 5000

const TEAM_SEARCH_ALIASES: Record<string, string> = {
  'Atl. Mineiro': 'Atletico Mineiro',
  'Atlético Madrid': 'Atletico Madrid',
  'Atlético-MG': 'Atletico Mineiro',
  Alavés: 'Deportivo Alaves',
  'B. Dortmund': 'Borussia Dortmund',
  'B. Leverkusen': 'Bayer Leverkusen',
  Bayern: 'Bayern Munich',
  Brighton: 'Brighton & Hove Albion',
  Eintracht: 'Eintracht Frankfurt',
  Hamburger: 'Hamburger SV',
  Inter: 'Inter Milan',
  Leeds: 'Leeds United',
  'Man. City': 'Manchester City',
  Newcastle: 'Newcastle United',
  PSG: 'Paris SG',
  Tottenham: 'Tottenham Hotspur',
  '76ers': 'Philadelphia 76ers',
  Bulls: 'Chicago Bulls',
  Cavaliers: 'Cleveland Cavaliers',
  Celtics: 'Boston Celtics',
  Clippers: 'Los Angeles Clippers',
  Heat: 'Miami Heat',
  Jazz: 'Utah Jazz',
  Kings: 'Sacramento Kings',
  Knicks: 'New York Knicks',
  Lakers: 'Los Angeles Lakers',
  Magic: 'Orlando Magic',
  Mavericks: 'Dallas Mavericks',
  Nuggets: 'Denver Nuggets',
  Spurs: 'San Antonio Spurs',
  Suns: 'Phoenix Suns',
  Thunder: 'Oklahoma City Thunder',
  Warriors: 'Golden State Warriors',
}

const teamIdCache = new Map<string, Promise<string | null>>()
const playerCache = new Map<string, Promise<SportsDbPlayer | null>>()

const DEFAULT_PLAYER_IMAGE_ADJUSTMENT: PlayerImageAdjustment = {
  scale: 1,
  x: 0,
  y: 0,
}

const PLAYER_IMAGE_ADJUSTMENTS: Record<string, PlayerImageAdjustment> = {
  // The API cutouts are framed differently, so these normalize face size inside the 92x52 window.
  '34194887': { scale: 1, x: 0, y: 0 }, // Pedro
  '34163600': { scale: 1.34, x: 0, y: -5 }, // Alan Patrick
  '34219163': { scale: 1.16, x: 0, y: -2 }, // Alesson
  '34161024': { scale: 2.15, x: 14, y: 0 }, // Jonathan Calleri
  '34200399': { scale: 1.08, x: 0, y: 0 }, // José Manuel López
  '34182604': { scale: 1.18, x: 0, y: 0 }, // Jefferson Savarino
  '34161149': { scale: 1.12, x: 0, y: -3 }, // Ademola Lookman
  '34181129': { scale: 1.08, x: 0, y: -2 }, // Gonçalo Ramos
  '34194505': { scale: 0.96, x: 0, y: 0 }, // Arda Güler
  '34163447': { scale: 1, x: 0, y: 0 }, // Alexander Isak
  '34202599': { scale: 1, x: 0, y: 0 }, // Andreas Schjelderup
  '34169884': { scale: 0.78, x: 0, y: 0 }, // Bukayo Saka
  '34169203': { scale: 1, x: 0, y: 0 }, // Dejan Kulusevski
  '34174227': { scale: 0.98, x: 0, y: 0 }, // Brenden Aaronson
  '34222119': { scale: 1.08, x: 0, y: -2 }, // Abu Kamara
  '34145656': { scale: 0.98, x: 0, y: 0 }, // Adnan Januzaj
  '34170266': { scale: 0.98, x: 0, y: 0 }, // Abdón Prats
  '34165361': { scale: 1.12, x: 0, y: 0 }, // Lauri Markkanen
  '34164224': { scale: 1.16, x: 0, y: 0 }, // Shai Gilgeous-Alexander
  '34161316': { scale: 1.16, x: 0, y: 0 }, // Jalen Brunson
  '34165845': { scale: 1.16, x: 0, y: 0 }, // Anfernee Simons
  '34196106': { scale: 1.16, x: 0, y: 0 }, // Tyrese Maxey
  '34165427': { scale: 1.08, x: 0, y: 0 }, // Nikola Jokić
}

const getImageUrl = (player: SportsDbPlayerRecord) =>
  player.strCutout || player.strRender || player.strThumb || ''

const getImageAdjustment = (playerId: string) =>
  PLAYER_IMAGE_ADJUSTMENTS[playerId] ?? DEFAULT_PLAYER_IMAGE_ADJUSTMENT

const FOOTBALL_SCORER_PLAYERS_BY_TEAM: Record<string, Omit<SportsDbPlayer, 'imageAdjustment'>> = {
  Flamengo: {
    id: '34194887',
    name: 'Pedro',
    teamName: 'Flamengo',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/ercx9t1750919772.png',
  },
  Internacional: {
    id: '34163600',
    name: 'Alan Patrick',
    teamName: 'Internacional',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/m3dyrk1767558419.png',
  },
  Mirassol: {
    id: '34219163',
    name: 'Alesson',
    teamName: 'Mirassol',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/taz6cx1767623029.png',
  },
  'São Paulo': {
    id: '34161024',
    name: 'Jonathan Calleri',
    teamName: 'São Paulo',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/render/p1jsv91603136426.png',
  },
  Palmeiras: {
    id: '34200399',
    name: 'José Manuel López',
    teamName: 'Palmeiras',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/pj879t1755631423.png',
  },
  Botafogo: {
    id: '34182604',
    name: 'Jefferson Savarino',
    teamName: 'Botafogo RJ',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/jv3t9r1749561330.png',
  },
  Bragantino: {
    id: '34219136',
    name: 'Eduardo Sasha',
    teamName: 'Bragantino',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/ifjyhc1766835102.png',
  },
}

const BASKETBALL_PLAYERS_BY_TEAM: Record<string, Omit<SportsDbPlayer, 'imageAdjustment'>> = {
  Jazz: {
    id: '34165361',
    name: 'Lauri Markkanen',
    teamName: 'Utah Jazz',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/llcl0q1730497806.png',
  },
  Thunder: {
    id: '34164224',
    name: 'Shai Gilgeous-Alexander',
    teamName: 'Oklahoma City Thunder',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/mr0eac1699043800.png',
  },
  Knicks: {
    id: '34161316',
    name: 'Jalen Brunson',
    teamName: 'New York Knicks',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/mr4fe21711892054.png',
  },
  Bulls: {
    id: '34165845',
    name: 'Anfernee Simons',
    teamName: 'Chicago Bulls',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/pkh5na1759583574.png',
  },
  '76ers': {
    id: '34196106',
    name: 'Tyrese Maxey',
    teamName: 'Philadelphia 76ers',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/1s0mk71700855374.png',
  },
  Nuggets: {
    id: '34165427',
    name: 'Nikola Jokić',
    teamName: 'Denver Nuggets',
    imageUrl: 'https://r2.thesportsdb.com/images/media/player/cutout/hqzhc61766921696.png',
  },
}

const getKnownPlayersBySport = (sport: SportsDbPlayerSport) =>
  sport === 'basketball' ? BASKETBALL_PLAYERS_BY_TEAM : FOOTBALL_SCORER_PLAYERS_BY_TEAM

export function getKnownSportsDbPlayerForTeam(
  teamName: string,
  sport: SportsDbPlayerSport = 'football'
): SportsDbPlayer | null {
  const player = getKnownPlayersBySport(sport)[teamName]
  if (!player) return null

  return {
    ...player,
    imageAdjustment: getImageAdjustment(player.id),
  }
}

const isUsablePlayer = (player: SportsDbPlayerRecord) => {
  const status = player.strStatus?.toLowerCase()
  const position = player.strPosition?.toLowerCase() ?? ''

  return Boolean(
    player.idPlayer &&
    player.strPlayer &&
    getImageUrl(player) &&
    (!status || status === 'active') &&
    !position.includes('manager') &&
    !position.includes('coach')
  )
}

const SCORING_POSITION_TERMS = [
  'attacker',
  'attacking midfield',
  'centre-forward',
  'center-forward',
  'forward',
  'striker',
  'winger',
]

const BASKETBALL_POSITION_TERMS = [
  'center',
  'centre',
  'forward',
  'guard',
]

const NON_SCORING_POSITION_TERMS = [
  'back',
  'centre-back',
  'center-back',
  'defender',
  'defensive midfield',
  'goalkeeper',
  'keeper',
  'manager',
  'coach',
]

const isScoringPlayer = (player: SportsDbPlayerRecord, sport: SportsDbPlayerSport) => {
  const position = player.strPosition?.toLowerCase() ?? ''

  if (sport === 'basketball') {
    return Boolean(
      isUsablePlayer(player) &&
      BASKETBALL_POSITION_TERMS.some((term) => position.includes(term))
    )
  }

  return Boolean(
    isUsablePlayer(player) &&
    !NON_SCORING_POSITION_TERMS.some((term) => position.includes(term)) &&
    SCORING_POSITION_TERMS.some((term) => position.includes(term))
  )
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) return null
    return response.json() as Promise<T>
  } catch {
    return null
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function fetchTeamId(teamName: string): Promise<string | null> {
  const searchName = TEAM_SEARCH_ALIASES[teamName] ?? teamName
  const url = `${API_BASE_URL}/searchteams.php?t=${encodeURIComponent(searchName)}`
  const data = await fetchJson<SportsDbTeamResponse>(url)
  return data?.teams?.[0]?.idTeam ?? null
}

function getTeamId(teamName: string) {
  const cacheKey = TEAM_SEARCH_ALIASES[teamName] ?? teamName
  const cached = teamIdCache.get(cacheKey)
  if (cached) return cached

  const promise = fetchTeamId(teamName)
    .then((teamId) => {
      if (!teamId) teamIdCache.delete(cacheKey)
      return teamId
    })
    .catch(() => {
      teamIdCache.delete(cacheKey)
      return null
    })
  teamIdCache.set(cacheKey, promise)
  return promise
}

async function fetchPlayerForTeam(
  teamName: string,
  sport: SportsDbPlayerSport
): Promise<SportsDbPlayer | null> {
  const teamId = await getTeamId(teamName)
  if (!teamId) return null

  const url = `${API_BASE_URL}/lookup_all_players.php?id=${encodeURIComponent(teamId)}`
  const data = await fetchJson<SportsDbPlayersResponse>(url)
  const player = data?.player?.find((candidate) => isScoringPlayer(candidate, sport))
  if (!player || !player.idPlayer || !player.strPlayer) return null

  return {
    id: player.idPlayer,
    name: player.strPlayer,
    teamName: player.strTeam || teamName,
    imageUrl: getImageUrl(player),
    imageAdjustment: getImageAdjustment(player.idPlayer),
  }
}

export function getSportsDbPlayerForTeam(
  teamName: string,
  sport: SportsDbPlayerSport = 'football'
) {
  const cacheKey = `${sport}:${teamName}`
  const cached = playerCache.get(cacheKey)
  if (cached) return cached

  const knownPlayer = getKnownSportsDbPlayerForTeam(teamName, sport)
  if (knownPlayer) {
    const promise = Promise.resolve(knownPlayer)
    playerCache.set(cacheKey, promise)
    return promise
  }

  const promise = fetchPlayerForTeam(teamName, sport)
    .then((player) => {
      if (!player) playerCache.delete(cacheKey)
      return player
    })
    .catch(() => {
      playerCache.delete(cacheKey)
      return null
    })
  playerCache.set(cacheKey, promise)
  return promise
}
