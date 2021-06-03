/* eslint-disable graphql/template-strings */
import { useReactiveVar } from "@apollo/client";
import { useCallback, useMemo, FC } from "react";
import { useHistory } from "react-router-dom";

import {
  appConfig,
  facilities,
} from "../../storage/store";
import { useFacilities } from "../../hooks/useFacilities";
import { getFacilityIdFromUrl } from "../utils/url";

import FacilityPopup from "./FacilityPopup";
import FacilitySelect from "./FacilitySelect";

const Loading: FC<{}> = () => <p>Loading facility information...</p>;

interface Props {}

const WithFacility: FC<Props> = ({ children }) => {
  const history = useHistory();
  const { setCurrentFacility } = useFacilities(facilities);
  const { list, current } = useReactiveVar<FacilitiesState>(facilities);
  const { dataLoaded } = useReactiveVar<AppConfigState>(appConfig);

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

  if (list.length === 1 && (!facilityFromUrl?.id || !current?.id)) {
    setActiveFacility(list[0]);
    return <Loading />;
  }

  if (facilityFromUrl?.id && !current?.id) {
    setActiveFacility(facilityFromUrl);
    return <Loading />;
  }

  if (facilityFromUrl?.id && current?.id) {
    return <>{children}</>;
  }

  return (
    <FacilitySelect facilities={list} setActiveFacility={setActiveFacility} />
  );
};

export default WithFacility;
