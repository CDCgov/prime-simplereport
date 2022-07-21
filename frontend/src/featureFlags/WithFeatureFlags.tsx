import { useEffect, useState } from "react";
import { FlagsProvider } from "flagged";

import { FeatureFlagsApiService } from "./FeatureFlagsApiService";

type WithFeatureFlagsProps = {
  children: JSX.Element;
};

const SR_APP_FEATURES = "sr-app-features";

const WithFeatureFlags = ({ children }: WithFeatureFlagsProps): JSX.Element => {
  // flags default to false when not defined
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  /**
   * Initialization
   */
  useEffect(() => {
    try {
      const cacheFeatureFlags = localStorage.getItem(SR_APP_FEATURES);

      if (cacheFeatureFlags) {
        setFeatureFlags(JSON.parse(cacheFeatureFlags));
      }

      FeatureFlagsApiService.featureFlags().then(
        (flags: Record<string, boolean>) => {
          localStorage.setItem(SR_APP_FEATURES, JSON.stringify(flags));
          setFeatureFlags(flags);
        }
      );
    } catch (e) {
      /*app will not break if it fails to load the flags*/
    }
  }, []);

  return <FlagsProvider features={featureFlags}>{children}</FlagsProvider>;
};

export default WithFeatureFlags;
