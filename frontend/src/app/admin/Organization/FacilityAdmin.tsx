import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";

import Alert from "../../commonComponents/Alert";
import Input from "../../commonComponents/Input";
import { showNotification } from "../../utils";

import {
  allFacilityAdminErrors,
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
      } catch (e) {
        setErrors((errors) => ({
          ...errors,
          [field]: allFacilityAdminErrors[field],
        }));
      }
    },
    [admin, clearError]
  );

  const validateAdmin = async () => {
    try {
      await facilityAdminSchema.validate(admin, { abortEarly: false });
    } catch (e) {
      const errors = e.inner.reduce(
        (
          acc: FacilityAdminErrors,
          el: { path: keyof FacilityAdminErrors; message: string }
        ) => {
          acc[el.path] = allFacilityAdminErrors[el.path];
          return acc;
        },
        {} as FacilityAdminErrors
      );
      setErrors(errors);
      const alert = (
        <Alert
          type="error"
          title="Form Errors"
          body="Please check the form to make sure you complete all of the required fields."
        />
      );
      showNotification(toast, alert);
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

  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2 style={{ margin: 0 }}>Facility Administrator</h2>
      </div>
      <div className="usa-card__body usa-form usa-form--large">
        <Input
          label="First name"
          field="firstName"
          formObject={admin}
          onChange={onChange}
          errors={errors}
          validate={validateField}
          getValidationStatus={getValidationStatus}
          required
        />
        <Input
          label="Middle name"
          field="middleName"
          formObject={admin}
          onChange={onChange}
          errors={errors}
          validate={validateField}
          getValidationStatus={getValidationStatus}
        />
        <Input
          label="Last name"
          field="lastName"
          formObject={admin}
          onChange={onChange}
          errors={errors}
          validate={validateField}
          getValidationStatus={getValidationStatus}
          required
        />
        <Input
          label="Suffix"
          field="suffix"
          formObject={admin}
          onChange={onChange}
          errors={errors}
          validate={validateField}
          getValidationStatus={getValidationStatus}
        />
        <Input
          label="Email"
          field="email"
          formObject={admin}
          onChange={onChange}
          errors={errors}
          validate={validateField}
          getValidationStatus={getValidationStatus}
          required
        />
      </div>
    </div>
  );
};

export default FacilityAdmin;
