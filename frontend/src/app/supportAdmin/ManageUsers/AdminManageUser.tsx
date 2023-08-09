import React, { useState } from "react";
import { Icon } from "@trussworks/react-uswds";

import { useDocumentTitle } from "../../utils/hooks";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import SearchInput from "../../testQueue/addToQueue/SearchInput";
import { useFindUserByEmailLazyQuery } from "../../../generated/graphql";
import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import { showError } from "../../utils/srToast";
import UserDetail from "../../Settings/Users/UserDetail";
import { UpdateUser } from "../../Settings/Users/ManageUsers";

const userNotFoundError = (
  <div className={"maxw-mobile-lg margin-x-auto"}>
    <h2>User not found</h2>
    Please check the email address and try the search again, or contact the
    SimpleReport team for help.
  </div>
);

const userIdentityError = (
  <div className={"maxw-mobile-lg margin-x-auto"}>
    <h2>Can't determine user identity</h2>
    The email address isn't in Okta and can't be displayed. Please escalate the
    issue to the SimpleReport team.
  </div>
);

const genericError = (
  <div className={"maxw-mobile-lg margin-x-auto"}>
    <h2>Something went wrong</h2>
    Please try again or contact the SimpleReport team for help.
  </div>
);
export const AdminManageUser: React.FC = () => {
  useDocumentTitle("Manage Users");
  const [searchEmail, setSearchEmail] = useState<string>("");
  const [foundUser, setFoundUser] = useState<SettingsUser>();
  const [displayedError, setDisplayedError] = useState<JSX.Element>();
  const [getUserByEmail] = useFindUserByEmailLazyQuery({
    fetchPolicy: "no-cache",
  });
  const tempFunction = () => {};
  const tempBoolean = false;
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="prime-container card-container padding-3">
          <div className="display-flex flex-justify">
            <div>
              <div className="display-flex flex-align-center">
                <Icon.ArrowBack
                  className={"text-base margin-left-neg-2px"}
                ></Icon.ArrowBack>
                <LinkWithQuery to={`/admin`} className="margin-left-05">
                  Support Admin
                </LinkWithQuery>
              </div>
              <div className="prime-edit-patient-heading margin-y-0">
                <h1 className="font-heading-lg margin-top-1 margin-bottom-0">
                  Manage Users
                </h1>
              </div>
            </div>
          </div>
          <div className={"padding-top-5 padding-bottom-7"}>
            <SearchInput
              onInputChange={(e) => {
                setSearchEmail(e.target.value);
              }}
              onSearchClick={(e) => {
                e.preventDefault();
                getUserByEmail({ variables: { email: searchEmail } }).then(
                  ({ data, error }) => {
                    if (!data?.user && !error) {
                      setDisplayedError(userNotFoundError);
                      setFoundUser(undefined);
                    } else if (
                      error?.message ===
                      "header: Unauthorized access of site admin account; body: Contact development team if you need to access this information."
                    ) {
                      // todo: figure out if it's ok to display two errors
                      // displays error here & in apolloLink for onError
                      setDisplayedError(userIdentityError);
                      showError(
                        "Please escalate this issue to the SimpleReport team.",
                        "Error finding user email"
                      );
                      setFoundUser(undefined);
                    } else if (error) {
                      setDisplayedError(genericError);
                      setFoundUser(undefined);
                    } else {
                      setDisplayedError(undefined);
                      setFoundUser(data?.user as SettingsUser);
                    }
                  }
                );
              }}
              queryString={searchEmail}
              placeholder={"email@example.com"}
              label={"Search by email address of user"}
              disabled={!searchEmail}
            />
          </div>
          {displayedError}
          {foundUser && (
            <div className="prime-container  manage-users-card">
              <div className="usa-card__body">
                <UserDetail
                  user={foundUser}
                  isUpdating={tempBoolean}
                  loggedInUser={{} as User}
                  handleDeleteUser={tempFunction}
                  isUserEdited={tempBoolean}
                  handleReactivateUser={tempFunction}
                  handleEditUserName={tempFunction}
                  handleEditUserEmail={tempFunction}
                  handleResetUserPassword={tempFunction}
                  handleResetUserMfa={tempFunction}
                  handleResendUserActivationEmail={tempFunction}
                  allFacilities={[]}
                  handleUpdateUser={tempFunction}
                  updateUser={{} as UpdateUser}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
