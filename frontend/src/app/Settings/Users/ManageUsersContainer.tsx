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
  isEdited?: boolean;
}

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
  },
];

const updateUser = (user: SettingsUser) => {
  // TODO: perform graphql query
};

const ManageUsersContainer: React.FC<any> = () => {
  const currentUser = useSelector((state) => (state as any).user as User);
  currentUser.id = "123"; // TODO: delete this
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
      currentUser={currentUser}
      onUpdateUser={updateUser}
    />
  );
};

export default ManageUsersContainer;
