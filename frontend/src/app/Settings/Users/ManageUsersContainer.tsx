import React, { useEffect } from "react";
import { gql, useQuery, useMutation, useLazyQuery } from "@apollo/client";
import { useSelector } from "react-redux";

import ManageUsers from "./ManageUsers";
import { UserRole, UserPermission } from "../../permissions";

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      firstName
      middleName
      lastName
      roleDescription
      permissions
      email
      organization {
        testingFacility {
          id
          name
        }
      }
    }
  }
`;

// structure for `getUsers` query
export interface SettingsUser {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  roleDescription: UserRole;
  permissions: UserPermission[];
  email: string;
  organization: {
    testingFacility: UserFacilitySetting[];
  };
}

interface UserData {
  users: SettingsUser[];
}

const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: OrganizationRole!) {
    updateUserRole(id: $id, role: $role)
  }
`;

const DELETE_USER = gql`
  mutation SetUserIsDeleted($id: ID!, $deleted: Boolean!) {
    setUserIsDeleted(id: $id, deleted: $deleted) {
      id
    }
  }
`;

const ADD_USER_TO_ORG = gql`
  mutation AddUserToCurrentOrg(
    $firstName: String
    $lastName: String!
    $email: String!
  ) {
    addUserToCurrentOrg(
      firstName: $firstName
      lastName: $lastName
      email: $email
    ) {
      id
    }
  }
`;

const GET_FACILITIES = gql`
  query GetFacilities {
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
  const [updateUserRole] = useMutation(UPDATE_USER_ROLE);
  const [deleteUser] = useMutation(DELETE_USER);
  const [addUserToOrg] = useMutation(ADD_USER_TO_ORG);

  const [getUsers, { data, loading, error }] = useLazyQuery<UserData, {}>(
    GET_USERS,
    { fetchPolicy: "no-cache" }
  );

  const {
    data: dataFacilities,
    loading: loadingFacilities,
    error: errorFacilities,
  } = useQuery<FacilityData, {}>(GET_FACILITIES, {
    fetchPolicy: "no-cache",
  });

  useEffect(getUsers, [getUsers]);

  if (loading || loadingFacilities) {
    return <p> Loading... </p>;
  }
  if (error || errorFacilities) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: Users not found</p>;
  }

  if (dataFacilities === undefined) {
    return <p>Error: Facilities not found</p>;
  }

  let allFacilities = dataFacilities.organization
    .testingFacility as UserFacilitySetting[];

  return (
    <ManageUsers
      users={data.users}
      loggedInUser={loggedInUser}
      allFacilities={allFacilities}
      updateUserRole={updateUserRole}
      addUserToOrg={addUserToOrg}
      deleteUser={deleteUser}
      getUsers={getUsers}
    />
  );
};

export default ManageUsersContainer;
