import React from "react";
import { v4 as uuidv4 } from "uuid";

import { testResultPropType } from "../propTypes";
import { useSelector, useDispatch } from "react-redux";
import {
  getPatientsInTestQueue,
  getQueueNotification,
} from "../testQueue/testQueueSelectors";
import QueueItem from "./QueueItem";
import AddToQueue from "./addToQueue/AddToQueue";
import QueueNotification from "./QueueNotification";
import Expire from "../commonComponents/Expire";
import { clearNotification } from "./state/testQueueActions";

const TestQueue = () => {
  const patients = useSelector(getPatientsInTestQueue);
  const notification = useSelector(getQueueNotification);
  const dispatch = useDispatch();

  let shouldRenderQueue = Object.keys(patients).length > 0;
  const createQueueItems = (patients) =>
    shouldRenderQueue ? (
      Object.values(patients).map((patient) => (
        <QueueItem key={`patient-${uuidv4()}`} patient={patient} />
      ))
    ) : (
      <React.Fragment>
        <div className="prime-container prime-center">
          <p>
            There are no people in the queue. Search for people above to add
            them to the queue.
          </p>
        </div>
      </React.Fragment>
    );

  const onNotificationExpire = () => {
    dispatch(clearNotification());
  };

  const shouldShowAlert = notification && Object.keys(notification).length > 0;

  const alert = shouldShowAlert ? (
    <Expire delay={3000} onExpire={onNotificationExpire}>
      <QueueNotification notification={notification} />
    </Expire>
  ) : null;

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <AddToQueue />
          {createQueueItems(patients)}
        </div>
        <div className="grid-row">{alert}</div>
      </div>
    </main>
  );
};

TestQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestQueue;
