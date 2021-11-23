import { waitFor, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import {
  GetPendingOrganizationsDocument,
  SetOrgIdentityVerifiedDocument,
} from "../../../generated/graphql";

import PendingOrganizationsContainer from "./PendingOrganizationsContainer";

const organizationsQuery = {
  request: {
    query: GetPendingOrganizationsDocument,
  },
  result: {
    data: {
      pendingOrganizations: [
        {
          externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
          name: "Space Camp",
          adminEmail: "admin@spacecamp.org",
          adminFirstName: "John",
          adminLastName: "Doe",
          adminPhone: "530-867-5309",
          createdAt: "2020-05-01T00:00:00.000Z",
        },
        {
          externalId: "CA-A-Real-Hospital-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
          name: "A Real Hospital",
          adminEmail: "admin@arealhospital.org",
          adminFirstName: "Jane",
          adminLastName: "Doe",
          adminPhone: "410-867-5309",
          createdAt: "2020-06-01T00:00:00.000Z",
        },
      ],
    },
  },
};
const EmptyOrganizationsQuery = {
  request: {
    query: GetPendingOrganizationsDocument,
  },
  result: {
    data: {
      pendingOrganizations: [],
    },
  },
};
const verificationMutation = {
  request: {
    query: SetOrgIdentityVerifiedDocument,
    variables: {
      externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
      verified: true,
    },
  },
  result: {
    data: {
      setOrganizationIdentityVerified: true,
    },
  },
};

describe("PendingOrganizationsContainer", () => {
  describe("loading organizations", () => {
    beforeEach(() => {
      render(
        <MockedProvider mocks={[]}>
          <PendingOrganizationsContainer />
        </MockedProvider>
      );
    });
    it("tells the user the orgs are loading", () => {
      expect(
        screen.getByText("Loading Organizations...", { exact: false })
      ).toBeInTheDocument();
    });
    it("disables submit", () => {
      expect(screen.getByText("Save Changes", { exact: false })).toBeDisabled();
    });
  });
  describe("organizations loaded", () => {
    beforeEach(async () => {
      render(
        <MockedProvider
          mocks={[
            organizationsQuery,
            verificationMutation,
            EmptyOrganizationsQuery,
          ]}
        >
          <PendingOrganizationsContainer />
        </MockedProvider>
      );
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
    });

    it("displays the organizations name", () => {
      expect(
        screen.getByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
    });

    it("displays the admin info", () => {
      expect(
        screen.getByText("John Doe", { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText("admin@spacecamp.org", { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByText("(530) 867-5309", { exact: false })
      ).toBeInTheDocument();
    });

    it("shows the newest orgs first", () => {
      const rowsCreatedAt = screen.getAllByTestId("org-created-at-table-cell");
      expect(rowsCreatedAt[0].textContent).toBe("6/1/2020, 12:00:00 AM");
      expect(rowsCreatedAt[1].textContent).toBe("5/1/2020, 12:00:00 AM");
    });
    describe("marking an organization as verified", () => {
      beforeEach(async () => {
        await userEvent.click(screen.getAllByText("Identity Verified")[1]);
      });
      it("enables submit", () => {
        expect(
          screen.getByText("Save Changes", { exact: false })
        ).not.toBeDisabled();
      });
      describe("submitting the form", () => {
        beforeEach(async () => {
          await userEvent.click(screen.getByText("Save Changes"));
          expect(
            screen.getByText("Save Changes", { exact: false })
          ).toBeDisabled();
        });
        it("no more results", async () => {
          expect(
            await screen.findByText("No results", { exact: false })
          ).toBeInTheDocument();
        });
      });
      describe("then mark as unverified", () => {
        beforeEach(async () => {
          await userEvent.click(screen.getAllByText("Identity Verified")[1]);
        });
        it("disables submit", () => {
          expect(
            screen.getByText("Save Changes", { exact: false })
          ).toBeDisabled();
        });
      });
    });
    describe("editing an org", () => {
      beforeEach(async () => {
        await screen.findByText("Space Camp", { exact: false });
        await userEvent.click(
          screen.getByTestId(
            "edit-icon-DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
          )
        );
      });
      it("displays the edit form", async () => {
        expect(
          await screen.findByText("Edit organization")
        ).toBeInTheDocument();
      });
      describe("submitting the form", () => {
        it("displays an error when org name is empty", async () => {
          userEvent.clear(
            screen.getByLabelText("Organization name", { exact: false })
          );
          userEvent.click(
            screen.getByLabelText("Administrator email", { exact: false })
          );
          expect(
            await screen.findByText("Organization name is required", {
              exact: false,
            })
          ).toBeInTheDocument();
        });
        it("displays an error when email is invalid", async () => {
          userEvent.clear(
            screen.getByLabelText("Administrator email", { exact: false })
          );
          userEvent.type(
            screen.getByLabelText("Administrator email", { exact: false }),
            "foo"
          );
          userEvent.click(
            screen.getByLabelText("Organization name", { exact: false })
          );
          expect(
            await screen.findByText("A valid email address is required", {
              exact: false,
            })
          ).toBeInTheDocument();
        });
        it("displays an error when phone is invalid", async () => {
          userEvent.clear(
            screen.getByLabelText("Administrator phone", { exact: false })
          );
          userEvent.type(
            screen.getByLabelText("Administrator phone", { exact: false }),
            "foo"
          );
          userEvent.click(
            screen.getByLabelText("Organization name", { exact: false })
          );
          expect(
            await screen.findByText("A valid phone number is required", {
              exact: false,
            })
          ).toBeInTheDocument();
        });
      });
    });
  });
});
