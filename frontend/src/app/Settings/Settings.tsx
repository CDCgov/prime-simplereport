import { Route, Routes, useParams } from "react-router-dom";

import { useDocumentTitle } from "../utils/hooks";

import ManageOrganizationContainer from "./ManageOrganizationContainer";
import ManageFacilitiesContainer from "./Facility/ManageFacilitiesContainer";
import FacilityFormContainer from "./Facility/FacilityFormContainer";
import ManageUsersContainer from "./Users/ManageUsersContainer";
import SettingsNav from "./SettingsNav";
import { ManageSelfRegistrationLinksContainer } from "./ManageSelfRegistrationLinksContainer";

const Settings = () => {
  useDocumentTitle("Settings");
  const { facilityId } = useParams();

  return (
    <main className="prime-home">
      <div className="grid-container">
        <SettingsNav />
        <Routes>
          <Route path="facilities" element={<ManageFacilitiesContainer />} />
          <Route
            path="facility/:facilityId"
            element={<FacilityFormContainer facilityId={facilityId} />}
          />
          <Route
            path="add-facility/"
            element={<FacilityFormContainer facilityId={facilityId} />}
          />
          <Route
            path="organization"
            element={<ManageOrganizationContainer />}
          />
          <Route
            path={"self-registration"}
            element={<ManageSelfRegistrationLinksContainer />}
          />
          <Route path="/" element={<ManageUsersContainer />} />
        </Routes>
      </div>
    </main>
  );
};

export default Settings;
