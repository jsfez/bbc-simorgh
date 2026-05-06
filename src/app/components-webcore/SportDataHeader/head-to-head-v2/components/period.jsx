import { getFallbackFootballPeriodLabel } from '../helpers/event-summary';
import styles from './index.module.scss';

const Period = ({ labels, status, homeRunningScores, awayRunningScores }) => {
  const period = getFallbackFootballPeriodLabel(
    labels,
    status,
    homeRunningScores,
    awayRunningScores,
  );
  return (
    <div className={styles.period} aria-hidden="true">
      <div>{period.value}</div>
    </div>
  );
};

export default Period;
