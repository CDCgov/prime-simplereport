import React from "react";
// import { gql, useQuery } from "@apollo/client";
import ManageUsers from "./ManageUsers";
import { UserRole } from "../../permissions";
import { useSelector } from "react-redux";

// TODO this hasn't been implemented yet in the backend
// const GET_USERS = gql`
//   query GetUsers {
//     getUsers {
//       id
//       roleDescription
//       permissions
//       firstName
//       middleName
//       lastName
//       email
//     }
//   }
// `;

export interface SettingsUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  isAdmin: boolean;
  facilities?: UserFacilitySetting[]; // TODO: update this when the graphql query is defined. Should just be the facility id and name.
}

export interface UserFacilitySetting {
  id: string;
  name: string;
}

export interface NewUserInvite {
  first: string;
  last: string;
  email: string;
  role: UserRole | string;
}

const dummyUsers = [
  {
    id: "111",
    name: "Peter Parker",
    role: "admin" as UserRole,
    isAdmin: true,
    email: "spiderman-or-deadpool@hero.com",
    facilities: [
      { id: "abc", name: "Mountainside Nursing" },
      { id: "def", name: "Hillside Nursing" },
      { id: "hij", name: "Lakeside Nursing" },
      { id: "klm", name: "Oceanside Nursing" },
      { id: "nop", name: "Desertside Nursing" },
    ],
  },
  {
    id: "222",
    name: "Carol Danvers",
    role: "entry-only" as UserRole,
    isAdmin: false,
    email: "marvel@hero.com",
    facilities: [
      { id: "def", name: "Hillside Nursing" },
      { id: "nop", name: "Desertside Nursing" },
    ],
  },
  {
    id: "333",
    name: "Natasha Romanoff",
    role: "admin" as UserRole,
    isAdmin: true,
    email: "widow@hero.com",
  },
  {
    id: "444",
    name: "T'Challa",
    role: "user" as UserRole,
    isAdmin: true,
    email: "panther@hero.com",
    facilities: [],
  },
];

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

const ManageUsersContainer: React.FC<any> = () => {
  const loggedInUser = useSelector((state) => (state as any).user as User);
  loggedInUser.id = "111"; // TODO: delete this
  //   const { data, loading, error } = useQuery<SettingsData, {}>(GET_FACILITIES, {
  //     fetchPolicy: "no-cache",
  //   });

  //   if (loading) {
  //     return <p> Loading... </p>;
  //   }
  //   if (error) {
  //     return error;
  //   }

  //   if (data === undefined) {
  //     return <p>Error: Users not found</p>;
  //   }

  return (
    <ManageUsers
      users={dummyUsers}
      loggedInUser={loggedInUser}
      onUpdateUser={updateUser}
      allFacilities={allFacilities}
      onCreateNewUser={createNewUser}
    />
  );
};

export default ManageUsersContainer;
