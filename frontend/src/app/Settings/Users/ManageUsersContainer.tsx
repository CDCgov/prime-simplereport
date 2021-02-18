import React from "react";
import { gql, useQuery } from "@apollo/client";
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

// const GET_FACILITIES = gql`
//   query GetFacilities {
//     organization {
//       testingFacility {
//         id
//         name
//       }
//     }
//   }
// `;

// interface FacilityData {
//   organization: {
//     testingFacility: UserFacilitySetting[];
//   };
// }

export interface UserFacilitySetting {
  id: string;
  name: string;
}

export interface NewUserInvite {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | string;
}

// const dummyUsers = [
//   {
//     id: "111",
//     name: "Peter Parker",
//     role: "admin" as UserRole,
//     email: "spiderman-or-deadpool@hero.com",
//     organization: {
//       testingFacility: [
//         { id: "abc", name: "Mountainside Nursing" },
//         { id: "def", name: "Hillside Nursing" },
//         { id: "hij", name: "Lakeside Nursing" },
//         { id: "klm", name: "Oceanside Nursing" },
//         { id: "nop", name: "Desertside Nursing" },
//       ],
//     },
//   },
//   {
//     id: "222",
//     name: "Carol Danvers",
//     role: "entry-only" as UserRole,
//     email: "marvel@hero.com",
//     organization: {
//       testingFacility: [
//         { id: "def", name: "Hillside Nursing" },
//         { id: "nop", name: "Desertside Nursing" },
//       ],
//     },
//   },
//   {
//     id: "333",
//     name: "Natasha Romanoff",
//     role: "admin" as UserRole,
//     email: "widow@hero.com",
//   },
//   {
//     id: "444",
//     name: "T'Challa",
//     role: "user" as UserRole,
//     email: "panther@hero.com",
//     organization: {
//       testingFacility: [],
//     },
//   },
// ];

const allFacilities: UserFacilitySetting[] = [
  { id: "abc", name: "Mountainside Nursing" },
  { id: "def", name: "Hillside Nursing" },
  { id: "hij", name: "Lakeside Nursing" },
  { id: "klm", name: "Oceanside Nursing" },
  { id: "nop", name: "Desertside Nursing" },
];

const updateUser = (user: SettingsUser) => {
  // TODO: perform graphql query
};

const createNewUser = (newUserInvite: NewUserInvite) => {
  // TODO: perform graphql mutation
};

const deleteUser = (userId: string) => {
  // TODO: perform, graphql mutation
};

// const ManageUsersContainer: React.FC<any> = () => {
const ManageUsersContainer: any = () => {
  const loggedInUser = useSelector((state) => (state as any).user as User);

  // const { data, loading, error } = useQuery<SettingsData, {}>(GET_USERS, {
  //   fetchPolicy: "no-cache",
  // });

  const { data, loading, error } = useQuery<UserData, {}>(GET_USERS, {
    fetchPolicy: "no-cache",
  });
  // const {
  //   data: dataFacilities,
  //   loading: loadingFacilities,
  //   error: errorFacilities,
  // } = useQuery<FacilityData, {}>(GET_FACILITIES, {
  //   fetchPolicy: "no-cache",
  // });

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: Users not found</p>;
  }

  loggedInUser.id = data.users[0].id; // TODO: delete me

  // let realFacilities = dataFacilities?.organization
  //   .testingFacility as UserFacilitySetting[];

  return (
    <ManageUsers
      users={data.users}
      loggedInUser={loggedInUser}
      onUpdateUser={updateUser}
      allFacilities={allFacilities}
      onCreateNewUser={createNewUser}
      onDeleteUser={deleteUser}
    />
  );
};

export default ManageUsersContainer;
