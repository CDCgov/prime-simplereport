import { fireEvent, render, screen } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router-dom";

import { FindUserByEmailDocument } from "../../../generated/graphql";

import { AdminManageUser } from "./AdminManageUser";

describe("Admin manage user", () => {
  const renderComponent = (mocks?: any[]) =>
    render(
      <MemoryRouter>
        <MockedProvider mocks={mocks}>
          <AdminManageUser />
        </MockedProvider>
      </MemoryRouter>
    );
  it("displays accurately", () => {
    const { container } = renderComponent();
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
      await screen.findByText("User not found");
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
      await screen.findByText("Can't determine user identity");
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
      await screen.findByText("Something went wrong");
    });
  });
});
