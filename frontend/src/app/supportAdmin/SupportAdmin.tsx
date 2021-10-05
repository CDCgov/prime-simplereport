import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SupportAdmin = () => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>Support Admin</h2>
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
                <LinkWithQuery to="/admin/manage-devices">
                  Manage devices
                </LinkWithQuery>
              </div>
              <div>
                <LinkWithQuery to="/admin/tenant-data-access">
                  Organization data
                </LinkWithQuery>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default SupportAdmin;
