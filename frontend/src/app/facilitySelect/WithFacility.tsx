import React from "react";
import { useDispatch, useSelector, connect } from "react-redux";
import { useHistory } from "react-router-dom";

import { updateFacility } from "../store";
import { getFacilityIdFromUrl } from "../utils/url";

import FacilitySelect from "./FacilitySelect";

const Loading: React.FC<{}> = () => <p>Loading facility information...</p>;

interface Props {}

const WithFacility: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const facilities = useSelector(
    (state) => (state as any).facilities as Facility[]
  );
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const user = useSelector((state) => (state as any).user as User);

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
    return <>{children}</>;
  }

  if (facilities.length === 0) {
    return <Loading />;
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
      organization={organization}
      user={user}
      setActiveFacility={setActiveFacility}
    />
  );
};

export default connect()(WithFacility);
