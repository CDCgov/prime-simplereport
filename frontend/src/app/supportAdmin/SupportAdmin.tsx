import { useFeature } from "flagged";
import React from "react";

import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { useDocumentTitle } from "../utils/hooks";

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
                <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                  <h2 className="font-heading-md margin-bottom-0 margin-top-2">
                    Organization
                  </h2>
                  <ul className="usa-list padding-left-2">
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
                  </ul>
                </div>
                <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                  <h2 className="font-heading-md margin-bottom-0 margin-top-2">
                    Test Devices
                  </h2>
                  <ul className="usa-list padding-left-2">
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
                  </ul>
                </div>
                {hivEnabled && (
                  <div className="desktop:grid-col-4 tablet:grid-col-4 mobile:grid-col-1">
                    <h2 className="font-heading-md margin-bottom-0 margin-top-2">
                      Beta
                    </h2>
                    <ul className="usa-list padding-left-2">
                      <li>
                        <LinkWithQuery to="/admin/hiv-csv-upload">
                          Beta - HIV CSV Upload
                        </LinkWithQuery>
                      </li>
                    </ul>
                  </div>
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
