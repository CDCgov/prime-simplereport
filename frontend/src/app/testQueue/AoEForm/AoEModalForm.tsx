import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import Modal from "react-modal";
import AoEForm from "./AoEForm";
import Button from "../../commonComponents/Button";
import RadioGroup from "../../commonComponents/RadioGroup";
import { displayFullName } from "../../utils";
import { globalSymptomDefinitions } from "../../../patientApp/timeOfTest/constants";
import { getUrl } from "../../utils/url";
import { gql, useQuery } from "@apollo/client";

interface LastTestData {
  patient: {
    lastTest: {
      dateTested: string;
      result: string;
    };
  };
}

export const LAST_TEST_QUERY = gql`
  query GetPatientsLastResult($patientId: String!) {
    patient(id: $patientId) {
      lastTest {
        dateTested
        result
      }
    }
  }
`;

interface Props {
  saveButtonText?: string;
  onClose: () => void;
  patient: any;
  loadState?: any;
  saveCallback: (a: any) => string | void;
  qrCodeValue?: string;
}

const AoEModalForm = (props: Props) => {
  const {
    saveButtonText = "Continue",
    onClose,
    patient,
    loadState = {},
    saveCallback,
    qrCodeValue,
  } = props;

  const [modalView, setModalView] = useState("");
  const [patientLink, setPatientLink] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const modalViewValues = [
    { label: "Complete on smartphone", value: "smartphone" },
    { label: "Complete questionnaire verbally", value: "verbal" },
  ];

  const symptomsResponse: { [key: string]: boolean } = {};
  globalSymptomDefinitions.forEach(({ value }) => {
    symptomsResponse[value] = false;
  });

  const patientResponse = {
    firstTest: false,
    noSymptoms: false,
    pregnancy: undefined,
    priorTestDate: undefined,
    priorTestResult: null,
    priorTestType: undefined,
    symptomOnset: undefined,
    symptoms: JSON.stringify(symptomsResponse),
  };

  const continueModal = () => {
    // No need to save form if in "smartphone" mode
    if (modalView === "smartphone") {
      return onClose();
    }
    // Save default if form doesn't exist, otherwise submit form
    if (!formRef?.current) {
      saveCallback(patientResponse);
    } else {
      formRef.current.dispatchEvent(new Event("submit"));
    }
    onClose();
  };

  const chooseModalView = async (view: string) => {
    if (view === "smartphone") {
      // if we already have a truthy qrCodeValue, we do not need to save the test order to generate a PLID
      setPatientLink(
        qrCodeValue ||
          `${getUrl()}pxp?plid=${await saveCallback(patientResponse)}`
      );
    }
    setModalView(view);
  };

  const buttonGroup = (
    <div className="sr-time-of-test-buttons">
      <Button variant="unstyled" label="Cancel" onClick={onClose} />
      <Button
        className="margin-right-0"
        label={saveButtonText}
        type={"button"}
        onClick={() => continueModal()}
      />
    </div>
  );

  const { data, loading, error } = useQuery<LastTestData, {}>(LAST_TEST_QUERY, {
    fetchPolicy: "no-cache",
    variables: { patientId: patient.internalId },
  });
  if (loading) return null;
  if (error) throw error;
  const lastTest = data?.patient.lastTest;

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
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
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
        {buttonGroup}
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      {process.env.REACT_APP_PATIENT_EXPERIENCE_ENABLED === "true" ? (
        <>
          <h2 className="font-heading-lg margin-top-205 margin-bottom-0">
            Test questionnaire
          </h2>
          <RadioGroup
            legend="How would you like to complete the questionnaire?"
            name="qr-code"
            type="radio"
            onChange={(evt) => chooseModalView(evt.currentTarget.value)}
            buttons={modalViewValues}
            selectedRadio={modalView}
            className="margin-top-205"
          />
          {modalView === "smartphone" && (
            <>
              <section className="display-flex flex-justify-center margin-top-4 padding-top-5 border-top border-base-lighter">
                <div className="text-center">
                  <p className="font-body-lg margin-y-0">
                    Point your camera at the QR code <br />
                    to access the questionnaire
                  </p>
                  <div
                    className="margin-top-205"
                    id="patient-link-qr-code"
                    data-patient-link={patientLink}
                  >
                    <QRCode value={patientLink} size={190} />
                  </div>
                </div>
              </section>
              <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
                <Button
                  className="margin-right-205"
                  label={saveButtonText}
                  type={"button"}
                  onClick={() => continueModal()}
                />
              </div>
            </>
          )}
          {modalView === "verbal" && (
            <AoEForm
              saveButtonText="Continue"
              onClose={onClose}
              patient={patient}
              lastTest={lastTest}
              loadState={loadState as any}
              saveCallback={saveCallback}
              isModal={true}
              noValidation={true}
              formRef={formRef}
            />
          )}
        </>
      ) : (
        <AoEForm
          saveButtonText="Continue"
          onClose={onClose}
          patient={patient}
          loadState={loadState as any}
          saveCallback={saveCallback}
          lastTest={lastTest}
          isModal={true}
          noValidation={true}
          formRef={formRef}
        />
      )}
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
