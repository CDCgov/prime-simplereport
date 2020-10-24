import React, { useState } from "react";
import { useDispatch } from "react-redux";

import LabeledText from "../commonComponents//LabeledText";
import Dropdown from "../commonComponents//Dropdown";
import Button from "../commonComponents/Button";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { patientPropType } from "../propTypes";
import { removePatientFromQueue } from "./state/testQueueActions";
import { submitTestResult } from "../testResults/state/testResultActions";
import { DEVICES } from "../devices/constants";

const QueueItem = ({ patient }) => {
  const dispatch = useDispatch();

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

  return (
    <React.Fragment>
      <div className="grid-container prime-container prime-queue-item">
        <Button
          icon="times-circle"
          onClick={() => removeFromQueue(patient.patientId)}
        />
        <div className="grid-row">
          <div className="tablet:grid-col-9">
            <div className="grid-row prime-test-name">
              <h1>
                {patient.firstName} {patient.lastName}
              </h1>
            </div>
            <div className="grid-row">
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
              </ul>
            </div>
            <div className="grid-row">
              <Dropdown
                options={options}
                label="Device"
                name="testDevice"
                selectedValue={deviceId}
                onChange={onDeviceChange}
              />
            </div>
          </div>
          <div className="tablet:grid-col-3 prime-test-result prime-container-padding">
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
