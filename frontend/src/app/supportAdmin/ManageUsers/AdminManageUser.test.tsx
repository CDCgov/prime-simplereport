import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
import { ToastContainer } from "react-toastify";
import createMockStore from "redux-mock-store";
import { configureAxe } from "jest-axe";
import { MockedResponse } from "@apollo/client/testing/core";
import { GraphQLError } from "graphql/error";

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
import { createGQLWrappedMemoryRouterWithDataApis } from "../../utils/reactRouter";

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

  await user.type(searchInput, email);

  await user.click(screen.getByAltText("Search"));

  expect(await screen.findByText(fullName)).toBeInTheDocument();
};
const mockStore = createMockStore([]);
const mockedStore = mockStore({ user: { isAdmin: true } });

const renderComponent = (mocks: MockedResponse[]) => ({
  user: userEvent.setup(),
  ...render(
    createGQLWrappedMemoryRouterWithDataApis(
      <div>
        <ToastContainer />
        <AdminManageUser />
      </div>,
      mockedStore,
      mocks
    )
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

      await user.click(screen.getByLabelText("Clear user search"));

      expect(
        await screen.findByPlaceholderText("email@example.com")
      ).toBeInTheDocument();
      expect(screen.queryByText("Ben")).not.toBeInTheDocument();
    });
    it("should clear error", async () => {
      const { user } = renderComponent([
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
      await user.type(searchInput, "bad@example.com");
      await user.click(screen.getByAltText("Search"));

      expect(await screen.findByText("User not found")).toBeInTheDocument();
      await user.click(screen.getByLabelText("Clear user search"));

      expect(
        await screen.findByPlaceholderText("email@example.com")
      ).toBeInTheDocument();
      expect(screen.queryByText("User not found")).not.toBeInTheDocument();
    });
  });
  describe("search error", () => {
    it("displays user not found", async () => {
      const { user } = renderComponent([
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
      await user.type(searchInput, "bad@example.com");
      await user.click(screen.getByAltText("Search"));
      expect(await screen.findByText("User not found")).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
      expect(document.body).toMatchSnapshot();
    });
    it("displays user is an admin", async () => {
      const mockedResponse = {
        request: {
          query: FindUserByEmailDocument,
          variables: { email: "admin@example.com" },
        },
        result: {
          data: undefined,
          errors: [
            new GraphQLError(
              "header: Error finding user email; body: Please escalate this issue to the SimpleReport team."
            ),
          ],
        },
      };
      const { user } = renderComponent([mockedResponse as MockedResponse]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      await user.type(searchInput, "admin@example.com");
      await user.click(screen.getByAltText("Search"));
      expect(
        await screen.findByText("Can't determine user identity")
      ).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
      expect(document.body).toMatchSnapshot();
    });
    it("displays generic error", async () => {
      const { user } = renderComponent([
        {
          request: {
            query: FindUserByEmailDocument,
            variables: { email: "bob@example.com" },
          },
          result: {
            data: undefined,
            errors: [
              new GraphQLError(
                "header: Something went wrong; body: Try again later."
              ),
            ],
          },
        },
      ]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      await user.type(searchInput, "bob@example.com");
      await user.click(screen.getByAltText("Search"));
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
      await user.click(screen.getByText("Edit name"));

      await screen.findByText("Edit name for Barnes, Ben");
      const firstNameField = screen.getByLabelText("First name *");
      const lastNameField = screen.getByLabelText("Last name *");
      await user.clear(lastNameField);
      await user.type(lastNameField, "Smith");
      await user.clear(firstNameField);
      await user.type(firstNameField, "Granny");

      await user.click(screen.getByText("Confirm"));
      await screen.findByText("Smith, Granny Billy");
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

      await user.click(screen.getByText("Edit email"));
      await screen.findByText("Edit email address for Barnes, Ben Billy");
      const emailField = screen.getByLabelText("Email address *");
      await user.clear(emailField);
      await user.type(emailField, "granny@example.com");
      await user.click(screen.getByText("Confirm"));

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
      await user.click(screen.getByText("Send password reset email"));
      await screen.findByText("Reset Barnes, Ben Billy's password");
      await user.click(screen.getByText("Yes, I'm sure"));

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
      await user.click(screen.getByText("Reset MFA"));
      await user.click(
        await screen.findByText("Reset multi-factor authentication")
      );

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
      await user.click(screen.getAllByText("Delete user")[1]);
      await screen.findByText(/Remove user/i);
      await user.click(await screen.findByText("Yes, I'm sure"));
      expect(await axe(document.body)).toHaveNoViolations();
      expect(await screen.findByText("Edit name")).toBeDisabled();
      expect(screen.getByText("Edit email")).toBeDisabled();
      expect(screen.getByText("Send password reset email")).toBeDisabled();
      expect(screen.getByText("Reset MFA")).toBeDisabled();
      expect(screen.queryByText("Delete user")).not.toBeInTheDocument();

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

      await user.click(await screen.findByText("Activate user"));

      await user.click(await screen.findByText("Yes, reactivate"));

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

      await user.click(await screen.findByText("Send account setup email"));

      await user.click(await screen.findByText("Yes, send email"));

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
    await user.click(undeleteBtn);

    await screen.findByRole("heading", { name: /undelete barnes, ben billy/i });
    expect(document.body).toMatchSnapshot(); //confirmation modal
    const confirmUndeleteBtn = screen.getByRole("button", {
      name: /yes, undelete user/i,
    });
    await user.click(confirmUndeleteBtn);

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

      await user.click(orgAccessTab);

      await screen.findByText(/user role/i);
      const roleRadioBtn = await screen.findByRole("radio", {
        name: /standard user report tests, bulk upload results, manage test results, and patient profiles/i,
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
      await user.click(orgAccessTab);

      const roleRadioBtn = await screen.findByRole("radio", {
        name: /standard user report tests, bulk upload results, manage test results, and patient profiles/i,
      });
      await waitFor(() => expect(roleRadioBtn).toHaveAttribute("checked", ""));

      await user.click(
        screen.getByRole("button", { name: /clear the select contents/i })
      );

      const saveBtn = screen.getByRole("button", { name: /save changes/i });

      await waitFor(() => expect(saveBtn).toBeEnabled());
      await user.click(saveBtn);

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

    await user.click(orgAccessTab);

    // change organization
    const orgComboBoxInput = await screen.findByTestId("combo-box-input");

    await user.clear(orgComboBoxInput);

    await user.type(orgComboBoxInput, "Dat Organization");

    await user.type(orgComboBoxInput, "{enter}");

    // select facility
    const downtownCheckbox = await screen.findByLabelText(/Downtown Clinic/i);

    await user.click(downtownCheckbox);

    // submit changes
    const saveChangesBtn = screen.getByRole("button", {
      name: /save changes/i,
    });

    await user.click(saveChangesBtn);

    // verify warning modal shows
    await screen.findByText(/organization update/i);
    expect(
      screen.getByText(
        /this update will move to a different organization\. the user will lose access to test result reported under it\./i
      )
    ).toBeInTheDocument();
  });
});
