import { fireEvent, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import createMockStore from "redux-mock-store";
import { Provider } from "react-redux";
import { configureAxe, toHaveNoViolations } from "jest-axe";

import {
  EditUserEmailDocument,
  FindUserByEmailDocument,
  ReactivateUserAndResetPasswordDocument,
  ResendActivationEmailDocument,
  ResetUserMfaDocument,
  ResetUserPasswordDocument,
  SetUserIsDeletedDocument,
  UpdateUserNameDocument,
} from "../../../generated/graphql";
import { OktaUserStatus } from "../../utils/user";

import { AdminManageUser } from "./AdminManageUser";

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
const searchForValidUser = async () => {
  const searchInput = screen.getByLabelText("Search by email address of user");
  fireEvent.change(searchInput, { target: { value: "ben@example.com" } });
  fireEvent.click(screen.getByAltText("Search"));

  expect(await screen.findByText("Barnes, Ben Billy")).toBeInTheDocument();
};
const mockStore = createMockStore([]);
const mockedStore = mockStore({ user: { isAdmin: true } });
expect.extend(toHaveNoViolations);
const renderComponent = (mocks?: any[]) =>
  render(
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
  );
const axe = configureAxe({
  rules: {
    // disable landmark rules when testing isolated components.
    region: { enabled: false },
  },
});
describe("Admin manage users", () => {
  it("search results matches snapshot", async () => {
    renderComponent(validResponse);
    await searchForValidUser();

    expect(document.body).toMatchSnapshot();
    expect(await axe(document.body)).toHaveNoViolations();
  });
  describe("clear filter button", () => {
    it("should clear search results", async () => {
      renderComponent(validResponse);
      await searchForValidUser();
      fireEvent.click(screen.getByLabelText("Clear user search"));
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
      fireEvent.click(screen.getByAltText("Search"));
      expect(await screen.findByText("User not found")).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText("Clear user search"));
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
      fireEvent.click(screen.getByAltText("Search"));
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
      fireEvent.click(screen.getByAltText("Search"));
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
      fireEvent.click(screen.getByAltText("Search"));
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
      renderComponent([...validResponse, updateUserNameResponse]);
      await searchForValidUser();
      fireEvent.click(screen.getByText("Edit name"));
      await screen.findByText("Edit name for Barnes, Ben");
      const firstNameField = screen.getByLabelText("First name *");
      const lastNameField = screen.getByLabelText("Last name *");
      fireEvent.change(firstNameField, { target: { value: "Granny" } });
      fireEvent.change(lastNameField, { target: { value: "Smith" } });
      fireEvent.click(screen.getByText("Confirm"));

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
      renderComponent([...validResponse, updateUserNameResponse]);
      await searchForValidUser();
      fireEvent.click(screen.getByText("Edit email"));
      await screen.findByText("Edit email address for Barnes, Ben Billy");
      const emailField = screen.getByLabelText("Email address *");
      fireEvent.change(emailField, { target: { value: "granny@example.com" } });
      fireEvent.click(screen.getByText("Confirm"));

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
      renderComponent([...validResponse, resetUserPasswordResponse]);
      await searchForValidUser();
      fireEvent.click(screen.getByText("Send password reset email"));
      await screen.findByText("Reset Barnes, Ben Billy's password");
      fireEvent.click(screen.getByText("Yes, I'm sure"));

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
      renderComponent([...validResponse, resetUserPasswordResponse]);
      await searchForValidUser();
      fireEvent.click(screen.getByText("Reset MFA"));
      fireEvent.click(
        await screen.findByText("Reset multi-factor authentication")
      );

      expect(
        await screen.findByText("MFA reset for Barnes, Ben Billy")
      ).toBeInTheDocument();
    });
    it("delete user handler", async () => {
      const resetUserPasswordResponse = {
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
      renderComponent([...validResponse, resetUserPasswordResponse]);
      await searchForValidUser();
      fireEvent.click(screen.getAllByText("Delete user")[1]);
      fireEvent.click(await screen.findByText("Yes, I'm sure"));

      expect(
        await screen.findByText("User account removed for Barnes, Ben Billy")
      ).toBeInTheDocument();
      expect(await screen.findByText("Edit name")).toBeDisabled();
      expect(screen.getByText("Edit email")).toBeDisabled();
      expect(screen.getByText("Send password reset email")).toBeDisabled();
      expect(screen.getByText("Reset MFA")).toBeDisabled();
      expect(screen.queryByText("Delete user")).not.toBeInTheDocument();
      expect(screen.getByText("Account deleted")).toBeInTheDocument();
      expect(await axe(document.body)).toHaveNoViolations();
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
      renderComponent([suspendedUserResponse, reactivateUserResponse]);
      await searchForValidUser();
      fireEvent.click(await screen.findByText("Activate user"));
      fireEvent.click(await screen.findByText("Yes, reactivate"));

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
      renderComponent([suspendedUserResponse, reactivateUserResponse]);
      await searchForValidUser();
      fireEvent.click(await screen.findByText("Send account setup email"));
      fireEvent.click(await screen.findByText("Yes, send email"));

      expect(
        await screen.findByText(
          "Barnes, Ben Billy has been sent a new invitation."
        )
      ).toBeInTheDocument();
    });
  });
});
