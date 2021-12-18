import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { TextInput } from "../../commonComponents/TextInput";
import { emailIsValid } from "../../utils/email";

import { SettingsUser } from "./ManageUsersContainer";
import "./ManageUsers.scss";
import BaseEditModal from "./BaseEditModal";

interface Props {
  onClose: () => void;
  onEditUserEmail: (userId: string, emailAddress: string) => void;
  user: SettingsUser;
}

const EditUserEmailModal: React.FC<Props> = ({
  onClose,
  onEditUserEmail,
  user,
}) => {
  const heading = `Update email address for ${displayFullName(
    user.firstName,
    user.middleName,
    user.lastName
  )}`;
  const [emailAddress, updateEmailAddress] = useState(user.email);
  const [emailAddressError, setEmailAddressError] = useState("");

  const onConfirm = (userId: string, emailAddress: string) => {
    if (!validateEmailAddress()) {
      return;
    }

    onEditUserEmail(userId, emailAddress);
  };

  const validateEmailAddress = () => {
    if (!emailAddress) {
      setEmailAddressError("Enter a valid email address");
      return false;
    }
    if (emailAddress === user.email) {
      setEmailAddressError("The old and new email addresses must be different");
      return false;
    }

    let valid;
    try {
      valid = emailIsValid(emailAddress);
    } catch (e) {
      valid = false;
    }

    if (!valid) {
      setEmailAddressError("Email must be a valid email address");
      return false;
    }

    setEmailAddressError("");
    return true;
  };

  const modalContent = (
    <TextInput
      label="Email address"
      name="emailAddress"
      value={emailAddress}
      required={true}
      onChange={(e) => updateEmailAddress(e.target.value)}
      onBlur={() => validateEmailAddress()}
      validationStatus={emailAddressError ? "error" : undefined}
      errorMessage={emailAddressError}
    />
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
        onClick={() => onConfirm(user.id, emailAddress)}
        label="Confirm"
        disabled={emailAddressError ? true : false}
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

export default EditUserEmailModal;
