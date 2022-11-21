import { LinkWithQuery } from "../commonComponents/LinkWithQuery";

const SupportAdmin = () => {
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h1 className="font-heading-lg margin-top-0 margin-bottom-0">
                  Support admin
                </h1>
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
                  Add a new testing device
                </LinkWithQuery>
              </div>
              <div>
                <LinkWithQuery to="/admin/manage-devices">
                  Edit existing testing device
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
    </div>
  );
};

export default SupportAdmin;
