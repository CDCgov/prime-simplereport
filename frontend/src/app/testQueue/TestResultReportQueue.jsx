import React from "react";
import { Link, useLocation } from "react-router-dom";

// import RadioGroup from "../common/components/RadioGroup";
import Button from "../common/components/Button";
import { testResultPropType } from "../propTypes";
// import { COVID_RESULTS } from "../constants";
import { useSelector } from "react-redux";
import { getPatients } from "../patients/selectors";
import LabeledText from "../common/components/LabeledText";

const TestResultReportQueue = () => {
  const patients = useSelector(getPatients); // TODO: only get patients in the queue
  const location = useLocation();

  const createReportUnit = (patient) => {
    return (
      <React.Fragment>
        <div className="prime-container">
          <LabeledText text={patient.patientId} label="Unique Id" />
        </div>
      </React.Fragment>
    );
  };

  const createReportUnits = (patients) => {
    return Object.keys(patients).length > 0
      ? [createReportUnit(patients[123]), createReportUnit(patients[234])]
      : null;
  };

  const noPatientsContainer = (
    <React.Fragment>
      <div className="prime-container prime-center">
        <p>You have no patients in the testing queue </p>
      </div>
    </React.Fragment>
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="grid-col">
            <div className="prime-right-align">
              <Link to={`${location.pathname}/add`}>
                <Button type="button" onClick={() => {}} label="Add To Queue" />
              </Link>
            </div>
          </div>
        </div>
        {/* {createReportUnits(patients)} */}
        {noPatientsContainer}
        {/* <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <div className="prime-container">
              <h2> Patient Summary </h2>
              {patientSummary(testResult)}
            </div>
          </div>
          <div className="tablet:grid-col">
            <div className="prime-container">
              <form className="usa-form">
                <h2> SARS-CoV-2 Results </h2>
                {testResultDetails(testResult)}
              </form>
            </div>
          </div>
        </div>
      </div> */}
      </div>
    </main>
  );
};

TestResultReportQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestResultReportQueue;
