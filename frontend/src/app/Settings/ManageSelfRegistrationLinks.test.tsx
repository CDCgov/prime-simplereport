import { MockedProvider } from "@apollo/client/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ManageSelfRegistrationLinksContainer,
  REGISTRATION_LINKS_QUERY,
} from "./ManageSelfRegistrationLinksContainer";

const mocks = [
  {
    request: {
      query: REGISTRATION_LINKS_QUERY,
    },
    result: {
      data: {
        whoami: {
          organization: {
            patientSelfRegistrationLink: "abc22",
            facilities: [
              { name: "Foo Facility", patientSelfRegistrationLink: "foo66" },
              {
                name: "Physics Building",
                patientSelfRegistrationLink: "phys2",
              },
            ],
          },
        },
      },
    },
  },
];

const org = mocks[0].result.data.whoami.organization;
const expectedOrgSlug = org.patientSelfRegistrationLink.toUpperCase();
const expectedFacilitySlug =
  org.facilities[1].patientSelfRegistrationLink.toUpperCase();
const testBaseUrl = "https://example.com";

describe("ManageSelfRegistrationLinks", () => {
  const mockNav = jest.fn();
  const nav = { ...navigator };
  const originalBaseUrl = process.env.REACT_APP_BASE_URL;

  const renderWithUser = () => ({
    user: userEvent.setup(),
    ...render(
      <MockedProvider mocks={mocks}>
        <ManageSelfRegistrationLinksContainer />
      </MockedProvider>
    ),
  });

  beforeEach(() => {
    process.env.REACT_APP_BASE_URL = testBaseUrl;
  });

  afterEach(() => {
    process.env.REACT_APP_BASE_URL = originalBaseUrl;
    Object.defineProperty(global, "navigator", { writable: true, value: nav });
  });

  it("copies the org link", async () => {
    const { user } = renderWithUser();
    await screen.findByText("Patient self-registration");

    Object.defineProperty(global, "navigator", {
      writable: true,
      value: {
        clipboard: {
          writeText: mockNav,
        },
      },
    });
    const orgUrl = `${process.env.REACT_APP_BASE_URL}/register/${expectedOrgSlug}`;
    const [orgBtn] = screen.getAllByRole("button");
    await user.click(orgBtn);
    await waitFor(async () => expect(orgBtn).toBeEnabled());
    expect(mockNav).toBeCalledWith(orgUrl);
  });

  it("copies a facility link", async () => {
    const { user } = renderWithUser();
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: {
        clipboard: {
          writeText: mockNav,
        },
      },
    });
    await screen.findByText("Patient self-registration");
    const facilityUrl = `${process.env.REACT_APP_BASE_URL}/register/${expectedFacilitySlug}`;
    const btns = screen.getByRole("button", {
      name: /copy patient self registration link for physics building/i,
    });
    await user.click(btns);
    await waitFor(async () => expect(btns).toBeEnabled());
    expect(mockNav).toBeCalledWith(facilityUrl);
  });
});
