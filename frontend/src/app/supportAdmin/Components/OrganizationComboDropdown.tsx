import React from "react";
import { ComboBox } from "@trussworks/react-uswds";
import { Control, Controller } from "react-hook-form";

import Required from "../../commonComponents/Required";
import { showError } from "../../utils/srToast";
import { FORM_ERROR_TITLE } from "../../../config/constants";

export interface OrganizationOption {
  name: string;
  externalId: string;
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
      showError("Please select an organization.", FORM_ERROR_TITLE);
      return "error";
    }

    return "";
  };
  return { validateOrganizationDropDown };
};

interface Props {
  selectedExternalId: string | undefined;
  updateSelectedExternalId?: (selectedId: string | undefined) => void;
  organizationOptions: OrganizationOption[];
  control?: Control<any>;
}

const OrganizationComboDropDown: React.FC<Props> = ({
  selectedExternalId,
  updateSelectedExternalId,
  organizationOptions,
  control,
}) => {
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
        {control ? (
          <Controller
            render={({
              field: { onChange, value, name, ref },
              fieldState: { error },
            }) => (
              <div
                className={
                  error?.message && "usa-form-group usa-form-group--error"
                }
              >
                {error && (
                  <span className={"usa-error-message"} role={"alert"}>
                    <span className="usa-sr-only">Error: </span>{" "}
                    {error?.message}
                  </span>
                )}
                <ComboBox
                  options={dropdownOptions}
                  id="org-dropdown-select"
                  name={name}
                  defaultValue={value}
                  onChange={onChange}
                  ref={ref}
                />
              </div>
            )}
            name="organizationExternalId"
            control={control}
            rules={{ required: "Organization is missing" }}
          />
        ) : (
          <ComboBox
            options={dropdownOptions}
            id="org-dropdown-select"
            name="orgSelect"
            defaultValue={selectedExternalId}
            onChange={(value) => {
              if (updateSelectedExternalId) {
                updateSelectedExternalId(value);
              }
            }}
          />
        )}
      </div>
    </div>
  );
};

export default OrganizationComboDropDown;
