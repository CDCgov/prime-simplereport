import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import {
  GetPendingOrganizationsDocument,
  SetOrgIdentityVerifiedDocument,
  EditPendingOrganizationDocument,
} from "../../../generated/graphql";

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
      userEvent.click(screen.getAllByText("View details")[1]);
      expect(
        screen.getByText("Organization details", { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Organization name", { exact: false })
      ).toBeDisabled();
      expect(screen.getByText("Save details", { exact: false })).toBeDisabled();
      expect(screen.getByText("Submit", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Submit", { exact: false })).toBeEnabled();
      expect(
        screen.getByTestId("old-schema-explanation", { exact: false })
      ).toBeInTheDocument();
    });
    it("shows disabled modal with copy text for old date org", () => {
      userEvent.click(screen.getAllByText("View details")[0]);
      expect(
        screen.getByText("Organization details", { exact: false })
      ).toBeInTheDocument();
      expect(
        screen.getByLabelText("Organization name", { exact: false })
      ).toBeDisabled();
      expect(screen.getByText("Save details", { exact: false })).toBeDisabled();
      expect(screen.getByText("Submit", { exact: false })).toBeInTheDocument();
      expect(screen.getByText("Submit", { exact: false })).toBeEnabled();
      expect(
        screen.getByTestId("old-schema-explanation", { exact: false })
      ).toBeInTheDocument();
    });
    it("With nulls submitted", async () => {
      expect(
        await screen.findByText("An Old Schema Org with Nulls", {
          exact: false,
        })
      ).toBeInTheDocument();
      userEvent.click(
        Array.from(await screen.findAllByText("View details"))[1]
      );
      userEvent.click(screen.getByText("Submit"));
      expect(
        await screen.findByText("An Old Schema Org with Nulls", {
          exact: false,
        })
      ).not.toBeInTheDocument();
      expect(
        await screen.findByText("An Old Schema Org with Date", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });

  describe("organizations loaded", () => {
    beforeEach(async () => {
      render(
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
        userEvent.click(screen.getAllByText("View details")[1]);
      });
      it("populates modal", () => {
        expect(
          screen.getByText("Organization details", { exact: false })
        ).toBeInTheDocument();
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

          userEvent.click(screen.getByText("Save details", { exact: false }));
          expect(
            screen.getByLabelText("Organization name", { exact: false })
          ).toHaveValue("DC Space Camp");
          expect(
            await screen.findByText(
              "DC-Space-Camp-fg413d4-btc5-449f-98b0-2e02abb7aae0",
              {
                exact: false,
              }
            )
          ).toBeInTheDocument();
        });
      });
    });
  });
  describe("marking an organization as verified", () => {
    describe("submitting the form", () => {
      beforeEach(async () => {
        render(
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
        );
      });
      it("Space Camp submitted", async () => {
        expect(
          await screen.findByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
        userEvent.click(
          Array.from(await screen.findAllByText("View details"))[1]
        );
        userEvent.click(screen.getByText("Submit"));
        expect(
          await screen.findByText("Space Camp", { exact: false })
        ).not.toBeInTheDocument();
        expect(
          await screen.findByText("A Real Hospital", { exact: false })
        ).toBeInTheDocument();
      });
    });
  });
});
