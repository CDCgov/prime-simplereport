import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Anchor from "../commonComponents/Anchor";
import AoeModalForm from "./AoEModalForm";
import Dropdown from "../commonComponents//Dropdown";
import LabeledText from "../commonComponents//LabeledText";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { displayFullName } from "../utils";
import { patientPropType, devicePropType } from "../propTypes";
import { removePatientFromQueue } from "./state/testQueueActions";
import { submitTestResult } from "../testResults/state/testResultActions";

const QueueItem = ({ patient, devices, askOnEntry }) => {
  const dispatch = useDispatch();

  const [isAoeModalOpen, updateIsAoeModalOpen] = useState(false);
  const [aoeAnswers, setAoeAnswers] = useState(askOnEntry);

  let defaultDevice = devices.find((device) => device.isDefault); // might be null if no devices have been added to the org
  let defaultDeviceId = defaultDevice ? defaultDevice.deviceId : null;
  const [deviceId, updateDeviceId] = useState(defaultDeviceId);
  const [testResultValue, updateTestResultValue] = useState(null);

  const onTestResultSubmit = (e) => {
    e.preventDefault();
    let testResultToSubmit = {
      deviceId: deviceId,
      testResultValue,
      testTimeQuestions: aoeAnswers,
    };
    dispatch(submitTestResult(patient.patientId, testResultToSubmit));
  };

  const onDeviceChange = (e) => {
    updateDeviceId(e.target.value);
  };

  const removeFromQueue = (patientId) => {
    dispatch(removePatientFromQueue(patientId));
  };

  const onTestResultChange = (newTestResultValue) => {
    updateTestResultValue(newTestResultValue);
  };

  const onClearClick = (e) => {
    e.preventDefault();
    onTestResultChange(null);
    updateDeviceId(null);
  };

  const openAoeModal = () => {
    updateIsAoeModalOpen(true);
  };

  const closeAoeModal = () => {
    updateIsAoeModalOpen(false);
  };

  let options = devices.map((device) => ({
    label: device.displayName,
    value: device.deviceId,
  }));
  options.unshift({
    label: "Select Device",
    value: null,
  });

  const closeButton = (
    <div
      onClick={() => removeFromQueue(patient.patientId)}
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
              <h2>
                {displayFullName(
                  patient.firstName,
                  patient.middleName,
                  patient.lastName
                )}
              </h2>
            </div>
            <div className="grid-row usa-card__body">
              <ul className="prime-ul">
                <li className="prime-li">
                  <LabeledText text={patient.patientId} label="Unique ID" />
                </li>
                <li className="prime-li">
                  <LabeledText text={patient.phone} label="Phone Number" />
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
                      saveCallback={setAoeAnswers}
                    />
                  )}
                  <p>
                    <span className="usa-tag">PENDING</span>
                  </p>
                </li>
              </ul>
            </div>
            <div className="grid-row usa-card__footer">
              <Dropdown
                options={options}
                label="Device"
                name="testDevice"
                selectedValue={deviceId}
                onChange={onDeviceChange}
              />
            </div>
          </div>
          <div className="tablet:grid-col-3 prime-test-result">
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
