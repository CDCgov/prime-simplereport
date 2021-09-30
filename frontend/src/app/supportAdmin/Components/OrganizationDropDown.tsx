import React from "react";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import Dropdown from "../../commonComponents/Dropdown";
import Required from "../../commonComponents/Required";

export interface OrganizationOption {
  name: string;
  externalId: string;
}

export interface OrganizationOptions {
  organizations: [OrganizationOption];
}

export const useOrganizationDropDownValidation = (
  organizationExternalId: string
) => {
  const validateOrganizationDropDown = () => {
    if (organizationExternalId === null || organizationExternalId === "") {
      const alert = (
        <Alert
          type="error"
          title="Form Errors"
          body="Please select an organization."
        />
      );
      showNotification(alert);
      return "error";
    }

    return "";
  };

  return { validateOrganizationDropDown };
};

interface Props {
  selectedExternalId: string;
  updateSelectedExternalId: (externalId: string) => void;
  organizationOptions: OrganizationOption[];
}

const OrganizationDropDown: React.FC<Props> = ({
  selectedExternalId,
  updateSelectedExternalId,
  organizationOptions,
}) => {
  const onOrganizationChange = (newOrganizationExternalId: string) => {
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
          <Required label="Organization" />
        </h2>
      </div>
      <div className="usa-card__body usa-form usa-form--large">
        <Dropdown
          options={dropdownOptions}
          selectedValue={selectedExternalId}
          defaultSelect
          required
          onChange={(e) =>
            onOrganizationChange((e.target as HTMLSelectElement).value)
          }
          data-testid="organization-dropdown"
        />
      </div>
    </div>
  );
};

export default OrganizationDropDown;
