import { useFeature } from "flagged";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";

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
              <div className="grid-row grid-gap">
                <CategoryMenu heading="Organization">
                  <li>
                    <LinkWithQuery to={`/admin/pending-organizations`}>
                      Identify verification
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/add-organization-admin">
                      Add organization admin
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/tenant-data-access">
                      Organization data
                    </LinkWithQuery>
                  </li>
                </CategoryMenu>
                <CategoryMenu heading="Test Devices">
                  <li>
                    <LinkWithQuery to="/admin/create-device-type">
                      Add a new testing device
                    </LinkWithQuery>
                  </li>
                  <li>
                    <LinkWithQuery to="/admin/manage-devices">
                      Edit existing testing device
                    </LinkWithQuery>
                  </li>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportAdmin;
