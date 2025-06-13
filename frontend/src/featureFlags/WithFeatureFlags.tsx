import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import { FlagsProvider } from "flagged";

import { FeatureFlagsApiService } from "./FeatureFlagsApiService";
// import { RootState } from "../app/store";

type WithFeatureFlagsProps = {
  children: JSX.Element;
};

const WithFeatureFlags = ({ children }: WithFeatureFlagsProps): JSX.Element => {
  // flags default to false when not defined
  const [featureFlags, setFeatureFlags] = useState<Record<string, boolean>>({});

  // const facilities = useSelector<RootState, Facility[]>(
  //   (state) => state.facilities
  // );

  /**
   * Initialization
   */
  useEffect(() => {
    FeatureFlagsApiService.featureFlags()
      .then((flags: Record<string, boolean>) => {
        setFeatureFlags(flags);
      })
      .catch(() => {
        /*app will not break if it fails to load the flags*/
      });
  }, []);

  return <FlagsProvider features={featureFlags}>{children}</FlagsProvider>;
};

export default WithFeatureFlags;
