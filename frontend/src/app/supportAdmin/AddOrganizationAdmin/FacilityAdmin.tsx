import React, { useCallback, useState } from "react";

import Input from "../../commonComponents/Input";
import { showError } from "../../utils/srToast";
import { camelToSentenceCase } from "../../utils/text";

import {
  FacilityAdminErrors,
  facilityAdminSchema,
} from "./facilityAdminSchema";

export const useFacilityAdminValidation = (admin: FacilityAdmin) => {
  const [errors, setErrors] = useState<FacilityAdminErrors>({});

  const clearError = useCallback(
    (field: keyof FacilityAdminErrors) => {
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    },
    [errors]
  );

  const validateField = useCallback(
    async (field: keyof FacilityAdminErrors) => {
      try {
        clearError(field);
        await facilityAdminSchema.validateAt(field, admin);
      } catch (e: any) {
        setErrors((existingErrors) => ({
          ...existingErrors,
          [field]: e.errors?.join(", "),
        }));
      }
    },
    [admin, clearError]
  );

  const validateAdmin = async () => {
    try {
      await facilityAdminSchema.validate(admin, { abortEarly: false });
      return "";
    } catch (e: any) {
      const newErrors = e.inner.reduce(
        (
          acc: FacilityAdminErrors,
          el: { path: keyof FacilityAdminErrors; message: string }
        ) => {
          acc[el.path] = el.message;
          return acc;
        },
        {} as FacilityAdminErrors
      );
      setErrors(newErrors);
      showError(
        "Please check the form to make sure you complete all of the required fields.",
        "Form Errors"
      );
      return "error";
    }
  };

  return { errors, validateField, validateAdmin };
};
interface Props {
  admin: FacilityAdmin;
  updateAdmin: (admin: FacilityAdmin) => void;
}

const FacilityAdmin: React.FC<Props> = ({ admin, updateAdmin }) => {
  const onChange = <K extends keyof FacilityAdmin>(field: K) => (
    value: FacilityAdmin[K]
  ) => {
    updateAdmin({ ...admin, [field]: value });
  };

  const { errors, validateField } = useFacilityAdminValidation(admin);

  const getValidationStatus = (field: keyof FacilityAdmin) =>
    errors[field] ? "error" : undefined;

  const fields = {
    ["firstName" as keyof FacilityAdmin]: true,
    ["middleName" as keyof FacilityAdmin]: false,
    ["lastName" as keyof FacilityAdmin]: true,
    ["suffix" as keyof FacilityAdmin]: false,
    ["email" as keyof FacilityAdmin]: true,
  };

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2 className="font-heading-lg" style={{ margin: 0 }}>
          Facility Administrator
        </h2>
      </div>
      <div className="usa-card__body usa-form usa-form--large">
        {Object.entries(fields).map(([key, required]) => {
          const field = key as keyof FacilityAdmin;
          return (
            <Input
              label={camelToSentenceCase(field)}
              field={field}
              key={field}
              formObject={admin}
              onChange={onChange}
              errors={errors}
              validate={validateField}
              getValidationStatus={getValidationStatus}
              required={required}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FacilityAdmin;
