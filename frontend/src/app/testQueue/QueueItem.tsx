import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";
import classnames from "classnames";
import moment from "moment";
import { DatePicker, Label } from "@trussworks/react-uswds";
import { useSelector } from "react-redux";

import Alert from "../commonComponents/Alert";
import Button from "../commonComponents/Button/Button";
import Dropdown from "../commonComponents/Dropdown";
import LabeledText from "../commonComponents/LabeledText";
import TextInput from "../commonComponents/TextInput";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { displayFullName, showNotification } from "../utils";
import Checkboxes from "../commonComponents/Checkboxes";
import { RootState } from "../store";
import { getAppInsights } from "../TelemetryService";

import { ALERT_CONTENT, QUEUE_NOTIFICATION_TYPES } from "./constants";
import AskOnEntryTag, { areAnswersComplete } from "./AskOnEntryTag";
import {
  removeTimer,
  TestTimerWidget,
  updateTimer,
  useTestTimer,
} from "./TestTimer";
import AoEModalForm from "./AoEForm/AoEModalForm";
import "./QueueItem.scss";
import { AoEAnswers, TestQueuePerson } from "./AoEForm/AoEForm";
import { QueueItemSubmitLoader } from "./QueueItemSubmitLoader";
import { UPDATE_AOE } from "./addToQueue/AddToQueueSearch";

export type TestResult = "POSITIVE" | "NEGATIVE" | "UNDETERMINED" | "UNKNOWN";

const EARLIEST_TEST_DATE = new Date("01/01/2020 12:00:00 AM");

export const REMOVE_PATIENT_FROM_QUEUE = gql`
  mutation RemovePatientFromQueue($patientId: ID!) {
    removePatientFromQueue(patientId: $patientId)
  }
`;

export const EDIT_QUEUE_ITEM = gql`
  mutation EditQueueItem(
    $id: ID!
    $deviceId: String
    $deviceSpecimenType: ID
    $result: String
    $dateTested: DateTime
  ) {
    editQueueItem(
      id: $id
      deviceId: $deviceId
      deviceSpecimenType: $deviceSpecimenType
      result: $result
      dateTested: $dateTested
    ) {
      result
      dateTested
      deviceType {
        internalId
        testLength
      }
      deviceSpecimenType {
        internalId
        deviceType {
          internalId
          testLength
        }
        specimenType {
          internalId
        }
      }
    }
  }
`;

interface EditQueueItemParams {
  id: string;
  deviceId?: string;
  deviceSpecimenType: string;
  result?: TestResult;
  dateTested?: string;
}

interface EditQueueItemResponse {
  editQueueItem: {
    result: TestResult;
    dateTested: string;
    deviceType: { internalId: string; testLength: number };
    deviceSpecimenType: DeviceSpecimenType;
  };
}

export const SUBMIT_TEST_RESULT = gql`
  mutation SubmitTestResult(
    $patientId: ID!
    $deviceId: String!
    $deviceSpecimenType: ID
    $result: String!
    $dateTested: DateTime
  ) {
    addTestResultNew(
      patientId: $patientId
      deviceId: $deviceId
      deviceSpecimenType: $deviceSpecimenType
      result: $result
      dateTested: $dateTested
    ) {
      testResult {
        internalId
      }
      deliverySuccess
    }
  }
`;

interface AreYouSureProps {
  cancelText: string;
  continueText: string;
  cancelHandler: () => void;
  continueHandler: () => void;
}

const AreYouSure: React.FC<AreYouSureProps> = ({
  cancelHandler,
  cancelText,
  continueHandler,
  continueText,
  children,
}) => (
  <Modal
    isOpen={true}
    style={{
      content: {
        maxHeight: "90vh",
        width: "40em",
        position: "initial",
      },
    }}
    overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
    contentLabel="Questions not answered"
    ariaHideApp={process.env.NODE_ENV !== "test"}
  >
    <div className="sr-modal-content">{children}</div>
    <div className="margin-top-4 padding-top-205 border-top border-base-lighter margin-x-neg-205">
      <div className="text-right prime-modal-buttons">
        <Button onClick={cancelHandler} variant="unstyled" label={cancelText} />
        <Button onClick={continueHandler} label={continueText} />
      </div>
    </div>
  </Modal>
);

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#root");
}

