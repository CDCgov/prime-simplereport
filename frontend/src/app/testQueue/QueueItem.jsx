import React from "react";
import { Link, useLocation } from "react-router-dom";

// import RadioGroup from "../common/components/RadioGroup";
import Button from "../common/components/Button";
import { testResultPropType, patientPropType } from "../propTypes";
// import { COVID_RESULTS } from "../constants";
import { useSelector } from "react-redux";
import { getPatients } from "../patients/selectors";
import LabeledText from "../common/components/LabeledText";
import TestResultInputForm from "../testResults/TestResultInputForm";
import Dropdown from "../common/components/Dropdown";

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
        <div class="grid-row">
          <div class="tablet:grid-col-9">
            <div class="grid-row prime-test-name">
              <h1>{patient.firstName} {patient.middleName} {patient.lastName}</h1>
            </div>
            <div class="grid-row">
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
            <div class="grid-row">
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
