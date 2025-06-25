import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { appPermissions } from "../permissions";
import FacilityFormContainer from "../Settings/Facility/FacilityFormContainer";
import { RootState } from "../store";

import FacilitySelect from "./FacilitySelect";
import { useSelectedFacility } from "./useSelectedFacility";
import { useRedirectToPilot } from "./useRedirectToPilot";
import NoFacilityPopup from "./NoFacilityPopup";

const Loading: React.FC<{}> = () => <p>Loading facility information...</p>;

interface Props {
  children: React.ReactNode;
}

const WithFacility: React.FC<Props> = ({ children }) => {
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

  const [selectedFacility, setSelectedFacility] = useSelectedFacility();

  useEffect(() => {
    if (selectedFacility || !dataLoaded) {
      return;
    }

    if (facilities.length === 1) {
      setSelectedFacility(facilities[0]);
    }
  }, [facilities, selectedFacility, dataLoaded, setSelectedFacility]);

  const { facilityFlagsLoaded } = useRedirectToPilot(
    facilities,
    selectedFacility
  );

  /**
   * HTML
   */

  if (!dataLoaded || !facilityFlagsLoaded) {
    return <Loading />;
  } else if (selectedFacility || (isAdmin && facilities.length === 0)) {
    return <>{children}</>;
  } else if (canViewSettings && facilities.length === 0) {
    // new org needs to create a facility
    return (
      <main className="prime-home">
        <div className="grid-container">
          <FacilityFormContainer newOrg={true} />
        </div>
      </main>
    );
  } else if (facilities.length === 0) {
    return <NoFacilityPopup />;
  } else {
    return (
      <FacilitySelect
        facilities={facilities}
        setActiveFacility={setSelectedFacility}
      />
    );
  }
};

export default WithFacility;
