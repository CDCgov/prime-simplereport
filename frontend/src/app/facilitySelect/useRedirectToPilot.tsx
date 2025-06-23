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
  const hasRedirect = useRef(false);
  const [facilityFlags, setFacilityFlags] = useState<{
    [facilityId: string]: FeatureFlags;
  } | null>(null);

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
    } else if (!hasRedirect.current) {
      const allInPilot = Object.values(facilityFlags).every(
        (flags) => flags.pilotEnabled
      );
      const someInPilot = Object.values(facilityFlags).some(
        (flags) => flags.pilotEnabled
      );
      const selectedInPilot =
        selectedFacility && facilityFlags[selectedFacility.id].pilotEnabled;

      if (allInPilot || selectedInPilot) {
        hasRedirect.current = true;
        window.location.replace(`${urlPrefix}pilot/report`);
      } else if (someInPilot && selectedFacility) {
        hasRedirect.current = true;
        navigate({ search: "?" });
      }
    }
  }, [
    facilityFlags,
    setFacilityFlags,
    hasRedirect,
    navigate,
    facilities,
    selectedFacility,
    urlPrefix,
  ]);
}
