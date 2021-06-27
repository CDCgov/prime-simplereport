import React, { useMemo, useState } from "react";

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

interface Props {
  organizationExternalId: string;
  justification: string;
  organizationOptions: OrganizationOption[];
  saveTenantDataAccess: (
    organizationExternalId?: string,
    justification?: string
  ) => void;
}

const TenantDataAccessForm: React.FC<Props> = (props) => {
  const [formChanged, updateFormChanged] = useState<boolean>(false);

  const [justification, setJustification] = useState<string>(
    props.justification
  );
  const onJustificationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setJustification(e.target.value);
    updateFormChanged(true);
  };

  const [
    organizationExternalId,
    updateOrganizationExternalId,
  ] = useState<string>("");

  const updateOrganizationExternalIdDropDown = (externalId: string) => {
    updateOrganizationExternalId(externalId);
    updateFormChanged(true);
  };

  const sortedOrganizationOptions = useMemo(
    () => sortOrganizationOptions(props.organizationOptions),
    [props.organizationOptions]
  );

  const { validateOrganizationDropDown } = useOrganizationDropDownValidation(
    organizationExternalId
  );

  const validateAndSaveOrganizationAdmin = async () => {
    if (validateOrganizationDropDown() === "error") {
      return;
    }
    if (!justification || justification.length === 0) {
      return;
    }
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
                <h2 className="font-heading-lg">Access Tenant Data</h2>
                <RequiredMessage />
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
                  onClick={validateAndSaveOrganizationAdmin}
                  label="Save Changes"
                  disabled={!formChanged}
                />
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
                <h2 className="font-heading-lg">Cancel Tenant Data Access</h2>
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
                  label="Cancel Access"
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
