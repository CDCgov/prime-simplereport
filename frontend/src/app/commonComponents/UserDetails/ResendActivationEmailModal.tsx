import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../Button/Button";
import { displayFullName } from "../../utils";
import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import "../../Settings/Users/ManageUsers.scss";
import { User } from "../../../generated/graphql";

interface Props {
  onClose: () => void;
  onResendActivationEmail: (userId: string) => void;
  user: SettingsUser | User;
  isOpen: boolean;
}

const ResendActivationEmailModal: React.FC<Props> = ({
  onClose,
  onResendActivationEmail,
  user,
  isOpen,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center sr-legacy-application"
      contentLabel="Confirm sending of reactivation email"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-sans-lg margin-top-05 margin-bottom-0">
            Resend account setup email
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
            Do you want to resend an account setup email to{" "}
            <strong>
              {displayFullName(user.firstName, user.middleName, user.lastName)}
            </strong>
            ?
          </p>
          <p>
            Doing so will email this person a new link to set up their account.
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
                onResendActivationEmail(user.id);
                onClose();
              }}
              label="Yes, send email"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ResendActivationEmailModal;
