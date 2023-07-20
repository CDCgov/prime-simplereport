import { useMemo } from "react";
import { useForm } from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import OrganizationComboDropDown, {
  OrganizationOption,
} from "../Components/OrganizationComboDropdown";
import { addOrgAdminPageTitle } from "../pageTitles";

import FacilityAdmin from "./FacilityAdmin";

const sortOrganizationOptions = (organizationOptions: OrganizationOption[]) =>
  Object.values(organizationOptions).sort((a, b) => {
    return a.name > b.name ? 1 : -1;
  });

export interface OrganizationAdminFormData {
  organizationExternalId: string;
  admin: FacilityAdmin;
}
interface Props {
  organizationExternalId: string;
  admin: FacilityAdmin;
  organizationOptions: OrganizationOption[];
  saveOrganizationAdmin: (
    organizationExternalId: string,
    admin: FacilityAdmin
  ) => void;
}

const AddOrganizationAdminForm = ({
  organizationExternalId,
  admin,
  organizationOptions,
  saveOrganizationAdmin,
}: Props) => {
  const sortedOrganizationOptions = useMemo(
    () => sortOrganizationOptions(organizationOptions),
    [organizationOptions]
  );

  const onSubmit = async (data: OrganizationAdminFormData) => {
    saveOrganizationAdmin(data.organizationExternalId, data.admin);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    control,
  } = useForm<OrganizationAdminFormData>({
    defaultValues: {
      organizationExternalId: organizationExternalId,
      admin: admin,
    },
  });
  const formCurrentValues = watch();

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <form className="grid-row" onSubmit={handleSubmit(onSubmit)}>
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">{addOrgAdminPageTitle}</h2>
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
                  type="submit"
                  label="Save Changes"
                  disabled={isSubmitting || !isDirty}
                />
              </div>
            </div>
          </div>
          <OrganizationComboDropDown
            selectedExternalId={organizationExternalId}
            organizationOptions={sortedOrganizationOptions}
            control={control}
          />
          <FacilityAdmin
            admin={formCurrentValues.admin}
            errors={errors}
            register={register}
          />
        </form>
      </div>
    </div>
  );
};

export default AddOrganizationAdminForm;
