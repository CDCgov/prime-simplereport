import React from "react";
import { Link, useLocation } from "react-router-dom";

import Button from "../commonComponents/Button";
import { testResultPropType } from "../propTypes";
import { useSelector } from "react-redux";
import { getPatients } from "../patients/selectors";
import QueueItem from "./QueueItem";
import { v4 as uuidv4 } from "uuid";

const TestQueue = () => {
  const patients = useSelector(getPatients); // TODO: only get patients in the queue
  const location = useLocation();

  const createQueueItems = (patients) => {
    return Object.keys(patients).length > 0
      ? [
          <QueueItem
            key={`patient-${uuidv4()}`}
            patient={patients["abc123"]}
          />,
          <QueueItem
            key={`patient-${uuidv4()}`}
            patient={patients["def456"]}
          />,
        ]
      : null;
  };

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
