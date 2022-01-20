import { MockedProvider } from "@apollo/client/testing";
import {
  render,
  waitFor,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import "../../../i18n";
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
          organization: { testingFacility: [] },
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
let resetUserPassword: (obj: any) => Promise<any>;
let resetUserMfa: (obj: any) => Promise<any>;
let resendUserActivationEmail: (obj: any) => Promise<any>;

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
    updateUserPrivileges = jest.fn(() => Promise.resolve());
    addUserToOrg = jest.fn(() =>
      Promise.resolve({
        data: { addUserToCurrentOrg: { id: "added-user-id" } },
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
    beforeEach(async () => {
      render(
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
    });

    it("enables logged-in user's settings except deletion and roles", async () => {
      const nameButton = screen.getByRole("tab", {
        name: displayFullName("Bob", "", "Bobberoo"),
      });
      userEvent.click(nameButton);
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
      userEvent.click(screen.getByText("Facility access"));
      expect(screen.getByLabelText("Admin", { exact: false })).toBeDisabled();
      expect(
        screen.getByLabelText("Testing only", { exact: false })
      ).toBeDisabled();
    });

    it("passes user details to the addUserToOrg function", async () => {
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smith.co",
        role: "USER",
      };

      userEvent.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      const select = screen.getByLabelText("Access level", { exact: false });
      userEvent.type(first, newUser.firstName);
      userEvent.type(last, newUser.lastName);
      userEvent.type(email, newUser.email);
      userEvent.selectOptions(select, newUser.role);
      const sendButton = screen.getByText("Send invite");
      userEvent.click(screen.getAllByRole("checkbox")[0]);
      expect(sendButton).toBeEnabled();
      userEvent.click(sendButton);
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

      userEvent.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      const select = screen.getByLabelText("Access level", { exact: false });
      userEvent.type(first, newUser.firstName);
      userEvent.type(last, newUser.lastName);
      userEvent.type(email, newUser.email);
      userEvent.selectOptions(select, newUser.role);
      const sendButton = screen.getByText("Send invite");
      userEvent.click(screen.getAllByRole("checkbox")[0]);
      expect(sendButton).toBeEnabled();
      userEvent.click(sendButton);
      await waitFor(() => expect(addUserToOrg).not.toBeCalled());
      expect(
        screen.queryAllByText("Email must be a valid email address").length
      ).toBe(1);
    });

    it("passes user details to the addUserToOrg function without a role", async () => {
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smith.co",
      };

      userEvent.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      userEvent.type(first, newUser.firstName);
      userEvent.type(last, newUser.lastName);
      userEvent.type(email, newUser.email);
      userEvent.click(screen.getAllByRole("checkbox")[0]);
      const sendButton = screen.getByText("Send invite");
      await waitFor(() => expect(sendButton).toBeEnabled());
      userEvent.click(sendButton);
      await waitFor(() => expect(addUserToOrg).toBeCalled());
      expect(addUserToOrg).toBeCalledWith({
        variables: { ...newUser, role: "USER" },
      });
    });

    it("deletes a user", async () => {
      const removeButton = await screen.findByRole("button", {
        name: "Delete user",
      });
      userEvent.click(removeButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      userEvent.click(sureButton);
      await waitFor(() => expect(deleteUser).toBeCalled());
      expect(deleteUser).toBeCalledWith({
        variables: { deleted: true, id: users[0].id },
      });
    });

    it("updates someone from user to admin", async () => {
      userEvent.click(screen.getByText("Facility access"));
      const [adminOption] = await screen.findAllByRole("radio");
      userEvent.click(adminOption);
      const button = await screen.findByText("Save", { exact: false });
      await waitFor(() => expect(button).toBeEnabled());
      userEvent.click(button);
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
      userEvent.click(screen.getByText("Facility access"));
      userEvent.click(screen.getAllByRole("checkbox")[1]);
      const saveButton = screen.getByText("Save changes");
      await waitFor(() => expect(saveButton).toBeEnabled());
      userEvent.click(saveButton);
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
      const resetButton = await screen.findByText("Send password reset email");
      userEvent.click(resetButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      userEvent.click(sureButton);
      await waitFor(() => expect(resetUserPassword).toBeCalled());
      expect(resetUserPassword).toBeCalledWith({
        variables: { id: users[0].id },
      });
    });

    it("resets a user's MFA", async () => {
      const resetButton = await screen.findByText("Reset MFA");
      userEvent.click(resetButton);
      const sureButton = await screen.findByRole("button", {
        name: "Reset multi-factor authentication",
        exact: false,
      });
      userEvent.click(sureButton);
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

      beforeEach(async () => {
        editButton = await screen.findByText("Edit name", { exact: true });
        userEvent.click(editButton);
        [first, last] = await screen.findAllByRole("textbox");
        confirmButton = await screen.findByText("Confirm", {
          exact: false,
        });
      });

      it("successfully changes a user's name", async () => {
        [
          { textbox: first, value: newUser.firstName },
          { textbox: last, value: newUser.lastName },
        ].forEach((t) => {
          userEvent.clear(t.textbox);
          userEvent.type(t.textbox, t.value);
        });
        userEvent.click(confirmButton);
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
        userEvent.clear(first);
        userEvent.click(confirmButton);
        await waitFor(() => expect(confirmButton).toBeDisabled());
        expect(
          screen.getByText("A first name is required")
        ).toBeInTheDocument();
      });

      it("fails for a missing last name", async () => {
        userEvent.clear(last);
        userEvent.click(confirmButton);
        await waitFor(() => expect(confirmButton).toBeDisabled());
        expect(screen.getByText("A last name is required")).toBeInTheDocument();
      });
    });

    describe("changing a user's email", () => {
      let editButton: HTMLElement;
      let email: HTMLElement;
      let confirmButton: HTMLElement;

      beforeEach(async () => {
        editButton = await screen.findByText("Edit email", { exact: true });
        userEvent.click(editButton);
        [email] = await screen.findAllByRole("textbox");
        confirmButton = await screen.findByText("Confirm", {
          exact: false,
        });
      });

      it("successfully changes a user's email", async () => {
        const newEmail = "thisisanewemail@newemail.com";

        userEvent.clear(email);
        userEvent.type(email, newEmail);
        userEvent.click(confirmButton);
        await waitFor(() => expect(updateUserEmail).toBeCalled());
        expect(updateUserEmail).toBeCalledWith({
          variables: {
            id: users[0].id,
            email: newEmail,
          },
        });
      });

      it("fails for an invalid email", async () => {
        const invalidEmail = "thisisanewemail@invalid";

        userEvent.clear(email);
        userEvent.type(email, invalidEmail);
        userEvent.click(confirmButton);
        await waitFor(() => expect(confirmButton).toBeDisabled());
        expect(
          screen.getByText("Email must be a valid email address")
        ).toBeInTheDocument();
      });

      it("fails for the same email", async () => {
        userEvent.click(confirmButton);
        await waitFor(() => expect(confirmButton).toBeDisabled());
        expect(
          screen.getByText("The old and new email addresses must be different")
        ).toBeInTheDocument();
      });

      it("fails with an empty textbox", async () => {
        userEvent.clear(email);
        userEvent.click(confirmButton);
        await waitFor(() => expect(confirmButton).toBeDisabled());
        expect(
          screen.getByText("Enter a valid email address")
        ).toBeInTheDocument();
      });
    });
  });

  describe("empty list of users", () => {
    beforeEach(async () => {
      render(
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
    });

    it("fails gracefully when there are no users", async () => {
      const noUsers = await screen.findByText("no users", { exact: false });
      expect(noUsers).toBeInTheDocument();
    });

    it("adds a user when zero users exist", async () => {
      const newUser = {
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@smith.co",
      };

      userEvent.click(screen.getByText("Add user", { exact: false }));
      const [first, last, email] = await screen.findAllByRole("textbox");
      userEvent.type(first, newUser.firstName);
      userEvent.type(last, newUser.lastName);
      userEvent.type(email, newUser.email);
      userEvent.click(screen.getAllByRole("checkbox")[0]);
      const sendButton = screen.getByText("Send invite");
      await waitFor(() => expect(sendButton).toBeEnabled());
      userEvent.click(sendButton);
      await waitForElementToBeRemoved(() => screen.queryByText("Sending"));
      await waitFor(() => expect(addUserToOrg).toBeCalled());
      expect(addUserToOrg).toBeCalledWith({
        variables: { ...newUser, role: "USER" },
      });
    });
  });

  describe("suspended users", () => {
    beforeEach(async () => {
      render(
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
    });

    it("reactivates a suspended user", async () => {
      const reactivateButton = await screen.findByText("Activate user");
      userEvent.click(reactivateButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      userEvent.click(sureButton);
      await waitFor(() => expect(reactivateUser).toBeCalled());
      expect(reactivateUser).toBeCalledWith({
        variables: { id: suspendedUsers[0].id },
      });
    });

    it("only shows status for non-active users", async () => {
      expect(await screen.findByText("Activate user")).toBeInTheDocument();
      // status appears twice for each suspended user - once in the side nav, and once in the detail view.
      // the suspendedUsers list only has two users, one active and one suspended.
      expect(screen.queryAllByText("Account deactivated").length).toBe(2);
    });
  });

  describe("pending account setup users", () => {
    beforeEach(async () => {
      render(
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
    });

    it("resends account activation email for pending user", async () => {
      const resendButton = await screen.findByText("Send account setup email");
      userEvent.click(resendButton);
      const sureButton = await screen.findByText("Yes", { exact: false });
      userEvent.click(sureButton);
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

    userEvent.click(screen.getByText("Facility access"));
    const facilityA2 = screen.getAllByRole("checkbox")[2];
    await waitFor(() => expect(facilityA2).toBeChecked());
    userEvent.click(facilityA2);
    await waitFor(() => expect(facilityA2).not.toBeChecked());
    const saveButton = await screen.findByText("Save changes");
    await waitFor(() => expect(saveButton).toBeEnabled());
    userEvent.click(saveButton);
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
