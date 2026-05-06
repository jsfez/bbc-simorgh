import { isLiveStatus } from '../helpers/event-status-groups';
import styles from './index.module.scss';

const formatTournamentDescriptionLabel = tournamentDescriptionLabel => {
  const tournamentGroupsArray = tournamentDescriptionLabel.split(' - ');

  return tournamentGroupsArray.map((element, i) => {
    if (tournamentGroupsArray.length === i + 1) {
      return (
        // eslint-disable-next-line react/no-array-index-key
        <div
          className={styles.competitionFormatter}
          key={`tournament_part_${i}`}
        >
          {element}
        </div>
      );
    }
    return (
      // eslint-disable-next-line react/no-array-index-key
      <div className={styles.competitionFormatter} key={`tournament_part_${i}`}>
        {element} -{' '}
      </div>
    );
  });
};

const HeadToHeadHeader = ({ date, tournamentDescriptionLabel, status }) => (
  <div
    className={
      isLiveStatus(status) ? styles.headerWrapperLive : styles.headerWrapper
    }
  >
    {!isLiveStatus(status) && (
      <div className={styles.dateWrapper}>
        <div className={styles.dateHeader}>
          <time className={styles.date}>{date}</time>
        </div>
        <div className={styles.interpunct} aria-hidden>
          ‧
        </div>
      </div>
    )}
    <div className={styles.tournamentHeader}>
      {formatTournamentDescriptionLabel(tournamentDescriptionLabel)}
    </div>
  </div>
);

export default HeadToHeadHeader;
