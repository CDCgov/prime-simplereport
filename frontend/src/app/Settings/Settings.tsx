import { Navigate, Route, Routes } from "react-router-dom";

import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

import ManageOrganizationContainer from "./ManageOrganizationContainer";
import ManageFacilitiesContainer from "./Facility/ManageFacilitiesContainer";
import FacilityFormContainer from "./Facility/FacilityFormContainer";
import ManageUsersContainer from "./Users/ManageUsersContainer";
import SettingsNav from "./SettingsNav";
import { ManageSelfRegistrationLinksContainer } from "./ManageSelfRegistrationLinksContainer";

import "./Settings.scss";

const Settings = () => {
  const [facility] = useSelectedFacility();
  const activeFacilityId = facility?.id || "";
  const settingsIndexRedirect =
    "/settings/users/1?facility=" + activeFacilityId;

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <SettingsNav />
        <Routes>
          <Route path="facilities" element={<ManageFacilitiesContainer />} />
          <Route
            path="facility/:facilityId"
            element={<FacilityFormContainer />}
          />
          <Route path="add-facility" element={<FacilityFormContainer />} />
          <Route
            path="organization"
            element={<ManageOrganizationContainer />}
          />
          <Route
            path={"self-registration"}
            element={<ManageSelfRegistrationLinksContainer />}
          />
          <Route path="users/:pageNumber" element={<ManageUsersContainer />} />
          <Route index element={<Navigate to={settingsIndexRedirect} />} />
        </Routes>
      </div>
    </div>
  );
};

export default Settings;
