import React, { useState } from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../commonComponents/Alert";
import Button from "../commonComponents/Button";
import AoeModalForm from "./AoEForm/AoEModalForm";
import Dropdown from "../commonComponents/Dropdown";
import TextInput from "../commonComponents/TextInput";
import LabeledText from "../commonComponents/LabeledText";
import TestResultInputForm from "../testResults/TestResultInputForm";
import { ALERT_CONTENT } from "./constants";
import { displayFullName } from "../utils";
import { patientPropType, devicePropType } from "../propTypes";
import { QUEUE_NOTIFICATION_TYPES } from "./constants";
import { showNotification } from "../utils";
import AskOnEntryTag, { areAnswersComplete } from "./AskOnEntryTag";
import { removeTimer, TestTimerWidget } from "./TestTimer";
import Checkboxes from "../commonComponents/Checkboxes";
import moment from "moment";

import "./QueueItem.scss";

export type TestResult = "POSITIVE" | "NEGATIVE" | "UNDETERMINED";

const EARLIEST_TEST_DATE = new Date("01/01/2020 12:00:00 AM");

const REMOVE_PATIENT_FROM_QUEUE = gql`
  mutation RemovePatientFromQueue($patientId: String!) {
    removePatientFromQueue(patientId: $patientId)
  }
`;

const EDIT_QUEUE_ITEM = gql`
  mutation EditQueueItem(
    $id: String!
    $deviceId: String
    $result: String
    $dateTested: String
  ) {
    editQueueItem(
      id: $id
      deviceId: $deviceId
      result: $result
      dateTested: $dateTested
    ) {
      result
      dateTested
      deviceType {
        internalId
      }
    }
  }
`;

interface EditQueueItemParams {
  id: string;
  deviceId?: string;
  result?: TestResult;
  dateTested?: string;
}

interface EditQueueItemResponse {
  editQueueItem: {
    result: TestResult;
    dateTested: string;
    deviceType: { internalId: string };
  };
}

const SUBMIT_TEST_RESULT = gql`
  mutation SubmitTestResult(
    $patientId: String!
    $deviceId: String!
    $result: String!
    $dateTested: String
  ) {
    addTestResult(
      patientId: $patientId
      deviceId: $deviceId
      result: $result
      dateTested: $dateTested
    )
  }
`;

const UPDATE_AOE = gql`
  mutation UpdateAOE(
    $patientId: String!
    $symptoms: String
    $symptomOnset: String
    $pregnancy: String
    $firstTest: Boolean
    $priorTestDate: String
    $priorTestType: String
    $priorTestResult: String
    $noSymptoms: Boolean
  ) {
    updateTimeOfTestQuestions(
      patientId: $patientId
      pregnancy: $pregnancy
      symptoms: $symptoms
      noSymptoms: $noSymptoms
      firstTest: $firstTest
      priorTestDate: $priorTestDate
      priorTestType: $priorTestType
      priorTestResult: $priorTestResult
      symptomOnset: $symptomOnset
    )
  }
`;

interface AreYouSureProps {
  patientName: string;
  cancelHandler: () => void;
  continueHandler: () => void;
}

const AreYouSure: React.FC<AreYouSureProps> = ({
  patientName,
  cancelHandler,
  continueHandler,
}) => (
  <Modal
    isOpen={true}
    style={{
      content: {
        top: "50%",
        left: "50%",
        width: "40%",
        minWidth: "20em",
        maxHeight: "14em",
        marginRight: "-50%",
        transform: "translate(-50%, -50%)",
      },
    }}
    overlayClassName={"prime-modal-overlay"}
    contentLabel="Questions not answered"
  >
    <p className="usa-prose prime-modal-text">
      Time of test questions for <b> {` ${patientName} `} </b> have not been
      completed. Do you want to submit results anyway?
    </p>
    <div className="prime-modal-buttons">
      <Button onClick={cancelHandler} variant="unstyled" label="No, go back" />
      <Button onClick={continueHandler} label="Submit Anyway" />
    </div>
  </Modal>
);
Modal.setAppElement("#root");

/* 
  Dates from the backend are coming in as ISO 8601 strings: (eg: "2021-01-11T23:56:53.103Z")
  The datetime-local text input expects values in the following format *IN LOCAL TIME*: (eg: "2014-01-02T11:42:13.510")

  AFAICT, there is no easy ISO -> datetime-local converter built into vanilla JS dates, so using moment

*/
const isoDateToDatetimeLocal = (isoDateString: string | undefined) => {
  if (!isoDateString) {
    return undefined;
  }
  let datetime = moment(isoDateString);
  let datetimeLocalString = datetime.format(moment.HTML5_FMT.DATETIME_LOCAL);
  return datetimeLocalString;
};

