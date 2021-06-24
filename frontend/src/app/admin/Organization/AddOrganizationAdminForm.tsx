import React, { useMemo, useState } from "react";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";

import FacilityAdmin, { useFacilityAdminValidation } from "./FacilityAdmin";
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
  admin: FacilityAdmin;
  organizationOptions: OrganizationOption[];
  saveOrganizationAdmin: (
    organizationExternalId: string,
    admin: FacilityAdmin
  ) => void;
}

const AddOrganizationAdminForm: React.FC<Props> = (props) => {
  const [admin, updateAdminFormData] = useState<FacilityAdmin>(props.admin);
  const [
    organizationExternalId,
    updateOrganizationExternalId,
  ] = useState<string>("");
  const [formChanged, updateFormChanged] = useState<boolean>(false);

  const updateOrganizationExternalIdDropDown = (externalId: string) => {
    updateOrganizationExternalId(externalId);
    updateFormChanged(true);
  };

  const updateAdminForm = (data: FacilityAdmin) => {
    updateAdminFormData(data);
    updateFormChanged(true);
  };

  const sortedOrganizationOptions = useMemo(
    () => sortOrganizationOptions(props.organizationOptions),
    [props.organizationOptions]
  );

  const { validateAdmin } = useFacilityAdminValidation(admin);

  const { validateOrganizationDropDown } = useOrganizationDropDownValidation(
    organizationExternalId
  );

  const validateAndSaveOrganizationAdmin = async () => {
    if (validateOrganizationDropDown() === "error") {
      return;
    }
    if ((await validateAdmin()) === "error") {
      return;
    }
    props.saveOrganizationAdmin(organizationExternalId, admin);
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">Add Organization Admin</h2>
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
          <FacilityAdmin admin={admin} updateAdmin={updateAdminForm} />
        </div>
      </div>
    </main>
  );
};

export default AddOrganizationAdminForm;
