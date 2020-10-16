import React from "react";

import { patientPropType } from "../propTypes";
import LabeledText from "../commonComponents//LabeledText";
import TestResultInputForm from "../testResults/TestResultInputForm";
import Dropdown from "../commonComponents//Dropdown";

const QueueItem = ({ patient }) => {
  const onSubmit = (e) => {
    e.preventDefault();
  };

  const onDropdownChange = (e) => {
    console.log(e.target.value);
  };

  return (
    <React.Fragment>
      <div className="grid-container prime-container prime-queue-item">
        <div className="grid-row">
          <div className="tablet:grid-col-9">
            <div className="grid-row prime-test-name">
              <h1> John Doe</h1>
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
            <TestResultInputForm testResult={{}} onSubmit={onSubmit} />
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
