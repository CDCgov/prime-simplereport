import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

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

const mockStore = configureStore([]);

const users: SettingsUsers[keyof SettingsUsers][] = [
  {
    firstName: "John",
    middleName: "",
    lastName: "Arthur",
    id: "a123",
    email: "john@arthur.org",
    organization: { testingFacility: [] },
    permissions: ["READ_PATIENT_LIST"],
    roleDescription: "user",
    role: "USER",
  },
  {
    ...loggedInUser,
    permissions: [],
    organization,
    roleDescription: "admin",
    role: "ADMIN",
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
        data: { addUserToCurrentOrg: { id: "added-user-id" } },
      })
    );
    deleteUser = jest.fn((obj) =>
      Promise.resolve({ data: { setUserIsDeleted: { id: obj.variables.id } } })
    );
    getUsers = jest.fn(() => Promise.resolve({ data: users }));
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
    const store = mockStore({
      organization: {
        name: "Organization Name",
      },
      user: {
        firstName: "Kim",
        lastName: "Mendoza",
      },
      facilities: [
        { id: "1", name: "Facility 1" },
        { id: "2", name: "Facility 2" },
      ],
    });
    const { getByText, findAllByRole, getByLabelText } = render(
      <Provider store={store}>
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
      </Provider>
    );

    const newUser = {
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@smith.co",
      role: "USER",
    };

    fireEvent.click(getByText("New User", { exact: false }));
    const [first, last, email] = await findAllByRole("textbox");
    const select = getByLabelText("Access Level", { exact: false });
    fireEvent.change(first, inputValue(newUser.firstName));
    fireEvent.change(last, inputValue(newUser.lastName));
    fireEvent.change(email, inputValue(newUser.email));
    fireEvent.change(select, inputValue(newUser.role));
    const sendButton = getByText("Send invite");
    await waitFor(() => {
      fireEvent.click(screen.getAllByRole("checkbox")[1]);
      expect(sendButton).not.toBeDisabled();
    });
    fireEvent.click(sendButton);
    await waitFor(() => expect(addUserToOrg).toBeCalled());
    expect(addUserToOrg).toBeCalledWith({ variables: newUser });
    expect(updateUserPrivileges).toBeCalledWith({
      variables: {
        accessAllFacilities: true,
        facilities: ["1", "2"],
        id: "added-user-id",
        role: "USER",
      },
    });
  });
  it("passes user details to the addUserToOrg function without a role", async () => {
    const store = mockStore({
      organization: {
        name: "Organization Name",
      },
      user: {
        firstName: "Kim",
        lastName: "Mendoza",
      },
      facilities: [
        { id: "1", name: "Facility 1" },
        { id: "2", name: "Facility 2" },
      ],
    });
    const { getByText, findAllByRole } = render(
      <Provider store={store}>
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
      </Provider>
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
    fireEvent.click(screen.getAllByRole("checkbox")[1]);
    const sendButton = getByText("Send invite");
    await waitFor(() => expect(sendButton).not.toBeDisabled());
    fireEvent.click(sendButton);
    await waitFor(() => expect(addUserToOrg).toBeCalled());
    expect(addUserToOrg).toBeCalledWith({
      variables: { ...newUser, role: "USER" },
    });
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
    const store = mockStore({
      organization: {
        name: "Organization Name",
      },
      user: {
        firstName: "Kim",
        lastName: "Mendoza",
      },
      facilities: allFacilities,
    });
    const { getByText, findAllByRole } = render(
      <Provider store={store}>
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
      </Provider>
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
    fireEvent.click(screen.getByRole("checkbox"));
    const sendButton = getByText("Send invite");
    await waitFor(() => expect(sendButton).not.toBeDisabled());
    await waitFor(() => {
      fireEvent.click(sendButton);
      expect(addUserToOrg).toBeCalled();
    });
    expect(addUserToOrg).toBeCalledWith({
      variables: { ...newUser, role: "USER" },
    });
  });
  it("adds adds a facility for a user", async () => {
    render(
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
    const facilitySelect = await screen.findByLabelText("Add facility");
    const addButton = screen.getByText("Add");
    await waitFor(() => {
      fireEvent.change(facilitySelect, { target: { value: "a1" } });
      expect(addButton).not.toBeDisabled();
    });
    fireEvent.click(addButton);
    const saveButton = screen.getByText("Save changes");
    await waitFor(() => expect(saveButton).not.toBeDisabled());
    await waitFor(() => {
      fireEvent.click(saveButton);
      expect(updateUserPrivileges).toBeCalled();
    });
    expect(updateUserPrivileges).toBeCalledWith({
      variables: {
        accessAllFacilities: false,
        facilities: ["a1"],
        id: "a123",
        role: "USER",
      },
    });
  });
  it("gives user access to all facilities", async () => {
    render(
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
    const allFacilitiesBox = await screen.findByLabelText(
      "Access all facilities"
    );
    const saveButton = screen.getByText("Save changes");
    await waitFor(() => {
      fireEvent.click(allFacilitiesBox);
      expect(saveButton).not.toBeDisabled();
    });
    await waitFor(() => {
      fireEvent.click(saveButton);
      expect(updateUserPrivileges).toBeCalled();
    });

    expect(updateUserPrivileges).toBeCalledWith({
      variables: {
        accessAllFacilities: true,
        facilities: ["a1", "a2"],
        id: "a123",
        role: "USER",
      },
    });
  });
  it("removes a facility", async () => {
    render(
      <MemoryRouter>
        <ManageUsers
          users={users.map((user) => ({
            ...user,
            organization: {
              testingFacility: [
                { id: "a1", name: "Foo Facility" },
                { id: "a2", name: "Bar Facility" },
              ],
            },
          }))}
          loggedInUser={loggedInUser}
          allFacilities={allFacilities}
          updateUserPrivileges={updateUserPrivileges}
          addUserToOrg={addUserToOrg}
          deleteUser={deleteUser}
          getUsers={getUsers}
        />
      </MemoryRouter>
    );

    const removeButton = (
      await screen.findAllByLabelText("Remove facility", {
        exact: false,
      })
    )[0];
    const saveButton = await screen.findByText("Save changes");
    await waitFor(() => {
      fireEvent.click(removeButton);
      expect(saveButton).not.toBeDisabled();
    });
    await waitFor(() => {
      fireEvent.click(saveButton);
    });
    expect(updateUserPrivileges).toBeCalledWith({
      variables: {
        accessAllFacilities: false,
        facilities: ["a1"],
        id: "a123",
        role: "USER",
      },
    });
  });
});
