import { screen } from "@testing-library/react";

import * as smartyStreets from "../utils/smartyStreets";
import { PATIENT_TERM } from "../../config/constants";

import {
  mockFacilityID,
  renderWithUserNoFacility,
  renderWithUserWithFacility,
} from "./AddPatientTestUtils";

describe("AddPatient", () => {
  describe("No facility selected", () => {
    it("does not show the form title", () => {
      renderWithUserNoFacility();
      expect(
        screen.queryByText(`Add new ${PATIENT_TERM}`, {
          exact: false,
        })
      ).not.toBeInTheDocument();
    });
    it("shows a 'No facility selected' message", async () => {
      renderWithUserNoFacility();
      expect(
        screen.getByText("No facility selected", {
          exact: false,
        })
      ).toBeInTheDocument();
    });
  });

  describe("happy path", () => {
    beforeEach(async () => {
      jest.spyOn(smartyStreets, "getBestSuggestion").mockImplementation();
      jest
        .spyOn(smartyStreets, "suggestionIsCloseEnough")
        .mockReturnValue(false);
      jest.spyOn(smartyStreets, "getZipCodeData").mockResolvedValue(undefined);
    });

    it("shows the form title", async () => {
      renderWithUserWithFacility();
      expect(
        (
          await screen.findAllByText(`Add new ${PATIENT_TERM}`, {
            exact: false,
          })
        )[0]
      ).toBeInTheDocument();
    });

    describe("Choosing a country", () => {
      it("should show the state and zip code inputs for USA", async () => {
        const { user } = renderWithUserWithFacility();

        await user.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "USA"
        );
        expect(await screen.findByText("State")).toBeInTheDocument();
        expect(await screen.findByText("ZIP code")).toBeInTheDocument();
      });
      it("should show the state and zip code inputs for Canada", async () => {
        const { user } = renderWithUserWithFacility();
        await user.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "CAN"
        );
        expect(await screen.findByText("State")).toBeInTheDocument();
        expect(await screen.findByText("ZIP code")).toBeInTheDocument();
      });
      it("should show different states for Canada", async () => {
        const { user } = renderWithUserWithFacility();

        await user.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "CAN"
        );

        let stateInput: HTMLSelectElement;
        stateInput = screen.getByLabelText("State", {
          exact: false,
        }) as HTMLSelectElement;

        await user.selectOptions(stateInput, "QC");
        expect(stateInput.value).toBe("QC");
      });

      it("should hide the state and zip code inputs for non-US countries", async () => {
        const { user } = renderWithUserWithFacility();

        await user.selectOptions(
          screen.getByLabelText("Country", { exact: false }),
          "MEX"
        );
        expect(screen.queryByText("State")).not.toBeInTheDocument();
        expect(screen.queryByText("ZIP code")).not.toBeInTheDocument();
      });

      it("should hide address fields for unknown address checked", async () => {
        const { user } = renderWithUserWithFacility();
        await user.click(
          screen.getByText("Address unknown or patient unhoused", {
            exact: false,
          })
        );
        expect(screen.queryByText("Country")).not.toBeInTheDocument();
        expect(screen.queryByText("Street address 1")).not.toBeInTheDocument();
        expect(screen.queryByText("Street address 2")).not.toBeInTheDocument();
        expect(screen.queryByText("City")).not.toBeInTheDocument();
        expect(screen.queryByText("County")).not.toBeInTheDocument();
        expect(screen.queryByText("State")).not.toBeInTheDocument();
        expect(screen.queryByText("ZIP code")).not.toBeInTheDocument();
      });
    });

    describe("facility select input", () => {
      it("is present in the form", () => {
        renderWithUserWithFacility();
        const facilityInput = screen.getByLabelText("Facility", {
          exact: false,
        }) as HTMLSelectElement;
        expect(facilityInput).toBeInTheDocument();
      });

      it("defaults to no selection", () => {
        renderWithUserWithFacility();
        const facilityInput = screen.getByLabelText("Facility", {
          exact: false,
        }) as HTMLSelectElement;
        expect(facilityInput.value).toBe("");
      });

      it("updates its selection on change", async () => {
        const { user } = renderWithUserWithFacility();
        const facilityInput = screen.getByLabelText("Facility", {
          exact: false,
        }) as HTMLSelectElement;
        await user.selectOptions(facilityInput, [mockFacilityID]);
        expect(facilityInput.value).toBe(mockFacilityID);
      });
    });

    describe("With student ID", () => {
      it("allows student ID to be entered", async () => {
        const { user } = renderWithUserWithFacility();
        await user.selectOptions(screen.getByLabelText("Role"), "STUDENT");
        expect(await screen.findByText("Student ID")).toBeInTheDocument();
      });
    });

    describe("With unknown phone number", () => {
      it("should hide phone number fields when unknown phone number checked.", async () => {
        const { user } = renderWithUserWithFacility();

        expect(screen.getByText("Primary phone number")).toBeInTheDocument();
        expect(screen.getByText("Phone type")).toBeInTheDocument();

        await user.click(
          screen.getByText("Phone number unknown", { exact: false })
        );

        expect(
          screen.queryByText("Primary phone number")
        ).not.toBeInTheDocument();
        expect(screen.queryByText("Phone type")).not.toBeInTheDocument();
      });
    });
  });
});
