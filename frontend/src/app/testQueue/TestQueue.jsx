import React from "react";
import { v4 as uuidv4 } from "uuid";

import { testResultPropType } from "../propTypes";
import { useSelector } from "react-redux";
import { getPatientsInTestQueue } from "../testQueue/testQueueSelectors";
import QueueItem from "./QueueItem";
import AddToQueue from "./addToQueue/AddToQueue";

const TestQueue = () => {
  const patients = useSelector(getPatientsInTestQueue);

  const noPatientsContainer = (
    <React.Fragment>
      <div className="prime-container prime-center">
        <p>You have no patients in the testing queue </p>
      </div>
    </React.Fragment>
  );
  const createQueueItems = (patients) =>
    Object.keys(patients).length > 0
      ? Object.values(patients).map((patient) => (
          <QueueItem key={`patient-${uuidv4()}`} patient={patient} />
        ))
      : noPatientsContainer;

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <AddToQueue />
          {createQueueItems(patients)}
        </div>
      </div>
    </main>
  );
};

TestQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestQueue;
