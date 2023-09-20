import React from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

import RadioGroup from "../RadioGroup";
import { ROLES } from "../../Settings/Users/UserRoleSettingsForm";

interface UserRoleFormFieldProps {
  selectedRole: string;
  registrationProps: UseFormRegisterReturn<any>;
  error?: FieldError;
  disabled: boolean;
}

const UserRoleFormField: React.FC<UserRoleFormFieldProps> = ({
  error,
  disabled,
  registrationProps,
  selectedRole,
}) => {
  return (
    <div className={"usa-form-group"}>
      <RadioGroup
        className="margin-top-neg-1 margin-bottom-4"
        legend="User Role"
        hintText={
          "Admins have full access to use and change settings on SimpleReport. Standard and testing-only users have limited access for specific tasks, as described below."
        }
        buttons={ROLES}
        selectedRadio={selectedRole}
        validationStatus={error ? "error" : undefined}
        errorMessage={error?.message}
        registrationProps={registrationProps}
        required
        disabled={disabled}
      />
    </div>
  );
};

export default UserRoleFormField;
