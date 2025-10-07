import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";

import { SettingsUser } from "./ManageUsersContainer";
import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onDeleteUser: (userId: string) => void;
  user: SettingsUser;
}

const DeleteUserModal: React.FC<Props> = ({ onClose, onDeleteUser, user }) => {
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
      ariaHideApp={import.meta.env.MODE !== "test"}
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Remove user
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
            Are you sure you want to remove{" "}
            <strong>
              {displayFullName(user.firstName, user.middleName, user.lastName)}
            </strong>
            ?
          </p>
          <p>
            Doing so will remove this person's access to SimpleReport. It
            doesn't reset their account settings or password.
          </p>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={onClose}
              variant="unstyled"
              label="No, go back"
            />
            <Button
              className="margin-right-205"
              onClick={() => {
                onDeleteUser(user.id);
                onClose();
              }}
              label="Yes, I'm sure"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
