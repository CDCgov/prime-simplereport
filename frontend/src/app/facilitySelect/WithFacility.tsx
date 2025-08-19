import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { appPermissions } from "../permissions";
import FacilityFormContainer from "../Settings/Facility/FacilityFormContainer";
import { RootState } from "../store";
import DataRetentionModal, {
  shouldShowDataRetentionModal,
} from "../commonComponents/DataRetentionModal";

import FacilitySelect from "./FacilitySelect";
import { useRedirectToPilot } from "./useRedirectToPilot";
import NoFacilityPopup from "./NoFacilityPopup";
import "../commonComponents/DataRetentionModal.scss";

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

  const {
    facilityFlagsLoading,
    onFacilitySelect,
    selectedFacility,
    setSelectedFacility,
  } = useRedirectToPilot(facilities);

  const [showDataRetentionModal, setShowDataRetentionModal] = useState(false);

  useEffect(() => {
    if (selectedFacility || !dataLoaded) {
      return;
    }

    if (facilities.length === 1) {
      setSelectedFacility(facilities[0]);
    }
  }, [facilities, selectedFacility, dataLoaded, setSelectedFacility]);

  // Show modal only after facility is selected
  useEffect(() => {
    if (selectedFacility && shouldShowDataRetentionModal()) {
      setShowDataRetentionModal(true);
    }
  }, [selectedFacility]);

  if (!dataLoaded || facilityFlagsLoading) {
    return <Loading />;
  } else if (selectedFacility || (isAdmin && facilities.length === 0)) {
    return (
      <>
        <DataRetentionModal
          isOpen={showDataRetentionModal}
          onClose={() => setShowDataRetentionModal(false)}
        />
        {children}
      </>
    );
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
        onFacilitySelect={onFacilitySelect}
      />
    );
  }
};

export default WithFacility;
