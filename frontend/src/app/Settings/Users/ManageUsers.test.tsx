import { MockedProvider } from "@apollo/client/testing";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import { displayFullName } from "../../utils";

import ManageUsers, { SettingsUsers } from "./ManageUsers";
import { GET_USER } from "./ManageUsersContainer";
import "../../../i18n";

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
    status: "ACTIVE",
  },
  {
    ...loggedInUser,
    permissions: [],
    organization,
    roleDescription: "admin",
    role: "ADMIN",
    status: "ACTIVE",
  },
];

const suspendedUsers: SettingsUsers[keyof SettingsUsers][] = [
  {
    firstName: "Sarah",
    middleName: "",
    lastName: "Abba",
    id: "b234",
    email: "sarah@abba.org",
    organization: { testingFacility: [] },
    permissions: ["READ_PATIENT_LIST"],
    roleDescription: "user",
    role: "USER",
    status: "SUSPENDED",
  },
  {
    ...loggedInUser,
    permissions: [],
    organization,
    roleDescription: "admin",
    role: "ADMIN",
    status: "ACTIVE",
  },
];

const mocks = [
  {
    request: {
      query: GET_USER,
      variables: {
        id: "a123",
      },
    },
    result: {
      data: {
        user: {
          id: "a123",
          firstName: "John",
          middleName: "",
          lastName: "Arthur",
          roleDescription: "user",
          role: "USER",
          permissions: ["READ_PATIENT_LIST"],
          email: "john@example.com",
          organization: { testingFacility: [] },
        },
      },
    },
  },
  {
    request: {
      query: GET_USER,
      variables: {
        id: "b1",
      },
    },
    result: {
      data: {
        user: {
          id: "b1",
          firstName: "Bob",
          middleName: "",
          lastName: "Bobberoo",
          roleDescription: "admin",
          role: "ADMIN",
          permissions: ["READ_PATIENT_LIST"],
          email: "bob@bobberoo.org",
          organization: { testingFacility: [] },
        },
      },
    },
  },
  {
    request: {
      query: GET_USER,
      variables: {
        id: "b234",
      },
    },
    result: {
      data: {
        user: {
          id: "b234",
          firstName: "Sarah",
          middleName: "",
          lastName: "Abba",
          roleDescription: "user",
          role: "USER",
          permissions: ["READ_PATIENT_LIST"],
          email: "sarah@abba.com",
          organization: { testingFacility: [] },
          status: "SUSPENDED",
        },
      },
    },
  },
];

let updateUserPrivileges: () => Promise<any>;
let addUserToOrg: () => Promise<any>;
let deleteUser: (obj: any) => Promise<any>;
let getUsers: () => Promise<any>;
let reactivateUser: (obj: any) => Promise<any>;

let inputValue = (value: string) => ({ target: { value } });

