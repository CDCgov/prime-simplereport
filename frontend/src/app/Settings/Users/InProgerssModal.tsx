import React, { useState } from "react";
import Modal from "react-modal";
import Button from "../../commonComponents/Button";
import RadioGroup from "../../commonComponents/RadioGroup";

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
          inset: "3em auto auto auto",
          overflow: "auto",
          margin: "0 auto",
          display: "block",
          width: "30%",
          minWidth: "10em",
        },
      }}
      overlayClassName="prime-modal-overlay"
      contentLabel="Time of Test Questions"
    >
      <div className="display-flex flex-align-center flex-justify-center">
        <div className="flex-column flex-wrap">
          <h3> You have unsaved changes, are you sure you want to proceed? </h3>
        </div>

        <div className="flex-column flex-wrap">
          <Button onClick={onClose} label="Go back" />
          <Button onClick={onContinue} label="Continue anyway" />
        </div>
      </div>
    </Modal>
  );
};

export default InProgressModal;
