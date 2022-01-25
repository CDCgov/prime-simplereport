import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import reload from "../utils/reload";

import AddOrganizationAdminFormContainer from "./AddOrganizationAdmin/AddOrganizationAdminFormContainer";
import DeviceTypeFormContainer from "./DeviceType/DeviceTypeFormContainer";
import TenantDataAccessFormContainer from "./TenantDataAccess/TenantDataAccessFormContainer";
import SupportAdmin from "./SupportAdmin";
import PendingOrganizationsContainer from "./PendingOrganizations/PendingOrganizationsContainer";
import ManageDeviceTypeFormContainer from "./DeviceType/ManageDeviceTypeFormContainer";

interface Props {
  isAdmin: boolean;
}

const SupportAdminRoutes: React.FC<Props> = ({ isAdmin }) => {
  const location = useLocation();
  if ((location.state as any)?.reload) {
    reload();
  }

  if (!isAdmin) {
    return <Navigate to="/queue" />;
  }
  return (
    <Routes>
      <Route
        path="pending-organizations"
        element={<PendingOrganizationsContainer />}
      />
      <Route
        path="add-organization-admin"
        element={<AddOrganizationAdminFormContainer />}
      />
      <Route path="create-device-type" element={<DeviceTypeFormContainer />} />
      <Route
        path="manage-devices"
        element={<ManageDeviceTypeFormContainer />}
      />
      <Route
        path="tenant-data-access"
        element={<TenantDataAccessFormContainer />}
      />
      <Route path="/" element={<SupportAdmin />} />
    </Routes>
  );
};

export default SupportAdminRoutes;
