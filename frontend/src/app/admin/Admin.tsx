import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const Admin = () => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>Admin</h2>
              </div>
            </div>
            <div className="usa-card__body">
              <div>
                <LinkWithQuery to={`/admin/pending-organizations`}>
                  Organizations pending identify verification
                </LinkWithQuery>
              </div>
              <div>
                <LinkWithQuery to="/admin/add-organization-admin">
                  Add organization admin
                </LinkWithQuery>
              </div>
              <div>
                <LinkWithQuery to="/admin/create-device-type">
                  Create new device type
                </LinkWithQuery>
              </div>
              <div>
                <LinkWithQuery to="/admin/tenant-data-access">
                  Organization data
                </LinkWithQuery>
              </div>
              <div>
                <LinkWithQuery to="/admin/analytics">
                  Organization analytics
                </LinkWithQuery>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Admin;
