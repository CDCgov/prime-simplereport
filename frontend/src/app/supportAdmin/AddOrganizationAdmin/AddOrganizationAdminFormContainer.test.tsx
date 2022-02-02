import { render, screen, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter } from "react-router";
import userEvent from "@testing-library/user-event";

import {
  AddUserDocument,
  GetOrganizationsDocument,
  Role,
} from "../../../generated/graphql";

import AddOrganizationAdminFormContainer from "./AddOrganizationAdminFormContainer";

const organizationsQuery = {
  request: {
    query: GetOrganizationsDocument,
    variables: {
      identityVerified: true,
    },
  },
  result: {
    data: {
      organizations: [
        {
          externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
          name: "Space Camp",
        },
      ],
    },
  },
};

const addAdminMutation = {
  request: {
    query: AddUserDocument,
    variables: {
      organizationExternalId:
        "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
      role: Role.Admin,
      firstName: "Flora",
      middleName: "",
      lastName: "Murray",
      suffix: "",
      email: "Flora.Murray@example.com",
    },
  },
  result: {
    data: {
      addUser: {
        id: "c912d4d4-cbe6-4d80-9d24-c14ba1f7f180",
      },
    },
  },
};

jest.mock("react-router-dom", () => ({
  Redirect: () => <p>Redirected</p>,
}));

describe("AddOrganizationAdminFormContainer", () => {
  describe("loading organizations", () => {
    beforeEach(() => {
      render(
        <MemoryRouter>
          {" "}
          <MockedProvider mocks={[organizationsQuery, addAdminMutation]}>
            <AddOrganizationAdminFormContainer />
          </MockedProvider>
        </MemoryRouter>
      );
    });
    it("tells the user the orgs are loading", () => {
      expect(
        screen.getByText("Loading Organizations", { exact: false })
      ).toBeInTheDocument();
    });
    describe("after the orgs load", () => {
      let title: HTMLElement;
      beforeEach(async () => {
        await waitFor(() => {
          title = screen.getByText("Add Organization Admin", { exact: false });
        });
      });
      it("disables the form title", () => {
        expect(title).toBeInTheDocument();
      });
      it("disables the save button", () => {
        expect(
          screen.getByText("Save Changes", { exact: false })
        ).toBeDisabled();
      });
      describe("Blank value for first name", () => {
        beforeEach(() => {
          const firstName = screen.getByLabelText("First name", {
            exact: false,
          });
          userEvent.clear(firstName);
        });
        it("show an error", async () => {
          userEvent.tab();
          expect(
            await screen.findByText("First name is missing", { exact: false })
          ).toBeInTheDocument();
        });
        describe("Form submission", () => {
          beforeEach(() => {
            userEvent.click(screen.getByText("Save Changes"));
          });
          it("shows the form title", () => {
            expect(
              screen.getByText("Add Organization Admin")
            ).toBeInTheDocument();
          });
        });
      });
      describe("All required fields filled", () => {
        beforeEach(() => {
          userEvent.selectOptions(
            screen.getByTestId("organization-dropdown"),
            "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
          );
          userEvent.type(
            screen.getByLabelText("First name", { exact: false }),
            "Flora"
          );
          userEvent.type(
            screen.getByLabelText("Last name", { exact: false }),
            "Murray"
          );
          userEvent.type(
            screen.getByLabelText("Email", { exact: false }),
            "Flora.Murray@example.com"
          );
        });
        it("enables the save button", () => {
          expect(
            screen.getByText("Save Changes", { exact: false })
          ).toBeEnabled();
        });
        describe("Form submission", () => {
          it("User is redirected away from the form", async () => {
            userEvent.click(screen.getByText("Save Changes"));
            expect(await screen.findByText("Redirected")).toBeInTheDocument();
          });
        });
      });
    });
  });
});
