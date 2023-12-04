import { MockedProvider } from "@apollo/client/testing";
import {
  render,
  waitFor,
  screen,
  waitForElementToBeRemoved,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";
import "../../../i18n";
import { cloneDeep } from "lodash";

import { displayFullName } from "../../utils";
import { GetUserDocument, UserPermission } from "../../../generated/graphql";

import ManageUsers, { SettingsUsers } from "./ManageUsers";
import { LimitedUser } from "./ManageUsersContainer";

const organization = { testingFacility: [{ id: "a1", name: "Foo Org" }] };
const allFacilities = [
  organization.testingFacility[0],
  { id: "a2", name: "Bar Org" },
];

const loggedInUser = {
  firstName: "Bob",
  middleName: "",
  lastName: "Bobberoo",
  suffix: "",
  id: "b1",
  email: "bob@bobberoo.org",
  roleDescription: "Admin user",
  isAdmin: false,
};

const mockStore = configureStore([]);
const store = mockStore({
  organization: {
    name: "Organization Name",
  },
  user: {
    firstName: "Kim",
    lastName: "Mendoza",
    roleDescription: "Admin user",
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
    suffix: "",
    id: "a123",
    email: "john@arthur.org",
    organization: { testingFacility: [] },
    permissions: [UserPermission.ReadPatientList],
    roleDescription: "user",
    role: "USER",
    status: "ACTIVE",
  },
  {
    firstName: "Jane",
    middleName: "",
    lastName: "Doe",
    suffix: "",
    id: "a122",
    email: "jane@example.com",
    organization: { testingFacility: [] },
    permissions: [UserPermission.ReadPatientList],
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
    permissions: [UserPermission.ReadPatientList],
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

const pendingActivationUsers: SettingsUsers[keyof SettingsUsers][] = [
  {
    firstName: "Michael",
    middleName: "",
    lastName: "Almond",
    id: "c456",
    email: "michael@almond.com",
    organization: { testingFacility: [] },
    permissions: [UserPermission.ReadPatientList],
    roleDescription: "user",
    role: "USER",
    status: "PROVISIONED",
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

const mockGetUserRequest = (id: string) => ({
  request: {
    query: GetUserDocument,
    variables: {
      id,
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
        permissions: [UserPermission.ReadPatientList],
        email: "bob@bobberoo.org",
        organization: { testingFacility: [] },
      },
    },
  },
});

const mocks = [
  {
    request: {
      query: GetUserDocument,
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
          permissions: [UserPermission.ReadPatientList],
          email: "john@example.com",
          organization: { testingFacility: [] },
        },
      },
    },
  },
  // duplicating this for when we update the active user
  // currently no elegant way to reuse mocks
  // https://github.com/apollographql/apollo-feature-requests/issues/274
  { ...mockGetUserRequest("a123") },
  { ...mockGetUserRequest("b1") },
  { ...mockGetUserRequest("b1") },
  {
    request: {
      query: GetUserDocument,
      variables: {
        id: "a122",
      },
    },
    result: {
      data: {
        user: {
          id: "a122",
          firstName: "Jane",
          middleName: "",
          lastName: "Doe",
          roleDescription: "user",
          role: "USER",
          permissions: [UserPermission.ReadPatientList],
          email: "jane@example.com",
          organization: { testingFacility: [] },
          status: "ACTIVE",
        },
      },
    },
  },
  {
    request: {
      query: GetUserDocument,
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
          permissions: [UserPermission.ReadPatientList],
          email: "sarah@abba.com",
          organization: { testingFacility: [] },
          status: "SUSPENDED",
        },
      },
    },
  },
  {
    request: {
      query: GetUserDocument,
      variables: {
        id: "c456",
      },
    },
    result: {
      data: {
        user: {
          id: "c456",
          firstName: "Michael",
          middleName: "",
          lastName: "Almond",
          roleDescription: "user",
          role: "USER",
          permissions: [UserPermission.ReadPatientList],
          email: "michael@almond.com",
          organization: { testingFacility: [] },
          status: "PROVISIONED",
        },
      },
    },
  },
];

let updateUserPrivileges: () => Promise<any>;
let addUserToOrg: () => Promise<any>;
let deleteUser: (obj: any) => Promise<any>;
let updateUserName: (obj: any) => Promise<any>;
let updateUserEmail: (obj: any) => Promise<any>;
let getUsers: () => Promise<any>;
let reactivateUser: (obj: any) => Promise<any>;
let reactivateUserAndResetPassword: (obj: any) => Promise<any>;
let resetUserPassword: (obj: any) => Promise<any>;
let resetUserMfa: (obj: any) => Promise<any>;
let resendUserActivationEmail: (obj: any) => Promise<any>;

type TestContainerProps = {
  children: React.ReactNode;
};

const TestContainer: React.FC<TestContainerProps> = ({ children }) => (
  <MemoryRouter>
    <Provider store={store}>
      <MockedProvider mocks={mocks}>
        <>{children}</>
      </MockedProvider>
    </Provider>
  </MemoryRouter>
);

describe("ManageUsers", () => {
  const { reload } = window.location;

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: { reload: jest.fn() },
    });
  });

  afterAll(() => {
    window.location.reload = reload;
  });

  beforeEach(() => {
    updateUserPrivileges = jest.fn().mockImplementation(() => {
      return new Promise((res) => setTimeout(() => res({}), 200));
    });
    addUserToOrg = jest.fn(() =>
      Promise.resolve({
        data: { addUserToCurrentOrg: { id: "a123" } },
      })
    );
    deleteUser = jest.fn((obj) =>
      Promise.resolve({ data: { setUserIsDeleted: { id: obj.variables.id } } })
    );
    updateUserName = jest.fn((obj) =>
      Promise.resolve({
        data: { updateUserName: { id: obj.variables.id } },
      })
    );
    updateUserEmail = jest.fn((obj) =>
      Promise.resolve({
        data: { updateUserEmail: { id: obj.variables.id } },
      })
    );
    getUsers = jest.fn(() => Promise.resolve({ data: users }));
    reactivateUser = jest.fn((obj) =>
      Promise.resolve({
        data: { setUserIsReactivated: { id: obj.variables.id } },
      })
    );
    reactivateUserAndResetPassword = jest.fn((obj) =>
      Promise.resolve({
        data: { setUserIsReactivated: { id: obj.variables.id } },
      })
    );
    resetUserPassword = jest.fn((obj) =>
      Promise.resolve({
        data: { setUserPasswordReset: { id: obj.variables.id } },
      })
    );
    resetUserMfa = jest.fn((obj) =>
      Promise.resolve({
        data: { setUserMfaReset: { id: obj.variables.id } },
      })
    );
    resendUserActivationEmail = jest.fn((obj) =>
      Promise.resolve({
        data: { setUserActivationEmailResent: { id: obj.variables.id } },
      })
    );
  });

  describe("regular list of users", () => {
    const renderAndWaitForLoad = async () => {
      const { ...renderControls } = render(
        <TestContainer>
          <ManageUsers
            users={users as LimitedUser[]}
            loggedInUser={loggedInUser}
            allFacilities={allFacilities}
            updateUserPrivileges={updateUserPrivileges}
            addUserToOrg={addUserToOrg}
            deleteUser={deleteUser}
            getUsers={getUsers}
            reactivateUser={reactivateUser}
            resetUserPassword={resetUserPassword}
            resetUserMfa={resetUserMfa}
            resendUserActivationEmail={resendUserActivationEmail}
            updateUserName={updateUserName}
            updateUserEmail={updateUserEmail}
          />
        </TestContainer>
      );
      await waitForElementToBeRemoved(() => screen.queryByText("?, ?"));
      return { user: userEvent.setup(), ...renderControls };
    };

    it("is searchable", async () => {
      //given
      const { user } = await renderAndWaitForLoad();

      //when
      const searchBox = screen.getByRole("searchbox", {
        name: /search by name/i,
      });
      await act(async () => {
        await user.type(searchBox, "john");
      });

      //then
      await waitFor(() => {
        expect(
          screen.getByRole("tab", {
            name: displayFullName("John", "", "Arthur"),
          })
        ).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(
          screen.queryByText(displayFullName("Bob", "", "Bobberoo"), {
            exact: false,
          })
        ).not.toBeInTheDocument();
      });
    });

    it("displays no results message for empty filtered list", async () => {
      //given
      const { user } = await renderAndWaitForLoad();

      //when
      const searchBox = screen.getByRole("searchbox", {
        name: /search by name/i,
      });
      await act(async () => {
        await user.type(searchBox, "john wick");
      });

      //then
      await waitFor(() => {
        expect(
          screen.queryByText(displayFullName("Jane", "", "Doe"), {
            exact: false,
          })
        ).not.toBeInTheDocument();
      });

      await waitFor(() => {
        expect(
          screen.queryByText(displayFullName("Bob", "", "Bobberoo"), {
            exact: false,
          })
        ).not.toBeInTheDocument();
      });

      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });

    it("enables logged-in user's settings except deletion and roles", async () => {
      const { user } = await renderAndWaitForLoad();
      const nameButton = screen.getByRole("tab", {
        name: displayFullName("Bob", "", "Bobberoo"),
      });
      await user.click(nameButton);
      await waitFor(() => {
        expect(screen.getByText("YOU")).toBeInTheDocument();
      });
      expect(screen.getByText("Edit name")).toBeEnabled();
      expect(screen.getByText("Edit email")).toBeEnabled();
      expect(screen.getByText("Send password reset email")).toBeEnabled();
      expect(screen.getByText("Reset MFA")).toBeEnabled();
      expect(
        screen.getByRole("button", { name: "Delete user" })
      ).toBeDisabled();
      await user.click(screen.getByText("Facility access"));
      expect(screen.getByLabelText("Admin", { exact: false })).toBeDisabled();
      expect(
        screen.getByLabelText("Testing only", { exact: false })
      ).toBeDisabled();
    });

    it("passes user details to the addUserToOrg function", async () => {
      const { user } = await renderAndWaitForLoad();
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smith.co",
        role: "USER",
      };

      await user.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      const select = screen.getByLabelText("Access level", { exact: false });
      await user.type(first, newUser.firstName);
      await user.type(last, newUser.lastName);
      await user.type(email, newUser.email);
      await user.selectOptions(select, newUser.role);
      await user.click(screen.getAllByRole("checkbox")[0]);
      const sendButton = screen.getByText("Send invite");
      await waitFor(() => expect(sendButton).toBeEnabled());
      await user.click(sendButton);
      await waitFor(() => expect(addUserToOrg).toBeCalled());
      expect(addUserToOrg).toBeCalledWith({
        variables: {
          ...newUser,
          accessAllFacilities: true,
          facilities: ["1", "2"],
        },
      });
      expect(updateUserPrivileges).not.toBeCalled();
    });

    it("fails with invalid email address", async () => {
      const { user } = await renderAndWaitForLoad();
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane",
        role: "USER",
      };

      await user.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      const select = screen.getByLabelText("Access level", { exact: false });
      await user.type(first, newUser.firstName);
      await user.type(last, newUser.lastName);
      await user.type(email, newUser.email);
      await user.selectOptions(select, newUser.role);
      await user.click(screen.getAllByRole("checkbox")[0]);
      const sendButton = screen.getByText("Send invite");
      await waitFor(() => expect(sendButton).toBeEnabled());
      await user.click(sendButton);
      await waitFor(() => expect(addUserToOrg).not.toBeCalled());
      expect(
        screen.getByText("Email address must be a valid email address")
      ).toBeInTheDocument();
    });

    it("passes user details to the addUserToOrg function without a role", async () => {
      const { user } = await renderAndWaitForLoad();
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smith.co",
      };

      await user.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      await user.type(first, newUser.firstName);
      await user.type(last, newUser.lastName);
      await user.type(email, newUser.email);
      await user.click(screen.getAllByRole("checkbox")[0]);
      const sendButton = screen.getByText("Send invite");
      await waitFor(() => expect(sendButton).toBeEnabled());
      await user.click(sendButton);
      await waitFor(() => expect(addUserToOrg).toBeCalled());
      expect(addUserToOrg).toBeCalledWith({
        variables: {
          ...newUser,
          role: "USER",
          accessAllFacilities: true,
          facilities: ["1", "2"],
        },
      });
    });

    it("deletes a user", async () => {
      const { user } = await renderAndWaitForLoad();
      const removeButton = await screen.findByRole("button", {
        name: "Delete user",
      });
      await user.click(removeButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      await user.click(sureButton);
      await waitFor(() => expect(deleteUser).toBeCalled());
      expect(deleteUser).toBeCalledWith({
        variables: { deleted: true, id: users[0].id },
      });
    });

    it("focuses on next user after current is deleted", async () => {
      const { user } = await renderAndWaitForLoad();
      await user.click(screen.getByRole("tab", { name: /doe, jane/i }));
      await waitFor(() =>
        expect(screen.getByRole("heading", { name: /doe, jane/i }))
      );

      await user.click(
        screen.getByRole("button", {
          name: "Delete user",
        })
      );
      const sureButton = await screen.findByText("Yes", { exact: false });
      await user.click(sureButton);
      await waitFor(() =>
        expect(screen.getByRole("heading", { name: /bobberoo, bob/i }))
      );
    });

    it("updates someone from user to admin", async () => {
      const { user } = await renderAndWaitForLoad();
      await user.click(screen.getByText("Facility access"));
      const [adminOption] = await screen.findAllByRole("radio");
      await user.click(adminOption);
      const button = await screen.findByText("Save", { exact: false });
      await waitFor(() => expect(button).toBeEnabled());
      await user.click(button);
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

    it("adds a facility for a user", async () => {
      const { user } = await renderAndWaitForLoad();
      await user.click(screen.getByText("Facility access"));
      await user.click(screen.getAllByRole("checkbox")[1]);
      const saveButton = screen.getByText("Save changes");
      await waitFor(() => expect(saveButton).toBeEnabled());
      await user.click(saveButton);
      await waitForElementToBeRemoved(() => screen.queryByText("Saving..."));
      expect(updateUserPrivileges).toBeCalled();
      expect(updateUserPrivileges).toBeCalledWith({
        variables: {
          accessAllFacilities: false,
          facilities: ["a1"],
          id: "a123",
          role: "USER",
        },
      });
    });

    it("resets a user's password", async () => {
      const { user } = await renderAndWaitForLoad();
      const resetButton = await screen.findByText("Send password reset email");
      await user.click(resetButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      await user.click(sureButton);
      await waitFor(() => expect(resetUserPassword).toBeCalled());
      expect(resetUserPassword).toBeCalledWith({
        variables: { id: users[0].id },
      });
    });

    it("resets a user's MFA", async () => {
      const { user } = await renderAndWaitForLoad();
      const resetButton = await screen.findByText("Reset MFA");
      await user.click(resetButton);
      const sureButton = await screen.findByRole("button", {
        name: "Reset multi-factor authentication",
      });
      await user.click(sureButton);
      await waitFor(() => expect(resetUserMfa).toBeCalled());
      expect(resetUserMfa).toBeCalledWith({
        variables: { id: users[0].id },
      });
    });

    describe("changing a user's name", () => {
      let editButton: HTMLElement;
      let first: HTMLElement;
      let last: HTMLElement;
      let confirmButton: HTMLElement;
      let newUser = {
        firstName: "Newuser",
        lastName: "Lastname",
      };

      const renderAndStartEditName = async () => {
        const { user, ...renderControls } = await renderAndWaitForLoad();
        editButton = await screen.findByText("Edit name", { exact: true });
        await user.click(editButton);
        [first, last] = await screen.findAllByRole("textbox");
        confirmButton = await screen.findByText("Confirm", {
          exact: false,
        });
        return { user, ...renderControls };
      };

      it("successfully changes a user's name", async () => {
        const { user } = await renderAndStartEditName();
        await user.clear(first);
        await user.type(first, newUser.firstName);
        await user.clear(last);
        await user.type(last, newUser.lastName);
        await user.click(confirmButton);
        await waitFor(() => expect(updateUserName).toBeCalled());
        expect(updateUserName).toBeCalledWith({
          variables: {
            id: users[0].id,
            firstName: newUser.firstName,
            middleName: users[0].middleName,
            lastName: newUser.lastName,
            suffix: users[0].suffix,
          },
        });
      });

      it("fails for a missing first name", async () => {
        const { user } = await renderAndStartEditName();
        await user.clear(first);
        await user.click(confirmButton);
        await expect(() => screen.findByText("First name is required"));
        await waitFor(() => expect(confirmButton).toBeEnabled());
      });

      it("fails for a missing last name", async () => {
        const { user } = await renderAndStartEditName();
        await user.clear(last);
        await user.click(confirmButton);
        await expect(() => screen.findByText("Last name is required"));
        await waitFor(() => expect(confirmButton).toBeEnabled());
      });
    });

    describe("changing a user's email", () => {
      let editButton: HTMLElement;
      let email: HTMLElement;
      let confirmButton: HTMLElement;

      const renderAndStartEditEmail = async () => {
        const { user, ...renderControls } = await renderAndWaitForLoad();
        editButton = await screen.findByText("Edit email", { exact: true });
        await user.click(editButton);
        [email] = await screen.findAllByRole("textbox");
        confirmButton = await screen.findByText("Confirm", {
          exact: false,
        });

        return { user, ...renderControls };
      };

      it("successfully changes a user's email", async () => {
        const { user } = await renderAndStartEditEmail();
        const newEmail = "thisisanewemail@newemail.com";

        await user.clear(email);
        await user.type(email, newEmail);
        await user.click(confirmButton);
        await waitFor(() => expect(updateUserEmail).toBeCalled());
        expect(updateUserEmail).toBeCalledWith({
          variables: {
            id: users[0].id,
            email: newEmail,
          },
        });
      });

      it("fails for an invalid email", async () => {
        const { user } = await renderAndStartEditEmail();
        const invalidEmail = "thisisanewemail@invalid";
        await user.clear(email);
        await user.type(email, invalidEmail);
        await user.click(confirmButton);
        await expect(await screen.findByText("Invalid email address"));
      });

      it("submit button disabled for same email", async () => {
        const { user } = await renderAndStartEditEmail();
        await expect(await screen.findByLabelText(/Email address/i));
        await user.clear(email);
        await user.type(email, "john@example.com");
        expect(confirmButton).toBeDisabled();
      });

      it("Error shows for required email field", async () => {
        const { user } = await renderAndStartEditEmail();
        await user.clear(email);
        await user.click(confirmButton);
        await expect(
          await screen.findByText("Email is required")
        ).toBeInTheDocument();
        await user.type(email, "not an email");
        await user.click(confirmButton);
        await expect(
          await screen.findByText("Invalid email address")
        ).toBeInTheDocument();
      });
    });
  });

  describe("empty list of users", () => {
    const renderWithNoUsers = async () => {
      const { ...renderControls } = render(
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
            resetUserPassword={() => Promise.resolve()}
            resetUserMfa={() => Promise.resolve()}
            resendUserActivationEmail={resendUserActivationEmail}
            updateUserName={() => Promise.resolve()}
            updateUserEmail={() => Promise.resolve()}
          />
        </TestContainer>
      );
      await screen.findByText("Add user", { exact: false });

      return { user: userEvent.setup(), ...renderControls };
    };

    it("fails gracefully when there are no users", async () => {
      await renderWithNoUsers();
      const noUsers = await screen.findByText("no users", { exact: false });
      expect(noUsers).toBeInTheDocument();
    });

    it("adds a user when zero users exist", async () => {
      const { user } = await renderWithNoUsers();
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smith.co",
      };

      await user.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      await user.type(first, newUser.firstName);
      await user.type(last, newUser.lastName);
      await user.type(email, newUser.email);
      await user.click(screen.getAllByRole("checkbox")[0]);
      const sendButton = screen.getByText("Send invite");
      await waitFor(() => expect(sendButton).toBeEnabled());
      await user.click(sendButton);

      await waitFor(() => expect(addUserToOrg).toBeCalled());
      expect(addUserToOrg).toBeCalledWith({
        variables: {
          ...newUser,
          role: "USER",
          accessAllFacilities: true,
          facilities: ["1", "2"],
        },
      });
    });
  });

  describe("suspended users", () => {
    const renderWithSuspendedUsers = async () => {
      const { ...renderControls } = render(
        <TestContainer>
          <ManageUsers
            users={suspendedUsers as LimitedUser[]}
            loggedInUser={loggedInUser}
            allFacilities={allFacilities}
            updateUserPrivileges={updateUserPrivileges}
            addUserToOrg={addUserToOrg}
            deleteUser={deleteUser}
            getUsers={getUsers}
            reactivateUser={reactivateUser}
            resetUserPassword={() => Promise.resolve()}
            resetUserMfa={() => Promise.resolve()}
            resendUserActivationEmail={resendUserActivationEmail}
            updateUserName={() => Promise.resolve()}
            updateUserEmail={() => Promise.resolve()}
          />
        </TestContainer>
      );
      await screen.findByText("Add user", { exact: false });

      return { user: userEvent.setup(), ...renderControls };
    };

    it("reactivates a suspended user", async () => {
      const { user } = await renderWithSuspendedUsers();
      const reactivateButton = await screen.findByText("Activate user");
      await user.click(reactivateButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      await user.click(sureButton);
      await waitFor(() => expect(reactivateUser).toBeCalled());
      expect(reactivateUser).toBeCalledWith({
        variables: { id: suspendedUsers[0].id },
      });
    });

    it("when user is an admin account, reactivating triggers the reactivate and reset password hook", async () => {
      const { user, rerender } = await renderWithSuspendedUsers();
      const loggedInSiteAdminUser = cloneDeep(loggedInUser);
      loggedInSiteAdminUser.isAdmin = true;
      rerender(
        <TestContainer>
          <ManageUsers
            users={suspendedUsers as LimitedUser[]}
            loggedInUser={loggedInSiteAdminUser}
            allFacilities={allFacilities}
            updateUserPrivileges={updateUserPrivileges}
            addUserToOrg={addUserToOrg}
            deleteUser={deleteUser}
            getUsers={getUsers}
            reactivateUser={reactivateUserAndResetPassword}
            resetUserPassword={() => Promise.resolve()}
            resetUserMfa={() => Promise.resolve()}
            resendUserActivationEmail={resendUserActivationEmail}
            updateUserName={() => Promise.resolve()}
            updateUserEmail={() => Promise.resolve()}
          />
        </TestContainer>
      );

      const reactivateButton = await screen.findByText("Activate user");
      await user.click(reactivateButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      await user.click(sureButton);
      await waitFor(() => expect(reactivateUserAndResetPassword).toBeCalled());
      expect(reactivateUserAndResetPassword).toBeCalledWith({
        variables: { id: suspendedUsers[0].id },
      });
    });

    it("only shows status for non-active users", async () => {
      await renderWithSuspendedUsers();
      expect(await screen.findByText("Activate user")).toBeInTheDocument();
      // status appears twice for each suspended user - once in the side nav, and once in the detail view.
      // the suspendedUsers list only has two users, one active and one suspended.
      expect(screen.queryAllByText("Account deactivated").length).toBe(2);
    });
  });

  describe("pending account setup users", () => {
    const renderWithPendingUsers = async () => {
      const { ...renderControls } = render(
        <TestContainer>
          <ManageUsers
            users={pendingActivationUsers as LimitedUser[]}
            loggedInUser={loggedInUser}
            allFacilities={allFacilities}
            updateUserPrivileges={updateUserPrivileges}
            addUserToOrg={addUserToOrg}
            deleteUser={deleteUser}
            getUsers={getUsers}
            reactivateUser={reactivateUser}
            resetUserPassword={() => Promise.resolve()}
            resetUserMfa={() => Promise.resolve()}
            resendUserActivationEmail={resendUserActivationEmail}
            updateUserName={() => Promise.resolve()}
            updateUserEmail={() => Promise.resolve()}
          />
        </TestContainer>
      );
      await screen.findByText("Add user", { exact: false });

      return { user: userEvent.setup(), ...renderControls };
    };

    it("resends account activation email for pending user", async () => {
      const { user } = await renderWithPendingUsers();
      const resendButton = await screen.findByText("Send account setup email");
      await user.click(resendButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      await user.click(sureButton);
      await waitFor(() => expect(resendUserActivationEmail).toBeCalled());
      expect(resendUserActivationEmail).toBeCalledWith({
        variables: { id: pendingActivationUsers[0].id },
      });
    });
  });

  it("removes a facility", async () => {
    const updatedMocks = [
      {
        request: {
          query: GetUserDocument,
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
              suffix: "",
              roleDescription: "user",
              role: "USER",
              permissions: [UserPermission.ReadPatientList],
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
          query: GetUserDocument,
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
              permissions: [UserPermission.ReadPatientList],
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
    render(
      <MemoryRouter>
        <Provider store={store}>
          <MockedProvider mocks={updatedMocks}>
            <ManageUsers
              users={users as LimitedUser[]}
              loggedInUser={loggedInUser}
              allFacilities={allFacilities}
              updateUserPrivileges={updateUserPrivileges}
              addUserToOrg={addUserToOrg}
              deleteUser={deleteUser}
              getUsers={getUsers}
              reactivateUser={reactivateUser}
              resetUserPassword={() => Promise.resolve()}
              resetUserMfa={() => Promise.resolve()}
              resendUserActivationEmail={resendUserActivationEmail}
              updateUserName={() => Promise.resolve()}
              updateUserEmail={() => Promise.resolve()}
            />
          </MockedProvider>
        </Provider>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByText("Facility access"));
    const facilityA2 = screen.getAllByRole("checkbox")[2];
    await waitFor(() => expect(facilityA2).toBeChecked());
    await user.click(facilityA2);
    await waitFor(() => expect(facilityA2).not.toBeChecked());
    const saveButton = await screen.findByText("Save changes");
    await waitFor(() => expect(saveButton).toBeEnabled());
    await user.click(saveButton);
    await waitForElementToBeRemoved(() => screen.queryByText("Saving..."));
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
