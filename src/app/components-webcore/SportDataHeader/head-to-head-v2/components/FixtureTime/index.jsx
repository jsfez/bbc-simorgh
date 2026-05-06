import VisuallyHiddenText from '../../../../../components/VisuallyHiddenText';
import styles from './index.module.scss';

const Time = ({ time }) => (
  <>
    <time className={styles.fixtureTime} aria-hidden="true">
      {time.displayTimeUK}
    </time>
    <VisuallyHiddenText>{time.accessibleTime}</VisuallyHiddenText>
  </>
);

export default Time;
