import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button";
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
    >
      <div className="border-0 usa-card__container">
        <div className="usa-card__header display-flex flex-justify modal-bottom-border">
          <h2 className="margin-0"> Delete User </h2>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="usa-card__body modal-bottom-border">
          <div className="grid-row grid-gap">
            <p>
              Are you sure you want to remove{" "}
              <strong>
                {displayFullName(
                  user.firstName,
                  user.middleName,
                  user.lastName
                )}
              </strong>
              ?
            </p>
            <p> Doing so will remove this person's access to SimpleReport.</p>
          </div>
        </div>
        <div className="usa-card__footer">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={onClose}
              variant="unstyled"
              label="No, go back"
            />
            <Button
              className="margin-right-0"
              onClick={() => onDeleteUser(user.id)}
              label="Yes, I'm sure"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
