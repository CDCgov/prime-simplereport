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
  const nav = { ...navigator };
  const originalBaseUrl = process.env.REACT_APP_BASE_URL;

  beforeEach(async () => {
    process.env.REACT_APP_BASE_URL = testBaseUrl;
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });
    render(
      <MockedProvider mocks={mocks}>
        <ManageSelfRegistrationLinksContainer />
      </MockedProvider>
    );
    await screen.findByText("Patient self-registration");
  });

  afterEach(() => {
    process.env.REACT_APP_BASE_URL = originalBaseUrl;
    Object.assign(navigator, nav);
  });

  it("copies the org link", async () => {
    const orgUrl = `${process.env.REACT_APP_BASE_URL}/register/${expectedOrgSlug}`;
    const [orgBtn] = screen.getAllByRole("button");
    userEvent.click(orgBtn);
    await waitFor(async () => expect(orgBtn).toBeEnabled());
    expect(navigator.clipboard.writeText).toBeCalledWith(orgUrl);
  });

  it("copies a facility link", async () => {
    const facilityUrl = `${process.env.REACT_APP_BASE_URL}/register/${expectedFacilitySlug}`;
    const btns = screen.getAllByRole("button");
    userEvent.click(btns[2]);
    await waitFor(async () => expect(btns[2]).toBeEnabled());
    expect(navigator.clipboard.writeText).toBeCalledWith(facilityUrl);
  });
});
