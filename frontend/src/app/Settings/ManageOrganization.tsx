import React from "react";
import { useForm } from "react-hook-form";

import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button/Button";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Alert from "../commonComponents/Alert";
import Select from "../commonComponents/Select";
import { OrganizationTypeEnum } from "../signUp/Organization/utils";
import { Organization } from "../../generated/graphql";

interface ManageOrganizationProps {
  organization: Organization;
  onSave: (organization: Organization) => Promise<void>;
  canEditOrganizationName: boolean;
}

const ManageOrganization: React.FC<ManageOrganizationProps> = ({
  organization,
  onSave,
  canEditOrganizationName,
}: ManageOrganizationProps) => {
  /**
   * Form state setup
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<Organization>({
    defaultValues: { type: organization.type, name: organization.name },
  });
  const formCurrentValues = watch();

  /**
   * Submit organization data
   */
  const onSubmit = async (orgData: Organization) => {
    const updatedOrganization = {
      ...organization,
      name: canEditOrganizationName ? orgData.name : organization.name,
      type: orgData.type,
    };
    try {
      await onSave(updatedOrganization);
      // update default values so the isDirty check applies to current updated data
      reset({ ...orgData });
    } catch (e) {
      /* do nothing as the container component already displays error toast */
    }
  };

  /**
   * HTML
   */
  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container settings-tab">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="usa-card__header">
            <h1>Manage organization</h1>
            <Button
              type="submit"
              label="Save settings"
              disabled={isSubmitting || !isDirty}
            />
          </div>
          <div className="usa-card__body">
            <RequiredMessage />
            {canEditOrganizationName ? (
              <TextInput
                label="Organization name"
                name="name"
                value={formCurrentValues.name}
                validationStatus={
                  errors?.name?.type === "required" ? "error" : undefined
                }
                errorMessage="The organization's name cannot be blank"
                required
                registrationProps={register("name", {
                  required: true,
                })}
              />
            ) : (
              <>
                <Alert type="info">
                  The organization name is used for reporting to public health
                  departments. Please contact{" "}
                  <a href="mailto:support@simplereport.gov">
                    support@simplereport.gov
                  </a>{" "}
                  if you need to change it.
                </Alert>
                <div className="usa-form-group">
                  <span>Organization name</span>
                  <p>{organization.name}</p>
                </div>
              </>
            )}
            <Select
              name="type"
              options={
                Object.entries(OrganizationTypeEnum).map(([key, value]) => ({
                  label: value,
                  value: key,
                })) as {
                  value: OrganizationType;
                  label: string;
                }[]
              }
              label="Organization type"
              value={formCurrentValues.type}
              defaultSelect
              errorMessage="An organization type must be selected"
              validationStatus={
                errors?.type?.type === "required" ? "error" : undefined
              }
              required
              registrationProps={register("type", { required: true })}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageOrganization;
