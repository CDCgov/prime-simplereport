import React from "react";
import Modal from "react-modal";
import AoEForm from "./AoEForm";
import RadioGroup from  "../../commonComponents/RadioGroup";
import { useState } from "react";
import { displayFullName } from "../../utils";

const AoEModalForm = ({
  saveButtonText = "Save",
  onClose,
  patient,
  facilityId,
  loadState = {},
  saveCallback,
}) => {
  const [modalView, setModalView] = useState(
    null
  );
  const modalViewValues = [{label: "Complete on smartphone", value: "smartphone"}, {label: "Complete questionnaire verbally", value: "verbal"}]
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
      <h1 className="patient-name">
        {displayFullName(
          patient.firstName,
          patient.middleName,
          patient.lastName
        )}
      </h1>
      <h2>Test questionnaire</h2>
      <RadioGroup
        legend="How would you like to complete the questionnaire?"
        name="qr-code"
        type="radio"
        onChange={(evt) => setModalView(evt.currentTarget.value)}
        buttons={modalViewValues}
        selectedRadio={modalView}
      />
      <section className="border-top border-base-lighter">
        <p className="font-body-lg">Point your camera at the QR code to access the questionnaire</p>
        <img src="" alt="qr code"/>
      </section>
      <AoEForm
        saveButtonText="Save"
        onClose={onClose}
        patient={patient}
        facilityId={facilityId}
        loadState={loadState}
        saveCallback={saveCallback}
        isModal={true}
      ></AoEForm>
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
