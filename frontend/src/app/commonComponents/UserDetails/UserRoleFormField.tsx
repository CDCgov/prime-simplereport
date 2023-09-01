import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

import RadioGroup from "../RadioGroup";
import { ROLES } from "../../Settings/Users/UserRoleSettingsForm";

interface UserRoleFormFieldProps {
  value: string;
  registrationProps: UseFormRegisterReturn<any>;
  error: any;
}

const UserRoleFormField: React.FC<UserRoleFormFieldProps> = ({
  value,
  error,
  registrationProps,
}) => {
  return (
    <div className={"usa-form-group"}>
      <RadioGroup
        className="margin-top-neg-1 margin-bottom-4"
        legend="User Role"
        name="role"
        hintText={
          "Admins have full access to use and change settings on SimpleReport. Standard and testing-only users have limited access for specific tasks, as described below."
        }
        buttons={ROLES}
        selectedRadio={value}
        validationStatus={error ? "error" : undefined}
        errorMessage={error?.message}
        registrationProps={registrationProps}
        required
      />
    </div>
  );
};

export default UserRoleFormField;
