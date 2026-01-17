import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import { User } from "../../../generated/graphql";
import { displayFullName } from "../../utils";

import { SettingsUser } from "./ManageUsersContainer";
import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onResetMfa: (userId: string) => void;
  user: SettingsUser | User;
}

const ResetUserMfaModal: React.FC<Props> = ({ onClose, onResetMfa, user }) => {
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
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center sr-legacy-application"
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-sans-lg margin-top-05 margin-bottom-0">
            Reset multi-factor authentication (MFA)
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
            <strong>
              {displayFullName(user.firstName, user.middleName, user.lastName)}
            </strong>{" "}
            will receive an email to reset their multi-factor authentication
            settings to access their SimpleReport account.
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
                onResetMfa(user.id);
                onClose();
              }}
              label="Reset multi-factor authentication"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ResetUserMfaModal;
