import React, { useState } from "react";

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
} from "../../../generated/graphql";
import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import { showSuccess } from "../../utils/srToast";
import UserDetail from "../../Settings/Users/UserDetail";
import { UpdateUser } from "../../Settings/Users/ManageUsers";
import { displayFullName } from "../../utils";
import { OktaUserStatus } from "../../utils/user";

import { UserSearch } from "./UserSearch";

const userNotFoundError = (
  <div className={"maxw-mobile-lg margin-x-auto padding-bottom-205"}>
    <h2>User not found</h2>
    Please check the email address and try the search again, or contact the
    SimpleReport team for help.
  </div>
);

const userIdentityError = (
  <div className={"maxw-mobile-lg margin-x-auto padding-bottom-205"}>
    <h2>Can't determine user identity</h2>
    The email address isn't in Okta and can't be displayed. Please escalate the
    issue to the SimpleReport team.
  </div>
);

const genericError = (
  <div className={"maxw-mobile-lg margin-x-auto padding-bottom-205"}>
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
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateUserName] = useUpdateUserNameMutation();
  const [updateUserEmail] = useEditUserEmailMutation();
  const [resetPassword] = useResetUserPasswordMutation();
  const [resetMfa] = useResetUserMfaMutation();
  const [deleteUser] = useSetUserIsDeletedMutation();
  const [reactivateUserAndResetPassword] =
    useReactivateUserAndResetPasswordMutation();
  const [resendUserActivationEmail] = useResendActivationEmailMutation();

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
      } as SettingsUser);
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
      } as SettingsUser);
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

      setFoundUser({ ...foundUser, isDeleted: true } as SettingsUser);
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
      } as SettingsUser);
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
  const handleSearchClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    getUserByEmail({ variables: { email: searchEmail } }).then(
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
          setFoundUser(data?.user as SettingsUser);
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

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <UserSearch
          onClearFilter={handleClearFilter}
          onSearchClick={handleSearchClear}
          onInputChange={handleInputChange}
          searchEmail={searchEmail}
          disableClearFilters={!searchEmail}
        />
        <div aria-live={"polite"}>
          {displayedError && (
            <div className="prime-container card-container">
              {displayedError}
            </div>
          )}
          {foundUser && (
            <div className="prime-container card-container manage-users-card">
              <div className="usa-card__body">
                <UserDetail
                  user={foundUser}
                  isUpdating={isUpdating}
                  handleEditUserName={handleEditUserName}
                  handleEditUserEmail={handleEditUserEmail}
                  handleResetUserPassword={handleResetUserPassword}
                  handleResetUserMfa={handleResetUserMfa}
                  handleDeleteUser={handleDeleteUser}
                  handleReactivateUser={handleReactivateUser}
                  handleResendUserActivationEmail={
                    handleResendUserActivationEmail
                  }
                  // used in facility tab
                  updateUser={{} as UpdateUser}
                  loggedInUser={{} as User}
                  allFacilities={[]}
                  isUserEdited={false}
                  handleUpdateUser={() => null}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
