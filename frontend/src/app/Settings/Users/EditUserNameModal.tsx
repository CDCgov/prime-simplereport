import React, { useState } from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { TextInput } from "../../commonComponents/TextInput";

import { SettingsUser } from "./ManageUsersContainer";

import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onEditUserName: (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string
  ) => void;
  user: SettingsUser;
}

const EditUserNameModal: React.FC<Props> = ({
  onClose,
  onEditUserName,
  user,
}) => {
  const [firstName, updateFirstName] = useState(user.firstName || "");
  const [middleName, updateMiddleName] = useState(user.middleName || "");
  const [lastName, updateLastName] = useState(user.lastName);
  const [lastNameError, setLastNameError] = useState("");

  const validateLastName = () => {
    if (lastName === "") {
      setLastNameError("A last name is required");
    } else {
      setLastNameError("");
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
            Update name for{" "}
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
              label="First name"
              name="firstName"
              value={firstName}
              required={false}
              onChange={(e) => updateFirstName(e.target.value)}
            />
            <TextInput
              label="Middle name"
              name="middleName"
              value={middleName}
              required={false}
              onChange={(e) => updateMiddleName(e.target.value)}
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
              onClick={() =>
                onEditUserName(user.id, firstName, middleName, lastName)
              }
              label="Confirm"
              disabled={lastNameError ? true : false}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default EditUserNameModal;
