import { gql, useQuery } from "@apollo/client";
import React from "react";
import { testResultPropType } from "../propTypes";

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

const queueQuery = gql`
  {
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
      deviceType {
        internalId
        name
      }
      patient {
        internalId
        telephone
        birthDate
        lookupId
        firstName
        middleName
        lastName
      }
    }
    organization {
      deviceTypes {
        internalId
        name
      }
      defaultDeviceType {
        internalId
        name
      }
    }
  }
`;

const TestQueue = () => {
  const { data, loading, error, refetch: refetchQueue } = useQuery(queueQuery, {
    fetchPolicy: "no-cache",
  });

  if (error) {
    return <p>Error in loading patients</p>;
  }
  if (loading) {
    return <p>Loading patients...</p>;
  }

  let shouldRenderQueue =
    data.queue.length > 0 && data.organization.deviceTypes.length > 0;
  const createQueueItems = (patientQueue) =>
    shouldRenderQueue
      ? patientQueue.map(
          (
            {
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
              symptomOnset,
            },
            i
          ) => (
            <QueueItem
              key={patient.internalId}
              patient={patient}
              askOnEntry={{
                pregnancy,
                dateAdded: dateAdded,
                noSymptoms,
                symptoms,
                symptomOnset: symptomOnset,
                firstTest,
                priorTestDate: priorTestDate,
                priorTestType,
                priorTestResult,
              }}
              selectedDeviceId={device ? device.internalId : null}
              selectedTestResult={testResult}
              devices={data.organization.deviceTypes}
              defaultDevice={data.organization.defaultDeviceType}
              refetchQueue={refetchQueue}
            />
          )
        )
      : emptyQueueMessage;

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <AddToQueueSearch refetchQueue={refetchQueue} />
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
