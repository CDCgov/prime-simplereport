import { useMemo, useState } from "react";
import { useSelector } from "react-redux";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import OrganizationDropDown, {
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
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );
  const curAccessedOrgName =
    organization.name === undefined ? "" : organization.name;
  let mappedIdFromCurAccessedName = undefined;
  sortedOrganizationOptions.forEach((org) => {
    if (org.name === curAccessedOrgName)
      mappedIdFromCurAccessedName = org.externalId;
  });

  const [organizationExternalId, updateOrganizationExternalId] = useState<
    string | undefined
  >(mappedIdFromCurAccessedName);
  const [formIsValid, updateFormIsValid] = useState<boolean>(false);

  const updateOrganizationExternalIdDropDown = (
    externalId: string | undefined
  ) => {
    if (externalId !== undefined) {
      updateOrganizationExternalId(externalId);
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
                  disabled={!formIsValid}
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
