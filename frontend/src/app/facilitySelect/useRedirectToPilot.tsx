import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { getUrl } from "../utils/url";
import {
  FeatureFlagsApiService,
  type FeatureFlags,
} from "../../featureFlags/FeatureFlagsApiService";

export function useRedirectToPilot(
  facilities: Facility[],
  selectedFacility?: Facility
) {
  const navigate = useNavigate();
  const [facilityFlags, setFacilityFlags] = useState<{
    [facilityId: string]: FeatureFlags;
  } | null>(null);

  const isInitialRedirect = useRef(true);
  const urlPrefix = getUrl(true);
  const facilityFlagsLoaded = facilityFlags !== null;

  useEffect(() => {
    if (facilities.length === 0) {
      return;
    }

    if (!facilityFlags) {
      const promises = facilities.map((facility) =>
        FeatureFlagsApiService.featureFlags({ facility: facility.id }).then(
          (flags) => ({ [facility.id]: flags })
        )
      );

      Promise.all(promises).then((results) => {
        const flagMap = results.reduce((a, c) => ({ ...a, ...c }), {});
        setFacilityFlags(flagMap);
      });
    } else {
      const allInPilot = Object.values(facilityFlags).every(
        (flags) => flags.pilotEnabled
      );
      const someInPilot = Object.values(facilityFlags).some(
        (flags) => flags.pilotEnabled
      );
      const selectedInPilot =
        selectedFacility && facilityFlags[selectedFacility.id]?.pilotEnabled;

      if (allInPilot || selectedInPilot) {
        window.location.replace(`${urlPrefix}pilot/report`);
      } else if (someInPilot && selectedFacility && isInitialRedirect.current) {
        navigate({ search: "?" });
      }

      isInitialRedirect.current = false;
    }
  }, [
    facilityFlags,
    setFacilityFlags,
    navigate,
    facilities,
    selectedFacility,
    urlPrefix,
    isInitialRedirect,
  ]);

  return { facilityFlagsLoaded };
}
