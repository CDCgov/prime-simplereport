import React from "react";
import { FieldErrors, UseFormRegister, RegisterOptions } from "react-hook-form";

import { camelToSentenceCase } from "../../utils/text";
import TextInput from "../../commonComponents/TextInput";
import { emailRegex } from "../../utils/email";

import { OrganizationAdminFormData } from "./AddOrganizationAdminForm";

interface Props {
  admin: FacilityAdmin;
  register: UseFormRegister<OrganizationAdminFormData>;
  errors: FieldErrors<OrganizationAdminFormData>;
}

const FacilityAdmin: React.FC<Props> = ({ admin, register, errors }) => {
  const fields: { [key: string]: RegisterOptions } = {
    ["firstName" as keyof FacilityAdmin]: {
      required: `First name is missing`,
    },
    ["middleName" as keyof FacilityAdmin]: { required: false },
    ["lastName" as keyof FacilityAdmin]: {
      required: `Last name is missing`,
    },
    ["suffix" as keyof FacilityAdmin]: { required: false },
    ["email" as keyof FacilityAdmin]: {
      required: `Email is missing`,
      pattern: {
        value: emailRegex,
        message: "Invalid email address",
      },
    },
  };

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2 style={{ margin: 0 }}>Facility Administrator</h2>
      </div>
      <div className="usa-card__body usa-form usa-form--large">
        {Object.entries(fields).map(([key, validation]) => {
          const field = key as keyof FacilityAdmin;
          return (
            <TextInput
              label={camelToSentenceCase(field)}
              key={field}
              name={field}
              value={admin[field] || undefined}
              validationStatus={
                errors?.admin?.[field]?.type ? "error" : undefined
              }
              errorMessage={errors?.admin?.[field]?.message}
              required={!!validation.required}
              registrationProps={register(`admin.${field}`, validation)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FacilityAdmin;
