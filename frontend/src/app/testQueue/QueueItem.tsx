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
import moment from "moment";

export type TestResult = "POSITIVE" | "NEGATIVE" | "UNDETERMINED";

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

const getDate = (datetime: string) => {
  if (!datetime) {
    return datetime;
  }
  return datetime.split("T")[0];
};

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
  const [dateTested, updateDateTested] = useState<string>(
    getDate(dateTestedProp)
  );
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
          dateTested,
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
    const dateTested = e.target.value;
    // If we try to round-trip the date to the server, it is too slow and the
    // new prop clobbers what the user typed after the request continued.
    // So, only save complete recent dates but always update locally.
    // This will need further fixing once we go to subscriptions, ugh.
    updateDateTested(dateTested);
    const thisYear = new Date().getFullYear();
    const check = new RegExp(`^(${thisYear - 1}|${thisYear})-\\d\\d-\\d\\d`);
    if (check.test(dateTested)) {
      updateQueueItem({
        dateTested: dateTested,
        result: testResultValue,
      });
    }
  };

  const onTestResultChange = (result: TestResult | undefined) => {
    updateQueueItem({ result, dateTested });
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
            <div className="grid-row usa-card__body">
              <ul className="prime-ul">
                <li className="prime-li">
                  <LabeledText text={patient.lookupId} label="Unique ID" />
                </li>
                <li className="prime-li">
                  <LabeledText text={patient.telephone} label="Phone Number" />
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
            <div className="grid-row usa-card__footer">
              <form className="usa-form">
                <Dropdown
                  options={options}
                  label="Device"
                  name="testDevice"
                  selectedValue={deviceId}
                  onChange={onDeviceChange}
                />
                <TextInput
                  type="date"
                  label="Override Date Tested"
                  name="dateTested"
                  value={dateTested}
                  onChange={onDateTestedChange}
                />
              </form>
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
