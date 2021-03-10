import { render, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { displayFullName } from "../../utils";

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
    lastName: "Arthur",
    id: "a123",
    email: "john@arthur.org",
    organization,
    permissions: ["READ_PATIENT_LIST"],
    roleDescription: "user",
    role: "USER",
    facilities: [],
  },
  {
    ...loggedInUser,
    permissions: [],
    organization,
    roleDescription: "admin",
    role: "ADMIN",
    facilities: [],
  },
];

let updateUserPrivileges: () => Promise<any>;
let addUserToOrg: () => Promise<any>;
let deleteUser: (obj: any) => Promise<any>;
let getUsers: () => Promise<any>;

let inputValue = (value: string) => ({ target: { value } });

describe("ManageUsers", () => {
  beforeEach(() => {
    updateUserPrivileges = jest.fn(() => Promise.resolve());
    addUserToOrg = jest.fn(() =>
      Promise.resolve({
        data: { data: { addUserToCurrentOrg: { id: "added-user-id" } } },
      })
    );
    deleteUser = jest.fn((obj) =>
      Promise.resolve({ data: { setUserIsDeleted: { id: obj.variables.id } } })
    );
    getUsers = jest.fn(() => Promise.resolve());
  });
  it("displays the list of users and defaults to the first user", () => {
    const { container } = render(
      <MemoryRouter>
        <ManageUsers
          users={users}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );
    expect(container).toMatchSnapshot();
  });
  it("disables logged-in user's settings", async () => {
    const { container, findByText, getByText } = render(
      <MemoryRouter>
        <ManageUsers
          users={users}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );

    fireEvent.click(getByText(displayFullName("Bob", "", "Bobberoo")));
    await findByText("YOU");
    expect(container).toMatchSnapshot();
  });
  it("passes user details to the addUserToOrg function", async () => {
    const { getByText, findAllByRole, getByLabelText } = render(
      <MemoryRouter>
        <ManageUsers
          users={users}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );

    const newUser = {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@smith.co",
      role: "ADMIN",
    };

    fireEvent.click(getByText("New User", { exact: false }));
    const [first, last, email] = await findAllByRole("textbox");
    const select = getByLabelText("Access Level", { exact: false });
    fireEvent.change(first, inputValue(newUser.firstName));
    fireEvent.change(last, inputValue(newUser.lastName));
    fireEvent.change(email, inputValue(newUser.email));
    fireEvent.change(select, inputValue("ADMIN"));
    fireEvent.click(getByText("Send invite", { exact: false }));
    await waitFor(() => expect(addUserToOrg).toBeCalled());
    expect(addUserToOrg).toBeCalledWith({ variables: newUser });
  });
  it("passes user details to the addUserToOrg function without a role", async () => {
    const { getByText, findAllByRole } = render(
      <MemoryRouter>
        <ManageUsers
          users={users}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
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
    fireEvent.click(getByText("Send invite", { exact: false }));
    await waitFor(() => expect(addUserToOrg).toBeCalled());
    expect(addUserToOrg).toBeCalledWith({ variables: newUser });
  });
  it("deletes a user", async () => {
    const { findByText } = render(
      <MemoryRouter>
        <ManageUsers
          users={users}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );
    const removeButton = await findByText("Remove", { exact: false });
    fireEvent.click(removeButton);
    const sureButton = await findByText("Yes", { exact: false });
    fireEvent.click(sureButton);
    await waitFor(() => expect(deleteUser).toBeCalled());
    expect(deleteUser).toBeCalledWith({
      variables: { deleted: true, id: users[0].id },
    });
  });
  it("updates someone from user to admin", async () => {
    const { findAllByRole, findByText } = render(
      <MemoryRouter>
        <ManageUsers
          users={users}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );
    const [adminOption] = await findAllByRole("radio");
    fireEvent.click(adminOption);
    const button = await findByText("Save", { exact: false });
    await waitFor(() => expect(button).not.toHaveAttribute("disabled"));
    fireEvent.click(button);
    await waitFor(() => expect(updateUserPrivileges).toBeCalled());
    expect(updateUserPrivileges).toBeCalledWith({
      variables: {
        id: users[0].id,
        role: "ADMIN",
        accessAllFacilities: false,
        facilities: ["a1", "a2"],
      },
    });
  });
  it("fails gracefully when there are no users", async () => {
    const { findByText } = render(
      <MemoryRouter>
        <ManageUsers
          users={[]}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );
    const noUsers = await findByText("no users", { exact: false });
    expect(noUsers).toBeInTheDocument();
  });
  it("adds a user when zero users exist", async () => {
    const { getByText, findAllByRole } = render(
      <MemoryRouter>
        <ManageUsers
          users={[]}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
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
    fireEvent.click(getByText("Send invite", { exact: false }));
    await waitFor(() => expect(addUserToOrg).toBeCalled());
    expect(addUserToOrg).toBeCalledWith({ variables: newUser });
  });
});
