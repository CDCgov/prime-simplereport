import {
  waitFor,
  render,
  screen,
  fireEvent,
  act,
} from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";

import {
  GetOrganizationsDocument,
  SetOrgIdentityVerifiedDocument,
} from "../../../generated/graphql";

import PendingOrganizationsContainer from "./PendingOrganizationsContainer";

const organizationsQuery = {
  request: {
    query: GetOrganizationsDocument,
    variables: {
      identityVerified: false,
    },
  },
  result: {
    data: {
      organizations: [
        {
          externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
          name: "Space Camp",
          identityVerified: true,
        },
      ],
    },
  },
};
const EmptyOrganizationsQuery = {
  request: {
    query: GetOrganizationsDocument,
    variables: {
      identityVerified: false,
    },
  },
  result: {
    data: {
      organizations: [],
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
      await waitFor(() =>
        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument()
      );
    });

    it("displays the organizations name", () => {
      expect(
        screen.getByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
    });
    describe("marking an organization as verified", () => {
      beforeEach(async () => {
        await act(async () => {
          await fireEvent.click(screen.getByText("Identity Verified"));
        });
      });
      it("enables submit", () => {
        expect(
          screen.getByText("Save Changes", { exact: false })
        ).not.toBeDisabled();
      });
      describe("submitting the form", () => {
        beforeEach(async () => {
          await act(async () => {
            await fireEvent.click(screen.getByText("Save Changes"));
          });
          await waitFor(() =>
            expect(
              screen.getByText("No results", { exact: false })
            ).toBeInTheDocument()
          );
        });
        it("no more results", async () => {
          await expect(
            screen.getByText("No results", { exact: false })
          ).toBeInTheDocument();
        });
      });
      describe("then mark as unverified", () => {
        beforeEach(async () => {
          await act(async () => {
            await fireEvent.click(screen.getByText("Identity Verified"));
          });
        });
        it("disables submit", () => {
          expect(
            screen.getByText("Save Changes", { exact: false })
          ).toBeDisabled();
        });
      });
    });
  });
});
