import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";
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
  describe("empty organizations", () => {
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
        <MockedProvider mocks={[EmptyOrganizationsQuery]}>
          <PendingOrganizationsContainer />
        </MockedProvider>
      ),
    });

    it("tells the user the orgs are loading", () => {
      renderWithUser();
      expect(
        screen.getByText("Loading Organizations...", { exact: false })
      ).toBeInTheDocument();
    });

    it("shows no results", async () => {
      renderWithUser();
      expect(
        await screen.findByText("No results", { exact: false })
      ).toBeInTheDocument();
    });
  });

  describe("organizations loaded", () => {
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
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
      ),
    });

    const renderAndWaitForLoading = async () => {
      const { user, ...renderControls } = renderWithUser();
      await screen.findByText("Space Camp");
      return { user, ...renderControls };
    };

    it("displays the organizations name", async () => {
      await renderAndWaitForLoading();
      expect(
        screen.getByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
    });

    it("displays the admin info", async () => {
      await renderAndWaitForLoading();
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

    it("shows the newest orgs first", async () => {
      await renderAndWaitForLoading();
      const rowsCreatedAt = screen.getAllByTestId("org-created-at-table-cell");
      expect(rowsCreatedAt[0]).toHaveTextContent("12/26/2021, 12:00:00 AM");
      expect(rowsCreatedAt[1]).toHaveTextContent("12/1/2021, 12:00:00 AM");
    });

    describe("confirm/edit modal acts correctly", () => {
      const openEditModal = async (user: UserEvent) => {
        await user.click(screen.getAllByText("Edit/Verify")[1]);
        expect(
          screen.getByText("Organization details", { exact: true })
        ).toBeInTheDocument();
      };

      it("populates modal", async () => {
        const { user } = await renderAndWaitForLoading();
        await openEditModal(user);
        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument();

        await user.click(screen.getByAltText("Close"));

        expect(
          screen.getByText("Space Camp", { exact: false })
        ).toBeInTheDocument();
      });

      it("displays an error when email is invalid", async () => {
        const { user } = await renderAndWaitForLoading();
        await openEditModal(user);
        await user.clear(
          screen.getByLabelText("Administrator email", { exact: false })
        );
        await user.type(
          screen.getByLabelText("Administrator email", { exact: false }),
          "foo"
        );
        await clickEditOnlyBtn(user);
        expect(
          await screen.findByText(
            "Administrator email is incorrectly formatted",
            {
              exact: false,
            }
          )
        ).toBeInTheDocument();
      });

      it("displays an error when phone is invalid", async () => {
        const { user } = await renderAndWaitForLoading();
        await openEditModal(user);
        await user.clear(screen.getByLabelText(/Administrator phone/i));
        await user.type(screen.getByLabelText(/Administrator phone/i), "foo");
        await clickEditOnlyBtn(user);
        expect(
          await screen.findByText("Administrator phone number is invalid", {
            exact: false,
          })
        ).toBeInTheDocument();
      });
      it("displays an error when required values are empty", async () => {
        const { user } = await renderAndWaitForLoading();
        await openEditModal(user);
        const inputLabels = [
          "Organization name",
          "Administrator first name",
          "Administrator last name",
          "Administrator email",
          "Administrator phone",
        ];
        inputLabels.map(async (label) => {
          await user.clear(screen.getByLabelText(label, { exact: false }));
        });

        await clickEditOnlyBtn(user);
        expect(screen.getAllByRole("alert")?.length).toEqual(5);

        inputLabels.map((label) =>
          expect(
            screen.getByText(`${label} is required`, { exact: false })
          ).toBeInTheDocument()
        );
      });
      it("saves information on change", async () => {
        const { user } = await renderAndWaitForLoading();
        await openEditModal(user);
        await user.clear(screen.getByLabelText(/Organization name/i));
        await user.type(
          screen.getByLabelText(/Organization name/i),
          "DC Space Camp"
        );
        expect(screen.getByLabelText(/Organization name/i)).toHaveValue(
          "DC Space Camp"
        );
        await clickEditOnlyBtn(user);

        expect(await screen.findByText("DC Space Camp")).toBeInTheDocument();
      });
    });
  });

  describe("marking an organization as verified", () => {
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
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
      ),
    });

    it("returns to org details when verification canceled", async () => {
      const { user } = renderWithUser();
      await navigateToVerificationModal(user);
      await user.click(screen.getByText("No, go back"));

      await waitFor(() =>
        expect(
          screen.queryByLabelText(/verify organization/i)
        ).not.toBeInTheDocument()
      );

      expect(
        await screen.findByText("Organization details")
      ).toBeInTheDocument();
    });

    it("verifies Space Camp org when verification confirmed", async () => {
      const { user } = renderWithUser();
      await navigateToVerificationModal(user);
      await user.click(screen.getByText("Yes, I'm sure"));

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
  describe("submitting the form with edits without saving", () => {
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
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
      ),
    });

    it("Space Camp submitted with new title", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();

      await user.click(
        Array.from(await screen.findAllByText("Edit/Verify"))[1]
      );

      await user.clear(
        screen.getByLabelText("Organization name", {
          exact: false,
        })
      );

      await user.type(
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
      await user.click(screen.getByText("Verify"));
      await user.click(screen.getByText("Yes, I'm sure"));

      await waitFor(() =>
        expect(
          screen.queryByText("Verify organization")
        ).not.toBeInTheDocument()
      );
    });
  });
  describe("deleting organizations", () => {
    const renderWithUser = () => ({
      user: userEvent.setup(),
      ...render(
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
      ),
    });

    it("Facility deletion button populates modal", async () => {
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();
      await user.click(
        Array.from(await screen.findAllByTestId("delete-org-button"))[1]
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
      const { user } = renderWithUser();
      expect(
        await screen.findByText("Space Camp", { exact: false })
      ).toBeInTheDocument();

      await user.click(
        Array.from(await screen.findAllByTestId("delete-org-button"))[1]
      );
      expect(
        await screen.findByText("Delete this organization?", {
          exact: false,
        })
      ).toBeInTheDocument();
      expect(await screen.findByText("Delete", { exact: true })).toBeEnabled();
      await user.click(await screen.findByText("Delete", { exact: true }));

      await waitFor(() =>
        expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument()
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

const navigateToVerificationModal = async (user: UserEvent) => {
  expect(await screen.findByText("Space Camp")).toBeInTheDocument();
  await user.click(Array.from(await screen.findAllByText("Edit/Verify"))[1]);

  await user.click(screen.getByText("Verify"));

  expect(
    await screen.findByLabelText(/verify organization/i)
  ).toBeInTheDocument();
};

const clickEditOnlyBtn = async (user: UserEvent) => {
  await user.click(screen.getByText(/Edit only/i));
};
