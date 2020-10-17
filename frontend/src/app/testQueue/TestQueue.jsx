import React from "react";
import { Link, useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import Button from "../commonComponents/Button";
import { testResultPropType } from "../propTypes";
import { useSelector } from "react-redux";
import { getPatientsByIds } from "../patients/patientSelectors";
import { getPatientsInTestQueue } from "../testQueue/testQueueSelectors";
import QueueItem from "./QueueItem";

const TestQueue = () => {
  const location = useLocation();

  const patientIdsInTestQueue = useSelector(getPatientsInTestQueue);
  const patients = useSelector(getPatientsByIds(patientIdsInTestQueue));

  const createQueueItems = (patients) =>
    Object.keys(patients).length > 0
      ? Object.values(patients).map((patient) => (
          <QueueItem key={`patient-${uuidv4()}`} patient={patient} />
        ))
      : null;

  // const noPatientsContainer = (
  //   <React.Fragment>
  //     <div className="prime-container prime-center">
  //       <p>You have no patients in the testing queue </p>
  //     </div>
  //   </React.Fragment>
  // );

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
        {createQueueItems(patients)}
        {/* {noPatientsContainer} */}
      </div>
    </main>
  );
};

TestQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestQueue;
