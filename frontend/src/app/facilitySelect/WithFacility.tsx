/* eslint-disable graphql/template-strings */
import { useQuery } from "@apollo/client";
import gql from "graphql-tag";
import { useCallback, useMemo, FC } from "react";
import { useHistory } from "react-router-dom";

import { currentFacility } from "../../config/cache";
import { getFacilityIdFromUrl } from "../utils/url";

import FacilityPopup from "./FacilityPopup";
import FacilitySelect from "./FacilitySelect";

const Loading: FC<{}> = () => <p>Loading facility information...</p>;

interface Props {}
interface FacilityData {
  facilities: Facility[];
  dataLoaded: Boolean;
  facilityInCache: Facility | null;
}
export const getOrganizationFacilities = gql`
  query GetFacilities {
    facilitiesList @client
    dataLoaded @client
  }
`;
const WithFacility: FC<Props> = ({ children }) => {
  const history = useHistory();

  const { data } = useQuery(getOrganizationFacilities, {
    fetchPolicy: "cache-only",
  });

  const {
    facilities,
    dataLoaded,
    facilityInCache,
  } = useMemo<FacilityData>(() => {
    return {
      facilities: data.facilitiesList as Facility[],
      dataLoaded: data.dataLoaded as Boolean,
      facilityInCache: currentFacility(),
    };
  }, [data]);

  const facilityFromUrl = useMemo(
    () => facilities.find((f) => f.id === getFacilityIdFromUrl()),
    [facilities]
  );

  const setFacilityProp = useCallback(
    (facilityId: string) => {
      history.push({ search: `?facility=${facilityId}` });
    },
    [history]
  );

  const setActiveFacility = useCallback(
    (facility: Facility) => {
      currentFacility(facility);
      setFacilityProp(facility.id);
    },
    [setFacilityProp]
  );

  if (!dataLoaded) {
    return <Loading />;
  }

  if (facilities.length === 0) {
    return (
      <FacilityPopup>
        <p>You do not have access to any facilities at this time.</p>
        <p>
          Ask an administrator to assign you access, then try logging in again.
        </p>
      </FacilityPopup>
    );
  }

  if (
    facilities.length === 1 &&
    (!facilityFromUrl?.id || !facilityInCache?.id)
  ) {
    setActiveFacility(facilities[0]);
    return <Loading />;
  }

  if (facilityFromUrl?.id && !facilityInCache?.id) {
    setActiveFacility(facilityFromUrl);
    return <Loading />;
  }

  if (facilityFromUrl?.id && facilityInCache?.id) {
    return <>{children}</>;
  }

  return (
    <FacilitySelect
      facilities={facilities}
      setActiveFacility={setActiveFacility}
    />
  );
};

export default WithFacility;
