import React from "react";
// import { gql, useQuery } from "@apollo/client";
import ManagedUsers from "./ManageUsers";
import { UserRole } from "../../permissions";

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

const dummyUsers = [
  {
    id: "123",
    name: "Peter Parker",
    role: "admin" as UserRole,
    isAdmin: true,
    email: "spiderman-or-deadpool@hero.com",
  },
  {
    id: "456",
    name: "Carol Danvers",
    role: "entry-only" as UserRole,
    isAdmin: false,
    email: "marvel@hero.com",
  },
  {
    id: "789",
    name: "Natasha Romanoff",
    role: "admin" as UserRole,
    isAdmin: true,
    email: "widow@hero.com",
    isCurrentUser: true,
  },
];

const ManageUsersContainer: any = () => {
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
    <ManagedUsers
      users={dummyUsers}
      currentUser={{ id: "123", isAdmin: true }}
    />
  );
};

export default ManageUsersContainer;
