import { CalendarSection } from '../CalendarSection'
import { CompetitionPlayerProps } from './CompetitionPlayerProps'
import { getCompetitionData } from './competitionData'
import type { LiveEventOpenPayload } from '../../pages/LiveEventPage'

interface CompetitionPageProps {
  sport: string
  competitionId: string
  onLiveMatchClick?: (payload: LiveEventOpenPayload) => void
}

export function CompetitionPage({ sport, competitionId, onLiveMatchClick }: CompetitionPageProps) {
  const data = getCompetitionData(sport, competitionId)

  return (
    <>
      <CalendarSection
        sportFilter={sport}
        competitionId={competitionId}
        onLiveMatchClick={onLiveMatchClick}
      />
      <CompetitionPlayerProps statChips={data.playerStatChips} cards={data.playerProps} />
    </>
  )
}
