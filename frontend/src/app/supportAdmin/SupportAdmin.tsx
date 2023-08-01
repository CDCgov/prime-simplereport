import { useFeature } from "flagged";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";

import {
  addNewDevicePageTitle,
  addOrgAdminPageTitle,
  devicesColumnTitle,
  editDevicePageTitle,
  identityVerificationPageTitle,
  orgAccessPageTitle,
  orgFacilityColumnTitle,
  usersAndPatientsColumnTitle,
} from "./pageTitles";
import PageContainer from "./PageContainer";

type CategoryMenuProps = {
  heading: string;
  children: React.ReactNode;
};

const CategoryMenu: React.FC<CategoryMenuProps> = ({
  heading,
  children,
}: CategoryMenuProps) => (
  <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
    <h2 className="font-heading-md margin-bottom-0 margin-top-2">{heading}</h2>
    <ul className="usa-list padding-left-2">{children}</ul>
  </div>
);

const SupportAdmin = () => {
  useDocumentTitle("Support admin");
  const hivEnabled = useFeature("hivEnabled") as boolean;

  return (
    <PageContainer title="Support admin">
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
          <li></li>
        </CategoryMenu>
        {hivEnabled && (
          <CategoryMenu heading="Beta">
            <li>
              <LinkWithQuery to="/admin/hiv-csv-upload">
                Beta - HIV CSV Upload
              </LinkWithQuery>
            </li>
          </CategoryMenu>
        )}
      </div>
    </PageContainer>
  );
};

export default SupportAdmin;
