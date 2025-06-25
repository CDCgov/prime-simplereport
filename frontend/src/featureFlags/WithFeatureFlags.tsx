import { useEffect, useState } from "react";
import { FlagsProvider } from "flagged";

import { FeatureFlagsApiService } from "./FeatureFlagsApiService";

type WithFeatureFlagsProps = {
  children: JSX.Element;
};

const WithFeatureFlags = ({ children }: WithFeatureFlagsProps): JSX.Element => {
  // flags default to false when not defined
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  /**
   * Initialization
   */
  useEffect(() => {
    FeatureFlagsApiService.featureFlags()
      .then((flags) => {
        setFeatureFlags(flags);
      })
      .catch(() => {
        /*app will not break if it fails to load the flags*/
      });
  }, []);

  return <FlagsProvider features={featureFlags}>{children}</FlagsProvider>;
};

export default WithFeatureFlags;
