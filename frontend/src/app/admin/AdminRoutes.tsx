import React from "react";
import { Redirect, Route } from "react-router-dom";

import AddOrganizationAdminFormContainer from "./Organization/AddOrganizationAdminFormContainer";
import DeviceTypeFormContainer from "./DeviceType/DeviceTypeFormContainer";
import TenantDataAccessFormContainer from "./Organization/TenantDataAccessFormContainer";
import Admin from "./Admin";
import PendingOrganizationsList from "./Organization/PendingOrganizationsList";

interface Props {
  match: { url: string };
  isAdmin: boolean;
}

const AdminRoutes: React.FC<Props> = ({ match, isAdmin }) => {
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
        render={() => <PendingOrganizationsList />}
      />
      <Route
        path={`${match.url}/add-organization-admin`}
        render={() => <AddOrganizationAdminFormContainer />}
      />
      <Route
        path={`${match.url}/create-device-type`}
        render={() => <DeviceTypeFormContainer />}
      />
      <Route
        path={`${match.url}/tenant-data-access`}
        render={() => <TenantDataAccessFormContainer />}
      />
      <Route path={"/admin"} exact={true} render={() => <Admin />} />
    </>
  );
};

export default AdminRoutes;
