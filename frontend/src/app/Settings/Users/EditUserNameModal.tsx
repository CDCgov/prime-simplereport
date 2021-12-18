import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { TextInput } from "../../commonComponents/TextInput";

import { SettingsUser } from "./ManageUsersContainer";
import { BaseEditModal } from "./BaseEditModal";

import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onEditUserName: (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string
  ) => void;
  user: SettingsUser;
}

const EditUserNameModal: React.FC<Props> = ({
  onClose,
  onEditUserName,
  user,
}) => {
  const heading = `Update name for ${displayFullName(
    user.firstName,
    "",
    user.lastName
  )}`;
  const [firstName, updateFirstName] = useState(user.firstName || "");
  const [lastName, updateLastName] = useState(user.lastName);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");

  const validateFirstName = () => {
    if (firstName === "") {
      setFirstNameError("A first name is required");
    } else {
      setFirstNameError("");
    }
  };

  const validateLastName = () => {
    if (lastName === "") {
      setLastNameError("A last name is required");
    } else {
      setLastNameError("");
    }
  };

  const modalContent = (
    <div>
      <TextInput
        label="First name"
        name="firstName"
        value={firstName}
        required={true}
        onChange={(e) => updateFirstName(e.target.value)}
        onBlur={() => validateFirstName()}
        validationStatus={firstNameError ? "error" : undefined}
        errorMessage={firstNameError}
      />
      <TextInput
        label="Last name"
        name="lastName"
        value={lastName}
        required={true}
        onChange={(e) => updateLastName(e.target.value)}
        onBlur={() => validateLastName()}
        validationStatus={lastNameError ? "error" : undefined}
        errorMessage={lastNameError}
      />
    </div>
  );
  const modalButtons = (
    <div>
      <Button
        className="margin-right-2"
        onClick={onClose}
        variant="unstyled"
        label="Cancel"
      />
      <Button
        className="margin-right-205"
        onClick={() =>
          onEditUserName(
            user.id,
            firstName,
            user.middleName || "",
            lastName,
            user.suffix || ""
          )
        }
        label="Confirm"
        disabled={firstNameError || lastNameError ? true : false}
      />
    </div>
  );

  return (
    <BaseEditModal
      heading={heading}
      onClose={onClose}
      content={modalContent}
      buttons={modalButtons}
    ></BaseEditModal>
  );
};

export default EditUserNameModal;
