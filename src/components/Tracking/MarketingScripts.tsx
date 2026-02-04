'use client';

import { MetaPixel } from '@/components/Meta/MetaPixel';
import { useMarketingConsent } from '@/lib/consent/marketingConsent';
import { GoogleTagManager } from '@next/third-parties/google';

const GTM_ID = 'GTM-5TF5L8PQ';

const MarketingScripts = (): React.ReactElement | null => {
  const consent = useMarketingConsent();

  if (consent !== '1') return null;

  return (
    <>
      <GoogleTagManager gtmId={GTM_ID} />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          className="tracking-hidden"
        />
      </noscript>
      <MetaPixel />
    </>
  );
};

export default MarketingScripts;
