import { gql, useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { testResultPropType } from "../propTypes";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import { parseDate } from "./AoEForm/dateUtils";
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
  const appInsights = useAppInsightsContext();
  const trackFetchQueue = useTrackEvent(appInsights, "Fetch Queue");
  useEffect(() => {
    trackFetchQueue();
  }, [trackFetchQueue]);

  const { data, loading, error, refetch: refetchQueue } = useQuery(queueQuery, {
    fetchPolicy: "no-cache",
  });

  if (error) {
    return error;
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
                dateAdded: parseDate(dateAdded),
                noSymptoms,
                symptoms,
                symptomOnset: parseDate(symptomOnset),
                firstTest,
                priorTestDate: parseDate(priorTestDate),
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
