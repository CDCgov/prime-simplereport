import { useMemo, useState } from "react";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import OrganizationComboDropDown, {
  useOrganizationDropDownValidation,
  OrganizationOption,
} from "../Components/OrganizationComboDropdown";

import FacilityAdmin, { useFacilityAdminValidation } from "./FacilityAdmin";

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

const AddOrganizationAdminForm = (props: Props) => {
  const [admin, updateAdminFormData] = useState<FacilityAdmin>(props.admin);

  const sortedOrganizationOptions = useMemo(
    () => sortOrganizationOptions(props.organizationOptions),
    [props.organizationOptions]
  );

  const [organizationExternalId, updateOrganizationExternalId] = useState<
    string | undefined
  >("");
  const [formIsValid, updateFormIsValid] = useState<boolean>(false);

  const updateOrganizationExternalIdDropDown = (
    externalId: string | undefined
  ) => {
    updateOrganizationExternalId(externalId);
    if (externalId !== undefined) {
      updateFormIsValid(true);
    } else {
      updateFormIsValid(false);
    }
  };

  const updateAdminForm = (data: FacilityAdmin) => {
    updateAdminFormData(data);
    updateFormIsValid(true);
  };

  const { validateAdmin } = useFacilityAdminValidation(admin);

  const { validateOrganizationDropDown } = useOrganizationDropDownValidation(
    organizationExternalId
  );

  const validateAndSaveOrganizationAdmin = async () => {
    if (
      validateOrganizationDropDown() === "error" ||
      organizationExternalId === undefined
    ) {
      updateFormIsValid(false);
      return;
    }
    if ((await validateAdmin()) === "error") {
      updateFormIsValid(false);
      return;
    }
    props.saveOrganizationAdmin(organizationExternalId, admin);
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">Add organization admin</h2>
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
                  disabled={!formIsValid}
                />
              </div>
            </div>
          </div>
          <OrganizationComboDropDown
            selectedExternalId={organizationExternalId}
            updateSelectedExternalId={updateOrganizationExternalIdDropDown}
            organizationOptions={sortedOrganizationOptions}
          />
          <FacilityAdmin admin={admin} updateAdmin={updateAdminForm} />
        </div>
      </div>
    </div>
  );
};

export default AddOrganizationAdminForm;
