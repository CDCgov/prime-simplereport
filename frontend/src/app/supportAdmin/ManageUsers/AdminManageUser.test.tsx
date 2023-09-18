import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEvent } from "@testing-library/user-event/dist/types/setup";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { configureAxe } from "jest-axe";

import {
  EditUserEmailDocument,
  FindUserByEmailDocument,
  ReactivateUserAndResetPasswordDocument,
  ResendActivationEmailDocument,
  ResetUserMfaDocument,
  ResetUserPasswordDocument,
  SetUserIsDeletedDocument,
  UndeleteUserDocument,
  UpdateUserNameDocument,
} from "../../../generated/graphql";
import { OktaUserStatus } from "../../utils/user";

import { AdminManageUser } from "./AdminManageUser";
import {
  findUserByEmailMock,
  getAllOrgsMock,
  getFacilitiesByDatOrgMock,
  getFacilitiesByDisOrgMock,
  getTestResultCountByOrgMock,
} from "./operationMocks";

jest.mock("uuid", () => ({
  v4: jest
    .fn()
    .mockReturnValueOnce("123456789")
    .mockReturnValueOnce("987654321")
    .mockReturnValue("123"),
}));

const validResponse = [
  {
    request: {
      query: FindUserByEmailDocument,
      variables: { email: "ben@example.com" },
    },
    result: {
      data: {
        user: {
          id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
          firstName: "Ben",
          middleName: "Billy",
          lastName: "Barnes",
          suffix: "III",
          email: "ben@example.com",
          isAdmin: false,
          roleDescription: "Misconfigured user",
          permissions: [],
          role: null,
          roles: [],
          status: "ACTIVE",
        },
      },
    },
  },
];
const searchForValidUser = async (
  user: UserEvent,
  email = "ben@example.com",
  fullName = "Barnes, Ben Billy"
) => {
  const searchInput = await screen.findByLabelText(
    "Search by email address of user"
  );
  await act(async () => {
    await user.type(searchInput, email);
  });
  await act(async () => {
    await user.click(screen.getByAltText("Search"));
  });

  expect(await screen.findByText(fullName)).toBeInTheDocument();
};
const mockStore = createMockStore([]);
const mockedStore = mockStore({ user: { isAdmin: true } });

const renderComponent = (mocks?: any[]) => ({
  user: userEvent.setup(),
  render: render(
    <Provider store={mockedStore}>
      <MemoryRouter>
        <MockedProvider mocks={mocks} addTypename={false}>
          <div>
            <ToastContainer />
            <AdminManageUser />
          </div>
        </MockedProvider>
      </MemoryRouter>
    </Provider>
  ),
});

