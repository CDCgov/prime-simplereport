import { gql, useQuery } from "@apollo/client";
import React from "react";
import { v4 as uuidv4 } from "uuid";
import { testResultPropType } from "../propTypes";

import {parseDate} from "./AoEForm/dateUtils";
import AddToQueueSearch from "./addToQueue/AddToQueueSearch";
import QueueItem from "./QueueItem";

const emptyQueueMessage = (
  <div className="grid-container prime-center usa-card__container">
    <div className="grid-row">
      <div className="usa-card__body">
        <p>
          There are no people in the queue. Search for people above to add them
          to the queue.
        </p>
      </div>
    </div>
  </div>
);

const queueQuery = gql`{
  queue {
    pregnancy
    dateAdded
    symptoms
    symptomOnset
    noSymptoms
    firstTest
    priorTestDate
    priorTestType
    priorTestResult
    device {
      id
      displayName
    }
    patient {
      id
      phone
      birthDate
      lookupId
      firstName
      middleName
      lastName
    }
    testResult {id}
  }
  organization {
    devices {
      id
      displayName
    }
    defaultDevice {
      id
      displayName
    }
  }
}`;

const TestQueue = () => {
  const { data, loading, error, refetch: refetchQueue } = useQuery(queueQuery);

  if (error) {
    return <p>Error in loading patients</p>;
  }
  if (loading) {
    return <p>Loading patients...</p>;
  }

  let shouldRenderQueue = data.queue.length > 0;
  const createQueueItems = (patientQueue) =>
    shouldRenderQueue
      ? patientQueue.map(({
          pregnancy,
          dateAdded,
          symptoms,
          noSymptoms,
          firstTest,
          priorTestDate,
          priorTestType,
          priorTestResult,
          device,
          patient,
          testResult,
          symptomOnset
        }) => (
          <QueueItem
            key={`patient-${uuidv4()}`}
            patient={patient}
            askOnEntry={{
              pregnancy,
              dateAdded: parseDate(dateAdded),
              noSymptoms,
              symptoms,
              symptomOnset: parseDate(symptomOnset),
              firstTest,
              priorTestDate: parseDate(priorTestDate),
              priorTestType,
              priorTestResult,
            }}
            selectedDeviceId={device.id}
            selectedTestResult={testResult}
            devices={data.organization.devices}
            defaultDevice={data.organization.defaultDevice}
            refetchQueue={refetchQueue}
          />
        ))
      : emptyQueueMessage;

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <AddToQueueSearch refetchQueue={refetchQueue}/>
        </div>
        {createQueueItems(data.queue)}
      </div>
    </main>
  );
};

TestQueue.propTypes = {
  testResults: testResultPropType,
};
export default TestQueue;
