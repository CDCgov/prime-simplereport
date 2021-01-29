import React from "react";
import Nav from "../Nav";
import Button from "../../commonComponents/Button";

interface Props {
  users: any[]; // TODO
}

const ManageUsers: React.FC<Props> = ({ users }) => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <Nav />
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2>Manage Users</h2>
              <Button type="button" onClick={() => {}} label="Save Changes" />
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td> {user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ManageUsers;
