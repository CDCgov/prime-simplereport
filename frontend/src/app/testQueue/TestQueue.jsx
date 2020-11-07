import React from "react";
import { v4 as uuidv4 } from "uuid";
import { testResultPropType } from "../propTypes";
import { useSelector } from "react-redux";

import { getDetailedPatientsInTestQueue } from "../testQueue/testQueueSelectors";
import { getDevicesArray } from "../devices/deviceSelectors";
import AddToQueue from "./addToQueue/AddToQueue";
import QueueItem from "./QueueItem";

const TestQueue = () => {
  const patients = useSelector(getDetailedPatientsInTestQueue);
  const devices = useSelector(getDevicesArray);

  let shouldRenderQueue = Object.keys(patients).length > 0;
  const createQueueItems = (patients) =>
    shouldRenderQueue ? (
      Object.values(patients).map((patient) => (
        <QueueItem
          key={`patient-${uuidv4()}`}
          patient={patient}
          devices={devices}
        />
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

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <AddToQueue />
        </div>
        {createQueueItems(patients)}
      </div>
    </main>
  );
};

TestQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestQueue;
