import { fireEvent, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

import {
  FindUserByEmailDocument,
  UpdateUserNameDocument,
} from "../../../generated/graphql";

import { AdminManageUser } from "./AdminManageUser";

jest.mock("uuid", () => ({ v4: () => "123456789" }));
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
describe("Admin manage user", () => {
  const renderComponent = (mocks?: any[]) =>
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <AdminManageUser />
        </MockedProvider>
      </MemoryRouter>
    );
  it("search results matches snapshot", async () => {
    const { container } = renderComponent(validResponse);
    const searchInput = screen.getByLabelText(
      "Search by email address of user"
    );
    fireEvent.change(searchInput, { target: { value: "ben@example.com" } });
    fireEvent.click(screen.getByRole("button"));

    await screen.findByText("Barnes, Ben Billy");
    expect(container).toMatchSnapshot();
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
      fireEvent.click(screen.getByRole("button"));
      expect(await screen.findByText("User not found")).toBeInTheDocument();
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
                  "header: Unauthorized access of site admin account; body: Contact development team if you need to access this information.",
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
      fireEvent.click(screen.getByRole("button"));
      expect(
        await screen.findByText("Can't determine user identity")
      ).toBeInTheDocument();
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
      fireEvent.click(screen.getByRole("button"));
      expect(
        await screen.findByText("Something went wrong")
      ).toBeInTheDocument();
    });
  });
  describe("editing user", () => {
    it("edit name handler calls ", async () => {
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
            user: {
              id: "1cd3b088-e7d0-4be9-9cb7-035e3284d5f5",
            },
          },
        },
      };
      renderComponent([...validResponse, updateUserNameResponse]);
      const searchInput = screen.getByLabelText(
        "Search by email address of user"
      );
      fireEvent.change(searchInput, { target: { value: "ben@example.com" } });
      fireEvent.click(screen.getByRole("button"));

      await screen.findByText("Barnes, Ben Billy");
      fireEvent.click(screen.getByText("Edit name"));
      await screen.findByText("Edit name for Barnes, Ben");
      const firstNameField = screen.getByLabelText("First name *");
      const lastNameField = screen.getByLabelText("Last name *");
      fireEvent.change(firstNameField, { target: { value: "Granny" } });
      fireEvent.change(lastNameField, { target: { value: "Smith" } });
      fireEvent.click(screen.getByText("Confirm"));

      await screen.findByText("Smith, Granny Billy");
    });
  });
});
