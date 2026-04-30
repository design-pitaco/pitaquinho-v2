import { useEffect, useMemo, useState } from 'react'
import {
  CalendarSection,
  getCompetitionPageEvents,
  updateCompetitionMatchTime,
  type DisplayedCompetitionEvent,
} from '../CalendarSection'
import { CompetitionPlayerProps } from './CompetitionPlayerProps'
import { getCompetitionData } from './competitionData'
import type { PlayerPropCard, PlayerPropOption } from './competitionData'
import {
  getKnownSportsDbPlayerForTeam,
  getSportsDbPlayerForTeam,
  type SportsDbPlayer,
  type SportsDbPlayerSport,
} from '../../services/theSportsDbPlayers'
import type { LiveEventOpenPayload } from '../../pages/LiveEventPage'

interface CompetitionPageProps {
  sport: string
  competitionId: string
  liveOnly?: boolean
  onLiveMatchClick?: (payload: LiveEventOpenPayload) => void
}

const PLAYER_CARD_LIMIT = 5

const TEAM_CODES: Record<string, string> = {
  '76ers': 'PHI',
  'Atl. Mineiro': 'CAM',
  'Atlético Madrid': 'ATM',
  Ajax: 'AJA',
  Alavés: 'ALA',
  Arsenal: 'ARS',
  Augsburg: 'AUG',
  Bahia: 'BAH',
  Barcelona: 'BAR',
  Benfica: 'BEN',
  Besiktas: 'BES',
  Botafogo: 'BOT',
  Brighton: 'BHA',
  Bulls: 'CHI',
  Burnley: 'BUR',
  Cavaliers: 'CLE',
  Celtics: 'BOS',
  Chelsea: 'CHE',
  Clippers: 'LAC',
  Cruzeiro: 'CRU',
  Elche: 'ELC',
  Eintracht: 'SGE',
  Flamengo: 'FLA',
  Fluminense: 'FLU',
  Getafe: 'GET',
  Grêmio: 'GRE',
  Heat: 'MIA',
  Internacional: 'INT',
  Inter: 'INT',
  Jazz: 'UTA',
  Juventude: 'JUV',
  Kings: 'SAC',
  Knicks: 'NYK',
  Lakers: 'LAL',
  Leeds: 'LEE',
  Levante: 'LEV',
  Liverpool: 'LIV',
  Lyon: 'LYO',
  'Man. City': 'MCI',
  Mallorca: 'MAL',
  Mavericks: 'DAL',
  Mirassol: 'MIR',
  Magic: 'ORL',
  Napoli: 'NAP',
  Newcastle: 'NEW',
  Nuggets: 'DEN',
  Palmeiras: 'PAL',
  PSG: 'PSG',
  'RB Leipzig': 'RBL',
  'Real Madrid': 'RMA',
  Santos: 'SAN',
  Sevilla: 'SEV',
  'São Paulo': 'SAO',
  Spurs: 'SAS',
  Suns: 'PHX',
  Thunder: 'OKC',
  Tottenham: 'TOT',
  Villarreal: 'VIL',
  Vitória: 'VIT',
  Warriors: 'GSW',
  'West Ham': 'WHU',
  Wolfsburg: 'WOL',
  Wolves: 'WOL',
}

const TEAM_IMPORTANCE: Record<string, number> = {
  Flamengo: 10,
  Palmeiras: 11,
  'São Paulo': 12,
  Corinthians: 13,
  'Atl. Mineiro': 14,
  Botafogo: 15,
  Fluminense: 16,
  Grêmio: 17,
  Internacional: 18,
  Cruzeiro: 19,
  Santos: 20,
  Bahia: 35,
  Bragantino: 55,
  Mirassol: 80,
}

interface PlayerCandidate {
  eventData: DisplayedCompetitionEvent
  teamName: string
  sport: SportsDbPlayerSport
}

interface ResolvedPlayerCandidate extends PlayerCandidate {
  order: number
  player: SportsDbPlayer
}

interface ResolvedPlayersState {
  key: string
  players: ResolvedPlayerCandidate[]
}

const getTeamCode = (teamName: string) =>
  TEAM_CODES[teamName] ?? teamName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 3).toUpperCase()

const buildMatchLabel = ({ event }: DisplayedCompetitionEvent) =>
  `${getTeamCode(event.homeName)} X ${getTeamCode(event.awayName)}`

const seedFromText = (text: string) =>
  text.split('').reduce((total, char) => total + char.charCodeAt(0), 0)

const formatOdd = (value: number) => `${Math.max(1.05, value).toFixed(2)}x`

const options = (values: Array<[string, number]>): PlayerPropOption[] =>
  values.map(([label, odd], index) => ({
    label,
    odd: formatOdd(odd),
    active: index === 1,
  }))

