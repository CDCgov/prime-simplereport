import React from "react";
import { Redirect, Route } from "react-router-dom";

import AddOrganizationAdminFormContainer from "./AddOrganizationAdmin/AddOrganizationAdminFormContainer";
import DeviceTypeFormContainer from "./DeviceType/DeviceTypeFormContainer";
import TenantDataAccessFormContainer from "./TenantDataAccess/TenantDataAccessFormContainer";
import SupportAdmin from "./SupportAdmin";
import PendingOrganizationsContainer from "./PendingOrganizations/PendingOrganizationsContainer";

interface Props {
  match: { url: string };
  isAdmin: boolean;
}

const SupportAdminRoutes: React.FC<Props> = ({ match, isAdmin }) => {
  if (!isAdmin) {
    return (
      <Route
        path={match.url}
        render={({ location }) => (
          <Redirect to={{ ...location, pathname: "/queue" }} />
        )}
      />
    );
  }
  return (
    <>
      <Route
        path={`${match.url}/pending-organizations`}
        component={PendingOrganizationsContainer}
      />
      <Route
        path={`${match.url}/add-organization-admin`}
        component={AddOrganizationAdminFormContainer}
      />
      <Route
        path={`${match.url}/create-device-type`}
        component={DeviceTypeFormContainer}
      />
      <Route
        path={`${match.url}/tenant-data-access`}
        component={TenantDataAccessFormContainer}
      />
      <Route path={"/admin"} exact={true} component={SupportAdmin} />
    </>
  );
};

export default SupportAdminRoutes;
