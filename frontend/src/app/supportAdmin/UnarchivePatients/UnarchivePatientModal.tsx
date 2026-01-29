import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import { displayFullName } from "../../utils";
import { unarchivePatientTitle } from "../pageTitles";

import { UnarchivePatientPatient } from "./UnarchivePatient";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUnarchivePatientConfirmation: (patientId: string) => void;
  patient: UnarchivePatientPatient | undefined;
}

const UnarchivePatientModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUnarchivePatientConfirmation,
  patient,
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
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-sans-lg margin-top-05 margin-bottom-0">
            {unarchivePatientTitle}
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
            Are you sure you want to unarchive{" "}
            <strong>
              {displayFullName(
                patient?.firstName,
                patient?.middleName,
                patient?.lastName
              )}
            </strong>
            ?
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
                onUnarchivePatientConfirmation(patient?.internalId as string);
                onClose();
              }}
              label="Yes, I'm sure"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UnarchivePatientModal;
