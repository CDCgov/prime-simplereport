/* eslint-disable graphql/template-strings */
import { useCallback, useMemo, FC, useEffect } from "react";
import { useHistory } from "react-router-dom";

import { useFacilities } from "../../hooks/useFacilities";
import { useAppConfig } from "../../hooks/useAppConfig";
import { getFacilityIdFromUrl } from "../utils/url";

import FacilityPopup from "./FacilityPopup";
import FacilitySelect from "./FacilitySelect";

const Loading: FC<{}> = () => <p>Loading facility information...</p>;

interface Props {}

const WithFacility: FC<Props> = ({ children }) => {
  const history = useHistory();
  const {
    setCurrentFacility,
    facilities: { current, list },
  } = useFacilities();
  const {
    config: { dataLoaded },
  } = useAppConfig();

  const facilityFromUrl = useMemo(
    () => list.find((f) => f.id === getFacilityIdFromUrl()),
    [list]
  );

  const setFacilityProp = useCallback(
    (facilityId: string) => {
      history.push({ search: `?facility=${facilityId}` });
    },
    [history]
  );

  const setActiveFacility = useCallback(
    (facility: Facility) => {
      setCurrentFacility(facility);
      setFacilityProp(facility.id);
    },
    [setFacilityProp, setCurrentFacility]
  );

  useEffect(() => {
    if (facilityFromUrl?.id) {
      setActiveFacility(facilityFromUrl);
    }
    if (list.length === 1 && (!facilityFromUrl?.id || !current?.id)) {
      setActiveFacility(list[0]);
    }
    // eslint-disable-next-line
  }, [current?.id, facilityFromUrl, list]);

  if (!dataLoaded) {
    return <Loading />;
  }

  if (list.length === 0) {
    return (
      <FacilityPopup>
        <p>You do not have access to any facilities at this time.</p>
        <p>
          Ask an administrator to assign you access, then try logging in again.
        </p>
      </FacilityPopup>
    );
  }

  if (list.length > 1) {
    return (
      <FacilitySelect facilities={list} setActiveFacility={setActiveFacility} />
    );
  }

  if (current?.id) {
    return <>{children}</>;
  }

  return <Loading />;

};

export default WithFacility;
