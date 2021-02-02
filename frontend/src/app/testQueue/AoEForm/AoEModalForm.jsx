import React from "react";
import Modal from "react-modal";
import AoEForm from "./AoEForm";

const AoEModalForm = ({
  saveButtonText = "Save",
  onClose,
  patient,
  facilityId,
  loadState = {},
  saveCallback,
}) => {
  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          inset: "3em auto auto auto",
          overflow: "auto",
          maxHeight: "90vh",
          width: "50%",
          minWidth: "20em",
          marginRight: "50%",
          transform: "translate(50%, 0)",
        },
      }}
      overlayClassName="prime-modal-overlay"
      contentLabel="Time of Test Questions"
    >
      <AoEForm
        saveButtonText="Save"
        onClose={onClose}
        patient={patient}
        facilityId={facilityId}
        loadState={loadState}
        saveCallback={saveCallback}
        isModal={true}
        noValidation={true}
      ></AoEForm>
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
