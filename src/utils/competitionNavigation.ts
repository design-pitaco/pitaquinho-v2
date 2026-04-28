export interface CompetitionLinkTarget {
  id: string
  name: string
  sport: string
}

const competitionLinkTargetsByLeagueId: Record<string, CompetitionLinkTarget> = {
  'brasil-serie-a': {
    id: 'fut-brasileiro',
    name: 'Brasileirão Série A',
    sport: 'futebol',
  },
  nba: {
    id: 'bsq-nba',
    name: 'NBA',
    sport: 'basquete',
  },
}

export function getCompetitionLinkTarget(leagueId: string): CompetitionLinkTarget | null {
  return competitionLinkTargetsByLeagueId[leagueId] ?? null
}
