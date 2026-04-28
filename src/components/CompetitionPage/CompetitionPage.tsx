import { CalendarSection } from '../CalendarSection'
import { CompetitionPlayerProps } from './CompetitionPlayerProps'
import { getCompetitionData } from './competitionData'
import type { LiveEventOpenPayload } from '../../pages/LiveEventPage'

interface CompetitionPageProps {
  sport: string
  competitionId: string
  liveOnly?: boolean
  onLiveMatchClick?: (payload: LiveEventOpenPayload) => void
}

const isLiveMatchTime = (time: string) =>
  /^(\dT|Q\d) \d{1,2}:\d{2}$/.test(time) || time === 'Intervalo' || time === 'INT'

export function CompetitionPage({ sport, competitionId, liveOnly = false, onLiveMatchClick }: CompetitionPageProps) {
  const data = getCompetitionData(sport, competitionId)
  const playerProps = liveOnly
    ? data.playerProps.filter((card) => isLiveMatchTime(card.matchTime))
    : data.playerProps

  return (
    <>
      <CalendarSection
        sportFilter={sport}
        competitionId={competitionId}
        liveOnly={liveOnly}
        onLiveMatchClick={onLiveMatchClick}
      />
      <CompetitionPlayerProps statChips={data.playerStatChips} cards={playerProps} />
    </>
  )
}
