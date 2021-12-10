import React, { useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import { TransitionGroup, CSSTransition } from "react-transition-group";

import { showError } from "../utils";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";

import AddToQueueSearch from "./addToQueue/AddToQueueSearch";
import QueueItem, { TestResult } from "./QueueItem";
import { TestQueuePerson, AoEAnswers } from "./AoEForm/AoEForm";

const pollInterval = 10_000;

const transitionDuration = 1000;
const onEmptyQueueEntering = (node: HTMLElement) => {
  node.style.opacity = "1";
};
const onEmptyQueueExiting = (node: HTMLElement) => {
  node.style.display = "none";
};

const onExiting = (node: HTMLElement) => {
  node.style.marginBottom = `-${node.offsetHeight}px`;
  node.style.opacity = "0";
  node.style.transition = `opacity ${transitionDuration}ms ease-out, margin ${transitionDuration}ms ease-out`;
  node.style.pointerEvents = "none";
};

const emptyQueueMessage = (
  <div className="grid-container prime-center card-container">
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
  query GetFacilityQueue($facilityId: ID!) {
    queue(facilityId: $facilityId) {
      internalId
      pregnancy
      dateAdded
      symptoms
      symptomOnset
      noSymptoms
      deviceType {
        internalId
        name
        model
        testLength
      }
      deviceSpecimenType {
        internalId
      }
      patient {
        internalId
        telephone
        birthDate
        firstName
        middleName
        lastName
        gender
        testResultDelivery
        preferredLanguage
        email
        emails
        phoneNumbers {
          type
          number
        }
      }
      result
      dateTested
    }
    organization {
      testingFacility {
        id
        deviceTypes {
          internalId
          name
          model
          testLength
        }
        defaultDeviceSpecimen
      }
    }
    deviceSpecimenTypes {
      internalId
      deviceType {
        internalId
        name
      }
      specimenType {
        internalId
        name
      }
    }
  }
`;

interface Props {
  activeFacilityId: string;
}

interface QueueItemData extends AoEAnswers {
  internalId: string;
  dateAdded: string;
  deviceType: {
    internalId: string;
    testLength: number;
  };
  deviceSpecimenType: DeviceSpecimenType;
  patient: TestQueuePerson;
  result: TestResult;
  dateTested: string;
}

const TestQueue: React.FC<Props> = ({ activeFacilityId }) => {
  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(
    queueQuery,
    {
      variables: {
        facilityId: activeFacilityId,
      },
    }
  );

  const [selectedFacility] = useSelectedFacility();

  useEffect(() => {
    // Start polling on creation, stop on componenent teardown
    startPolling(pollInterval);
    return stopPolling;
  }, [startPolling, stopPolling]);

  if (error) {
    throw error;
  }
  if (loading) {
    return (
      <main
        className="prime-home display-flex flex-justify-center"
        style={{
          fontSize: "22px",
          paddingTop: "80px",
        }}
      >
        Loading tests ...
      </main>
    );
  }

  const facility = data.organization.testingFacility.find(
    (f: { id: string }) => f.id === activeFacilityId
  );

  if (!facility) {
    return <p>Facility not found</p>;
  }

  if (facility.deviceTypes.length === 0) {
    showError(
      "This facility does not have any testing devices. Go into Settings -> Manage facilities and add a device."
    );
  }

  const deviceIds = facility.deviceTypes.map((d: DeviceType) => d.internalId);

  let shouldRenderQueue =
    data.queue.length > 0 && facility.deviceTypes.length > 0;

  const createQueueItems = (patientQueue: QueueItemData[]) => {
    const queue =
      shouldRenderQueue &&
      patientQueue.map(
        ({
          internalId,
          deviceType,
          deviceSpecimenType,
          patient,
          result,
          dateTested,
          ...questions
        }) => {
          // Get possible device specimen types for this facility
          const deviceSpecimenTypes: DeviceSpecimenType[] = data.deviceSpecimenTypes.filter(
            (d: DeviceSpecimenType) =>
              deviceIds.includes(d.deviceType.internalId)
          );

          // a test may have been configured with a certain device/swab combo
          // that could have since been removed from the facility
          if (!deviceIds.includes(deviceType.internalId)) {
            deviceType = facility.deviceTypes[0];
            deviceSpecimenType = deviceSpecimenTypes.filter(
              (dst) => dst.deviceType.internalId === deviceType.internalId
            )[0];
          }

          return (
            <CSSTransition
              key={internalId}
              onExiting={onExiting}
              timeout={transitionDuration}
            >
              <QueueItem
                internalId={internalId}
                patient={patient}
                askOnEntry={questions}
                selectedDeviceSpecimenTypeId={
                  deviceSpecimenType?.internalId ||
                  facility.defaultDeviceSpecimen.internalId
                }
                selectedDeviceId={
                  deviceType?.internalId ||
                  facility.defaultDeviceSpecimen.deviceType.internalId
                }
                selectedDeviceTestLength={
                  deviceType?.testLength ||
                  facility.defaultDeviceSpecimen.deviceType.testLength
                }
                selectedTestResult={result}
                devices={facility.deviceTypes}
                deviceSpecimenTypes={deviceSpecimenTypes}
                refetchQueue={refetch}
                facilityName={selectedFacility?.name}
                facilityId={activeFacilityId}
                dateTestedProp={dateTested}
              />
            </CSSTransition>
          );
        }
      );

    return (
      <TransitionGroup
        timeout={transitionDuration}
        component={null}
        unmountOnExit
      >
        {queue}
        {!shouldRenderQueue && (
          <CSSTransition
            key="empty-queue"
            onEntering={onEmptyQueueEntering}
            onExiting={onEmptyQueueExiting}
            timeout={transitionDuration}
          >
            {emptyQueueMessage}
          </CSSTransition>
        )}
      </TransitionGroup>
    );
  };

  const patientsInQueue = data.queue.map(
    (q: QueueItemData) => q.patient.internalId
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="position-relative">
          <AddToQueueSearch
            refetchQueue={refetch}
            facilityId={activeFacilityId}
            patientsInQueue={patientsInQueue}
          />
        </div>
        {createQueueItems(data.queue)}
      </div>
    </main>
  );
};

export default TestQueue;