interface QueueItemProps {
  internalId: string;
  patient: {
    internalId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    lookupId: string;
    telephone: string;
    birthDate: string;
  };
  devices: {
    name: string;
    internalId: string;
  }[];
  askOnEntry: string;
  selectedDeviceId: string;
  selectedTestResult: TestResult;
  defaultDevice: {
    internalId: string;
  };
  dateTestedProp: string;
  refetchQueue: () => void;
  facilityId: string;
}

interface updateQueueItemProps {
  deviceId?: string;
  result?: TestResult;
  dateTested?: string;
}

const QueueItem: any = ({
  internalId,
  patient,
  devices,
  askOnEntry,
  selectedDeviceId,
  selectedTestResult,
  defaultDevice,
  refetchQueue,
  facilityId,
  dateTestedProp,
}: QueueItemProps) => {
  const appInsights = useAppInsightsContext();
  const trackRemovePatientFromQueue = useTrackEvent(
    appInsights,
    "Remove Patient From Queue",
    {}
  );
  const trackSubmitTestResult = useTrackEvent(
    appInsights,
    "Submit Test Result",
    {}
  );
  const trackUpdateAoEResponse = useTrackEvent(
    appInsights,
    "Update AoE Response",
    {}
  );

  const [mutationError, updateMutationError] = useState(null);
  const [removePatientFromQueue] = useMutation(REMOVE_PATIENT_FROM_QUEUE);
  const [submitTestResult] = useMutation(SUBMIT_TEST_RESULT);
  const [updateAoe] = useMutation(UPDATE_AOE);
  const [editQueueItem] = useMutation<
    EditQueueItemResponse,
    EditQueueItemParams
  >(EDIT_QUEUE_ITEM);

  const [isAoeModalOpen, updateIsAoeModalOpen] = useState(false);
  const [aoeAnswers, setAoeAnswers] = useState(askOnEntry);

  const [deviceId, updateDeviceId] = useState(
    selectedDeviceId || defaultDevice.internalId
  );

  const [useCurrentDateTime, updateUseCurrentDateTime] = useState<string>(
    dateTestedProp ? "false" : "true"
  );
  // this is an ISO string
  // always assume the current date unless provided something else
  const [dateTested, updateDateTested] = useState<string | undefined>(
    dateTestedProp || undefined
  );

  // helper method to work around the annoying string-booleans
  function shouldUseCurrentDateTime() {
    return useCurrentDateTime === "true";
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

  const [isConfirmationModalOpen, updateIsConfirmationModalOpen] = useState(
    false
  );
  let forceSubmit = false;

  if (mutationError) {
    throw mutationError;
  }

  const testResultsSubmitted = () => {
    let { title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
        patient
      ),
    };
    let alert = <Alert type="success" title={title} body={body} />;
    showNotification(toast, alert);
  };

  const onTestResultSubmit = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    if (forceSubmit || areAnswersComplete(aoeAnswers)) {
      if (e) e.currentTarget.disabled = true;
      trackSubmitTestResult({});
      submitTestResult({
        variables: {
          patientId: patient.internalId,
          deviceId: deviceId,
          result: testResultValue,
          dateTested: shouldUseCurrentDateTime() ? null : dateTested,
        },
      })
        .then(testResultsSubmitted)
        .then(refetchQueue)
        .then(() => removeTimer(internalId))
        .catch((error) => {
          updateMutationError(error);
          // Re-enable Submit in the hopes it will work
          if (e) e.currentTarget.disabled = false;
        });
    } else {
      updateIsConfirmationModalOpen(true);
    }
  };

  const updateQueueItem = ({
    deviceId,
    result,
    dateTested,
  }: updateQueueItemProps) => {
    editQueueItem({
      variables: {
        id: internalId,
        deviceId,
        result,
        dateTested,
      },
    })
      .then((response) => {
        if (!response.data) throw Error("updateQueueItem null response");
        updateDeviceId(response.data.editQueueItem.deviceType.internalId);
        updateTestResultValue(response.data.editQueueItem.result || undefined);
      })
      .catch(updateMutationError);
  };

  const onDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.currentTarget.value;
    updateQueueItem({ deviceId, dateTested, result: testResultValue });
  };

  const onDateTestedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDateString = e.target.value; // local time
    const isValidDate = isValidCustomDateTested(rawDateString);

    if (isValidDate) {
      const dateTested = new Date(rawDateString).toISOString(); // local time

      /* the custom date input field manages its own state in the DOM, not in the react state
      The reason for this is an invalid custom date would update react. Updating another field in the queue item, like the test result, would attempt to submit the invalid date to the backend
      Instead, we are only going to update react if there is a *valid* date. 
      this can be mitigated if the backend can reliably handle null/invalid dates (never needs to be the case, just default to current date)
      or if we change our updateQueuItem function to update only a single value at a time, which is a TODO for later
    */
      updateDateTested(dateTested);
      updateQueueItem({
        deviceId,
        dateTested: dateTested,
        result: testResultValue,
      });
    }
  };

  const onTestResultChange = (result: TestResult | undefined) => {
    updateQueueItem({ deviceId, result, dateTested });
  };

  const removeFromQueue = (
    e: React.MouseEvent<HTMLButtonElement>,
    patientId: string
  ) => {
    trackRemovePatientFromQueue({});
    if (e) e.currentTarget.disabled = true;
    removePatientFromQueue({
      variables: {
        patientId,
      },
    })
      .then(refetchQueue)
      .then(() => removeTimer(internalId))
      .catch((error) => {
        updateMutationError(error);
        // Re-enable Submit in the hopes it will work
        if (e) e.currentTarget.disabled = false;
      });
  };

  const openAoeModal = () => {
    updateIsAoeModalOpen(true);
  };

  const closeAoeModal = () => {
    updateIsAoeModalOpen(false);
  };

  const saveAoeCallback = (answers: any) => {
    setAoeAnswers(answers);
    trackUpdateAoEResponse({});
    updateAoe({
      variables: {
        ...answers,
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

  let options = devices.map((device) => ({
    label: device.name,
    value: device.internalId,
  }));

  const patientFullName = displayFullName(
    patient.firstName,
    patient.middleName,
    patient.lastName
  );

  const closeButton = (
    <button
      onClick={(e) => removeFromQueue(e, patient.internalId)}
      className="prime-close-button"
      aria-label="Close"
    >
      <span className="fa-layers">
        <FontAwesomeIcon icon={"circle"} size="2x" inverse />
        <FontAwesomeIcon icon={"times-circle"} size="2x" />
      </span>
    </button>
  );

  const testDateFields =
    useCurrentDateTime === "false" ? (
      <li className="prime-li">
        <TextInput
          type="datetime-local"
          label="Test Date"
          name="meeting-time"
          value={isoDateToDatetimeLocal(dateTested)}
          min="2020-01-01T00:00"
          max={moment().add(1, "days").format("YYYY-MM-DDThh:mm")} // TODO: is this a reasonable max?
          onChange={onDateTestedChange}
        />
      </li>
    ) : null;

  return (
    <React.Fragment>
      <div className="grid-container prime-container prime-queue-item usa-card__container">
        {closeButton}
        <div className="grid-row">
          <div className="tablet:grid-col-9">
            <div className="grid-row prime-test-name usa-card__header">
              <h2>{patientFullName}</h2>
              <TestTimerWidget id={internalId} />
            </div>
            <div className="usa-card__body">
              <div className="grid-row">
                <ul className="prime-ul">
                  <li className="prime-li">
                    <LabeledText text={patient.lookupId} label="Unique ID" />
                  </li>
                  <li className="prime-li">
                    <LabeledText
                      text={patient.telephone}
                      label="Phone Number"
                    />
                  </li>
                  <li className="prime-li">
                    <LabeledText
                      text={moment(patient.birthDate).format("MM/DD/yyyy")}
                      label="Date of Birth"
                    />
                  </li>
                  <li className="prime-li">
                    <Button
                      variant="unstyled"
                      label="Time of Test Questions"
                      onClick={openAoeModal}
                    />
                    {isAoeModalOpen && (
                      <AoeModalForm
                        saveButtonText="Save"
                        onClose={closeAoeModal}
                        patient={patient}
                        loadState={aoeAnswers}
                        saveCallback={saveAoeCallback}
                        facilityId={facilityId}
                      />
                    )}
                    <p>
                      <AskOnEntryTag aoeAnswers={aoeAnswers} />
                    </p>
                  </li>
                </ul>
              </div>
              <div className="grid-row">
                <ul className="prime-ul">
                  <li className="prime-li">
                    <Dropdown
                      options={options}
                      label="Device"
                      name="testDevice"
                      selectedValue={deviceId}
                      onChange={onDeviceChange}
                    />
                  </li>
                  {testDateFields}
                  <li className="prime-li">
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
                        useCurrentDateTime === "true" ? "Test Date" : null
                      }
                      name="currentDateTime"
                      onChange={onUseCurrentDateChange}
                    />
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="tablet:grid-col-3 prime-test-result">
            {isConfirmationModalOpen && (
              <AreYouSure
                patientName={patientFullName}
                cancelHandler={() => updateIsConfirmationModalOpen(false)}
                continueHandler={() => {
                  forceSubmit = true;
                  onTestResultSubmit();
                }}
              />
            )}
            <TestResultInputForm
              queueItemId={internalId}
              testResultValue={testResultValue}
              isSubmitDisabled={
                !shouldUseCurrentDateTime() &&
                !isValidCustomDateTested(dateTested)
              }
              onSubmit={onTestResultSubmit}
              onChange={onTestResultChange}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

QueueItem.propTypes = {
  patient: patientPropType,
  devices: PropTypes.arrayOf(devicePropType),
};
export default QueueItem;
