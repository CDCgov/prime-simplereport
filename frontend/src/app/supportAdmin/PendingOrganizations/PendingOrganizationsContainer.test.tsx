import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";

import {
  GetPendingOrganizationsDocument,
  SetOrgIdentityVerifiedDocument,
  EditPendingOrganizationDocument,
  MarkPendingOrganizationAsDeletedDocument,
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

const deletePendingOrgsMutation = {
  request: {
    query: MarkPendingOrganizationAsDeletedDocument,
    variables: {
      orgExternalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
      deleted: true,
    },
  },
  result: {
    data: {
      markPendingOrganizationAsDeleted:
        "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
    },
  },
};

describe("PendingOrganizationsContainer", () => {
  describe("loading organizations", () => {
    beforeEach(() => {
      render(
        <MockedProvider mocks={[EmptyOrganizationsQuery]}>
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
      expect(await screen.findByText("Space Camp")).toBeInTheDocument();
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
      beforeEach(async () => {
        await act(
          async () =>
            await userEvent.click(screen.getAllByText("Edit/Verify")[1])
        );
      });
      it("populates modal", async () => {
        expect(
          screen.getByText("Organization details", { exact: true })
        ).toBeInTheDocument();
        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
        await act(
          async () => await userEvent.click(screen.getByTestId("close-modal"))
        );
        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
      });
      describe("submitting an edit", () => {
        it("displays an error when org name is empty", async () => {
          await act(
            async () =>
              await userEvent.clear(
                screen.getByLabelText("Organization name", { exact: false })
              )
          );
          await act(
            async () =>
              await userEvent.click(
                screen.getByLabelText("Administrator email", { exact: false })
              )
          );
          expect(
            await screen.findByText("Organization name is required", {
              exact: false,
            })
          ).toBeInTheDocument();
        });
        it("displays an error when email is invalid", async () => {
          await act(
            async () =>
              await userEvent.clear(
                screen.getByLabelText("Administrator email", { exact: false })
              )
          );
          await act(
            async () =>
              await userEvent.type(
                screen.getByLabelText("Administrator email", { exact: false }),
                "foo"
              )
          );
          await act(
            async () =>
              await userEvent.click(
                screen.getByLabelText("Organization name", { exact: false })
              )
          );
          expect(
            await screen.findByText("A valid email address is required", {
              exact: false,
            })
          ).toBeInTheDocument();
        });
        it("displays an error when phone is invalid", async () => {
          await act(
            async () =>
              await userEvent.clear(
                screen.getByLabelText(/Administrator phone/i)
              )
          );
          await act(
            async () =>
              await userEvent.type(
                screen.getByLabelText(/Administrator phone/i),
                "foo"
              )
          );
          await act(
            async () =>
              await userEvent.click(screen.getByLabelText(/Organization name/i))
          );
          expect(
            await screen.findByText("A valid phone number is required", {
              exact: false,
            })
          ).toBeInTheDocument();
        });
        it("saves information on change", async () => {
          await act(
            async () =>
              await userEvent.clear(screen.getByLabelText(/Organization name/i))
          );
          await act(
            async () =>
              await userEvent.type(
                screen.getByLabelText(/Organization name/i),
                "DC Space Camp"
              )
          );
          expect(screen.getByLabelText(/Organization name/i)).toHaveValue(
            "DC Space Camp"
          );
          await act(
            async () => await userEvent.click(screen.getByText(/Edit only/i))
          );
          await waitFor(() =>
            expect(screen.getByLabelText(/Organization name/i)).toHaveValue(
              "DC Space Camp"
            )
          );
          await waitForElementToBeRemoved(
            screen.queryByText(/Organization details/i)
          );

          expect(await screen.findByText("DC Space Camp")).toBeInTheDocument();
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
        expect(await screen.findByText("Space Camp")).toBeInTheDocument();
        await act(
          async () =>
            await userEvent.click(
              Array.from(await screen.findAllByText("Edit/Verify"))[1]
            )
        );

        await act(
          async () => await userEvent.click(screen.getByText("Verify"))
        );

        expect(
          await screen.findByLabelText(/verify organization/i)
        ).toBeInTheDocument();

        await act(
          async () => await userEvent.click(screen.getByText("Yes, I'm sure"))
        );

        await waitFor(() =>
          expect(
            screen.queryByLabelText(/verify organization/i)
          ).not.toBeInTheDocument()
        );

        expect(await screen.findByText("A Real Hospital")).toBeInTheDocument();
        await waitFor(() =>
          expect(
            screen.queryByText(
              "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
            )
          ).not.toBeInTheDocument()
        );
      });
    });
  });
  describe("submitting the form with edits without saving", () => {
    beforeEach(async () => {
      render(
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
      );
    });
    it("Space Camp submitted with new title", async () => {
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
      await act(
        async () =>
          await userEvent.click(
            Array.from(await screen.findAllByText("Edit/Verify"))[1]
          )
      );
      await act(
        async () =>
          await userEvent.clear(
            screen.getByLabelText("Organization name", {
              exact: false,
            })
          )
      );
      await act(
        async () =>
          await userEvent.type(
            screen.getByLabelText("Organization name", {
              exact: false,
            }),
            "DC Space Camp"
          )
      );
      expect(
        screen.getByLabelText("Organization name", {
          exact: false,
        })
      ).toHaveValue("DC Space Camp");
      await act(async () => await userEvent.click(screen.getByText("Verify")));
      await act(
        async () => await userEvent.click(screen.getByText("Yes, I'm sure"))
      );

      await waitForElementToBeRemoved(
        screen.queryByText("Verify organization")
      );
    });
  });
  describe("deleting organizations", () => {
    beforeEach(async () => {
      render(
        <MockedProvider
          mocks={[
            organizationsQuery(
              "Space Camp",
              "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
            ),
            deletePendingOrgsMutation,
            submittedOrganizationQuery,
          ]}
        >
          <PendingOrganizationsContainer />
        </MockedProvider>
      );
    });

    it("Facility deletion button populates modal", async () => {
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
      await act(
        async () =>
          await userEvent.click(
            Array.from(await screen.findAllByTestId("delete-org-button"))[1]
          )
      );
      expect(
        await screen.findByText("Delete this organization?", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(await screen.findByText("No, go back")).toBeInTheDocument();
      expect(await screen.findByText("Delete")).toBeEnabled();
    });
    it("Facility deletion works", async () => {
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
      await act(
        async () =>
          await userEvent.click(
            Array.from(await screen.findAllByTestId("delete-org-button"))[1]
          )
      );
      expect(
        await screen.findByText("Delete this organization?", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(await screen.findByText("Delete", { exact: true })).toBeEnabled();
      fireEvent.click(await screen.findByText("Delete", { exact: true }));

      await waitForElementToBeRemoved(() =>
        screen.queryByText("DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0")
      );

      await waitFor(() =>
        expect(
          screen.queryByText(
            "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0"
          )
        ).not.toBeInTheDocument()
      );
    });
  });
});