const buildFootballOptionsByStat = (seed: number): PlayerPropCard['optionsByStat'] => {
  const variation = (seed % 9) * 0.03

  return {
    'finalizacao-gol': options([
      ['0.5+', 1.32 + variation],
      ['1.5+', 1.78 + variation],
      ['2.5+', 2.82 + variation],
    ]),
    'finalizacao-total': options([
      ['1.5+', 1.28 + variation],
      ['2.5+', 1.66 + variation],
      ['3.5+', 2.26 + variation],
    ]),
    gols: options([
      ['0.5+', 2.05 + variation],
      ['1.5+', 5.80 + variation],
      ['2.5+', 16.00 + variation],
    ]),
    assistencias: options([
      ['0.5+', 2.70 + variation],
      ['1.0+', 4.60 + variation],
      ['2.0+', 12.50 + variation],
    ]),
  }
}

const buildBasketballOptionsByStat = (seed: number): PlayerPropCard['optionsByStat'] => {
  const variation = (seed % 9) * 0.03

  return {
    pontos: options([
      ['15.5+', 1.34 + variation],
      ['20.5+', 1.82 + variation],
      ['25.5+', 2.72 + variation],
    ]),
    rebotes: options([
      ['4.5+', 1.38 + variation],
      ['6.5+', 1.88 + variation],
      ['8.5+', 2.80 + variation],
    ]),
    assistencias: options([
      ['3.5+', 1.42 + variation],
      ['5.5+', 1.95 + variation],
      ['7.5+', 3.10 + variation],
    ]),
    'bolas-3': options([
      ['1.5+', 1.36 + variation],
      ['2.5+', 1.92 + variation],
      ['3.5+', 3.20 + variation],
    ]),
  }
}

const buildOptionsByStat = (
  seed: number,
  sport: SportsDbPlayerSport
): PlayerPropCard['optionsByStat'] =>
  sport === 'basketball'
    ? buildBasketballOptionsByStat(seed)
    : buildFootballOptionsByStat(seed)

const isPlayerPropsLeague = ({ league }: DisplayedCompetitionEvent) =>
  league.sport === 'futebol' || league.id === 'nba'

const getPlayerSport = ({ league }: DisplayedCompetitionEvent): SportsDbPlayerSport =>
  league.sport === 'basquete' ? 'basketball' : 'football'

const getTeamImportance = (teamName: string) => TEAM_IMPORTANCE[teamName] ?? 100

const getPlayerCandidates = (events: DisplayedCompetitionEvent[]): PlayerCandidate[] => {
  const eligibleEvents = events.filter(isPlayerPropsLeague)

  return eligibleEvents.map((eventData) => {
    const sport = getPlayerSport(eventData)
    const [selectedTeam] = [eventData.event.homeName, eventData.event.awayName]
      .map((teamName, index) => ({ eventData, teamName, sport, index }))
      .sort((a, b) => getTeamImportance(a.teamName) - getTeamImportance(b.teamName) || a.index - b.index)

    return {
      eventData,
      teamName: selectedTeam.teamName,
      sport,
    }
  })
}

const getEventsKey = (events: DisplayedCompetitionEvent[]) =>
  events.map(({ event }) => `${event.id}:${event.dateTime}`).join('|')

const getInitialMatchTimes = (events: DisplayedCompetitionEvent[]) =>
  events.reduce<Record<string, string>>((times, { event }) => {
    if (event.isLive) times[event.id] = event.dateTime
    return times
  }, {})

const getPlayerCandidateKey = (candidate: PlayerCandidate) =>
  `${candidate.eventData.event.id}:${candidate.teamName}`

const getFallbackResolvedPlayers = (events: DisplayedCompetitionEvent[]): ResolvedPlayerCandidate[] => {
  const uniquePlayers = new Set<string>()

  return getPlayerCandidates(events).reduce<ResolvedPlayerCandidate[]>((players, candidate, order) => {
    const player = getKnownSportsDbPlayerForTeam(candidate.teamName, candidate.sport)
    if (!player || uniquePlayers.has(player.id)) return players

    uniquePlayers.add(player.id)
    players.push({ ...candidate, order, player })
    return players
  }, [])
}

const mergeResolvedPlayers = (
  apiPlayers: ResolvedPlayerCandidate[],
  fallbackPlayers: ResolvedPlayerCandidate[]
) => {
  const usedCandidateKeys = new Set<string>()
  const usedPlayerIds = new Set<string>()
  const merged: ResolvedPlayerCandidate[] = []

  const addPlayer = (candidate: ResolvedPlayerCandidate) => {
    const candidateKey = getPlayerCandidateKey(candidate)
    if (usedCandidateKeys.has(candidateKey) || usedPlayerIds.has(candidate.player.id)) return

    usedCandidateKeys.add(candidateKey)
    usedPlayerIds.add(candidate.player.id)
    merged.push(candidate)
  }

  apiPlayers.forEach(addPlayer)
  fallbackPlayers.forEach(addPlayer)

  return merged
    .sort((a, b) => a.order - b.order)
    .slice(0, PLAYER_CARD_LIMIT)
}

