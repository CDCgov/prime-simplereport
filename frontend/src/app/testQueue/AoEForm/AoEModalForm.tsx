import Modal from "react-modal";

import { displayFullName } from "../../utils";
import { globalSymptomDefinitions } from "../../../patientApp/timeOfTest/constants";
import iconClose from "../../../img/close.svg";

import AoEForm from "./AoEForm";

interface AoEModalProps {
  onClose: () => void;
  isOpen: boolean;
  patient: any;
  loadState?: any;
  saveCallback: (a: any) => Promise<string | void> | void;
}

const AoEModalForm = (props: AoEModalProps) => {
  const { onClose, isOpen, patient, loadState = {}, saveCallback } = props;

  const symptomsResponse: { [key: string]: boolean } = {};
  globalSymptomDefinitions.forEach(({ value }) => {
    symptomsResponse[value] = false;
  });

  const buttonGroup = (
    <div className="sr-time-of-test-buttons">
      <button
        className="modal__close-button"
        style={{ cursor: "pointer" }}
        onClick={onClose}
      >
        <img className="modal__close-img" src={iconClose} alt="Close" />
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      style={{
        content: {
          position: "initial",
        },
      }}
      onRequestClose={onClose}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Test questionnaire"
      ariaHideApp={import.meta.env.MODE !== "test"}
    >
      {isOpen && (
        <main aria-labelledby="aoe-form-title">
          <div className="display-flex flex-justify">
            <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
              {displayFullName(
                patient?.firstName,
                patient?.middleName,
                patient?.lastName
              )}
            </h1>
            {buttonGroup}
          </div>
          <div className="border-top border-base-lighter margin-x-neg-205 margin-top-1"></div>
          <h2
            id="aoe-form-title"
            className="font-heading-lg margin-top-205 margin-bottom-0"
          >
            Test questionnaire
          </h2>
          <AoEForm
            saveButtonText="Continue"
            onClose={onClose}
            patient={patient}
            loadState={loadState}
            saveCallback={saveCallback}
            isModal={true}
            noValidation={true}
          />
        </main>
      )}
    </Modal>
  );
};

export default AoEModalForm;
