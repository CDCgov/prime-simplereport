import React, { useEffect, useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

import { showError } from "../utils";
import { useSelectedFacility } from "../facilitySelect/useSelectedFacility";
import { TestCorrectionReason } from "../testResults/TestResultCorrectionModal";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { appPermissions, hasPermission } from "../permissions";

import AddToQueueSearch, {
  StartTestProps,
} from "./addToQueue/AddToQueueSearch";
import QueueItem from "./QueueItem";
import { AoEAnswers, TestQueuePerson } from "./AoEForm/AoEForm";
import "./TestQueue.scss";

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

const emptyQueueMessage = (canUseCsvUploader: boolean) => {
  return (
    <div className="grid-container prime-center card-container queue-container-wide">
      <div className="grid-row">
        <div className="usa-card__body">
          <p>
            There are no tests running. Search for a person to start their test.
          </p>
          {canUseCsvUploader && (
            <p>
              To add results in bulk using a CSV file, go to{" "}
              <LinkWithQuery to="/results/upload/submit">
                <strong>Upload spreadsheet</strong>
              </LinkWithQuery>
              .
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const queueQuery = gql`
  query GetFacilityQueueMultiplex($facilityId: ID!) {
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
      results {
        disease {
          name
        }
        testResult
      }
      dateTested
      correctionStatus
      reasonForCorrection
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
        testLength
        supportedDiseases {
          name
        }
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

export interface QueueItemData extends AoEAnswers {
  internalId: string;
  dateAdded: string;
  deviceType: {
    internalId: string;
    testLength: number;
  };
  deviceSpecimenType: DeviceSpecimenType;
  patient: TestQueuePerson;
  result: TestResult;
  results: MultiplexResult[];
  dateTested: string;
  correctionStatus: string;
  reasonForCorrection: TestCorrectionReason;
}

const TestQueue: React.FC<Props> = ({ activeFacilityId }) => {
  const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(
    queueQuery,
    {
      fetchPolicy: "no-cache",
      variables: {
        facilityId: activeFacilityId,
      },
    }
  );

  const location = useLocation();
  const [selectedFacility] = useSelectedFacility();
  const [startTestPatientId, setStartTestPatientId] = useState<string | null>(
    null
  );
  const canUseCsvUploader = hasPermission(
    useSelector((state) => (state as any).user.permissions),
    appPermissions.featureFlags.SrCsvUploaderPilot
  );

  useEffect(() => {
    const locationState = (location.state as StartTestProps) || {};
    const { patientId: patientIdParam } = locationState;
    if (patientIdParam) {
      setStartTestPatientId(patientIdParam);
    }
  }, [location.state]);

  useEffect(() => {
    // Start polling on creation, stop on component teardown
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

  const deviceIds: string[] = facility.deviceTypes.map(
    (d: DeviceType) => d.internalId
  );

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
          results,
          dateTested,
          correctionStatus,
          reasonForCorrection,
          ...questions
        }) => {
          // Get possible device specimen types for this facility
          const deviceSpecimenTypes: DeviceSpecimenType[] = data.deviceSpecimenTypes.filter(
            (d: DeviceSpecimenType) =>
              deviceIds.includes(d.deviceType.internalId) &&
              // Facility may be configured with a device that does not have
              // any associated swab types - remove them from the set of
              // options
              deviceIds.some((deviceId) => d.deviceType.internalId === deviceId)
          );

          // The `deviceSpecimenType` for a test queue entry does not carry full
          // device and swab data - if the device specimen no longer exists, we'll
          // get a server error trying to follow its associations, so we have to
          // do this in-memory
          let selectedDeviceSpecimenType = deviceSpecimenTypes.find(
            (dst) => dst.internalId === deviceSpecimenType.internalId
          );

          // The selected device specimen type for a test has been removed by an admin
          if (!selectedDeviceSpecimenType) {
            selectedDeviceSpecimenType =
              deviceSpecimenTypes.find(
                (dst) => dst.deviceType.internalId === deviceType.internalId
              ) || deviceSpecimenTypes[0];
          }

          let selectedTestResults: MultiplexResult[];

          // backwards compatibility
          if (!results && result) {
            selectedTestResults = [
              { disease: { name: "COVID-19" }, testResult: result },
            ];
          } else {
            selectedTestResults = results;
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
                startTestPatientId={startTestPatientId}
                setStartTestPatientId={setStartTestPatientId}
                askOnEntry={questions}
                selectedDeviceSpecimenTypeId={
                  selectedDeviceSpecimenType.internalId
                }
                selectedDeviceId={
                  selectedDeviceSpecimenType.deviceType.internalId
                }
                selectedDeviceTestLength={
                  // `testLength` is not nullable and is always returned by
                  // the facility queue GraphQL query
                  selectedDeviceSpecimenType.deviceType.testLength as number
                }
                selectedTestResults={selectedTestResults}
                devices={facility.deviceTypes}
                deviceSpecimenTypes={deviceSpecimenTypes}
                refetchQueue={refetch}
                facilityName={selectedFacility?.name}
                facilityId={activeFacilityId}
                dateTestedProp={dateTested}
                isCorrection={correctionStatus === "CORRECTED"}
                reasonForCorrection={reasonForCorrection}
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
            {emptyQueueMessage(canUseCsvUploader)}
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
      <div className="grid-container queue-container-wide">
        <div className="position-relative">
          <AddToQueueSearch
            refetchQueue={refetch}
            facilityId={activeFacilityId}
            patientsInQueue={patientsInQueue}
            startTestPatientId={startTestPatientId}
            setStartTestPatientId={setStartTestPatientId}
          />
        </div>
        {createQueueItems(data.queue)}
      </div>
    </main>
  );
};

export default TestQueue;
