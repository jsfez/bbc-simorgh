import VisuallyHiddenText from '../../../../components/VisuallyHiddenText';
import styles from './index.module.scss';

const PenaltyScores = ({ data }) => {
  const { winner, seriesWinner, multiLeg, status } = data;

  const isPostEvent = status?.toLowerCase() === 'postevent';
  const hasWinner = winner !== undefined;
  const isDrawWithNoSeriesWinner = winner === 'draw' && !seriesWinner;
  const isMultiLegWithNoSeriesWinner = multiLeg?.leg > 1 && !seriesWinner;

  if (
    !isPostEvent ||
    !hasWinner ||
    isDrawWithNoSeriesWinner ||
    isMultiLegWithNoSeriesWinner
  ) {
    return null;
  }

  const winnerOnPenalties = seriesWinner ?? winner;
  const loserOnPenalties =
    winnerOnPenalties.toLowerCase() === 'home' ? 'away' : 'home';
  const winnerOnPenaltiesName = data[winnerOnPenalties].fullName;
  const winnerOnPenaltiesScore =
    data[winnerOnPenalties].runningScores.penaltyShootout;
  const loserOnPenaltiesScore =
    data[loserOnPenalties].runningScores.penaltyShootout;

  return (
    <div className={styles.penaltyScoresContainer}>
      <VisuallyHiddenText>
        {`${winnerOnPenaltiesName} win ${winnerOnPenaltiesScore} - ${loserOnPenaltiesScore} on penalties`}
      </VisuallyHiddenText>
      <div
        className={styles.penaltiesText}
        aria-hidden="true"
        data-testid="penalties-text"
      >
        <span
          className={styles.winningTeamName}
        >{`${winnerOnPenaltiesName}`}</span>
        {` win ${winnerOnPenaltiesScore}-${loserOnPenaltiesScore} on pens`}
      </div>
    </div>
  );
};

export default PenaltyScores;
