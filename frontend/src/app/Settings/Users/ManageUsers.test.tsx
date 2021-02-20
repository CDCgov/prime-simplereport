import { render, fireEvent } from "@testing-library/react";
import { displayFullNameInOrder } from "../../utils";
import ManageUsers, { SettingsUsers } from "./ManageUsers";

const organization = { testingFacility: [{ id: "a1", name: "Foo Org" }] };
const allFacilities = [
  organization.testingFacility[0],
  { id: "a2", name: "Bar Org" },
];

const loggedInUser = {
  firstName: "Bob",
  middleName: "",
  lastName: "Bobberoo",
  id: "b1",
  email: "bob@bobberoo.org",
  suffix: "",
  roleDescription: "Admin user",
};

const users: SettingsUsers[keyof SettingsUsers][] = [
  {
    firstName: "John",
    middleName: "",
    lastName: "Doe",
    id: "a123",
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
  it("disables logged-in user's settings", async () => {
    const { container, getByText } = render(
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

    await fireEvent.click(
      getByText(displayFullNameInOrder("Bob", "", "Bobberoo"))
    );

    expect(container).toMatchSnapshot();
  });
});
