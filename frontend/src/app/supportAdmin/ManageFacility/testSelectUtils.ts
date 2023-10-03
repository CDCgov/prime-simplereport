import { screen, within } from "@testing-library/react";

export const getOrgComboBoxElements = () => {
  const orgSelectionDiv = screen.getByTestId("org-selection-container");
  const orgComboBoxInput = screen.getByLabelText(/organization/i);
  const orgComboBoxList = within(orgSelectionDiv).getByTestId(
    "combo-box-option-list"
  );
  return [orgComboBoxInput, orgComboBoxList] as const;
};

export const getFacilityComboBoxElements = () => {
  const facilitySelectionDiv = screen.getByTestId(
    "facility-selection-container"
  );
  const facilityComboBoxInput = screen.getByLabelText(/testing facility/i);
  const facilityComboBoxList = within(facilitySelectionDiv).getByTestId(
    "combo-box-option-list"
  );
  return [facilityComboBoxInput, facilityComboBoxList] as const;
};
