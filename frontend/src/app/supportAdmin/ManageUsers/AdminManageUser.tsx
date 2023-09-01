import React, { useEffect, useState } from "react";

import { useDocumentTitle } from "../../utils/hooks";
import {
  useEditUserEmailMutation,
  useFindUserByEmailLazyQuery,
  useReactivateUserAndResetPasswordMutation,
  useResendActivationEmailMutation,
  useResetUserMfaMutation,
  useResetUserPasswordMutation,
  useSetUserIsDeletedMutation,
  useUpdateUserNameMutation,
  useUndeleteUserMutation,
  User,
} from "../../../generated/graphql";
import { showSuccess } from "../../utils/srToast";
import { isUserActive } from "../../Settings/Users/UserDetailUtils";
import { displayFullName } from "../../utils";
import { OktaUserStatus } from "../../utils/user";
import UserInfoTab from "../../Settings/Users/UserInfoTab";
import UserHeading from "../../commonComponents/UserDetails/UserHeading";

import UserAccessTab from "./UserAccessTab";
import { UserSearch } from "./UserSearch";

const userNotFoundError = (
  <div className={"padding-x-3 padding-bottom-205"}>
    <h2>User not found</h2>
    Please check the email address and try the search again, or contact the
    SimpleReport team for help.
  </div>
);

const userIdentityError = (
  <div className={"padding-x-3 padding-bottom-205"}>
    <h2>Can't determine user identity</h2>
    The email address isn't in Okta and can't be displayed. Please escalate the
    issue to the SimpleReport team.
  </div>
);

const genericError = (
  <div className={"padding-x-3 padding-bottom-205"}>
    <h2>Something went wrong</h2>
    Please try again or contact the SimpleReport team for help.
  </div>
);

