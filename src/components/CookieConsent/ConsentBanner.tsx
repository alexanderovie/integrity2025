'use client';

import { useState, useEffect } from 'react';
import {
  getMarketingConsent,
  setMarketingConsent,
  ConsentStatus,
} from '@/lib/analytics/consent';

const ConsentBanner = (): React.ReactElement | null => {
  const [consent, setConsentState] = useState<ConsentStatus>('loading');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    getMarketingConsent().then(({ status }) => {
      setConsentState(status);
      setVisible(status === 'loading' || status === '0');
    });
  }, []);

  const handleAccept = async () => {
    await setMarketingConsent('1');
    setConsentState('1');
    setVisible(false);
  };

  const handleReject = async () => {
    await setMarketingConsent('0');
    setConsentState('0');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white text-secondary dark:bg-secondary dark:text-white px-6 py-4 shadow-lg">
      <div className="container flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm md:text-base">
          We use cookies for analytics and marketing. You can accept or reject non-essential cookies.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReject}
            className="border border-white/40 px-4 py-2 text-sm rounded-sm hover:bg-white/10"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="bg-primary hover:bg-deep-blue text-white px-4 py-2 text-sm rounded-sm"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentBanner;
