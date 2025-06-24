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

  const hasRedirect = useRef(false);
  const urlPrefix = getUrl(true);

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
        selectedFacility && facilityFlags[selectedFacility.id].pilotEnabled;

      if (allInPilot || selectedInPilot) {
        window.location.replace(`${urlPrefix}pilot/report`);
      } else if (someInPilot && selectedFacility && !hasRedirect.current) {
        navigate({ search: "?" });
        hasRedirect.current = true;
      }
    }
  }, [
    facilityFlags,
    setFacilityFlags,
    navigate,
    facilities,
    selectedFacility,
    urlPrefix,
    hasRedirect,
  ]);
}
