import React from "react";
import Modal from "react-modal";

import Button from "../../commonComponents/Button/Button";

interface Props {
  onClose: () => void;
  onContinue: () => void;
}

const InProgressModal: React.FC<Props> = ({ onClose, onContinue }) => {
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
        <div className="grid-row grid-gap">
          <p>You have unsaved changes, are you sure you want to proceed?</p>
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
              onClick={onContinue}
              label="Yes, I'm sure"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default InProgressModal;
