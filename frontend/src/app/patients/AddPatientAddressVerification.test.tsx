import * as router from "react-router";
import { screen, waitFor, within } from "@testing-library/react";

import * as smartyStreets from "../utils/smartyStreets";

import {
  fillOutForm,
  mockFacilityID,
  renderWithUserWithFacility,
} from "./AddPatientTestUtils";

// These tests have been broken down into multiple files so they can execute in parallel
describe("Add Patient: All required fields entered and submitting address verification", () => {
  beforeEach(async () => {
    jest.spyOn(smartyStreets, "getBestSuggestion").mockImplementation();
    jest.spyOn(smartyStreets, "suggestionIsCloseEnough").mockReturnValue(false);
    jest.spyOn(smartyStreets, "getZipCodeData").mockResolvedValue(undefined);
  });

  it("redirects to the person tab", async () => {
    const mockNavigate = jest.fn();
    jest.spyOn(router, "useNavigate").mockImplementation(() => mockNavigate);
    const { user } = renderWithUserWithFacility();

    await fillOutForm(
      {
        "First Name": "Alice",
        "Last Name": "Hamilton",
        "Date of birth": "1970-09-22",
        "Primary phone number": "617-432-1000",
        "Email address": "foo@bar.org",
        "Street address 1": "25 Shattuck St",
        City: "Boston",
        "ZIP code": "02115",
        Notes: "Green tent",
      },
      { Facility: mockFacilityID, State: "MA", Country: "USA" },
      {
        "Phone type": {
          label: "Mobile",
          value: "MOBILE",
          exact: true,
        },
        "Would you like to receive your results via text message?": {
          label: "Yes",
          value: "SMS",
          exact: false,
        },
        Race: {
          label: "Other",
          value: "other",
          exact: true,
        },
        "Are you Hispanic or Latino?": {
          label: "Prefer not to answer",
          value: "refused",
          exact: true,
        },
        "Sex assigned at birth": {
          label: "Female",
          value: "female",
          exact: true,
        },
        // "What's your gender identity?": {
        //   label: "Female",
        //   value: "female",
        //   exact: true,
        // },
      }
    );

    await user.click(screen.queryAllByText(/Save Changes/i)[0]);
    await screen.findByRole("heading", { name: "Address validation" });
    const modal = screen.getByRole("dialog");

    await user.click(
      within(modal).getByLabelText("Use address as entered", {
        exact: false,
      })
    );
    await user.click(
      within(modal).getByRole("button", { name: "Save changes" })
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/patients/?facility=b0d2041f-93c9-4192-b19a-dd99c0044a7e",
        {}
      )
    );
    jest.restoreAllMocks();
  });

  it("surfaces an error if invalid zip code for state", async () => {
    const { user } = renderWithUserWithFacility();
    let zipCodeSpy: jest.SpyInstance;
    zipCodeSpy = jest.spyOn(smartyStreets, "isValidZipCodeForState");
    zipCodeSpy.mockReturnValue(false);
    await fillOutForm(
      {
        "First Name": "Alice",
        "Last Name": "Hamilton",
        "Date of birth": "1970-09-22",
        "Primary phone number": "617-432-1000",
        "Email address": "foo@bar.org",
        "Street address 1": "25 Shattuck St",
        City: "Boston",
        "ZIP code": "02115",
      },
      { Facility: mockFacilityID, State: "MA", Country: "USA" },
      {
        "Phone type": {
          label: "Mobile",
          value: "MOBILE",
          exact: true,
        },
        "Would you like to receive your results via text message?": {
          label: "Yes",
          value: "SMS",
          exact: false,
        },
        Race: {
          label: "Other",
          value: "other",
          exact: true,
        },
        "Are you Hispanic or Latino?": {
          label: "Prefer not to answer",
          value: "refused",
          exact: true,
        },
        "Sex assigned at birth": {
          label: "Female",
          value: "female",
          exact: true,
        },
      }
    );

    await user.click(
      screen.queryAllByText("Save Changes", {
        exact: false,
      })[0]
    );
    await screen.findByText(/Invalid ZIP code for this state/i);
  });

  it("requires race field to be populated", async () => {
    const { user } = renderWithUserWithFacility();
    await fillOutForm(
      {
        "First Name": "Alice",
        "Last Name": "Hamilton",
        "Date of birth": "1970-09-22",
        "Primary phone number": "617-432-1000",
        "Email address": "foo@bar.org",
        "Street address 1": "25 Shattuck St",
        City: "Boston",
        "ZIP code": "02115",
      },
      { Facility: mockFacilityID, State: "MA", Country: "USA" },
      {
        "Phone type": {
          label: "Mobile",
          value: "MOBILE",
          exact: true,
        },
        "Would you like to receive your results via text message?": {
          label: "Yes",
          value: "SMS",
          exact: false,
        },
        "Sex assigned at birth": {
          label: "Female",
          value: "female",
          exact: true,
        },
      }
    );

    await user.click(
      screen.queryAllByText("Save Changes", {
        exact: false,
      })[0]
    );

    await waitFor(() => expect(screen.queryByText("Error: Race is missing")));
  });
});
