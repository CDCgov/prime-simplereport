import React from "react";
import { gql, useQuery } from "@apollo/client";

import AddToQueueSearch from "./addToQueue/AddToQueueSearch";
import QueueItem from "./QueueItem";
import { showError } from "../utils";
import { toast } from "react-toastify";
import { useLocalQueue } from "./useLocalQueue";

const pollInterval = 10_000;

const transitionDuration = 1000;

const pxToNumber = (px: string | undefined): number =>
  px ? Number(px.replace("px", "")) : 0;

const getQueueItemStyles = (id: string, remove: boolean) => {
  const defaultStyle = { opacity: 1 };
  if (!remove) {
    return defaultStyle;
  }
  const element = document.querySelector(
    `#queue-container-${id} .prime-queue-item`
  );
  if (!element) {
    return defaultStyle;
  }
  const computed = getComputedStyle(element);
  const computedHeight =
    pxToNumber(computed.height) + pxToNumber(computed.marginBottom);
  return {
    opacity: 0,
    transitionProperty: "opacity, margin-bottom",
    transitionDuration: `${transitionDuration}ms`,
    transitionTimingFunction: "ease",
    marginBottom: -1 * computedHeight,
  };
};

const emptyQueueMessage = (
  <div className="grid-container prime-center usa-card__container">
    <div className="grid-row">
      <div className="usa-card__body">
        <p>
          There are no tests running. Search for a person to start their test{" "}
        </p>
      </div>
    </div>
  </div>
);

export const queueQuery = gql`
  query GetFacilityQueue($facilityId: String!) {
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
        firstName
        middleName
        lastName
        gender
      }
      result
      dateTested
      patientLink {
        internalId
      }
    }
    organization {
      testingFacility {
        id
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

interface Props {
  activeFacilityId: string;
}

export interface QueueItemData {
  internalId: string;
  pregnancy: string;
  dateAdded: string;
  symptoms: string;
  noSymptoms: string;
  firstTest: string;
  priorTestDate: string;
  priorTestType: string;
  priorTestResult: string;
  deviceType: {
    internalId: string;
  };
  patient: {
    internalId: string;
  };
  result: string;
  symptomOnset: string;
  dateTested: string;
  patientLink: {
    internalId: string;
  };
}

const TestQueue: React.FC<Props> = ({ activeFacilityId }) => {
  const { data, loading, error, refetch: refetchQueue } = useQuery(queueQuery, {
    fetchPolicy: "no-cache",
    variables: {
      facilityId: activeFacilityId,
    },
    pollInterval,
  });

  const { localQueue, toRemove, setToRemove } = useLocalQueue(
    data?.queue,
    transitionDuration
  );

  if (error) {
    throw error;
  }
  if (loading || !localQueue) {
    return <p>Loading patients...</p>;
  }

  const facility = data.organization.testingFacility.find(
    (f: { id: string }) => f.id === activeFacilityId
  );
  if (!facility) {
    return <p>Facility not found</p>;
  }
  if (facility.deviceTypes.length === 0) {
    showError(
      toast,
      "This facility does not have any testing devices. Go into Settings -> Manage facilities and add a device."
    );
  }
  let shouldRenderQueue =
    localQueue.length > 0 && facility.deviceTypes.length > 0;

  const removePatientFromLocalQueue = (id: string) => {
    setToRemove((r) => {
      const newToRemove = new Set(r);
      newToRemove.add(id);
      return newToRemove;
    });
  };

  const createQueueItems = (patientQueue: QueueItemData[]) =>
    shouldRenderQueue
      ? patientQueue.map(
          ({
            internalId,
            deviceType,
            patient,
            result,
            dateTested,
            patientLink,
            ...questions
          }) => {
            return (
              <div
                key={internalId}
                id={`queue-container-${internalId}`}
                style={getQueueItemStyles(internalId, toRemove.has(internalId))}
              >
                <QueueItem
                  internalId={internalId}
                  patient={patient}
                  askOnEntry={questions}
                  selectedDeviceId={deviceType?.internalId || null}
                  selectedTestResult={result}
                  devices={facility.deviceTypes}
                  defaultDevice={facility.defaultDeviceType}
                  refetchQueue={refetchQueue}
                  facilityId={activeFacilityId}
                  dateTestedProp={dateTested}
                  patientLinkId={patientLink?.internalId || null}
                  removePatientFromLocalQueue={removePatientFromLocalQueue}
                />
              </div>
            );
          }
        )
      : emptyQueueMessage;

  const patientsInQueue = localQueue.map(
    (q: QueueItemData) => q.patient.internalId
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row position-relative">
          <AddToQueueSearch
            refetchQueue={refetchQueue}
            facilityId={activeFacilityId}
            patientsInQueue={patientsInQueue}
          />
        </div>
        {createQueueItems(localQueue)}
      </div>
    </main>
  );
};

export default TestQueue;
