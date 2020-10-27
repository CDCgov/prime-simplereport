import React, { useState } from "react";
import { useDispatch } from "react-redux";

import LabeledText from "../commonComponents//LabeledText";
import Dropdown from "../commonComponents//Dropdown";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { patientPropType } from "../propTypes";
import { removePatientFromQueue } from "./state/testQueueActions";
import { submitTestResult } from "../testResults/state/testResultActions";
import { DEVICES } from "../devices/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Anchor from "../commonComponents/Anchor";
import AoeModalForm from "./AoEModalForm";
import { displayFullName } from "../utils";

const QueueItem = ({ patient }) => {
  const dispatch = useDispatch();

  const [isAoeModalOpen, updateIsAoeModalOpen] = useState(false);

  const [deviceId, updateDeviceId] = useState(null);
  const [testResultValue, updateTestResultValue] = useState(null);

  const onTestResultSubmit = (e) => {
    e.preventDefault();
    let testResultToSubmit = { deviceId: deviceId, testResultValue };
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

  const openAoeModal = () => {
    updateIsAoeModalOpen(true);
  };

  const closeAoeModal = () => {
    updateIsAoeModalOpen(false);
  };

  let options = Object.entries(DEVICES).map(([deviceId, { displayName }]) => {
    return {
      label: displayName,
      value: deviceId,
    };
  });
  options.unshift({
    label: "Select Device",
    value: null,
  });

  const closeButton = (
    <div
      onClick={() => removeFromQueue(patient.patientId)}
      className="prime-close-button"
    >
      <FontAwesomeIcon icon={"times-circle"} size="2x" />
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
                  <AoeModalForm
                    isOpen={isAoeModalOpen}
                    onClose={closeAoeModal}
                    patient={patient}
                  />
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
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

QueueItem.propTypes = {
  patient: patientPropType,
};
export default QueueItem;
