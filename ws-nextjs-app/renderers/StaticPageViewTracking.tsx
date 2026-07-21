import { addSendStaticBeaconToWindow } from '#app/lib/analyticsUtils/staticATITracking/sendStaticBeacon';

type Props = {
  nonce?: string;
};

/**
 * Component for injecting sendStaticBeacon function to facilitate
 * GET requests to Piano
 */
const StaticPageViewTracking = ({ nonce }: Props) => {
  return (
    <script
      nonce={nonce}
      type="text/javascript"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `(${addSendStaticBeaconToWindow.toString()})()`,
      }}
    />
  );
};

export default StaticPageViewTracking;
