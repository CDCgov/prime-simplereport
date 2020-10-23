import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import LabeledText from "../commonComponents//LabeledText";
import Dropdown from "../commonComponents//Dropdown";
import Button from "../commonComponents/Button";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { patientPropType } from "../propTypes";
import { getTestResultById } from "../testResults/testResultsSelector";
import { removePatientFromQueue } from "./state/testQueueActions";

const QueueItem = ({ patient }) => {
  const dispatch = useDispatch();

  // 1. grab device from store
  // 2. grab testReuslt from store

  const [device, updatedDevice] = useState(null);
  const [testResultValue, updateTestResultValue] = useState(null);

  //   useEffect(() => {
  // dispatch(loadTestResult(patientId));
  //   }, [patientId, dispatch]);

  const onSubmit = (e) => {
    e.preventDefault();
    // grab selectedTestResult
    // grab selected device
    // dispatch(submitTestResult());
  };

  const onDeviceChange = (selectedDevice) => {
    updatedDevice(selectedDevice);
  };

  const removeFromQueue = (patientId) => {
    dispatch(removePatientFromQueue(patientId));
  };

  const onTestResultChange = (newTestResultValue) => {
    updateTestResultValue(newTestResultValue);
  };

  // useEffect{
  //   dispatch(loadPatients(organizationId));
  // }, [organizationId, dispatch]);

  const testResult = useSelector(getTestResultById(patient.testResultId));

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
                options={[
                  { text: "Abbott ID Now", value: "abbottIdNow" },
                  { text: "Some other device", value: "someOtherDeviceValue" },
                ]}
                label="Device"
                name="testDevice"
                selectedValue={device}
                onChange={(e) => onDeviceChange(e.target.value)}
              />
            </div>
          </div>
          <div className="tablet:grid-col-3 prime-test-result prime-container-padding">
            <TestResultInputForm
              testResultValue={testResultValue}
              onSubmit={onSubmit}
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
