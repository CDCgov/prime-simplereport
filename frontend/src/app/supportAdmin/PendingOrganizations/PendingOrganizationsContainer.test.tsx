import {
  render,
  screen,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import {
  GetPendingOrganizationsDocument,
  SetOrgIdentityVerifiedDocument,
  EditPendingOrganizationDocument,
} from "../../../generated/graphql";
import Page from "../../commonComponents/Page/Page";

import PendingOrganizationsContainer from "./PendingOrganizationsContainer";

const organizationsQuery = (name: string, id: string) => {
  return {
    request: {
      query: GetPendingOrganizationsDocument,
    },
    result: {
      data: {
        pendingOrganizations: [
          {
            externalId: id,
            name: name,
            adminEmail: "admin@spacecamp.org",
            adminFirstName: "John",
            adminLastName: "Doe",
            adminPhone: "530-867-5309",
            createdAt: "2021-12-01T00:00:00.000Z",
          },
          {
            externalId:
              "CA-A-Real-Hospital-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
            name: "A Real Hospital",
            adminEmail: "admin@arealhospital.org",
            adminFirstName: "Jane",
            adminLastName: "Doe",
            adminPhone: "410-867-5309",
            createdAt: "2021-12-26T00:00:00.000Z",
          },
        ],
      },
    },
  };
};

const oldOrganizationsQuery = {
  request: {
    query: GetPendingOrganizationsDocument,
  },
  result: {
    data: {
      pendingOrganizations: [
        {
          externalId:
            "CA-An-Old-Schema-Org-with-Nulls-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
          name: "An Old Schema Org with Nulls",
          adminEmail: null,
          adminFirstName: null,
          adminLastName: null,
          adminPhone: "410-867-5309",
          createdAt: "2021-12-01T00:00:00.000Z",
        },
        {
          externalId:
            "CA-An-Old-Schema-Org-with-Date-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
          name: "An Old Schema Org with Date",
          adminEmail: "admin@oldschema.org",
          adminFirstName: "James",
          adminLastName: "Doe",
          adminPhone: "410-867-5309",
          createdAt: "2020-12-26T00:00:00.000Z",
        },
      ],
    },
  },
};

const submittedOrganizationsQueryOldOrgs = {
  request: {
    query: GetPendingOrganizationsDocument,
  },
  result: {
    data: {
      pendingOrganizations: [
        {
          externalId:
            "CA-An-Old-Schema-Org-with-Date-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
          name: "An Old Schema Org with Date",
          adminEmail: "admin@oldschema.org",
          adminFirstName: "James",
          adminLastName: "Doe",
          adminPhone: "410-867-5309",
          createdAt: "2020-12-26T00:00:00.000Z",
        },
      ],
    },
  },
};
const oldOrganizationsVerificationMutation = {
  request: {
    query: SetOrgIdentityVerifiedDocument,
    variables: {
      externalId:
        "CA-An-Old-Schema-Org-with-Date-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
      verified: true,
    },
  },
  result: {
    data: {
      setOrganizationIdentityVerified: true,
    },
  },
};

const submittedOrganizationQuery = {
  request: {
    query: GetPendingOrganizationsDocument,
  },
  result: {
    data: {
      pendingOrganizations: [
        {
          externalId: "CA-A-Real-Hospital-f34183c4-b4c5-449f-97b4-2e02abb7aae0",
          name: "A Real Hospital",
          adminEmail: "admin@arealhospital.org",
          adminFirstName: "Jane",
          adminLastName: "Doe",
          adminPhone: "410-867-5309",
          createdAt: "2021-12-26T00:00:00.000Z",
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

const inEditVerificationMutation = {
  request: {
    query: SetOrgIdentityVerifiedDocument,
    variables: {
      externalId: "DC-Space-Camp-fg413d4-btc5-449f-98b0-2e02abb7aae0",
      verified: true,
    },
  },
  result: {
    data: {
      setOrganizationIdentityVerified: true,
    },
  },
};

const editOrganizationsInVerifyMutation = {
  request: {
    query: EditPendingOrganizationDocument,
    variables: {
      externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
      name: "DC Space Camp",
      adminFirstName: "John",
      adminLastName: "Doe",
      adminEmail: "admin@spacecamp.org",
      adminPhone: "530-867-5309",
    },
  },
  result: {
    data: {
      editPendingOrganization:
        "DC-Space-Camp-fg413d4-btc5-449f-98b0-2e02abb7aae0",
    },
  },
};

const editOrganizationsMutation = {
  request: {
    query: EditPendingOrganizationDocument,
    variables: {
      externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
      name: "DC Space Camp",
      adminFirstName: "John",
      adminLastName: "Doe",
      adminEmail: "admin@spacecamp.org",
      adminPhone: "530-867-5309",
    },
  },
  result: {
    data: {
      editPendingOrganization:
        "DC-Space-Camp-fg413d4-btc5-449f-98b0-2e02abb7aae0",
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
  });
  describe("empty organizations", () => {
    beforeEach(() => {
      render(
        <MockedProvider mocks={[EmptyOrganizationsQuery]}>
          <PendingOrganizationsContainer />
        </MockedProvider>
      );
    });
    it("shows no results", async () => {
      expect(
        await screen.findByText("No results", { exact: false })
      ).toBeInTheDocument();
    });
  });
  describe("bad schema organizations", () => {
    beforeEach(async () => {
      render(
        <MockedProvider
          mocks={[
            oldOrganizationsQuery,
            oldOrganizationsVerificationMutation,
            submittedOrganizationsQueryOldOrgs,
          ]}
        >
          <PendingOrganizationsContainer />
        </MockedProvider>
      );
      expect(
        await screen.findByText("An Old Schema Org with Nulls", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        await screen.findByText("An Old Schema Org with Date", { exact: false })
      ).toBeInTheDocument();
    });

    it("shows disabled modal with copy text for nulled fields", () => {
      userEvent.click(screen.getAllByText("Edit/Verify")[1]);
      expect(
        screen.getByText("Organization details", { exact: true })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Organization name", { exact: false })
      ).toBeDisabled();
      expect(screen.getByText("Update only", { exact: false })).toBeDisabled();
      expect(screen.getByText("Verify", { exact: true })).toBeInTheDocument();
      expect(screen.getByText("Verify", { exact: true })).toBeEnabled();
      expect(
        screen.getByTestId("old-schema-explanation", { exact: false })
      ).toBeInTheDocument();
    });
    it("shows disabled modal with copy text for old date org", () => {
      userEvent.click(screen.getAllByText("Edit/Verify")[0]);
      expect(
        screen.getByText("Organization details", { exact: true })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Organization name", { exact: false })
      ).toBeDisabled();
      expect(screen.getByText("Update only", { exact: false })).toBeDisabled();
      expect(screen.getByText("Verify", { exact: true })).toBeInTheDocument();
      expect(screen.getByText("Verify", { exact: true })).toBeEnabled();
      expect(
        screen.getByTestId("old-schema-explanation", { exact: false })
      ).toBeInTheDocument();
      userEvent.click(screen.getByTestId("close-modal"));
      expect(
        screen.queryByText("Organization details", { exact: false })
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("An Old Schema Org with Date", { exact: false })
      ).toBeInTheDocument();
    });
    it("With nulls submitted", async () => {
      expect(
        await screen.findByText("An Old Schema Org with Nulls", {
          exact: false,
        })
      ).toBeInTheDocument();
      userEvent.click(Array.from(await screen.findAllByText("Edit/Verify"))[1]);
      expect(
        screen.getByLabelText("Organization name", { exact: false })
      ).toBeDisabled();
      expect(screen.getByText("Update only", { exact: false })).toBeDisabled();
      userEvent.click(screen.getByText("Verify", { exact: true }));
      await waitForElementToBeRemoved(
        screen.queryByText("Organization details")
      );
      expect(
        await screen.findByText("An Old Schema Org with Date", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(
        screen.queryByText("An Old Schema Org with Nulls", {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
  });
  describe("organizations loaded", () => {
    beforeEach(async () => {
      render(
        <Page>
          <MockedProvider
            mocks={[
              organizationsQuery(
                "Space Camp",
                "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
              ),
              verificationMutation,
              editOrganizationsMutation,
              organizationsQuery(
                "DC Space Camp",
                "DC-Space-Camp-fg413d4-btc5-449f-98b0-2e02abb7aae0"
              ),
            ]}
          >
            <PendingOrganizationsContainer />
          </MockedProvider>
        </Page>
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
      expect(rowsCreatedAt[0]).toHaveTextContent("12/26/2021, 12:00:00 AM");
      expect(rowsCreatedAt[1]).toHaveTextContent("12/1/2021, 12:00:00 AM");
    });

    describe("confirm/edit modal acts correctly", () => {
      beforeEach(() => {
        userEvent.click(screen.getAllByText("Edit/Verify")[1]);
      });
      it("populates modal", () => {
        expect(
          screen.getByText("Organization details", { exact: true })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
        userEvent.click(screen.getByTestId("close-modal"));
        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
      });
      describe("submitting an edit", () => {
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
        it("saves information on change", async () => {
          userEvent.clear(
            screen.getByLabelText("Organization name", { exact: false })
          );
          userEvent.type(
            screen.getByLabelText("Organization name", { exact: false }),
            "DC Space Camp"
          );
          expect(
            screen.getByLabelText("Organization name", { exact: false })
          ).toHaveValue("DC Space Camp");
          userEvent.click(screen.getByText("Update only", { exact: false }));
          expect(
            screen.getByLabelText("Organization name", { exact: false })
          ).toHaveValue("DC Space Camp");
          await waitForElementToBeRemoved(
            screen.queryByText("Organization details")
          );
          expect(
            screen.getByText("DC Space Camp details updated")
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("marking an organization as verified", () => {
    describe("submitting the form", () => {
      beforeEach(async () => {
        render(
          <Page>
            <MockedProvider
              mocks={[
                organizationsQuery(
                  "Space Camp",
                  "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
                ),
                verificationMutation,
                submittedOrganizationQuery,
              ]}
            >
              <PendingOrganizationsContainer />
            </MockedProvider>
          </Page>
        );
      });
      it("Space Camp submitted", async () => {
        expect(
          await screen.findByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
        userEvent.click(
          Array.from(await screen.findAllByText("Edit/Verify"))[1]
        );
        userEvent.click(screen.getByText("Verify"));
        expect(
          await screen.findByText("Identity verified for Space Camp")
        ).toBeInTheDocument();
        expect(
          await screen.findByText("A Real Hospital", { exact: false })
        ).toBeInTheDocument();
      });
    });
  });
  describe("submitting the form with edits without saving", () => {
    beforeEach(async () => {
      render(
        <Page>
          <MockedProvider
            mocks={[
              organizationsQuery(
                "Space Camp",
                "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
              ),
              editOrganizationsInVerifyMutation,
              organizationsQuery(
                "DC Space Camp",
                "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
              ),
              inEditVerificationMutation,
              submittedOrganizationQuery,
            ]}
          >
            <PendingOrganizationsContainer />
          </MockedProvider>
        </Page>
      );
    });
    it("Space Camp submitted with new title", async () => {
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
      userEvent.click(Array.from(await screen.findAllByText("Edit/Verify"))[1]);
      userEvent.clear(
        screen.getByLabelText("Organization name", {
          exact: false,
        })
      );
      userEvent.type(
        screen.getByLabelText("Organization name", {
          exact: false,
        }),
        "DC Space Camp"
      );
      expect(
        screen.getByLabelText("Organization name", {
          exact: false,
        })
      ).toHaveValue("DC Space Camp");
      userEvent.click(screen.getByText("Verify"));
      expect(
        await screen.findByText("Identity verified for DC Space Camp")
      ).toBeInTheDocument();
    });
  });
});
