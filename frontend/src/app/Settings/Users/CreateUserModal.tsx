import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";
import Dropdown from "../../commonComponents/Dropdown";

import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onContinue: () => void;
}

const CreateUserModal: React.FC<Props> = ({ onClose, onContinue }) => {
  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          marginRight: "50%",
          overflow: "auto",
          height: "60%",
          width: "50%",
          minWidth: "20em",
          maxHeight: "100vh",
          padding: "0",
          transform: "translate(50%, 33%)",
        },
      }}
      overlayClassName="prime-modal-overlay"
      contentLabel="Unsaved changes to current user"
    >
      <div className="border-0 usa-card__container">
        <div className="usa-card__header display-flex flex-justify ">
          <h1 className="margin-0"> Invite new user </h1>
          <button
            onClick={() => {}}
            className="close-button"
            aria-label="Close"
          >
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="usa-card__body">
          <div className="grid-row grid-gap">
            <TextInput
              name="firstName"
              className="grid-col"
              label="First Name"
              value={"hi"}
              required
              onChange={() => {}}
            />
            <TextInput
              name="lastName"
              label="Last Name"
              className="grid-col"
              value={"hi"}
              required
              onChange={() => {}}
            />
          </div>
          <div className="grid-row">
            <TextInput
              type="email"
              label="Email Address"
              name="email"
              className="grid-col"
              value={"hi"}
              required
              onChange={() => {}}
            />
          </div>
          <div className="grid-row">
            <Dropdown
              options={[
                {
                  value: "hi",
                  label: "hi",
                },
              ]}
              label="Access Level"
              name="newUserAccessLevel"
              selectedValue={""}
              defaultSelect
              className="grid-col"
              onChange={() => {}}
            />
          </div>
        </div>
        <div className="usa-card__footer">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={onClose}
              variant="unstyled"
              label="Go back"
            />
            <Button
              className="margin-right-0"
              onClick={onContinue}
              label="Send Invite"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