const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});
describe("Admin manage users", () => {
  it("search results matches snapshot", async () => {
    const { user } = renderComponent(validResponse);
    await searchForValidUser(user);

    expect(document.body).toMatchSnapshot();
    expect(await axe(document.body)).toHaveNoViolations();
  });
  describe("clear filter button", () => {
    it("should clear search results", async () => {
      const { user } = renderComponent(validResponse);
      await searchForValidUser(user);
      await act(async () => {
        screen.getByLabelText("Clear user search").click();
      });
      expect(
        await screen.findByPlaceholderText("email@example.com")
      ).toBeInTheDocument();
      expect(screen.queryByText("Ben")).not.toBeInTheDocument();
    });
    it("should clear error", async () => {
      renderComponent([
        {
          request: {
            query: FindUserByEmailDocument,
            variables: { email: "bad@example.com" },
          },
          result: {
            data: null,
          },
        },
      ]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      fireEvent.change(searchInput, { target: { value: "bad@example.com" } });
      await act(async () => {
        screen.getByAltText("Search").click();
      });

      expect(await screen.findByText("User not found")).toBeInTheDocument();
      await act(async () => {
        screen.getByLabelText("Clear user search").click();
      });

      expect(
        await screen.findByPlaceholderText("email@example.com")
      ).toBeInTheDocument();
      expect(screen.queryByText("User not found")).not.toBeInTheDocument();
    });
  });
  describe("search error", () => {
    it("displays user not found", async () => {
      renderComponent([
        {
          request: {
            query: FindUserByEmailDocument,
            variables: { email: "bad@example.com" },
          },
          result: {
            data: null,
          },
        },
      ]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      fireEvent.change(searchInput, { target: { value: "bad@example.com" } });
      await act(async () => {
        screen.getByAltText("Search").click();
      });
      expect(await screen.findByText("User not found")).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
      expect(document.body).toMatchSnapshot();
    });
    it("displays user is an admin", async () => {
      renderComponent([
        {
          request: {
            query: FindUserByEmailDocument,
            variables: { email: "admin@example.com" },
          },
          result: {
            data: null,
            errors: [
              {
                message:
                  "header: Error finding user email; body: Please escalate this issue to the SimpleReport team.",
                locations: [],
                path: ["user"],
                extensions: {
                  classification: "ExecutionAborted",
                },
              },
            ],
          },
        },
      ]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      fireEvent.change(searchInput, { target: { value: "admin@example.com" } });
      await act(async () => {
        screen.getByAltText("Search").click();
      });
      expect(
        await screen.findByText("Can't determine user identity")
      ).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
      expect(document.body).toMatchSnapshot();
    });
    it("displays generic error", async () => {
      renderComponent([
        {
          request: {
            query: FindUserByEmailDocument,
            variables: { email: "bob@example.com" },
          },
          result: {
            data: null,
            errors: [
              {
                message: "header: Something went wrong; body: Try again later.",
                locations: [],
                path: ["user"],
                extensions: {
                  classification: "ExecutionAborted",
                },
              },
            ],
          },
        },
      ]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      fireEvent.change(searchInput, { target: { value: "bob@example.com" } });
      await act(async () => {
        screen.getByAltText("Search").click();
      });
      expect(
        await screen.findByText("Something went wrong")
      ).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
      expect(document.body).toMatchSnapshot();
    });
  });
  describe("editing basic information", () => {
    it("edit name handler calls", async () => {
      const updateUserNameResponse = {
        request: {
          query: UpdateUserNameDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            firstName: "Granny",
            middleName: "Billy",
            lastName: "Smith",
            suffix: "III",
          },
        },
        result: {
          data: {
            updateUser: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            },
          },
        },
      };
      const { user } = renderComponent([
        ...validResponse,
        updateUserNameResponse,
      ]);
      await searchForValidUser(user);
      await act(async () => {
        screen.getByText("Edit name").click();
      });

      await screen.findByText("Edit name for Barnes, Ben");
      const firstNameField = screen.getByLabelText("First name *");
      const lastNameField = screen.getByLabelText("Last name *");
      fireEvent.change(firstNameField, { target: { value: "Granny" } });
      fireEvent.change(lastNameField, { target: { value: "Smith" } });

      await act(async () => {
        screen.getByText("Confirm").click();
      });

      expect(
        await screen.findByText("Smith, Granny Billy")
      ).toBeInTheDocument();
    });
    it("edit email handler calls", async () => {
      const updateUserNameResponse = {
        request: {
          query: EditUserEmailDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            email: "granny@example.com",
          },
        },
        result: {
          data: {
            updateUserEmail: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
              email: "granny@example.com",
            },
          },
        },
      };
      const { user } = renderComponent([
        ...validResponse,
        updateUserNameResponse,
      ]);
      await searchForValidUser(user);

      await act(async () => {
        screen.getByText("Edit email").click();
      });
      await screen.findByText("Edit email address for Barnes, Ben Billy");
      const emailField = screen.getByLabelText("Email address *");
      fireEvent.change(emailField, { target: { value: "granny@example.com" } });
      await act(async () => {
        screen.getByText("Confirm").click();
      });

      await screen.findByText("granny@example.com");
    });
  });
  describe("resetting user controls", () => {
    it("reset user password handler", async () => {
      const resetUserPasswordResponse = {
        request: {
          query: ResetUserPasswordDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
          },
        },
        result: {
          data: {
            resetUserPassword: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            },
          },
        },
      };
      const { user } = renderComponent([
        ...validResponse,
        resetUserPasswordResponse,
      ]);
      await searchForValidUser(user);
      await act(async () => {
        screen.getByText("Send password reset email").click();
      });
      await screen.findByText("Reset Barnes, Ben Billy's password");
      await act(async () => {
        screen.getByText("Yes, I'm sure").click();
      });

      expect(
        await screen.findByText("Password reset for Barnes, Ben Billy")
      ).toBeInTheDocument();
    });
    it("reset user mfa handler", async () => {
      const resetUserPasswordResponse = {
        request: {
          query: ResetUserMfaDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
          },
        },
        result: {
          data: {
            resetUserMfa: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            },
          },
        },
      };
      const { user } = renderComponent([
        ...validResponse,
        resetUserPasswordResponse,
      ]);
      await searchForValidUser(user);
      await act(async () => {
        screen.getByText("Reset MFA").click();
      });
      const resetMFABtn = await screen.findByText(
        "Reset multi-factor authentication"
      );
      await act(async () => {
        resetMFABtn.click();
      });

      expect(
        await screen.findByText("MFA reset for Barnes, Ben Billy")
      ).toBeInTheDocument();
    });

    it("delete user handler", async () => {
      const deleteUserResponse = {
        request: {
          query: SetUserIsDeletedDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            deleted: true,
          },
        },
        result: {
          data: {
            setUserIsDeleted: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            },
          },
        },
      };
      const { user } = renderComponent([...validResponse, deleteUserResponse]);
      await searchForValidUser(user);
      await act(async () => {
        await user.click(screen.getAllByText("Delete user")[1]);
      });
      await screen.findByText(/Remove user/i);
      await act(async () => {
        await user.click(await screen.findByText("Yes, I'm sure"));
      });
      expect(await screen.findByText("Account deleted"));
      expect(screen.getByText("Edit name")).toBeDisabled();
      expect(screen.getByText("Edit email")).toBeDisabled();
      expect(screen.getByText("Send password reset email")).toBeDisabled();
      expect(screen.getByText("Reset MFA")).toBeDisabled();
      expect(screen.queryByText("Delete user")).not.toBeInTheDocument();

      expect(await axe(document.body)).toHaveNoViolations();
      expect(
        await screen.findByText("User account removed for Barnes, Ben Billy")
      ).toBeInTheDocument();
    });

    it("reactivate user handler", async () => {
      const suspendedUserResponse = {
        request: {
          query: FindUserByEmailDocument,
          variables: { email: "ben@example.com" },
        },
        result: {
          data: {
            user: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
              firstName: "Ben",
              middleName: "Billy",
              lastName: "Barnes",
              suffix: "III",
              email: "ben@example.com",
              isAdmin: false,
              roleDescription: "Misconfigured user",
              permissions: [],
              role: null,
              roles: [],
              status: OktaUserStatus.SUSPENDED,
            },
          },
        },
      };
      const reactivateUserResponse = {
        request: {
          query: ReactivateUserAndResetPasswordDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
          },
        },
        result: {
          data: {
            reactivateUserAndResetPassword: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            },
          },
        },
      };
      const { user } = renderComponent([
        suspendedUserResponse,
        reactivateUserResponse,
      ]);
      await searchForValidUser(user);

      await act(async () => {
        await user.click(await screen.findByText("Activate user"));
      });

      await act(async () => {
        await user.click(await screen.findByText("Yes, reactivate"));
      });

      expect(
        await screen.findByText("Barnes, Ben Billy has been reactivated.")
      ).toBeInTheDocument();
    });

    it("resend user activation handler", async () => {
      const suspendedUserResponse = {
        request: {
          query: FindUserByEmailDocument,
          variables: { email: "ben@example.com" },
        },
        result: {
          data: {
            user: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
              firstName: "Ben",
              middleName: "Billy",
              lastName: "Barnes",
              suffix: "III",
              email: "ben@example.com",
              isAdmin: false,
              roleDescription: "Misconfigured user",
              permissions: [],
              role: null,
              roles: [],
              status: OktaUserStatus.PROVISIONED,
            },
          },
        },
      };
      const reactivateUserResponse = {
        request: {
          query: ResendActivationEmailDocument,
          variables: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
          },
        },
        result: {
          data: {
            resendActivationEmail: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
              firstName: "Ben",
              middleName: "Billy",
              lastName: "Barnes",
              email: "bob@example.com",
              status: OktaUserStatus.PROVISIONED,
            },
          },
        },
      };
      const { user } = renderComponent([
        suspendedUserResponse,
        reactivateUserResponse,
      ]);
      await searchForValidUser(user);
      await act(async () => {
        await user.click(await screen.findByText("Send account setup email"));
      });
      await act(async () => {
        await user.click(await screen.findByText("Yes, send email"));
      });

      expect(
        await screen.findByText(
          "Barnes, Ben Billy has been sent a new invitation."
        )
      ).toBeInTheDocument();
    });
  });

  it("Undelete user", async () => {
    const deletedUserResponse = {
      request: {
        query: FindUserByEmailDocument,
        variables: { email: "ben@example.com" },
      },
      result: {
        data: {
          user: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            firstName: "Ben",
            middleName: "Billy",
            lastName: "Barnes",
            suffix: "III",
            email: "ben@example.com",
            isAdmin: false,
            roleDescription: "Misconfigured user",
            permissions: [],
            role: null,
            roles: [],
            status: OktaUserStatus.SUSPENDED,
            isDeleted: true,
          },
        },
      },
    };

    const undeletedUserResponse = {
      request: {
        query: FindUserByEmailDocument,
        variables: { email: "ben@example.com" },
      },
      result: {
        data: {
          user: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            firstName: "Ben",
            middleName: "Billy",
            lastName: "Barnes",
            suffix: "III",
            email: "ben@example.com",
            isAdmin: false,
            roleDescription: "Misconfigured user",
            permissions: [],
            role: null,
            roles: [],
            status: OktaUserStatus.ACTIVE,
            isDeleted: false,
          },
        },
      },
    };

    const undeleteUserResponse = {
      request: {
        query: UndeleteUserDocument,
        variables: {
          userId: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
        },
      },
      result: {
        data: {
          setUserIsDeleted: {
            id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            email: "ben@example.com",
            isDeleted: false,
            __typename: "User",
          },
        },
      },
    };
    const { user } = renderComponent([
      deletedUserResponse,
      undeleteUserResponse,
      undeletedUserResponse,
    ]);
    await searchForValidUser(user);
    expect(document.body).toMatchSnapshot(); // deleted account
    await screen.findByRole("heading", { name: /barnes, ben billy/i });
    const undeleteBtn = screen.getByRole("button", { name: /undelete user/i });
    await act(async () => {
      undeleteBtn.click();
    });

    await screen.findByRole("heading", { name: /undelete barnes, ben billy/i });
    expect(document.body).toMatchSnapshot(); //confirmation modal
    const confirmUndeleteBtn = screen.getByRole("button", {
      name: /yes, undelete user/i,
    });

    await act(async () => {
      confirmUndeleteBtn.click();
    });

    await waitFor(() =>
      expect(
        screen.queryByRole("heading", { name: /undelete barnes, ben billy/i })
      ).not.toBeInTheDocument()
    );
  });

  describe("Organization access tab", () => {
    it("loads organization access tab", async () => {
      const { user } = renderComponent([
        getAllOrgsMock,
        getFacilitiesByDisOrgMock,
        getFacilitiesByDisOrgMock,
        findUserByEmailMock,
      ]);
      await searchForValidUser(
        user,
        "ruby@example.com",
        "Reynolds, Ruby Raven"
      );
      const orgAccessTab = await screen.findByRole("tab", {
        name: /organization access/i,
      });
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        orgAccessTab.click();
      });

      await screen.findByText(/user role/i);
      const roleRadioBtn = await screen.findByRole("radio", {
        name: /standard user conduct tests, bulk upload results, manage test results, and patient profiles/i,
      });
      await waitFor(() => expect(roleRadioBtn).toHaveAttribute("checked", ""));
    });

    it("checks form validation happens on submit", async () => {
      const { user } = renderComponent([
        getAllOrgsMock,
        getFacilitiesByDisOrgMock,
        getFacilitiesByDisOrgMock,
        findUserByEmailMock,
      ]);
      await searchForValidUser(
        user,
        "ruby@example.com",
        "Reynolds, Ruby Raven"
      );
      const orgAccessTab = await screen.findByRole("tab", {
        name: /organization access/i,
      });
      // eslint-disable-next-line testing-library/no-unnecessary-act
      await act(async () => {
        orgAccessTab.click();
      });

      const roleRadioBtn = await screen.findByRole("radio", {
        name: /standard user conduct tests, bulk upload results, manage test results, and patient profiles/i,
      });
      await waitFor(() => expect(roleRadioBtn).toHaveAttribute("checked", ""));

      await act(async () => {
        screen
          .getByRole("button", { name: /clear the select contents/i })
          .click();
      });

      const saveBtn = screen.getByRole("button", { name: /save changes/i });

      await waitFor(() => expect(saveBtn).toBeEnabled());
      await act(async () => {
        saveBtn.click();
      });

      await screen.findByText(/Error: Organization is required/i);
    });
  });

  it("shows warning modal if org updates that will make user lose access to data are submitted", async () => {
    const { user } = renderComponent([
      findUserByEmailMock,
      getAllOrgsMock,
      getFacilitiesByDisOrgMock,
      getFacilitiesByDisOrgMock,
      getFacilitiesByDatOrgMock,
      getTestResultCountByOrgMock,
    ]);

    await searchForValidUser(user, "ruby@example.com", "Reynolds, Ruby Raven");

    const orgAccessTab = await screen.findByRole("tab", {
      name: /organization access/i,
    });

    await act(async () => {
      orgAccessTab.click();
    });

    // change organization
    const orgComboBoxInput = await screen.findByTestId("combo-box-input");
    await act(async () => {
      await user.clear(orgComboBoxInput);
    });
    await act(async () => {
      await user.type(orgComboBoxInput, "Dat Organization");
    });
    await act(async () => {
      await user.type(orgComboBoxInput, "{enter}");
    });

    // select facility
    const downtownCheckbox = await screen.findByLabelText(/Downtown Clinic/i);
    await act(async () => {
      await user.click(downtownCheckbox);
    });

    // submit changes
    const saveChangesBtn = screen.getByRole("button", {
      name: /save changes/i,
    });
    await act(async () => {
      await user.click(saveChangesBtn);
    });

    // verify warning modal shows
    await screen.findByText(/organization update/i);
    expect(
      screen.getByText(
        /this update will move to a different organization\. the user will lose access to test result reported under it\./i
      )
    ).toBeInTheDocument();
  });
});
