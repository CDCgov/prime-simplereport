import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { gql, useMutation } from "@apollo/client";

import Modal from "react-modal";
import Alert from "../commonComponents/Alert";
import { Button } from "@cmsgov/design-system";

import Anchor from "../commonComponents/Anchor";
import AoeModalForm from "./AoEForm/AoEModalForm";
import Dropdown from "../commonComponents//Dropdown";
import LabeledText from "../commonComponents//LabeledText";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { ALERT_CONTENT } from "../testQueue/constants";
import { displayFullName } from "../utils";
import { patientPropType, devicePropType } from "../propTypes";
import { QUEUE_NOTIFICATION_TYPES } from "../testQueue/constants";
import { showNotification } from "../utils";
import AskOnEntryTag, { areAnswersComplete } from "./AskOnEntryTag";

const REMOVE_PATIENT_FROM_QUEUE = gql`
  mutation($patientId: String!) {
    removePatientFromQueue(patientId: $patientId)
  }
`;

const SUBMIT_TEST_RESULT = gql`
  mutation($patientId: String!, $deviceId: String!, $result: String!) {
    addTestResult(patientId: $patientId, deviceId: $deviceId, result: $result)
  }
`;

const UPDATE_AOE = gql`
  mutation(
    $patientId: String!
    $symptoms: String
    $symptomOnset: String
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: String
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
  ) {
    updateTimeOfTestQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      symptoms: $symptoms
      noSymptoms: $noSymptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
    )
  }
`;

const AreYouSure = ({ patientName, cancelHandler, continueHandler }) => (
  <Modal
    isOpen={true}
    style={{
      content: {
        top: "50%",
        left: "50%",
        width: "40%",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
      },
    }}
    overlayClassName={"prime-modal-overlay"}
    contentLabel="Questions not answered"
  >
    <p className="usa-prose prime-modal-text">
      Time of test questions for <b> {` ${patientName} `} </b> have not been
      completed. Do you want to submit results anyway?
    </p>
    <div className="prime-modal-buttons">
      <Button onClick={cancelHandler} variation="transparent">
        No, go back
      </Button>
      <Button onClick={continueHandler}>Submit Anyway</Button>
    </div>
  </Modal>
);
Modal.setAppElement("#root");

