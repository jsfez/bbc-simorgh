import {
  isCalledOffStatus,
  isInProgressStatus,
  isResultStatus,
} from '../../helpers/event-status-groups';

import Time from '../FixtureTime';
import Score from '../Score';
import styles from './index.module.scss';

export const shouldShowScores = statusGroup =>
  isInProgressStatus(statusGroup) ||
  isResultStatus(statusGroup) ||
  isCalledOffStatus(statusGroup) ||
  statusGroup === 'Postponed';

const Played = ({ data, isConciseView }) => (
  <Score
    status={data.status}
    home={data.home.score}
    homeScoreUnconfirmed={data.home.scoreUnconfirmed}
    away={data.away.score}
    awayScoreUnconfirmed={data.away.scoreUnconfirmed}
    isConciseView={isConciseView}
  />
);

const Centre = ({ data, isConciseView, maxScoreLength }) => {
  const { status } = data;
  const centreClassName =
    maxScoreLength && maxScoreLength > 1
      ? styles.centreWideScore
      : styles.centre;

  return (
    <div className={centreClassName}>
      {shouldShowScores(status) ? (
        <Played data={data} isConciseView={isConciseView} />
      ) : (
        <Time time={data.time} isConciseView={isConciseView} />
      )}
    </div>
  );
};

export default Centre;
