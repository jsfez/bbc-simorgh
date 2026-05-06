import styles from './index.module.scss';

const MATCH_STATUS_LETTERS = {
  Postponed: 'P',
  Cancelled: 'C',
};

const Score = ({
  status,
  home,
  homeScoreUnconfirmed,
  away,
  awayScoreUnconfirmed,
}) => {
  const matchStatusLetter = MATCH_STATUS_LETTERS[status];
  const homeScore = homeScoreUnconfirmed || home;
  const awayScore = awayScoreUnconfirmed || away;

  return (
    <div className={styles.score} data-testid="score" aria-hidden="true">
      <div className={styles.homeScore}>{matchStatusLetter || homeScore}</div>
      <div className={styles.verticalLine} />
      <div className={styles.awayScore}>{matchStatusLetter || awayScore}</div>
    </div>
  );
};

export default Score;

export const VerticalLine = ({ children }) => (
  <div className={styles.verticalLine}>{children}</div>
);