const QueueItem = ({
  patient,
  devices,
  askOnEntry,
  selectedDeviceId,
  selectedTestResult,
  defaultDevice,
  refetchQueue,
}) => {
  const [removePatientFromQueue] = useMutation(REMOVE_PATIENT_FROM_QUEUE);
  const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT);
  const [updateAoe] = useMutation(UPDATE_AOE);

  const [isAoeModalOpen, updateIsAoeModalOpen] = useState(false);
  const [aoeAnswers, setAoeAnswers] = useState(askOnEntry);

  const [deviceId, updateDeviceId] = useState(
    selectedDeviceId || defaultDevice.internalId
  );
  const [testResultValue, updateTestResultValue] = useState(selectedTestResult);

  const [isConfirmationModalOpen, updateIsConfirmationModalOpen] = useState(
    false
  );
  let forceSubmit = false;

  const testResultsSubmitted = () => {
    let { type, title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
        patient
      ),
    };
    let alert = <Alert type={type} title={title} body={body} />;
    showNotification(toast, alert);
    refetchQueue();
  };

  const onTestResultSubmit = (e) => {
    if (e) e.preventDefault();
    if (forceSubmit || areAnswersComplete(aoeAnswers)) {
      submitTestResult({
        variables: {
          patientId: patient.internalId,
          deviceId: deviceId,
          result: testResultValue,
        },
      }).then(
        (_response) => testResultsSubmitted(),
        (error) => console.error("error submitting test results", error)
      );
    } else {
      updateIsConfirmationModalOpen(true);
    }
  };

  const onDeviceChange = (e) => {
    updateDeviceId(e.target.value);
  };

  const removeFromQueue = (patientId) => {
    removePatientFromQueue({
      variables: {
        patientId,
      },
    }).then(
      (_response) => refetchQueue(),
      (error) => console.error("error removing patient from queue", error)
    );
  };

  const onTestResultChange = (newTestResultValue) => {
    updateTestResultValue(newTestResultValue);
  };

  const onClearClick = (e) => {
    e.preventDefault();
    onTestResultChange(null);
  };

  const openAoeModal = () => {
    updateIsAoeModalOpen(true);
  };

  const closeAoeModal = () => {
    updateIsAoeModalOpen(false);
  };

  const saveAoeCallback = (answers) => {
    setAoeAnswers(answers);
    updateAoe({
      variables: {
        patientId: patient.internalId,
        noSymptoms: answers.noSymptoms,
        symptoms: answers.symptoms,
        symptomOnset: answers.symptomOnset,
        pregnancy: answers.pregnancy,
        firstTest: answers.firstTest,
        priorTestDate: answers.priorTestDate,
        priorTestType: answers.priorTestType,
        priorTestResult: answers.priorTestResult,
      },
    }).then(
      (_response) => {
        refetchQueue();
      },
      (error) => console.error("error saving aoe", error)
    );
  };

  let options = devices.map((device) => ({
    label: device.name,
    value: device.internalId,
  }));
  options.unshift({
    label: "Select Device",
    value: null,
  });

  const patientFullName = displayFullName(
    patient.firstName,
    patient.middleName,
    patient.lastName
  );

  const closeButton = (
    <div
      onClick={() => removeFromQueue(patient.internalId)}
      className="prime-close-button"
    >
      <span className="fa-layers">
        <FontAwesomeIcon icon={"circle"} size="2x" inverse />
        <FontAwesomeIcon icon={"times-circle"} size="2x" />
      </span>
    </div>
  );

  return (
    <React.Fragment>
      <div className="grid-container prime-container prime-queue-item usa-card__container">
        {closeButton}
        <div className="grid-row">
          <div className="tablet:grid-col-9">
            <div className="grid-row prime-test-name usa-card__header">
              <h2>{patientFullName}</h2>
            </div>
            <div className="grid-row usa-card__body">
              <ul className="prime-ul">
                <li className="prime-li">
                  <LabeledText text={patient.lookupId} label="Unique ID" />
                </li>
                <li className="prime-li">
                  <LabeledText text={patient.telephone} label="Phone Number" />
                </li>
                <li className="prime-li">
                  <LabeledText text={patient.birthDate} label="Date of Birth" />
                </li>
                <li className="prime-li">
                  <Anchor
                    text="Time of Test Questions"
                    onClick={openAoeModal}
                  />
                  {isAoeModalOpen && (
                    <AoeModalForm
                      onClose={closeAoeModal}
                      patient={patient}
                      loadState={aoeAnswers}
                      saveCallback={saveAoeCallback}
                    />
                  )}
                  <p>
                    <AskOnEntryTag aoeAnswers={aoeAnswers} />
                  </p>
                </li>
              </ul>
            </div>
            <div className="grid-row usa-card__footer">
              <form className="usa-form">
                <Dropdown
                  options={options}
                  label="Device"
                  name="testDevice"
                  selectedValue={deviceId}
                  onChange={onDeviceChange}
                />
              </form>
            </div>
          </div>
          <div className="tablet:grid-col-3 prime-test-result">
            {isConfirmationModalOpen && (
              <AreYouSure
                patientName={patientFullName}
                cancelHandler={() => updateIsConfirmationModalOpen(false)}
                continueHandler={() => {
                  forceSubmit = true;
                  onTestResultSubmit();
                }}
              />
            )}
            <TestResultInputForm
              testResultValue={testResultValue}
              onSubmit={onTestResultSubmit}
              onChange={onTestResultChange}
              onClearClick={onClearClick}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

QueueItem.propTypes = {
  patient: patientPropType,
  devices: PropTypes.arrayOf(devicePropType),
};
export default QueueItem;
