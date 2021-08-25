import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { useSelector } from "react-redux";

import { UserRole, UserPermission, Role } from "../../permissions";

import ManageUsers from "./ManageUsers";

const GET_USERS_WITH_STATUS = gql`
  query GetUsersAndStatus {
    usersWithStatus {
      id
      firstName
      middleName
      lastName
      email
      status
    }
  }
`;

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      firstName
      middleName
      lastName
      roleDescription
      role
      permissions
      email
      status
      organization {
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

// structure for `getUser` query
export interface SettingsUser {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  roleDescription: UserRole;
  role: Role;
  permissions: UserPermission[];
  email: string;
  status: string;
  organization: {
    testingFacility: UserFacilitySetting[];
  };
}

// structure for `getUsersWithStatus` query
export interface LimitedStatusUser {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  status: string;
}

interface UserStatusData {
  usersWithStatus: LimitedStatusUser[];
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

const ADD_USER_TO_ORG = gql`
  mutation AddUserToCurrentOrg(
    $firstName: String
    $lastName: String!
    $email: String!
    $role: Role!
  ) {
    addUserToCurrentOrg(
      firstName: $firstName
      lastName: $lastName
      email: $email
      role: $role
    ) {
      id
    }
  }
`;

const GET_FACILITIES = gql`
  query GetFacilitiesForManageUsers {
    organization {
      testingFacility {
        id
        name
      }
    }
  }
`;

interface FacilityData {
  organization: {
    testingFacility: UserFacilitySetting[];
  };
}

export interface UserFacilitySetting {
  id: string;
  name: string;
}

export interface NewUserInvite {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string | undefined; // TODO: clean this up or delete it if we are not supporting this feature
}

const ManageUsersContainer: any = () => {
  const loggedInUser = useSelector((state) => (state as any).user as User);
  const [updateUserPrivileges] = useMutation(UPDATE_USER_PRIVILEGES);
  const [deleteUser] = useMutation(DELETE_USER);
  const [reactivateUser] = useMutation(REACTIVATE_USER);
  const [addUserToOrg] = useMutation(ADD_USER_TO_ORG);
  const [resetPassword] = useMutation(RESET_USER_PASSWORD);

  const { data, loading, error, refetch: getUsersWithStatus } = useQuery<
    UserStatusData,
    {}
  >(GET_USERS_WITH_STATUS, { fetchPolicy: "no-cache" });

  console.log("users", data?.usersWithStatus);

  const {
    data: dataFacilities,
    loading: loadingFacilities,
    error: errorFacilities,
  } = useQuery<FacilityData, {}>(GET_FACILITIES, {
    fetchPolicy: "no-cache",
  });

  if (loading || loadingFacilities) {
    return <p> Loading... </p>;
  }

  if (error || errorFacilities) {
    throw error || errorFacilities;
  }

  if (data === undefined) {
    return <p>Error: Users not found</p>;
  }

  if (dataFacilities === undefined) {
    return <p>Error: Facilities not found</p>;
  }

  const allFacilities = dataFacilities.organization
    .testingFacility as UserFacilitySetting[];

  return (
    <ManageUsers
      users={data.usersWithStatus}
      loggedInUser={loggedInUser}
      allFacilities={allFacilities}
      updateUserPrivileges={updateUserPrivileges}
      addUserToOrg={addUserToOrg}
      resetUserPassword={resetPassword}
      deleteUser={deleteUser}
      reactivateUser={reactivateUser}
      getUsersWithStatus={getUsersWithStatus}
    />
  );
};

export default ManageUsersContainer;
