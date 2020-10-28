import React from "react";
import { v4 as uuidv4 } from "uuid";
import { testResultPropType } from "../propTypes";
import { useSelector } from "react-redux";

import { getDetailedPatientsInTestQueue } from "../testQueue/testQueueSelectors";
import AddToQueue from "./addToQueue/AddToQueue";
import QueueItem from "./QueueItem";
import QueueNotification from "./QueueNotification";

const TestQueue = () => {
  const patients = useSelector(getDetailedPatientsInTestQueue);

  let shouldRenderQueue = Object.keys(patients).length > 0;
  const createQueueItems = (patients) =>
    shouldRenderQueue ? (
      Object.values(patients).map((patient) => (
        <QueueItem key={`patient-${uuidv4()}`} patient={patient} />
      ))
    ) : (
      <React.Fragment>
        <div className="grid-container prime-center usa-card__container">
          <div className="grid-row">
            <div className="usa-card__body">
              <p>
                There are no people in the queue. Search for people above to add
                them to the queue.
              </p>
            </div>
          </div>
        </div>
      </React.Fragment>
    );

  // <div className="grid-container prime-container prime-queue-item usa-card__container">
  //     {closeButton}
  //     <div className="grid-row">
  //       <div className="tablet:grid-col-9">
  //         <div className="grid-row prime-test-name usa-card__header">

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <AddToQueue />
        </div>
        {createQueueItems(patients)}
        <div className="grid-row">
          <QueueNotification />
        </div>
      </div>
    </main>
  );
};

TestQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestQueue;
