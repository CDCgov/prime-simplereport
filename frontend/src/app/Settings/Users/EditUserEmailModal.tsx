import React, { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { TextInput } from "../../commonComponents/TextInput";
import { emailIsValid } from "../../utils/email";

import { SettingsUser } from "./ManageUsersContainer";

import "./ManageUsers.scss";

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
  const [emailAddress, updateEmailAddress] = useState(user.email);
  const [emailAddressError, setEmailAddressError] = useState("");

  const validateEmailAddress = () => {
    if (!emailAddress) {
      setEmailAddressError("Enter your email address");
      return;
    }
    if (emailAddress === user.email) {
      setEmailAddressError("The old and new email addresses must be different");
      return;
    }

    let valid;
    try {
      valid = emailIsValid(emailAddress);
    } catch (e) {
      valid = false;
    }
    if (!valid) {
      setEmailAddressError("Enter a valid email address");
    } else {
      setEmailAddressError("");
    }
  };

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Update email address for{" "}
            {displayFullName(user.firstName, user.middleName, user.lastName)}
          </h1>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
        <div className="grid-row grid-gap">
          <p>
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
          </p>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={onClose}
              variant="unstyled"
              label="Cancel"
            />
            <Button
              className="margin-right-205"
              onClick={() => onEditUserEmail(user.id, emailAddress)}
              label="Confirm"
              disabled={emailAddressError ? true : false}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserEmailModal;
