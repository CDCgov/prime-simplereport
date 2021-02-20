import { render } from "@testing-library/react";
import ManageUsers, { SettingsUsers } from "./ManageUsers";

const organization = { testingFacility: [{ id: "a1", name: "Foo Org" }] };
const allFacilities = [
  organization.testingFacility[0],
  { id: "a2", name: "Bar Org" },
];

const loggedInUser = {
  firstName: "Bob",
  middleName: "",
  lastName: "Bobaroo",
  id: "1",
  email: "bob@bobaroo.org",
  suffix: "",
  roleDescription: "Admin user",
};

const users: SettingsUsers[keyof SettingsUsers][] = [
  {
    firstName: "John",
    middleName: "",
    lastName: "Doe",
    id: "123",
    email: "john@doe.org",
    organization,
    permissions: ["READ_PATIENT_LIST"],
    roleDescription: "user",
  },
  { ...loggedInUser, permissions: [], organization, roleDescription: "admin" },
];

const updateUserRole = jest.fn();
const addUserToOrg = jest.fn();
const deleteUser = jest.fn();
const getUsers = jest.fn();

describe("ManageUsers", () => {
  it("displays the list of users and defaults to the first user", () => {
    const { container } = render(
      <ManageUsers
        users={users}
        loggedInUser={loggedInUser}
        allFacilities={allFacilities}
        updateUserRole={updateUserRole}
        addUserToOrg={addUserToOrg}
        deleteUser={deleteUser}
        getUsers={getUsers}
      />
    );
    expect(container).toMatchSnapshot();
  });
});
