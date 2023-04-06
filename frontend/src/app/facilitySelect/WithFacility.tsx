import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { appPermissions } from "../permissions";
import FacilityFormContainer from "../Settings/Facility/FacilityFormContainer";
import { RootState } from "../store";

import FacilityPopup from "./FacilityPopup";
import FacilitySelect from "./FacilitySelect";
import { useSelectedFacility } from "./useSelectedFacility";

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

  if (!dataLoaded) {
    return <Loading />;
  }

  if (selectedFacility || (isAdmin && facilities.length === 0)) {
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

  return (
    <FacilitySelect
      facilities={facilities}
      setActiveFacility={setSelectedFacility}
    />
  );
};

export default WithFacility;
