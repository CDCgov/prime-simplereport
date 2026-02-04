import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";

import {
  addNewDevicePageTitle,
  addOrgAdminPageTitle,
  devicesColumnTitle,
  editDevicePageTitle,
  escalationPageTitle,
  identityVerificationPageTitle,
  manageUserPageTitle,
  manageFacility,
  orgAccessPageTitle,
  orgFacilityColumnTitle,
  usersAndPatientsColumnTitle,
  unarchivePatientTitle,
} from "./pageTitles";

type CategoryMenuProps = {
  heading: string;
  children: React.ReactNode;
};

const CategoryMenu: React.FC<CategoryMenuProps> = ({
  heading,
  children,
}: CategoryMenuProps) => (
  <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
    <h2 className="font-sans-md margin-bottom-0 margin-top-2">{heading}</h2>
    <ul className="usa-list padding-left-2">{children}</ul>
  </div>
);

const SupportAdmin = () => {
  useDocumentTitle("Support admin");
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <h1 className="font-sans-lg margin-top-0 margin-bottom-0">
                Support admin
              </h1>
            </div>
            <div className="usa-card__body">
              <div className="grid-row grid-gap">
                <CategoryMenu heading={orgFacilityColumnTitle}>
                  <li>
                    <LinkWithQuery to={`/admin/pending-organizations`}>
                      {identityVerificationPageTitle}
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/add-organization-admin">
                      {addOrgAdminPageTitle}
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/tenant-data-access">
                      {orgAccessPageTitle}
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/escalate-to-engineering">
                      {escalationPageTitle}
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/manage-facility">
                      {manageFacility}
                    </LinkWithQuery>
                  </li>
                </CategoryMenu>
                <CategoryMenu heading={devicesColumnTitle}>
                  <li>
                    <LinkWithQuery to="/admin/create-device-type">
                      {addNewDevicePageTitle}
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/manage-devices">
                      {editDevicePageTitle}
                    </LinkWithQuery>
                  </li>
                </CategoryMenu>
                <CategoryMenu heading={usersAndPatientsColumnTitle}>
                  <li>
                    <LinkWithQuery to="/admin/manage-users">
                      {manageUserPageTitle}
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/unarchive-patient">
                      {unarchivePatientTitle}
                    </LinkWithQuery>
                  </li>
                </CategoryMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAdmin;
