import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import Modal from "react-modal";

import Button from "../../../commonComponents/Button/Button";
import { PendingOrganization } from "../../../../generated/graphql";

interface VerifyConfirmationModalProps {
  onVerifyConfirm: () => void;
  onClose: () => void;
  setVerifyConfirmation: (verify: boolean) => void;
  organization: PendingOrganization;
  isLoading: boolean;
}

const VerifyPendingOrganizationConfirmationModal: React.FC<
  VerifyConfirmationModalProps
> = ({
  onVerifyConfirm,
  onClose,
  setVerifyConfirmation,
  organization,
  isLoading,
}) => {
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
      contentLabel="Verify organization"
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Verify organization
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
            Are you sure you want to verify <strong>{organization.name}</strong>
            ?
          </p>
          <p>
            Doing so will allow the organization to create an account and
            conduct and submit tests.
          </p>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={() => {
                setVerifyConfirmation(false);
              }}
              variant="unstyled"
              label="No, go back"
              disabled={isLoading}
            />
            <Button
              className="margin-right-205"
              id="verify-confirmation"
              label="Yes, I'm sure"
              onClick={onVerifyConfirm}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default VerifyPendingOrganizationConfirmationModal;
