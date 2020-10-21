import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { patientPropType } from "../propTypes";
import LabeledText from "../commonComponents//LabeledText";
import TestResultInputForm from "../testResults/TestResultInputForm";
import Dropdown from "../commonComponents//Dropdown";
import { getTestResultById } from "../testResults/testResultsSelector";
import Button from "../commonComponents/Button";
import { removePatientFromQueue } from "./state/testQueueActions";

const QueueItem = ({ patient }) => {
  const onSubmit = (e) => {
    e.preventDefault();
  };

  const onDropdownChange = (e) => {
    console.log(e.target.value);
  };

  const dispatch = useDispatch();

  const removeFromQueue = (patientId) => {
    dispatch(removePatientFromQueue(patientId));
  };

  // useEffect(() => {
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
                onChange={onDropdownChange}
              />
            </div>
          </div>
          <div className="tablet:grid-col-3 prime-test-result prime-container-padding">
            <TestResultInputForm testResult={testResult} onSubmit={onSubmit} />
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
