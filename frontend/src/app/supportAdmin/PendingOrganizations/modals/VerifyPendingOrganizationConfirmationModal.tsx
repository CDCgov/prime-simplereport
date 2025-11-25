import React from "react";

import Modal from "../../../commonComponents/Modal";
import Button from "../../../commonComponents/Button/Button";

import { VerifyConfirmationModalProps } from "./modal_utils";

const VerifyPendingOrganizationConfirmationModal: React.FC<
  VerifyConfirmationModalProps
> = ({
  onVerifyConfirm,
  onClose,
  onGoBackClick,
  organization,
  isLoading,
  isVerifying,
  isUpdating,
  isOpen,
}) => {
  const isButtonDisabled = isLoading || isVerifying || isUpdating;
  return (
    <Modal
      showModal={isOpen}
      title="Verify organization"
      contentLabel="Verify organization"
      onClose={onClose}
    >
      <Modal.Header styleClassNames={"margin-top-0 margin-bottom-205"}>
        Verify organization
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      <p>
        Are you sure you want to verify <strong>{organization?.name}</strong>?
      </p>
      <p>
        Doing so will allow the organization to create an account and report
        tests.
      </p>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-205"
          onClick={onGoBackClick}
          variant="unstyled"
          label="No, go back"
          disabled={isButtonDisabled}
        />
        <Button
          className="margin-right-0"
          id="verify-confirmation"
          label="Yes, I'm sure"
          onClick={onVerifyConfirm}
          disabled={isButtonDisabled}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default VerifyPendingOrganizationConfirmationModal;
