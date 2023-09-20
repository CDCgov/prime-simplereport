import React, { useEffect, useState } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { useLocation } from "react-router-dom";
import { useFeature } from "flagged";

import { showAlertNotification, showError } from "../utils/srToast";
import { LinkWithQuery } from "../commonComponents/LinkWithQuery";
import { appPermissions, hasPermission } from "../permissions";
import { useAppSelector } from "../store";
import { PATIENT_TERM } from "../../config/constants";
import {
  useGetFacilityQueueQuery,
  GetFacilityQueueQuery,
  useAddPatientToQueueMutation,
  useGetPatientQuery,
} from "../../generated/graphql";
import { Patient } from "../patients/ManagePatients";
import { getSymptomsAllFalse } from "../../patientApp/timeOfTest/constants";
import { getAppInsights } from "../TelemetryService";

import AddToQueueSearch, {
  StartTestProps,
} from "./addToQueue/AddToQueueSearch";
import QueueItem, { DevicesMap } from "./QueueItem";
import "./TestQueue.scss";
import { TestCard } from "./TestCard/TestCard";
import { ALERT_CONTENT, QUEUE_NOTIFICATION_TYPES } from "./constants";

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
    <div className="grid-container prime-center card-container">
      <div className="grid-row">
        <div className="usa-card__body">
          <p>
            There are no tests running. Search for a {PATIENT_TERM} to start
            their test.
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

interface Props {
  activeFacilityId: string;
}

const TestQueue: React.FC<Props> = ({ activeFacilityId }) => {
  const { data, loading, error, refetch, startPolling, stopPolling } =
    useGetFacilityQueueQuery({
      fetchPolicy: "no-cache",
      variables: {
        facilityId: activeFacilityId,
      },
    });
  const testCardRefactorEnabled = useFeature(
    "testCardRefactorEnabled"
  ) as boolean;
  const appInsights = getAppInsights();
  const [addPatientToQueueMutation] = useAddPatientToQueueMutation();

  const location = useLocation();
  const [startTestPatientId, setStartTestPatientId] = useState<string | null>(
    null
  );
  const patientIdParam = (location.state as StartTestProps)?.patientId;
  const getPatientQueryResult = useGetPatientQuery({
    variables: { internalId: patientIdParam },
    skip: !patientIdParam,
  });

  const canUseCsvUploader = hasPermission(
    useAppSelector((state) => state.user.permissions),
    appPermissions.results.canView
  );

  const canAddPatient = hasPermission(
    useAppSelector((state) => state.user.permissions),
    appPermissions.people.canEdit
  );

  useEffect(() => {
    (async () => {
      if (patientIdParam && data?.queue && getPatientQueryResult.data) {
        const doesPatientExistInQueue = data.queue.some(
          (testOrder) => testOrder?.patient.internalId === patientIdParam
        );
        if (!doesPatientExistInQueue) {
          const patient = getPatientQueryResult.data.patient as Patient;
          await addToQueueWithoutAoe(patient);
        }
      }
    })();
    // eslint-disable-next-line
  }, [location.state, data, patientIdParam, getPatientQueryResult.data]);

  useEffect(() => {
    // Start polling on creation, stop on component teardown
    startPolling(pollInterval);
    return stopPolling;
  }, [startPolling, stopPolling]);

  if (error) {
    throw error;
  }
  if (loading || !data) {
    return (
      <div
        className="prime-home display-flex flex-justify-center flex-1"
        style={{
          fontSize: "22px",
          paddingTop: "80px",
        }}
      >
        Loading tests ...
      </div>
    );
  }

  const facility = data.facility;

  if (!facility) {
    return <p>Facility not found</p>;
  }

  if (!facility.deviceTypes || facility.deviceTypes.length === 0) {
    showError(
      "This facility does not have any testing devices. Go into Settings -> Manage facilities and add a device."
    );
  }

  const addToQueueWithoutAoe = async (patient: Patient) => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Add Patient To Queue" });
    }
    try {
      await addPatientToQueueMutation({
        variables: {
          facilityId: facility.id,
          patientId: patient.internalId,
          symptoms: JSON.stringify(getSymptomsAllFalse()),
          pregnancy: null,
          symptomOnset: null,
          noSymptoms: null,
        },
      });
      const { type, title, body } = {
        ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS](
          patient
        ),
      };
      showAlertNotification(type, title, body);
      refetch();
      setStartTestPatientId(patient.internalId);
    } catch (err: any) {
      throw err;
    }
  };

  let shouldRenderQueue =
    data &&
    data.queue &&
    data.queue.length > 0 &&
    facility &&
    facility.deviceTypes &&
    facility.deviceTypes.length > 0;

  const devicesMap: DevicesMap = new Map();
  facility.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

  const createQueueItems = (patientQueue: GetFacilityQueueQuery["queue"]) => {
    const queue =
      shouldRenderQueue &&
      patientQueue &&
      patientQueue.map((queueItem) => {
        if (!queueItem) return <></>;

        return (
          <CSSTransition
            key={queueItem.internalId}
            onExiting={onExiting}
            timeout={transitionDuration}
          >
            {testCardRefactorEnabled ? (
              <TestCard
                testOrder={queueItem}
                devicesMap={devicesMap}
                facility={facility}
                refetchQueue={refetch}
              ></TestCard>
            ) : (
              <QueueItem
                refetchQueue={refetch}
                queueItem={queueItem}
                startTestPatientId={startTestPatientId}
                setStartTestPatientId={setStartTestPatientId}
                facility={facility}
                devicesMap={devicesMap}
              />
            )}
          </CSSTransition>
        );
      });

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

  const patientsInQueue: string[] = data?.queue
    ? data?.queue
        .map((q) => q?.patient.internalId)
        .filter((element): element is string => !!element)
    : [];

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <h1 className="font-sans-lg">Conduct tests</h1>
        <div className="position-relative">
          <AddToQueueSearch
            refetchQueue={refetch}
            facilityId={activeFacilityId}
            patientsInQueue={patientsInQueue}
            startTestPatientId={startTestPatientId}
            setStartTestPatientId={setStartTestPatientId}
            canAddPatient={canAddPatient}
            addToQueueWithoutAoe={addToQueueWithoutAoe}
          />
        </div>
        {createQueueItems(data.queue)}
      </div>
    </div>
  );
};

export default TestQueue;
