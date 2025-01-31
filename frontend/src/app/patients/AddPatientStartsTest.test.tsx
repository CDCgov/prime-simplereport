import { screen, waitFor, within } from "@testing-library/react";
import * as router from "react-router";

import * as smartyStreets from "../utils/smartyStreets";

import {
  fillOutForm,
  mockFacilityID,
  renderWithUserWithFacility,
} from "./AddPatientTestUtils";

describe("Add Patient: saving changes and starting a test", () => {
  const mockNavigate = jest.fn();
  beforeEach(async () => {
    jest.spyOn(smartyStreets, "getBestSuggestion").mockImplementation();
    jest.spyOn(smartyStreets, "suggestionIsCloseEnough").mockReturnValue(false);
    jest.spyOn(smartyStreets, "getZipCodeData").mockResolvedValue(undefined);

    jest.spyOn(router, "useNavigate").mockImplementation(() => mockNavigate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("redirects to the queue after address validation", async () => {
    jest.spyOn(smartyStreets, "suggestionIsCloseEnough").mockReturnValue(true);
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
        notes: "Green tent",
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
        Sex: {
          label: "Female",
          value: "female",
          exact: true,
        },
      }
    );

    await user.click(
      screen.queryAllByText("Save and start test", {
        exact: false,
      })[0]
    );

    expect(
      screen.queryByText("Address validation", {
        exact: false,
      })
    ).not.toBeInTheDocument();

    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/queue?facility=facility-id-001",
        {
          state: {
            patientId: "153f661f-b6ea-4711-b9ab-487b95198cce",
          },
        }
      )
    );
  });

  it("redirects to the queue with a patient id and selected facility id", async () => {
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
        notes: "Green tent",
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
        Sex: {
          label: "Female",
          value: "female",
          exact: true,
        },
      }
    );
    await user.click(
      screen.queryAllByText("Save and start test", {
        exact: false,
      })[0]
    );
    expect(
      await screen.findByText("Address validation", {
        exact: false,
      })
    ).toBeInTheDocument();

    const modal = screen.getByRole("dialog");

    await user.click(
      within(modal).getByLabelText("Use address as entered", {
        exact: false,
      })
    );
    await user.click(
      within(modal).getByText("Save changes", {
        exact: false,
      })
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith(
        "/queue?facility=facility-id-001",
        {
          state: {
            patientId: "153f661f-b6ea-4711-b9ab-487b95198cce",
          },
        }
      )
    );
  });
});
