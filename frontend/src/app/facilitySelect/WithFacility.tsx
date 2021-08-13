import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { appPermissions } from "../permissions";
import FacilityFormContainer from "../Settings/Facility/FacilityFormContainer";
import { RootState, updateFacility } from "../store";
import { getFacilityIdFromUrl } from "../utils/url";

import FacilityPopup from "./FacilityPopup";
import FacilitySelect from "./FacilitySelect";

const Loading: React.FC<{}> = () => <p>Loading facility information...</p>;

interface Props {}

const WithFacility: React.FC<Props> = ({ children }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const isAdmin = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );
  const canViewSettings = useSelector<RootState, boolean>((state) =>
    appPermissions.settings.canView.every((requiredPermission) =>
      state.user.permissions.includes(requiredPermission)
    )
  );
  const dataLoaded = useSelector<RootState, boolean>(
    (state) => state.dataLoaded
  );
  const facilities = useSelector<RootState, Facility[]>(
    (state) => state.facilities
  );
  const facilityInStore = useSelector<RootState, Pick<Facility, "id" | "name">>(
    (state) => state.facility
  );
  const facilityFromUrl = facilities.find(
    (f) => f.id === getFacilityIdFromUrl()
  );

  const setFacilityProp = useCallback(
    (facilityId: string) => {
      history.push({ search: `?facility=${facilityId}` });
    },
    [history]
  );

  const setActiveFacility = useCallback(
    (facility: Facility) => {
      dispatch(updateFacility(facility));
      setFacilityProp(facility.id);
    },
    [dispatch, setFacilityProp]
  );

  const shouldSetOnlyFacility = facilities.length === 1 && !facilityInStore?.id;

  const shouldSetFacilityFromUrl = facilityFromUrl?.id && !facilityInStore?.id;

  useEffect(() => {
    // No action if facility in store and URL exist and are equal
    if (
      facilityFromUrl &&
      facilityInStore &&
      facilityFromUrl === facilityInStore
    ) {
      return;
    }

    // If both exist but are different, URL selection is correct
    if (
      facilityFromUrl &&
      facilityInStore &&
      facilityFromUrl.id !== facilityInStore.id
    ) {
      setActiveFacility(facilityFromUrl);
      return;
    }

    // If only in URL, set store value
    if (facilityFromUrl && !facilityInStore) {
      setActiveFacility(facilityFromUrl);
      return;
    }

    // If only in store, set URL value
    if (!facilityFromUrl && facilityInStore) {
      setFacilityProp(facilityInStore.id);
      return;
    }

    // If only one facility in org, use that one
    if (shouldSetOnlyFacility) {
      setActiveFacility(facilities[0]);
    }
  }, [
    shouldSetOnlyFacility,
    setActiveFacility,
    facilities,
    facilityFromUrl,
    facilityInStore,
    setFacilityProp,
  ]);

  if (!dataLoaded || shouldSetOnlyFacility || shouldSetFacilityFromUrl) {
    return <Loading />;
  }

  if (isAdmin && facilities.length === 0) {
    // site admin without an organization
    return <>{children}</>;
  }

  if (canViewSettings && facilities.length === 0) {
    // new org needs to create a facility
    return (
      <main className="prime-home">
        <div className="grid-container">
          <FacilityFormContainer newOrg={true} />
        </div>
      </main>
    );
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

export default WithFacility;
