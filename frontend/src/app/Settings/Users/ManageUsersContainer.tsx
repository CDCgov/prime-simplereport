import React from "react";
// import { gql, useQuery } from "@apollo/client";
import ManagedUsers from "./ManageUsers";

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
  { id: "123", name: "Peter Parker", role: "Admin", email: "spider@hero.com" },
  { id: "456", name: "Carol Danvers", role: "User", email: "marvel@hero.com" },
  {
    id: "789",
    name: "Natasha Romanoff",
    role: "Admin",
    email: "widow@hero.com",
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

  return <ManagedUsers users={dummyUsers} />;
};

export default ManageUsersContainer;
