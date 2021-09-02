import React, { useRef } from "react";
import Modal from "react-modal";
import { gql, useQuery } from "@apollo/client";

import { displayFullName } from "../../utils";
import { globalSymptomDefinitions } from "../../../patientApp/timeOfTest/constants";
import iconClose from "../../../../node_modules/uswds/dist/img/usa-icons/close.svg";

import AoEForm, { LastTest } from "./AoEForm";

interface LastTestData {
  patient: {
    lastTest: LastTest;
  };
}

export const LAST_TEST_QUERY = gql`
  query GetPatientsLastResult($patientId: ID!) {
    patient(id: $patientId) {
      lastTest {
        dateTested
        result
      }
    }
  }
`;

interface AoEModalProps {
  onClose: () => void;
  patient: any;
  loadState?: any;
  saveCallback: (a: any) => Promise<string | void> | void;
}

const AoEModalForm = (props: AoEModalProps) => {
  const { onClose, patient, loadState = {}, saveCallback } = props;

  const formRef = useRef<HTMLFormElement>(null);

  const symptomsResponse: { [key: string]: boolean } = {};
  globalSymptomDefinitions.forEach(({ value }) => {
    symptomsResponse[value] = false;
  });

  const { data, loading, error } = useQuery<LastTestData, {}>(LAST_TEST_QUERY, {
    fetchPolicy: "no-cache",
    variables: { patientId: patient.internalId },
  });
  if (loading) {
    return null;
  }
  if (error) {
    throw error;
  }
  const lastTest = data?.patient.lastTest;

  const buttonGroup = (
    <div className="sr-time-of-test-buttons">
      {/* <Button variant="unstyled" label="Cancel" onClick={onClose} /> */}
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
      isOpen={true}
      style={{
        content: {
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Test questionnaire"
      ariaHideApp={process.env.NODE_ENV !== "test"}
    >
      <div className="display-flex flex-justify">
        <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
          {displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )}
        </h1>
        {buttonGroup}
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-1"></div>
      <h2 className="font-heading-lg margin-top-205 margin-bottom-0">
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
        formRef={formRef}
        lastTest={lastTest}
      />
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
