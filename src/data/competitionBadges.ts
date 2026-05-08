export const COMPETITION_BADGES: Record<string, string> = {
  'fut-brasileiro': 'https://r2.thesportsdb.com/images/media/league/badge/lywv7t1766787179.png',
  'fut-brasileirao-a': 'https://r2.thesportsdb.com/images/media/league/badge/lywv7t1766787179.png',
  'fut-champions': 'https://r2.thesportsdb.com/images/media/league/badge/facv1u1742998896.png',
  'fut-premier-league': 'https://r2.thesportsdb.com/images/media/league/badge/gasy9d1737743125.png',
  'fut-laliga': 'https://r2.thesportsdb.com/images/media/league/badge/ja4it51687628717.png',
  'bsq-nba': 'https://r2.thesportsdb.com/images/media/league/badge/frdjqy1536585083.png',
  'bsq-nba-2': 'https://r2.thesportsdb.com/images/media/league/badge/frdjqy1536585083.png',
  'ten-atp-roma': 'https://r2.thesportsdb.com/images/media/league/badge/q7aej51769857150.png',
}

export function getCompetitionBadge(competitionId: string, fallback = ''): string {
  return COMPETITION_BADGES[competitionId] ?? fallback
}
