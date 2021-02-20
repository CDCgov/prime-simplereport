import { render, fireEvent, waitFor } from "@testing-library/react";
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

let updateUserRole: () => Promise<any>;
let addUserToOrg: () => Promise<any>;
let deleteUser: () => Promise<any>;
let getUsers: () => void;

let inputValue = (value: string) => ({ target: { value } });

describe("ManageUsers", () => {
  beforeEach(() => {
    updateUserRole = jest.fn(() => Promise.resolve());
    addUserToOrg = jest.fn(() => Promise.resolve());
    deleteUser = jest.fn(() => Promise.resolve());
    getUsers = jest.fn();
  });
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
    const { container, findByText, getByText } = render(
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

    fireEvent.click(getByText(displayFullNameInOrder("Bob", "", "Bobberoo")));
    await findByText("YOU");
    expect(container).toMatchSnapshot();
  });
  it("passes user details to the addUserToOrg function", async () => {
    const { getByText, findAllByRole } = render(
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

    const newUser = {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@smith.co",
    };

    fireEvent.click(getByText("New User", { exact: false }));
    const [first, last, email] = await findAllByRole("textbox");
    fireEvent.change(first, inputValue(newUser.firstName));
    fireEvent.change(last, inputValue(newUser.lastName));
    fireEvent.change(email, inputValue(newUser.email));
    fireEvent.click(getByText("Send", { exact: false }));
    await waitFor(() => expect(addUserToOrg).toBeCalled());
    expect(addUserToOrg).toBeCalledWith({ variables: newUser });
  });
});