const TestContainer: React.FC = ({ children }) => (
  <MemoryRouter>
    <Provider store={store}>
      <MockedProvider mocks={mocks}>
        <>{children}</>
      </MockedProvider>
    </Provider>
  </MemoryRouter>
);

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
    reactivateUser = jest.fn((obj) =>
      Promise.resolve({
        data: { setUserIsReactivated: { id: obj.variables.id } },
      })
    );
  });

  describe("regular list of users", () => {
    let container: any,
      findByText: any,
      findAllByRole: any,
      getByText: any,
      getByLabelText: any;
    beforeEach(async () => {
      await waitFor(() => {
        const {
          container: ui,
          findByText: findText,
          findAllByRole: findAllRole,
          getByText: getText,
          getByLabelText: getLabelText,
        } = render(
          <TestContainer>
            <ManageUsers
              users={users}
              loggedInUser={loggedInUser}
              allFacilities={allFacilities}
              updateUserPrivileges={updateUserPrivileges}
              addUserToOrg={addUserToOrg}
              deleteUser={deleteUser}
              getUsers={getUsers}
              reactivateUser={reactivateUser}
            />
          </TestContainer>
        );
        container = ui;
        findByText = findText;
        findAllByRole = findAllRole;
        getByText = getText;
        getByLabelText = getLabelText;
      });
    });

    it("displays the list of users and defaults to the first user", async () => {
      expect(container).toMatchSnapshot();
    });

    it("disables logged-in user's settings", async () => {
      fireEvent.click(getByText(displayFullName("Bob", "", "Bobberoo")));
      await findByText("YOU");
      expect(getByLabelText("admin", { exact: false })).toHaveAttribute(
        "disabled"
      );
      expect(getByLabelText("user", { exact: false })).toHaveAttribute(
        "disabled"
      );
      expect(getByLabelText("Entry only", { exact: false })).toHaveAttribute(
        "disabled"
      );
      expect(container).toMatchSnapshot();
    });

    it("passes user details to the addUserToOrg function", async () => {
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

    it("fails with invalid email address", async () => {
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane",
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
      expect(
        screen.queryAllByText("Email is incorrectly formatted").length
      ).toBe(1);
    });

    it("passes user details to the addUserToOrg function without a role", async () => {
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

    it("adds adds a facility for a user", async () => {
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
  });

  describe("empty list of users", () => {
    let findByText: any, findAllByRole: any, getByText: any;
    beforeEach(async () => {
      await waitFor(() => {
        const {
          findByText: findText,
          findAllByRole: findAllRole,
          getByText: getText,
        } = render(
          <TestContainer>
            <ManageUsers
              users={[]}
              loggedInUser={loggedInUser}
              allFacilities={allFacilities}
              updateUserPrivileges={updateUserPrivileges}
              addUserToOrg={addUserToOrg}
              deleteUser={deleteUser}
              getUsers={getUsers}
              reactivateUser={reactivateUser}
            />
          </TestContainer>
        );
        findByText = findText;
        findAllByRole = findAllRole;
        getByText = getText;
      });
    });

    it("fails gracefully when there are no users", async () => {
      const noUsers = await findByText("no users", { exact: false });
      expect(noUsers).toBeInTheDocument();
    });

    it("adds a user when zero users exist", async () => {
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
  });

  describe("suspended users", () => {
    let findByText: any;
    beforeEach(async () => {
      await waitFor(() => {
        const { findByText: findText } = render(
          <TestContainer>
            <ManageUsers
              users={suspendedUsers}
              loggedInUser={loggedInUser}
              allFacilities={allFacilities}
              updateUserPrivileges={updateUserPrivileges}
              addUserToOrg={addUserToOrg}
              deleteUser={deleteUser}
              getUsers={getUsers}
              reactivateUser={reactivateUser}
            />
          </TestContainer>
        );
        findByText = findText;
      });
    });

    it("reactivates a suspended user", async () => {
      const reactivateButton = await findByText("Reactivate", { exact: false });
      fireEvent.click(reactivateButton);
      const sureButton = await findByText("Yes", { exact: false });
      fireEvent.click(sureButton);
      await waitFor(() => expect(reactivateUser).toBeCalled());
      expect(reactivateUser).toBeCalledWith({
        variables: { id: suspendedUsers[0].id },
      });
    });
  });

  it("removes a facility", async () => {
    const updatedMocks = [
      {
        request: {
          query: GET_USER,
          variables: {
            id: "a123",
          },
        },
        result: {
          data: {
            user: {
              id: "a123",
              firstName: "John",
              middleName: "",
              lastName: "Arthur",
              roleDescription: "user",
              role: "USER",
              permissions: ["READ_PATIENT_LIST"],
              email: "john@example.com",
              organization: {
                testingFacility: [
                  { id: "a1", name: "Foo Facility" },
                  { id: "a2", name: "Bar Facility" },
                ],
              },
            },
          },
        },
      },
      {
        request: {
          query: GET_USER,
          variables: {
            id: "b1",
          },
        },
        result: {
          data: {
            user: {
              id: "b1",
              firstName: "Bob",
              middleName: "",
              lastName: "Bobberoo",
              roleDescription: "admin",
              role: "ADMIN",
              permissions: ["READ_PATIENT_LIST"],
              email: "bob@bobberoo.org",
              organization: {
                testingFacility: [
                  { id: "a1", name: "Foo Facility" },
                  { id: "a2", name: "Bar Facility" },
                ],
              },
            },
          },
        },
      },
    ];
    await waitFor(() => {
      render(
        <MemoryRouter>
          <Provider store={store}>
            <MockedProvider mocks={updatedMocks}>
              <ManageUsers
                users={users}
                loggedInUser={loggedInUser}
                allFacilities={allFacilities}
                updateUserPrivileges={updateUserPrivileges}
                addUserToOrg={addUserToOrg}
                deleteUser={deleteUser}
                getUsers={getUsers}
                reactivateUser={reactivateUser}
              />
            </MockedProvider>
          </Provider>
        </MemoryRouter>
      );
    });

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
