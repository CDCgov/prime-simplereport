import React from "react";
import { ComboBox } from "@trussworks/react-uswds";

import Required from "../../commonComponents/Required";
import { showError } from "../../utils/srToast";

export interface OrganizationOption {
  name: string;
  externalId: string;
}

export interface OrganizationOptions {
  organizations: [OrganizationOption];
}

export const useOrganizationDropDownValidation = (
  organizationExternalId: string | undefined
) => {
  const validateOrganizationDropDown = () => {
    // ensure organizationExternalId is not undefined in the case where we're
    // not using a combo box
    if (organizationExternalId === undefined) {
      return "combo box cleared";
    }
    if (organizationExternalId === null || organizationExternalId === "") {
      showError("Please select an organization.", "Form Errors");
      return "error";
    }

    return "";
  };
  return { validateOrganizationDropDown };
};

interface Props {
  selectedExternalId: string | undefined;
  updateSelectedExternalId: (selectedId: string | undefined) => void;
  organizationOptions: OrganizationOption[];
}

const OrganizationComboDropDown: React.FC<Props> = ({
  selectedExternalId,
  updateSelectedExternalId,
  organizationOptions,
}) => {
  const onOrganizationChange = (
    newOrganizationExternalId: string | undefined
  ) => {
    updateSelectedExternalId(newOrganizationExternalId);
  };

  const dropdownOptions = organizationOptions.map(({ name, externalId }) => {
    return {
      label: name,
      value: externalId,
    };
  });

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2 className="font-heading-lg" style={{ margin: 0 }}>
          <label htmlFor="org-dropdown-select">
            <Required label="Organization" />
          </label>
        </h2>
      </div>
      <div className="usa-card__body usa-form usa-form--large">
        <ComboBox
          options={dropdownOptions}
          id="org-dropdown-select"
          name="orgSelect"
          defaultValue={selectedExternalId}
          onChange={(value) => {
            onOrganizationChange(value);
          }}
        />
      </div>
    </div>
  );
};

export default OrganizationComboDropDown;