export interface QueueItemProps {
  internalId: string;
  patient: TestQueuePerson;
  devices: {
    name: string;
    internalId: string;
    testLength: number;
  }[];
  deviceSpecimenTypes: DeviceSpecimenType[];
  askOnEntry: AoEAnswers;
  selectedDeviceId: string;
  selectedDeviceSpecimenTypeId: string;
  selectedDeviceTestLength: number;
  selectedTestResult: TestResult;
  dateTestedProp: string;
  refetchQueue: () => void;
  facilityName: string | undefined;
  facilityId: string;
}

interface updateQueueItemProps {
  deviceId?: string;
  deviceSpecimenType: string;
  testLength?: number;
  result?: TestResult;
  dateTested?: string;
}

type SaveState = "idle" | "editing" | "saving" | "error";

const QueueItem = ({
  internalId,
  patient,
  deviceSpecimenTypes,
  askOnEntry,
  selectedDeviceId,
  selectedDeviceSpecimenTypeId,
  selectedDeviceTestLength,
  selectedTestResult,
  refetchQueue,
  facilityName,
  dateTestedProp,
}: QueueItemProps) => {
  const appInsights = getAppInsights();
  const trackRemovePatientFromQueue = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Remove Patient From Queue" });
    }
  };
  const trackSubmitTestResult = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Submit Test Result" });
    }
  };
  const trackUpdateAoEResponse = () => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Update AoE Response" });
    }
  };

  const [mutationError, updateMutationError] = useState(null);
  const [removePatientFromQueue] = useMutation(REMOVE_PATIENT_FROM_QUEUE);
  const [submitTestResult, { loading }] = useMutation(SUBMIT_TEST_RESULT);
  const [updateAoe] = useMutation(UPDATE_AOE);
  const [editQueueItem] = useMutation<
    EditQueueItemResponse,
    EditQueueItemParams
  >(EDIT_QUEUE_ITEM);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [isAoeModalOpen, updateIsAoeModalOpen] = useState(false);
  const [aoeAnswers, setAoeAnswers] = useState(askOnEntry);
  useEffect(() => {
    setAoeAnswers(askOnEntry);
  }, [askOnEntry]);

  const [deviceId, updateDeviceId] = useState<string>(selectedDeviceId);
  const [specimenId, updateSpecimenId] = useState<string>("");
  const [deviceSpecimenTypeId, updateDeviceSpecimenTypeId] = useState(
    selectedDeviceSpecimenTypeId
  );

  // Populate device+specimen state variables from selected device specimen type
  useEffect(() => {
    const deviceSpecimenType = deviceSpecimenTypes.find(
      (dst) => dst.internalId === deviceSpecimenTypeId
    );

    if (!deviceSpecimenType) {
      return;
    }

    updateDeviceId(deviceSpecimenType.deviceType.internalId);
    updateSpecimenId(deviceSpecimenType.specimenType.internalId);
  }, [deviceSpecimenTypes, deviceSpecimenTypeId]);

  const deviceTypes = deviceSpecimenTypes
    .map((d) => d.deviceType)
    .reduce((allDevices, device: DeviceType) => {
      const id = device.internalId;

      if (!(id in allDevices)) {
        allDevices[id] = device;
      }

      return allDevices;
    }, {} as Record<string, DeviceType>);

  const [deviceTestLength, updateDeviceTestLength] = useState(
    selectedDeviceTestLength
  );

  const [useCurrentDateTime, updateUseCurrentDateTime] = useState<
    "true" | "false"
  >(dateTestedProp ? "false" : "true");
  // this is an ISO string
  // always assume the current date unless provided something else
  const [dateTested, updateDateTested] = useState<string | undefined>(
    dateTestedProp || undefined
  );

  const organization = useSelector<RootState, Organization>(
    (state: any) => state.organization as Organization
  );

  // helper method to work around the annoying string-booleans
  function shouldUseCurrentDateTime() {
    return useCurrentDateTime === "true";
  }

  // `Array.prototype.sort`-friendly callback for devices and swab types
  function alphabetizeByName(
    a: DeviceType | SpecimenType,
    b: DeviceType | SpecimenType
  ): number {
    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  }

  function isValidCustomDateTested(customDate: string | undefined) {
    if (!customDate) {
      return false;
    }
    const dateTested = new Date(customDate); // local time, may be an invalid date

    // if it is an invalid date
    if (isNaN(dateTested.getTime())) {
      return false;
    }

    // problem: user can manually input future dates and bypass the `max` attribute.
    // this enforces the max future date to be 1 day from the time of submission, an arbitrary upper bound -- not sure if this is a good idea?
    const MAX_TEST_DATE = new Date();
    MAX_TEST_DATE.setDate(MAX_TEST_DATE.getDate() + 1);
    return dateTested > EARLIEST_TEST_DATE && dateTested < MAX_TEST_DATE;
  }

  const [testResultValue, updateTestResultValue] = useState<
    TestResult | undefined
  >(selectedTestResult || undefined);

  const [confirmationType, setConfirmationType] = useState<
    "submitResult" | "removeFromQueue" | "none"
  >("none");

  const [removePatientId, setRemovePatientId] = useState<string>();

  if (mutationError) {
    // Don't do anything. These errors will propagate to AppInsights, and
    // generate a user-facing toast error via ApolloClient's onError handler,
    // defined in index.tsx
  }

  const testResultsSubmitted = (response: any) => {
    let { title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
        patient
      ),
    };

    if (response?.data?.addTestResultNew.deliverySuccess === false) {
      let deliveryFailureAlert = (
        <Alert
          type="error"
          title={`Unable to text result to ${patientFullName}`}
          body="The phone number provided may not be valid or may not be able to accept text messages"
        />
      );
      showNotification(deliveryFailureAlert);
    }

    let alert = <Alert type="success" title={title} body={body} />;
    showNotification(alert);
  };

  const onTestResultSubmit = async (forceSubmit: boolean = false) => {
    if (!forceSubmit && !areAnswersComplete(aoeAnswers)) {
      return setConfirmationType("submitResult");
    }

    setSaveState("saving");
    if (appInsights) {
      trackSubmitTestResult();
    }
    setConfirmationType("none");
    try {
      const result = await submitTestResult({
        variables: {
          patientId: patient.internalId,
          deviceId: deviceId,
          deviceSpecimenTypeId: deviceSpecimenTypeId,
          result: testResultValue,
          dateTested: shouldUseCurrentDateTime() ? null : dateTested,
        },
      });
      testResultsSubmitted(result);
      refetchQueue();
      removeTimer(internalId);
    } catch (error) {
      setSaveState("error");
      updateMutationError(error);
    }
  };

  const updateQueueItem = useCallback(
    (props: updateQueueItemProps) => {
      return editQueueItem({
        variables: {
          id: internalId,
          deviceId: props.deviceId,
          result: props.result,
          dateTested: props.dateTested,
          deviceSpecimenType: props.deviceSpecimenType,
        },
      })
        .then((response) => {
          if (!response.data) throw Error("updateQueueItem null response");
          updateDeviceSpecimenTypeId(
            response.data.editQueueItem.deviceSpecimenType.internalId
          );
          updateTestResultValue(
            response.data.editQueueItem.result || undefined
          );

          updateTimer(
            internalId,
            response.data.editQueueItem.deviceSpecimenType.deviceType
              .testLength as number
          );
          updateDeviceTestLength(
            response.data.editQueueItem.deviceSpecimenType.deviceType
              .testLength as number
          );
        })
        .catch(updateMutationError);
    },
    [editQueueItem, internalId]
  );

  const onDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceSpecimenTypesForDevice = deviceSpecimenTypes.filter(
      (dst) => dst.deviceType.internalId === e.currentTarget.value
    );
    // When changing devices, the target device may not be configured with the current swab type
    // In that case, just grab from the top of the list
    const newDeviceTypeSpecimen =
      deviceSpecimenTypesForDevice.find(
        (dst) => dst.specimenType.internalId === specimenId
      ) || deviceSpecimenTypesForDevice[0];

    updateDeviceSpecimenTypeId(newDeviceTypeSpecimen.internalId);
  };

  const onSpecimenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDeviceSpecimenType = deviceSpecimenTypes.find(
      (dst) =>
        dst.specimenType.internalId === e.currentTarget.value &&
        dst.deviceType.internalId === deviceId
    );

    updateDeviceSpecimenTypeId(newDeviceSpecimenType?.internalId);
  };

  const onDateTestedChange = (date: moment.Moment) => {
    const newDateTested = date.toISOString();
    const isValidDate = isValidCustomDateTested(newDateTested);

    // the date string returned from the server is only precise to seconds; moment's
    // toISOString method returns millisecond precision. as a result, an onChange event
    // was being fired when this component initialized, sending an EditQueueItem to
    // the back end w/ the same data that it already had. this prevents it:
    if (moment(dateTested).isSame(date)) {
      return;
    }

    if (isValidDate) {
      /* the custom date input field manages its own state in the DOM, not in the react state
      The reason for this is an invalid custom date would update react. Updating another field in the queue item, like the test result, would attempt to submit the invalid date to the backend
      Instead, we are only going to update react if there is a *valid* date.
      this can be mitigated if the backend can reliably handle null/invalid dates (never needs to be the case, just default to current date)
      or if we change our updateQueuItem function to update only a single value at a time, which is a TODO for later
    */
      updateDateTested(newDateTested);
    }
  };

  const isMounted = useRef(false);
  const DEBOUNCE_TIME = 500;
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      setSaveState("editing");
      debounceTimer = setTimeout(async () => {
        await updateQueueItem({
          deviceId,
          dateTested,
          deviceSpecimenType: deviceSpecimenTypeId,
          result: testResultValue,
        });
        setSaveState("idle");
      }, DEBOUNCE_TIME);
    }
    return () => {
      clearTimeout(debounceTimer);
      setSaveState("idle");
    };
  }, [
    deviceId,
    deviceSpecimenTypeId,
    dateTested,
    testResultValue,
    updateQueueItem,
  ]);

  const onTestResultChange = (result: TestResult | undefined) => {
    updateTestResultValue(result);
  };

  const removeFromQueue = () => {
    setConfirmationType("none");
    if (appInsights) {
      trackRemovePatientFromQueue();
    }
    removePatientFromQueue({
      variables: {
        patientId: removePatientId,
      },
    })
      .then(() => refetchQueue())
      .then(() => removeTimer(internalId))
      .catch((error) => {
        updateMutationError(error);
      })
      .finally(() => {
        setRemovePatientId(undefined);
      });
  };

  const openAoeModal = () => {
    updateIsAoeModalOpen(true);
  };

  const closeAoeModal = () => {
    updateIsAoeModalOpen(false);
  };

  const saveAoeCallback = (answers: AoEAnswers) => {
    setAoeAnswers(answers);
    if (appInsights) {
      trackUpdateAoEResponse();
    }

    const symptomOnset = answers.symptomOnset
      ? moment(answers.symptomOnset).format("YYYY-MM-DD")
      : null;

    updateAoe({
      variables: {
        ...answers,
        symptomOnset,
        patientId: patient.internalId,
      },
    })
      .then(refetchQueue)
      .catch(updateMutationError);
  };

  const onUseCurrentDateChange = () => {
    // if we want to use a custom date
    if (shouldUseCurrentDateTime()) {
      updateUseCurrentDateTime("false");
    }
    // if we want to use the current date time
    else {
      updateDateTested(undefined);
      updateUseCurrentDateTime("true");
    }
  };

  const deviceLookup: Map<DeviceType, SpecimenType[]> = useMemo(
    () =>
      deviceSpecimenTypes.reduce((allDevices, { deviceType, specimenType }) => {
        const device = deviceTypes[deviceType.internalId];
        allDevices.get(device)?.push(specimenType);

        return allDevices;
      }, new Map(Object.values(deviceTypes).map((device) => [device, [] as SpecimenType[]]))),
    // adding `deviceTypes` to dependency list will cause an infinite loop of state updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deviceSpecimenTypes]
  );

  const patientFullName = displayFullName(
    patient.firstName,
    patient.middleName,
    patient.lastName
  );

  const closeButton = (
    <button
      onClick={() => {
        setRemovePatientId(patient.internalId);
        setConfirmationType("removeFromQueue");
      }}
      className="prime-close-button"
      aria-label="Close"
    >
      <span className="fa-layers">
        <FontAwesomeIcon icon={"circle"} size="2x" inverse />
        <FontAwesomeIcon icon={"times-circle"} size="2x" />
      </span>
    </button>
  );

  const selectedDate = dateTested ? moment(dateTested) : moment();

  const testDateFields =
    useCurrentDateTime === "false" ? (
      <>
        <div className="prime-li tablet:grid-col-4 tablet:padding-left-1">
          <div className="usa-form-group">
            <Label htmlFor="test-date">Test date</Label>
            <span className="usa-hint">mm/dd/yyyy</span>
            <DatePicker
              id="test-date"
              name="test-date"
              defaultValue={selectedDate.format(
                moment.HTML5_FMT.DATETIME_LOCAL
              )}
              minDate="2020-01-01T00:00"
              maxDate={moment().add(1, "days").format("YYYY-MM-DDThh:mm")} // TODO: is this a reasonable max?
              onChange={(date) => {
                if (date) {
                  const newDate = moment(date)
                    .hour(selectedDate.hours())
                    .minute(selectedDate.minutes());
                  onDateTestedChange(newDate);
                }
              }}
            />
          </div>
        </div>
        <div className="prime-li tablet:grid padding-right-1 tablet:padding-left-05">
          <TextInput
            label={"Test time"}
            name={"test-time"}
            hintText="hh:mm"
            type="time"
            step="60"
            value={selectedDate.format("HH:mm")}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(":");
              const newDate = moment(selectedDate)
                .hours(parseInt(hours))
                .minutes(parseInt(minutes));
              onDateTestedChange(newDate);
            }}
          />
        </div>
      </>
    ) : null;

  const timer = useTestTimer(internalId, deviceTestLength);

  function cardColorDisplay() {
    const prefix = "prime-queue-item__";
    if (saveState === "error") {
      return prefix + "error";
    }
    if (timer.countdown < 0 && testResultValue === "UNKNOWN") {
      return prefix + "ready";
    }
    return undefined;
  }

  const containerClasses = classnames(
    "position-relative",
    "grid-container",
    "prime-container",
    "prime-queue-item card-container",
    timer.countdown < 0 &&
      testResultValue !== "UNKNOWN" &&
      "prime-queue-item__completed",
    cardColorDisplay()
  );

  const timerContext = {
    organizationName: organization.name,
    facilityName: facilityName,
    patientId: patient.internalId,
    testOrderId: internalId,
  };

  return (
    <React.Fragment>
      <div className={containerClasses}>
        <QueueItemSubmitLoader
          show={saveState === "saving"}
          name={patientFullName}
        />
        <div className="prime-card-container">
          {saveState !== "saving" && closeButton}
          <div className="grid-row">
            <div className="tablet:grid-col-9">
              <div
                className="grid-row prime-test-name usa-card__header"
                id="patient-name-header"
              >
                <h2>{patientFullName}</h2>
                <TestTimerWidget timer={timer} context={timerContext} />
              </div>
              <div className="margin-top-2 margin-left-2 margin-bottom-2">
                <div className="queue-item__description prime-ul grid-row grid-gap">
                  <li className="prime-li tablet:grid-col-3">
                    <LabeledText
                      text={patient.telephone}
                      label="Phone number"
                    />
                  </li>
                  <li className="prime-li tablet:grid-col-3">
                    <LabeledText
                      text={moment(patient.birthDate).format("MM/DD/yyyy")}
                      label="Date of birth"
                    />
                  </li>
                  <li className="prime-li tablet:grid-col-3">
                    <Button
                      variant="unstyled"
                      label="Test questionnaire"
                      onClick={openAoeModal}
                    />
                    {isAoeModalOpen && (
                      <AoEModalForm
                        onClose={closeAoeModal}
                        patient={patient}
                        loadState={aoeAnswers}
                        saveCallback={saveAoeCallback}
                      />
                    )}
                    <p>
                      <AskOnEntryTag aoeAnswers={aoeAnswers} />
                    </p>
                  </li>
                </div>
                <div
                  className={classnames(
                    "queue-item__form prime-ul grid-row",
                    useCurrentDateTime === "false" && "queue-item__form--open"
                  )}
                >
                  <div className="prime-li flex-align-self-end tablet:grid-col-3 padding-right-1">
                    <Dropdown
                      options={Array.from(deviceLookup.keys())
                        .sort(alphabetizeByName)
                        .map((d: DeviceType) => ({
                          label: d.name,
                          value: d.internalId,
                        }))}
                      label="Device"
                      name="testDevice"
                      selectedValue={deviceId}
                      onChange={onDeviceChange}
                    />
                  </div>
                  <div className="prime-li flex-align-self-end tablet:grid-col-3 padding-left-1">
                    <Dropdown
                      options={(deviceLookup.get(
                        deviceTypes[deviceId]
                      ) as SpecimenType[])
                        .sort(alphabetizeByName)
                        .map((s: SpecimenType) => ({
                          label: s.name,
                          value: s.internalId,
                        }))}
                      label="Swab type"
                      name="swabType"
                      selectedValue={specimenId}
                      onChange={onSpecimenChange}
                    />
                  </div>
                  {testDateFields}
                  <div className="prime-li tablet:grid-col tablet:padding-left-2">
                    <Checkboxes
                      boxes={[
                        {
                          value: useCurrentDateTime,
                          label: "Use current date",
                          checked: useCurrentDateTime === "true",
                        },
                      ]}
                      className={
                        useCurrentDateTime === "false"
                          ? "testdate-checkbox"
                          : ""
                      }
                      legend={
                        useCurrentDateTime === "true" ? "Test date" : null
                      }
                      name="currentDateTime"
                      onChange={onUseCurrentDateChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="tablet:grid-col-3 prime-test-result">
              {confirmationType !== "none" && (
                <AreYouSure
                  cancelText="No, go back"
                  continueText={
                    confirmationType === "submitResult"
                      ? "Submit anyway"
                      : "Yes, I'm sure"
                  }
                  cancelHandler={() => setConfirmationType("none")}
                  continueHandler={
                    confirmationType === "submitResult"
                      ? () => {
                          onTestResultSubmit(true);
                        }
                      : removeFromQueue
                  }
                >
                  {confirmationType === "submitResult" ? (
                    <p className="usa-prose">
                      The test questionnaire for{" "}
                      <b> {` ${patientFullName} `} </b> has not been completed.
                      Do you want to submit results anyway?
                    </p>
                  ) : (
                    <>
                      <p className="usa-prose">
                        Are you sure you want to stop <b>{patientFullName}'s</b>{" "}
                        test?
                      </p>
                      <p className="usa-prose">
                        Doing so will remove this person from the list. You can
                        use the search bar to start their test again later.
                      </p>
                    </>
                  )}
                </AreYouSure>
              )}
              <TestResultInputForm
                queueItemId={internalId}
                testResultValue={testResultValue}
                isSubmitDisabled={
                  loading ||
                  saveState === "editing" ||
                  saveState === "saving" ||
                  (!shouldUseCurrentDateTime() &&
                    !isValidCustomDateTested(dateTested))
                }
                onSubmit={onTestResultSubmit}
                onChange={onTestResultChange}
              />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default QueueItem;
