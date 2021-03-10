import React from "react";
import { useDispatch, useSelector, connect } from "react-redux";
import { useHistory } from "react-router-dom";

import { updateFacility } from "../store";
import { getFacilityIdFromUrl } from "../utils/url";

import FacilityPopup from "./FacilityPopup";
import FacilitySelect from "./FacilitySelect";

const Loading: React.FC<{}> = () => <p>Loading facility information...</p>;

interface Props {}

const WithFacility: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const facilities = useSelector(
    (state) => (state as any).facilities as Facility[]
  );
  const facilityInStore = useSelector(
    (state) => (state as any).facility as Facility
  );
  const facilityFromUrl = facilities?.find(
    (f) => f.id === getFacilityIdFromUrl()
  );

  const setFacilityProp = (facilityId: string) => {
    history.push({ search: `?facility=${facilityId}` });
  };

  const setActiveFacility = (facility: Facility) => {
    dispatch(updateFacility(facility));
    setFacilityProp(facility.id);
  };

  if (facilities === undefined) {
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
    (!facilityFromUrl?.id || !facilityInStore?.id)
  ) {
    setActiveFacility(facilities[0]);
    return <Loading />;
  }

  if (facilityFromUrl?.id && !facilityInStore?.id) {
    setActiveFacility(facilityFromUrl);
    return <Loading />;
  }

  if (facilityFromUrl?.id && facilityInStore?.id) {
    return <>{children}</>;
  }

  return (
    <FacilitySelect
      facilities={facilities}
      setActiveFacility={setActiveFacility}
    />
  );
};

export default connect()(WithFacility);
