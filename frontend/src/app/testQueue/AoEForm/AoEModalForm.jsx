import { React, useState } from "react";
import QRCode from "react-qr-code";
import Modal from "react-modal";
import AoEForm from "./AoEForm";
import RadioGroup from "../../commonComponents/RadioGroup";
import { displayFullName } from "../../utils";
import iconClose from "../../../../node_modules/uswds/dist/img/close.svg";

const AoEModalForm = ({
  saveButtonText = "Save",
  onClose,
  patient,
  facilityId,
  loadState = {},
  saveCallback,
  qrCodeValue = "https://www.google.com",
}) => {
  const [modalView, setModalView] = useState(null);
  const modalViewValues = [
    { label: "Complete on smartphone", value: "smartphone" },
    { label: "Complete questionnaire verbally", value: "verbal" },
  ];
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
      <div className="display-flex flex-justify">
        <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
          {displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )}
        </h1>
        <button
          class="usa-nav__close display-block margin-top-neg-2 margin-right-neg-205 margin-bottom-0"
          onClick={onClose}
        >
          <img src={iconClose} alt="Close" />
        </button>
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      <h2 className="font-heading-lg margin-top-205 margin-bottom-0">
        Test questionnaire
      </h2>
      <RadioGroup
        legend="How would you like to complete the questionnaire?"
        name="qr-code"
        type="radio"
        onChange={(evt) => setModalView(evt.currentTarget.value)}
        buttons={modalViewValues}
        selectedRadio={modalView}
        className="margin-top-205"
      />
      <section className="display-flex flex-justify-center margin-top-4 padding-top-5 border-top border-base-lighter">
        <div className="text-center">
          <p className="font-body-lg margin-y-0">
            Point your camera at the QR code <br />
            to access the questionnaire
          </p>
          <QRCode className="text-align-center" value={qrCodeValue} />
        </div>
      </section>
      <AoEForm
        saveButtonText="Continue"
        onClose={onClose}
        patient={patient}
        facilityId={facilityId}
        loadState={loadState}
        saveCallback={saveCallback}
        isModal={true}
      />
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