export const AdminManageUser: React.FC = () => {
  useDocumentTitle("Manage Users");
  //ToDo Remove this
  const [searchEmail, setSearchEmail] = useState<string>("ruby@example.com");
  useEffect(() => {
    retrieveUser();
  }, []);
  const [foundUser, setFoundUser] = useState<User>();
  const [displayedError, setDisplayedError] = useState<JSX.Element>();
  const [navItemSelected, setNavItemSelected] = useState<
    "User information" | "User access"
  >("User information");
  const [getUserByEmail] = useFindUserByEmailLazyQuery({
    fetchPolicy: "no-cache",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateUserName] = useUpdateUserNameMutation();
  const [updateUserEmail] = useEditUserEmailMutation();
  const [resetPassword] = useResetUserPasswordMutation();
  const [resetMfa] = useResetUserMfaMutation();
  const [deleteUser] = useSetUserIsDeletedMutation();
  const [reactivateUserAndResetPassword] =
    useReactivateUserAndResetPasswordMutation();
  const [resendUserActivationEmail] = useResendActivationEmailMutation();
  const [undeleteUser] = useUndeleteUserMutation();

  /**
   * Handlers
   */
  const handleUpdate = async (func: () => Promise<void>) => {
    setIsUpdating(true);
    try {
      await func();
    } finally {
      setIsUpdating(false);
    }
  };
  const handleEditUserName = async (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string
  ) => {
    await handleUpdate(async () => {
      await updateUserName({
        variables: {
          id: userId,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          suffix: suffix,
        },
      });
      setFoundUser({
        ...foundUser,
        firstName,
        middleName,
        lastName,
        suffix,
      } as User);
      const fullName = displayFullName(firstName, "", lastName);
      showSuccess("", `User name changed to ${fullName}`);
    });
  };
  const handleEditUserEmail = async (userId: string, emailAddress: string) => {
    await handleUpdate(async () => {
      await updateUserEmail({
        variables: {
          id: userId,
          email: emailAddress,
        },
      });
      showSuccess("", `User email address changed to ${emailAddress}`);
      setFoundUser({
        ...foundUser,
        email: emailAddress,
      } as User);
    });
  };
  const handleResetUserPassword = async (userId: string) => {
    await handleUpdate(async () => {
      await resetPassword({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        foundUser?.firstName,
        foundUser?.middleName,
        foundUser?.lastName
      );
      showSuccess("", `Password reset for ${fullName}`);
    });
  };
  const handleResetUserMfa = async (userId: string) => {
    await handleUpdate(async () => {
      await resetMfa({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        foundUser?.firstName,
        foundUser?.middleName,
        foundUser?.lastName
      );
      showSuccess("", `MFA reset for ${fullName}`);
    });
  };
  const handleDeleteUser = async (userId: string) => {
    await handleUpdate(async () => {
      await deleteUser({
        variables: {
          id: userId,
          deleted: true,
        },
      });
      const fullName = displayFullName(
        foundUser?.firstName,
        foundUser?.middleName,
        foundUser?.lastName
      );

      setFoundUser({
        ...foundUser,
        isDeleted: true,
        status: OktaUserStatus.SUSPENDED,
      } as User);
      showSuccess("", `User account removed for ${fullName}`);
    });
  };
  const handleReactivateUser = async (userId: string) => {
    await handleUpdate(async () => {
      await reactivateUserAndResetPassword({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        foundUser?.firstName,
        foundUser?.middleName,
        foundUser?.lastName
      );
      setFoundUser({
        ...foundUser,
        status: OktaUserStatus.ACTIVE,
      } as User);
      showSuccess("", `${fullName} has been reactivated.`);
    });
  };
  const handleResendUserActivationEmail = async (userId: string) => {
    await handleUpdate(async () => {
      await resendUserActivationEmail({
        variables: {
          id: userId,
        },
      });
      const fullName = displayFullName(
        foundUser?.firstName,
        foundUser?.middleName,
        foundUser?.lastName
      );
      showSuccess("", `${fullName} has been sent a new invitation.`);
    });
  };

  const handleUndeleteUser = async () => {
    await handleUpdate(async () => {
      await undeleteUser({
        variables: { userId: foundUser?.id as string },
      });

      await retrieveUser();

      const fullName = displayFullName(
        foundUser?.firstName,
        foundUser?.middleName,
        foundUser?.lastName
      );

      showSuccess("", `User account undeleted for ${fullName}`);
    });
  };

  const retrieveUser = async () => {
    return getUserByEmail({ variables: { email: searchEmail.trim() } }).then(
      ({ data, error }) => {
        if (!data?.user && !error) {
          setDisplayedError(userNotFoundError);
          setFoundUser(undefined);
        } else if (
          error?.message ===
          "header: Error finding user email; body: Please escalate this issue to the SimpleReport team."
        ) {
          setDisplayedError(userIdentityError);
          setFoundUser(undefined);
        } else if (error) {
          setDisplayedError(genericError);
          setFoundUser(undefined);
        } else {
          setDisplayedError(undefined);
          setFoundUser(data?.user as User);
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
  };
  const handleClearFilter = () => {
    setSearchEmail("");
    setDisplayedError(undefined);
    setFoundUser(undefined);
  };

  /**
   * Tab content
   */

  const tabs: (typeof navItemSelected)[] = ["User information", "User access"];

  /**
   * HTML
   */
  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <UserSearch
          onClearFilter={handleClearFilter}
          onSearchClick={(e) => {
            e.preventDefault();
            retrieveUser();
          }}
          onInputChange={handleInputChange}
          searchEmail={searchEmail}
          disableClearFilters={!searchEmail && !foundUser && !displayedError}
        />
        {displayedError && (
          <div className="prime-container card-container" aria-live={"polite"}>
            {displayedError}
          </div>
        )}
        {foundUser && (
          <div
            className="prime-container card-container manage-users-card"
            aria-live={"polite"}
          >
            <div className="usa-card__body">
              <div className="tablet:grid-col padding-left-3 user-detail-column">
                <UserHeading
                  user={foundUser}
                  isUpdating={isUpdating}
                  onResendUserActivationEmail={handleResendUserActivationEmail}
                  onReactivateUser={handleReactivateUser}
                  onUndeleteUser={handleUndeleteUser}
                />
                <nav
                  className="prime-secondary-nav margin-top-4 padding-bottom-0"
                  aria-label="Manage user navigation"
                >
                  <div
                    role="tablist"
                    aria-owns={`user-information-tab-id facility-access-tab-id`}
                    className="usa-nav__secondary-links prime-nav usa-list"
                  >
                    {tabs.map((tabLabel) => (
                      <div
                        key={tabLabel}
                        className={`usa-nav__secondary-item ${
                          navItemSelected === tabLabel ? "usa-current" : ""
                        }`}
                      >
                        <button
                          id={`user-information-tab-id`}
                          role="tab"
                          className="usa-button--unstyled text-ink text-no-underline cursor-pointer"
                          onClick={() => setNavItemSelected(tabLabel)}
                          aria-selected={navItemSelected === tabLabel}
                        >
                          {tabLabel}
                        </button>
                      </div>
                    ))}
                  </div>
                </nav>
                {navItemSelected === "User information" ? (
                  <UserInfoTab
                    user={foundUser}
                    isUserActive={isUserActive(foundUser)}
                    isUpdating={isUpdating}
                    onEditUserName={handleEditUserName}
                    onEditUserEmail={handleEditUserEmail}
                    onResetUserPassword={handleResetUserPassword}
                    onResetUserMfa={handleResetUserMfa}
                    onDeleteUser={handleDeleteUser}
                  />
                ) : (
                  <UserAccessTab user={foundUser} isUpdating={false} />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
