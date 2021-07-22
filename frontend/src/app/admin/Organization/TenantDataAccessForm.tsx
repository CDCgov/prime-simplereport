import React, { useEffect, useMemo, useState } from "react";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import TextInput from "../../commonComponents/TextInput";

import OrganizationDropDown, {
  useOrganizationDropDownValidation,
  OrganizationOption,
} from "./OrganizationDropDown";

const sortOrganizationOptions = (organizationOptions: OrganizationOption[]) =>
  Object.values(organizationOptions).sort((a, b) => {
    return a.name > b.name ? 1 : -1;
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

  const [
    organizationExternalId,
    updateOrganizationExternalId,
  ] = useState<string>("");

  const updateOrganizationExternalIdDropDown = (externalId: string) => {
    updateOrganizationExternalId(externalId);
  };

  const sortedOrganizationOptions = useMemo(
    () => sortOrganizationOptions(props.organizationOptions),
    [props.organizationOptions]
  );

  const { validateOrganizationDropDown } = useOrganizationDropDownValidation(
    organizationExternalId
  );

  useEffect(() => {
    if (!justification || justification.length === 0) {
      updateFormIsValid(false);
    } else if (validateOrganizationDropDown() === "error") {
      updateFormIsValid(false);
    } else {
      updateFormIsValid(true);
    }
  }, [validateOrganizationDropDown, organizationExternalId, justification]);

  const submitTenantDataAccessRequest = async () => {
    props.saveTenantDataAccess(organizationExternalId, justification);
  };

  const submitCancellationRequest = async () => {
    props.saveTenantDataAccess();
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">Organization Data Access</h2>
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
          <OrganizationDropDown
            selectedExternalId={organizationExternalId}
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
                  disabled={!formIsValid}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TenantDataAccessForm;
