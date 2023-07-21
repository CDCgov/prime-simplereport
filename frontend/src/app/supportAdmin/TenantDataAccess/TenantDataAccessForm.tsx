import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import TextInput from "../../commonComponents/TextInput";
import OrganizationComboDropDown, {
  useOrganizationDropDownValidation,
  OrganizationOption,
} from "../Components/OrganizationComboDropdown";
import { orgAccessPageTitle } from "../pageTitles";

const sortOrganizationOptions = (organizationOptions: OrganizationOption[]) =>
  Object.values(organizationOptions).sort((a, b) => {
    return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
  });

export interface Props {
  organizationExternalId: string;
  justification: string;
  organizationOptions: OrganizationOption[];
  saveTenantDataAccess: (
    organizationExternalId?: string,
    justification?: string
  ) => void;
}

const TenantDataAccessForm: React.FC<Props> = (props) => {
  const [formIsValid, updateFormIsValid] = useState<boolean>(false);

  const [justification, setJustification] = useState<string>(
    props.justification
  );
  const onJustificationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setJustification(e.target.value);
  };

  const sortedOrganizationOptions = useMemo(
    () => sortOrganizationOptions(props.organizationOptions),
    [props.organizationOptions]
  );
  let mappedIdFromCurAccessedName = undefined;
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const curAccessedOrgName =
    organization.name === undefined ? "" : organization.name;
  sortedOrganizationOptions.forEach((org) => {
    if (org.name === curAccessedOrgName) {
      mappedIdFromCurAccessedName = org.externalId;
    }
  });

  const [selectedOrgExternalId, updateOrganizationExternalId] = useState<
    string | undefined
  >(mappedIdFromCurAccessedName);
  const updateOrganizationExternalIdDropDown = (
    externalId: string | undefined
  ) => {
    updateOrganizationExternalId(externalId);
  };

  const { validateOrganizationDropDown } = useOrganizationDropDownValidation(
    selectedOrgExternalId
  );

  useEffect(() => {
    if (!justification || justification.length === 0) {
      updateFormIsValid(false);
    } else if (validateOrganizationDropDown() === "error") {
      updateFormIsValid(false);
    } else if (validateOrganizationDropDown() === "combo box cleared") {
      updateFormIsValid(false);
    } else {
      updateFormIsValid(true);
    }
  }, [validateOrganizationDropDown, selectedOrgExternalId, justification]);

  const submitTenantDataAccessRequest = async () => {
    props.saveTenantDataAccess(selectedOrgExternalId, justification);
  };

  const submitCancellationRequest = async () => {
    props.saveTenantDataAccess();
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h1 className="font-heading-lg">{orgAccessPageTitle}</h1>
                <p className="text-base">
                  This page allows you to reproduce a specific user's issues by
                  accessing their account. Access automatically expires after an
                  hour, or you can leave the organization manually by selecting
                  "Cancel access" below.
                </p>
                <RequiredMessage />
              </div>
            </div>
          </div>
          <OrganizationComboDropDown
            selectedExternalId={selectedOrgExternalId}
            updateSelectedExternalId={updateOrganizationExternalIdDropDown}
            organizationOptions={sortedOrganizationOptions}
          />
          <div className="prime-container usa-card__container">
            <div className="usa-card__body usa-form usa-form--large">
              <TextInput
                label="Justification"
                name="justification"
                value={justification}
                onChange={onJustificationChange}
                required
              />
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">
                  Request organization data access
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  type="button"
                  onClick={submitTenantDataAccessRequest}
                  label="Access data"
                  disabled={!formIsValid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">
                  Cancel organization data access
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  type="button"
                  onClick={submitCancellationRequest}
                  label="Cancel access"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantDataAccessForm;
