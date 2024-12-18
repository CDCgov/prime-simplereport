import { gql, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

import { RootState } from "../../store";
import { Role } from "../../permissions";
import {
  Maybe,
  useResendActivationEmailMutation,
  useUpdateUserNameMutation,
  useEditUserEmailMutation,
  useResetUserMfaMutation,
  UserPermission,
  ReactivateUserDocument,
  ReactivateUserAndResetPasswordDocument,
  useUpdateUserPrivilegesMutation,
  useSetUserIsDeletedMutation,
  useAddUserToCurrentOrgMutation,
  useResetUserPasswordMutation,
  useGetUsersAndStatusPageQuery,
} from "../../../generated/graphql";
import { useDocumentTitle } from "../../utils/hooks";

import ManageUsers from "./ManageUsers";

// structure for `getUser` query
export interface SettingsUser {
  id: string;
  firstName?: Maybe<string>;
  middleName?: Maybe<string>;
  lastName: string;
  suffix?: Maybe<string>;
  roleDescription: string;
  role?: Maybe<Role>;
  permissions: UserPermission[];
  email: string;
  status?: Maybe<string>;
  isDeleted?: boolean;
  organization?: Maybe<{
    testingFacility: UserFacilitySetting[];
  }>;
}

// structure for `getUsersWithStatus` query
export interface LimitedUser {
  id: string;
  firstName?: Maybe<string>;
  middleName?: Maybe<string>;
  lastName: string;
  suffix?: string;
  email: string;
  status?: Maybe<string>;
}

export interface SingleUserData {
  user: SettingsUser;
}

const REACTIVATE_USER = gql`
  ${ReactivateUserDocument}
`;

const REACTIVATE_USER_AND_RESET_PASSWORD = gql`
  ${ReactivateUserAndResetPasswordDocument}
`;

export interface UserFacilitySetting {
  id: string;
  name: string;
}

const ManageUsersContainer = () => {
  useDocumentTitle("Manage users");

  const loggedInUser = useSelector<RootState, User>((state) => state.user);
  const loggedInUserIsSiteAdmin = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );
  const allFacilities = useSelector<RootState, UserFacilitySetting[]>(
    (state) => state.facilities
  );
  const [updateUserPrivileges] = useUpdateUserPrivilegesMutation();
  const [deleteUser] = useSetUserIsDeletedMutation();
  const [reactivateUser] = useMutation(
    loggedInUserIsSiteAdmin
      ? REACTIVATE_USER_AND_RESET_PASSWORD
      : REACTIVATE_USER
  );
  const [addUserToOrg] = useAddUserToCurrentOrgMutation();
  const [updateUserName] = useUpdateUserNameMutation();
  const [updateUserEmail] = useEditUserEmailMutation();
  const [resetPassword] = useResetUserPasswordMutation();
  const [resetMfa] = useResetUserMfaMutation();
  const [resendUserActivationEmail] = useResendActivationEmailMutation();

  const { pageNumber } = useParams();
  const currentPage = pageNumber ? +pageNumber : 1;
  const entriesPerPage = 10;

  const {
    data,
    loading,
    error,
    refetch: getUsers,
  } = useGetUsersAndStatusPageQuery({
    fetchPolicy: "no-cache",
    variables: {
      pageNumber: currentPage - 1,
    },
  });

  if (loading) {
    return <p> Loading... </p>;
  }

  if (error) {
    throw error;
  }

  if (data === undefined) {
    return <p>Error: Users not found</p>;
  }

  return (
    <ManageUsers
      users={data.usersWithStatusPage.content ?? []}
      loggedInUser={loggedInUser}
      allFacilities={allFacilities}
      updateUserPrivileges={updateUserPrivileges}
      addUserToOrg={addUserToOrg}
      updateUserName={updateUserName}
      updateUserEmail={updateUserEmail}
      resetUserPassword={resetPassword}
      resetUserMfa={resetMfa}
      deleteUser={deleteUser}
      reactivateUser={reactivateUser}
      resendUserActivationEmail={resendUserActivationEmail}
      getUsers={getUsers}
      currentPage={currentPage}
      totalEntries={data.usersWithStatusPage.totalElements}
      entriesPerPage={entriesPerPage}
    />
  );
};

export default ManageUsersContainer;