const buildPlayerCard = (
  candidate: ResolvedPlayerCandidate,
  matchTimes: Record<string, string>
): PlayerPropCard => {
  const { eventData, teamName, player } = candidate
  const { event } = eventData
  const seed = seedFromText(`${event.id}:${teamName}:${player.id}`)

  return {
    id: `${event.id}-${teamName}-${player.id}`,
    matchLabel: buildMatchLabel(eventData),
    highlightedTeam: getTeamCode(teamName),
    matchTime: event.isLive ? matchTimes[event.id] ?? event.dateTime : event.dateTime,
    playerName: player.name,
    playerImage: player.imageUrl,
    playerImageAdjustment: player.imageAdjustment,
    optionsByStat: buildOptionsByStat(seed, candidate.sport),
  }
}

export function CompetitionPage({ sport, competitionId, liveOnly = false, onLiveMatchClick }: CompetitionPageProps) {
  const data = getCompetitionData(sport, competitionId)
  const displayedEvents = useMemo(
    () => getCompetitionPageEvents(sport, competitionId, liveOnly),
    [sport, competitionId, liveOnly]
  )
  const eventsKey = useMemo(() => getEventsKey(displayedEvents), [displayedEvents])
  const initialMatchTimes = useMemo(() => getInitialMatchTimes(displayedEvents), [displayedEvents])
  const hasLiveEvents = useMemo(
    () => displayedEvents.some(({ event }) => event.isLive),
    [displayedEvents]
  )
  const [matchTimesState, setMatchTimesState] = useState(() => ({
    key: eventsKey,
    times: initialMatchTimes,
  }))
  const matchTimes = matchTimesState.key === eventsKey ? matchTimesState.times : initialMatchTimes
  const [resolvedPlayersState, setResolvedPlayersState] = useState<ResolvedPlayersState>({
    key: eventsKey,
    players: [],
  })
  const resolvedPlayers = useMemo(
    () => resolvedPlayersState.key === eventsKey ? resolvedPlayersState.players : [],
    [eventsKey, resolvedPlayersState]
  )
  const fallbackResolvedPlayers = useMemo(
    () => getFallbackResolvedPlayers(displayedEvents),
    [displayedEvents]
  )

  useEffect(() => {
    let cancelled = false
    const candidates = getPlayerCandidates(displayedEvents).slice(0, PLAYER_CARD_LIMIT * 3)

    candidates.forEach((candidate, order) => {
      getSportsDbPlayerForTeam(candidate.teamName, candidate.sport).then((player) => {
        if (cancelled || !player) return

        setResolvedPlayersState((current) => {
          const currentPlayers = current.key === eventsKey ? current.players : []
          if (currentPlayers.some((item) => item.player.id === player.id)) {
            return current.key === eventsKey ? current : { key: eventsKey, players: currentPlayers }
          }

          const players = [
            ...currentPlayers,
            { ...candidate, order, player },
          ]
            .sort((a, b) => a.order - b.order)
            .slice(0, PLAYER_CARD_LIMIT)

          return { key: eventsKey, players }
        })
      })
    })

    return () => {
      cancelled = true
    }
  }, [displayedEvents, eventsKey])

  useEffect(() => {
    if (!hasLiveEvents) return

    const interval = setInterval(() => {
      setMatchTimesState((current) => {
        const sourceTimes = current.key === eventsKey ? current.times : initialMatchTimes
        const next: Record<string, string> = {}
        Object.keys(initialMatchTimes).forEach((id) => {
          next[id] = updateCompetitionMatchTime(sourceTimes[id] ?? initialMatchTimes[id])
        })
        return { key: eventsKey, times: next }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [eventsKey, hasLiveEvents, initialMatchTimes])

  const playerProps = useMemo(
    () => mergeResolvedPlayers(resolvedPlayers, fallbackResolvedPlayers)
      .map((candidate) => buildPlayerCard(candidate, matchTimes)),
    [fallbackResolvedPlayers, resolvedPlayers, matchTimes]
  )

  return (
    <>
      <CalendarSection
        sportFilter={sport}
        competitionId={competitionId}
        liveOnly={liveOnly}
        matchTimesOverride={matchTimes}
        onLiveMatchClick={onLiveMatchClick}
      />
      {playerProps.length > 0 && (
        <CompetitionPlayerProps statChips={data.playerStatChips} cards={playerProps} />
      )}
    </>
  )
}
