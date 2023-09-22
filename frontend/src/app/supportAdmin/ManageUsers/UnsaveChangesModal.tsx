import React, { MouseEventHandler } from "react";

import Modal from "../../commonComponents/Modal";
import Button from "../../commonComponents/Button/Button";

export interface UnsavedChangesModalProps {
  closeModal: () => void;
  isShowing: boolean;
  onContinue: MouseEventHandler<HTMLButtonElement>;
}
const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  closeModal,
  isShowing,
  onContinue,
}) => {
  return (
    <Modal
      onClose={closeModal}
      title="Unsaved changes of user access"
      contentLabel="Unsaved changes of user access"
      showModal={isShowing}
    >
      <p className="margin-y-5">
        You have unsaved changes in the user access tab. Do you want to proceed?
      </p>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-205"
          variant="unstyled"
          label="No, go back"
          onClick={closeModal}
        />
        <Button
          className="margin-right-0"
          label="Yes, continue"
          onClick={onContinue}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default UnsavedChangesModal;
