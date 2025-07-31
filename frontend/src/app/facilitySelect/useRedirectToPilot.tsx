import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { getUrl } from "../utils/url";
import {
  FeatureFlagsApiService,
  type FeatureFlags,
} from "../../featureFlags/FeatureFlagsApiService";

import { useSelectedFacility } from "./useSelectedFacility";

export function useRedirectToPilot(facilities: Facility[]) {
  const navigate = useNavigate();
  const [selectedFacility, setSelectedFacility] = useSelectedFacility();
  const [facilityFlags, setFacilityFlags] = useState<{
    [facilityId: string]: FeatureFlags;
  } | null>(null);

  const isInitialRedirect = useRef(true);
  const urlPrefix = getUrl(true);
  const facilityFlagsLoading = facilities.length > 0 && facilityFlags === null;

  const someInPilot =
    facilityFlags &&
    Object.values(facilityFlags).some((flags) => flags.pilotEnabled);

  const allInPilot =
    facilityFlags &&
    Object.values(facilityFlags).every((flags) => flags.pilotEnabled);

  const redirectToPilot = useCallback(() => {
    window.location.replace(`${urlPrefix}pilot/report`);
  }, [urlPrefix]);

  const onFacilitySelect = (facility: Facility) => {
    const selectedInPilot =
      facilityFlags && facilityFlags[facility.id]?.pilotEnabled;

    if (selectedInPilot) {
      redirectToPilot();
    } else {
      setSelectedFacility(facility);
    }
  };

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
      if (allInPilot) {
        redirectToPilot();
      } else if (someInPilot && selectedFacility && isInitialRedirect.current) {
        // redirects back to FacilitySelect
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
    allInPilot,
    redirectToPilot,
    someInPilot,
  ]);

  return {
    facilityFlagsLoading,
    onFacilitySelect,
    selectedFacility,
    setSelectedFacility,
  };
}
