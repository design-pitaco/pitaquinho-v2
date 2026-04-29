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
  'champions-league': {
    id: 'fut-champions',
    name: 'Champions League',
    sport: 'futebol',
  },
  'premier-league': {
    id: 'fut-premier-league',
    name: 'Premier League',
    sport: 'futebol',
  },
  'la-liga': {
    id: 'fut-laliga',
    name: 'LaLiga',
    sport: 'futebol',
  },
  nba: {
    id: 'bsq-nba',
    name: 'NBA',
    sport: 'basquete',
  },
  ncaab: {
    id: 'bsq-ncaab',
    name: 'NCAAB',
    sport: 'basquete',
  },
  'brasil-nbb': {
    id: 'bsq-nbb',
    name: 'NBB',
    sport: 'basquete',
  },
  'euro-cup': {
    id: 'bsq-euro-cup',
    name: 'Euro Cup',
    sport: 'basquete',
  },
}

export function getCompetitionLinkTarget(leagueId: string): CompetitionLinkTarget | null {
  return competitionLinkTargetsByLeagueId[leagueId] ?? null
}
