import React from "react";
import { testResultPropType } from "../propTypes";
import { gql, useQuery } from "@apollo/client";
import { useSelector } from "react-redux";

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
  query Queue($facilityId: String!) {
    queue(facilityId: $facilityId) {
      internalId
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
        gender
      }
    }
    organization {
      testingFacility {
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
  }
`;

const TestQueue = () => {
  const { data, loading, error, refetch: refetchQueue } = useQuery(queueQuery, {
    fetchPolicy: "no-cache",
  });
  const activeFacilityId = useSelector((state) => state.facility.id);

  if (error) {
    throw error;
  }
  if (loading) {
    return <p>Loading patients...</p>;
  }

  const facility = data.organization.testingFacility.find(
    (f) => f.id === activeFacilityId
  );
  if (!facility) {
    return <p>Facility not found</p>;
  }
  let shouldRenderQueue =
    data.queue.length > 0 && facility.deviceTypes.length > 0;
  const createQueueItems = (patientQueue) =>
    shouldRenderQueue
      ? patientQueue.map(
          (
            {
              internalId,
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
              internalId={internalId}
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
              devices={facility.deviceTypes}
              defaultDevice={facility.defaultDeviceType}
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
