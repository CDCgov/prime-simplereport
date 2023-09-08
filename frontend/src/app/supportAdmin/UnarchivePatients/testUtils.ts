import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  UnarchivePatientFacility,
  UnarchivePatientOrganization,
  UnarchivePatientPatient,
} from "./UnarchivePatient";

export const clickSearch = async () => {
  await act(async () => await userEvent.click(screen.getByText("Search")));
};

export const selectComboBoxOption = async (
  containerTestId: string,
  value: string
) => {
  const containerDiv = screen.getByTestId(containerTestId);
  const listbox = within(containerDiv).getByTestId("combo-box-option-list");
  await act(async () => await userEvent.selectOptions(listbox, value));
  await waitFor(async () =>
    expect(within(containerDiv).getByRole("combobox")).toHaveValue(value)
  );
};

export const checkPatientResultRows = () => {
  let resultsRow = screen.getAllByTestId("sr-archived-patient-row");
  resultsRow.forEach((row, index) => {
    if (index === 0) {
      expect(within(row).getByText("Gutmann, Rod")).toBeInTheDocument();
      expect(within(row).getByText("05/19/1927")).toBeInTheDocument();
      expect(within(row).getByText("All facilities")).toBeInTheDocument();
    } else if (index === 1) {
      expect(within(row).getByText("Mode, Mia")).toBeInTheDocument();
      expect(within(row).getByText("11/20/1973")).toBeInTheDocument();
      expect(within(row).getByText("Mars Facility")).toBeInTheDocument();
    }
  });
};

export const mockFacility1: UnarchivePatientFacility = {
  id: "bc0536e-4564-4291-bbf3-0e7b0731f9e8",
  name: "Mars Facility",
};
export const mockFacility2: UnarchivePatientFacility = {
  id: "d70bb3b3-96bd-40d1-a3ce-b266a7edb91d",
  name: "Jupiter Facility",
};
export const mockPatient1: UnarchivePatientPatient = {
  birthDate: "1927-05-19",
  firstName: "Rod",
  internalId: "60b79a6b-5547-4d54-9cdd-e99ffef59bfc",
  isDeleted: true,
  lastName: "Gutmann",
  middleName: "",
  facility: null,
};
export const mockPatient2: UnarchivePatientPatient = {
  birthDate: "1973-11-20",
  firstName: "Mia",
  internalId: "b0612367-1c82-46ad-88db-2985ac6b81ab",
  isDeleted: true,
  lastName: "Mode",
  middleName: "",
  facility: mockFacility1,
};
export const mockOrg1: UnarchivePatientOrganization = {
  internalId: "f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Space-Camp-f34183c4-b4c5-449f-98b0-2e02abb7aae0",
  name: "Space Org",
  facilities: [mockFacility1, mockFacility2],
};
export const mockOrg2: UnarchivePatientOrganization = {
  internalId: "h3781038-b4c5-449f-98b0-2e02abb7aae0",
  externalId: "DC-Universe-Org-h3781038-b4c5-449f-98b0-2e02abb7aae0",
  name: "Universe Org",
  facilities: [],
};
