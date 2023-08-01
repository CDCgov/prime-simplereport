import { gql, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";

import { RootState } from "../../store";
import { Role } from "../../permissions";
import {
  Maybe,
  useGetUsersAndStatusQuery,
  useResendActivationEmailMutation,
  useUpdateUserNameMutation,
  useEditUserEmailMutation,
  useResetUserMfaMutation,
  UserPermission,
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

const UPDATE_USER_PRIVILEGES = gql`
  mutation UpdateUserPrivileges(
    $id: ID!
    $role: Role!
    $accessAllFacilities: Boolean!
    $facilities: [ID!]!
  ) {
    updateUserPrivileges(
      id: $id
      role: $role
      accessAllFacilities: $accessAllFacilities
      facilities: $facilities
    ) {
      id
    }
  }
`;

const RESET_USER_PASSWORD = gql`
  mutation ResetUserPassword($id: ID!) {
    resetUserPassword(id: $id) {
      id
    }
  }
`;

const DELETE_USER = gql`
  mutation SetUserIsDeleted($id: ID!, $deleted: Boolean!) {
    setUserIsDeleted(id: $id, deleted: $deleted) {
      id
    }
  }
`;

const REACTIVATE_USER = gql`
  mutation ReactivateUser($id: ID!) {
    reactivateUser(id: $id) {
      id
    }
  }
`;

const REACTIVATE_USER_AND_RESET_PASSWORD = gql`
  mutation ReactivateUserAndResetPassword($id: ID!) {
    reactivateUserAndResetPassword(id: $id) {
      id
    }
  }
`;

const ADD_USER_TO_ORG = gql`
  mutation AddUserToCurrentOrg(
    $firstName: String
    $lastName: String!
    $email: String!
    $role: Role!
    $accessAllFacilities: Boolean
    $facilities: [ID!]
  ) {
    addUserToCurrentOrg(
      userInput: {
        firstName: $firstName
        lastName: $lastName
        email: $email
        role: $role
        accessAllFacilities: $accessAllFacilities
        facilities: $facilities
      }
    ) {
      id
    }
  }
`;

export interface UserFacilitySetting {
  id: string;
  name: string;
}

export const SITE_ADMIN_ROLE_DESC = "Admin user (SU)";

const ManageUsersContainer = () => {
  useDocumentTitle("Manage users");

  const loggedInUser = useSelector<RootState, User>((state) => state.user);
  const loggedInUserIsSiteAdmin =
    loggedInUser.roleDescription.includes(SITE_ADMIN_ROLE_DESC);

  const allFacilities = useSelector<RootState, UserFacilitySetting[]>(
    (state) => state.facilities
  );
  const [updateUserPrivileges] = useMutation(UPDATE_USER_PRIVILEGES);
  const [deleteUser] = useMutation(DELETE_USER);
  const [reactivateUser] = useMutation(
    loggedInUserIsSiteAdmin
      ? REACTIVATE_USER_AND_RESET_PASSWORD
      : REACTIVATE_USER
  );
  const [addUserToOrg] = useMutation(ADD_USER_TO_ORG);
  const [updateUserName] = useUpdateUserNameMutation();
  const [updateUserEmail] = useEditUserEmailMutation();
  const [resetPassword] = useMutation(RESET_USER_PASSWORD);
  const [resetMfa] = useResetUserMfaMutation();
  const [resendUserActivationEmail] = useResendActivationEmailMutation();

  const {
    data,
    loading,
    error,
    refetch: getUsers,
  } = useGetUsersAndStatusQuery({ fetchPolicy: "no-cache" });

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
      users={data.usersWithStatus ?? []}
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
    />
  );
};

export default ManageUsersContainer;
