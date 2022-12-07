import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";

import Button from "../../commonComponents/Button/Button";
import Dropdown from "../../commonComponents/Dropdown";
import { Role } from "../../permissions";
import { RootState } from "../../store";
import { isFormValid, isFieldValid } from "../../utils/yupHelpers";
import Input from "../../commonComponents/Input";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import "./ManageUsers.scss";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import { UpdateUser } from "./ManageUsers";
import {
  CreateUserErrors,
  initCreateUserErrors,
  createUserSchema as schema,
  CreateUser,
  ROLE_OPTIONS,
} from "./CreateUserSchema";

interface Props {
  onClose: () => void;
  onSubmit: (newUserInvite: Partial<SettingsUser>) => void;
  isUpdating: boolean;
}

const initialFormState: CreateUser = {
  firstName: "",
  lastName: "",
  email: "",
  role: "USER",
};

const CreateUserForm: React.FC<Props> = ({ onClose, onSubmit, isUpdating }) => {
  const facilities = useSelector<RootState, UserFacilitySetting[]>(
    (state) => state.facilities
  );
  const [newUser, updateNewUser] = useState(initialFormState);
  const [errors, setErrors] = useState<CreateUserErrors>(
    initCreateUserErrors()
  );
  const [saving, setSaving] = useState(isUpdating);

  const updateUser: UpdateUser = (key, value) => {
    updateNewUser({
      ...newUser,
      [key]: value,
    });
  };

  const onChange =
    (field: keyof CreateUser) => (value: CreateUser[typeof field]) => {
      updateNewUser({ ...newUser, [field]: value });
    };

  const validateField = async (field: keyof CreateUser) => {
    setErrors(await isFieldValid({ data: newUser, schema, errors, field }));
  };

  const getValidationStatus = (field: keyof CreateUser) =>
    errors[field] ? "error" : undefined;

  const disableSubmit =
    saving ||
    !newUser.firstName ||
    !newUser.lastName ||
    !newUser.email ||
    !(newUser as SettingsUser).organization?.testingFacility ||
    (newUser as SettingsUser)?.organization?.testingFacility.length === 0;

  const onSave = async () => {
    setSaving(true);
    const validation = await isFormValid({
      data: newUser,
      schema,
    });
    if (validation.valid) {
      setErrors(initCreateUserErrors());
      onSubmit(newUser);
      return;
    }
    setErrors(validation.errors);
    setSaving(false);
  };

  const commonInputProps = {
    formObject: newUser,
    onChange,
    required: true,
    disabled: isUpdating,
    validate: validateField,
    errors,
    getValidationStatus,
  };

  return (
    <div className="border-0 card-container">
      <div className="display-flex flex-justify">
        <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
          Invite new user
        </h1>
        <button onClick={onClose} className="close-button" aria-label="Close">
          <span className="fa-layers">
            <FontAwesomeIcon icon={"circle"} size="2x" inverse />
            <FontAwesomeIcon icon={"times-circle"} size="2x" />
          </span>
        </button>
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      <div>
        <Input {...commonInputProps} label="First name" field="firstName" />
        <div></div>
        <Input {...commonInputProps} label="Last name" field="lastName" />
      </div>
      <div>
        <Input
          {...commonInputProps}
          label="Email address"
          field="email"
          type="email"
        />
      </div>
      <div className="grid-row">
        <Dropdown
          options={ROLE_OPTIONS}
          label="Access level"
          name="role"
          selectedValue={newUser.role as string}
          className="grid-col"
          onChange={(evt) => updateUser("role", evt.target.value as Role)}
          errorMessage={errors["role"]}
          validationStatus={getValidationStatus("role")}
          required
        />
      </div>
      <UserFacilitiesSettingsForm
        activeUser={newUser}
        onUpdateUser={updateUser}
        allFacilities={facilities}
        showRequired
      />
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
        <div className="display-flex flex-justify-end">
          <Button
            className="margin-right-2"
            onClick={onClose}
            variant="unstyled"
            label="Go back"
          />
          <Button
            className="margin-right-205"
            onClick={onSave}
            label={saving ? "Sending" : "Send invite"}
            disabled={disableSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
