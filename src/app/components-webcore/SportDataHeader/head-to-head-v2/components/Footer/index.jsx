import styles from './index.module.scss';

const Footer = ({ venue, attendanceValue, attendanceInfo }) => {
  const formattedAttendanceValue = attendanceValue?.toLocaleString();

  return (
    <div className={styles.footer}>
      <hr className={styles.horizontalRule} aria-hidden />
      <div className={styles.footerTextWrapper}>
        <div className={styles.venue}>
          <span className={styles.venueLabel}>Venue:</span>
          {attendanceInfo ? `${venue} (${attendanceInfo})` : venue}
        </div>
      </div>
      <div className={styles.footerTextWrapper}>
        {attendanceValue && (
          <div className={styles.attendanceValue}>
            <span className={styles.attendanceLabel}>Attendance:</span>
            {formattedAttendanceValue}
          </div>
        )}
      </div>
    </div>
  );
};

export default Footer;
