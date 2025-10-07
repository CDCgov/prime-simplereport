import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@apollo/client";
import Modal from "react-modal";
import classnames from "classnames";
import moment, { Moment } from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { isEqual } from "lodash";

import {
  GetFacilityQueueQuery,
  MultiplexResultInput,
  useEditQueueItemMutation,
  useRemovePatientFromQueueMutation,
  useSubmitQueueItemMutation,
} from "../../generated/graphql";
import Button from "../commonComponents/Button/Button";
import Dropdown from "../commonComponents/Dropdown";
import CovidResultInputForm from "../testResults/CovidResultInputForm";
import { displayFullName } from "../utils";
import { showError, showSuccess } from "../utils/srToast";
import { RootState } from "../store";
import { getAppInsights } from "../TelemetryService";
import { formatDate } from "../utils/date";
import { TextWithTooltip } from "../commonComponents/TextWithTooltip";
import {
  TestCorrectionReason,
  TestCorrectionReasons,
} from "../testResults/TestResultCorrectionModal";
import MultiplexResultInputForm from "../testResults/MultiplexResultInputForm";
import { MULTIPLEX_DISEASES } from "../testResults/constants";

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
import { AoEAnswers } from "./AoEForm/AoEForm";
import { QueueItemSubmitLoader } from "./QueueItemSubmitLoader";
import { UPDATE_AOE } from "./addToQueue/AddToQueueSearch";

const EARLIEST_TEST_DATE = new Date("01/01/2020 12:00:00 AM");

interface AreYouSureProps {
  isOpen: boolean;
  cancelText: string;
  continueText: string;
  cancelHandler: () => void;
  continueHandler: () => void;
  children: React.ReactNode;
}

const AreYouSure: React.FC<AreYouSureProps> = ({
  cancelHandler,
  cancelText,
  continueHandler,
  continueText,
  isOpen,
  children,
}) => (
  <Modal
    isOpen={isOpen}
    style={{
      content: {
        maxHeight: "90vh",
        width: "40em",
        position: "initial",
      },
    }}
    overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
    contentLabel="Questions not answered"
    ariaHideApp={import.meta.env.MODE !== "test"}
    onRequestClose={cancelHandler}
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

export const findResultByDiseaseName = (
  results: MultiplexResultInput[],
  name: string
) =>
  results.find((r: MultiplexResultInput) => r.diseaseName === name)
    ?.testResult ?? null;

export type QueriedTestOrder = NonNullable<
  NonNullable<GetFacilityQueueQuery["queue"]>[number]
>;
export type QueriedDeviceType = NonNullable<
  GetFacilityQueueQuery["facility"]
>["deviceTypes"][number];
export type QueriedFacility = GetFacilityQueueQuery["facility"];

const convertFromMultiplexResponse = (
  responseResult: QueriedTestOrder["results"]
): MultiplexResultInput[] => {
  return responseResult.map((result) => ({
    diseaseName: result.disease?.name,
    testResult: result.testResult,
  }));
};

export type DevicesMap = Map<string, QueriedDeviceType>;

export interface QueueItemProps {
  queueItem: QueriedTestOrder;
  startTestPatientId: string | null;
  setStartTestPatientId: any;
  facility: QueriedFacility;
  refetchQueue: () => void;
  devicesMap: DevicesMap;
}

interface UpdateQueueItemProps {
  deviceId?: string;
  specimenTypeId?: string;
  testLength?: number;
  results?: MultiplexResultInput[];
  dateTested: string | null;
}

type SaveState = "idle" | "editing" | "saving" | "error";

const CorrectionStatusBanner: React.FC<{
  isCorrection: boolean;
  reasonForCorrection: TestCorrectionReason;
}> = ({ isCorrection, reasonForCorrection }) => {
  if (isCorrection && reasonForCorrection) {
    return (
      <div className={classnames("tablet:grid-col-12", "card-correction")}>
        <strong>Correction:</strong>{" "}
        {reasonForCorrection in TestCorrectionReasons
          ? TestCorrectionReasons[reasonForCorrection]
          : reasonForCorrection}
      </div>
    );
  }
  return null;
};

function getCloseMessage(
  confirmationType: "submitResult" | "removeFromQueue" | "none",
  patientFullName: string,
  isCorrection: boolean
) {
  if (confirmationType === "submitResult") {
    return (
      <p className="usa-prose">
        The test questionnaire for <b> {` ${patientFullName} `} </b> has not
        been completed. Do you want to submit results anyway?
      </p>
    );
  } else if (isCorrection) {
    return (
      <p>
        Are you sure you want to cancel <b>{patientFullName}'s</b> test
        correction? The original test result won’t be changed.
      </p>
    );
  }
  return (
    <>
      <p className="usa-prose">
        Are you sure you want to stop <b>{patientFullName}'s</b> test?
      </p>
      <p className="usa-prose">
        Doing so will remove this person from the list. You can use the search
        bar to start their test again later.
      </p>
    </>
  );
}

const QueueItem = ({
  refetchQueue,
  queueItem,
  startTestPatientId,
  setStartTestPatientId,
  facility,
  devicesMap,
}: QueueItemProps) => {
  const testCardElement = useRef() as React.MutableRefObject<HTMLDivElement>;
  const navigate = useNavigate();
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

  const isCorrection = queueItem.correctionStatus === "CORRECTED";
  const reasonForCorrection =
    queueItem.reasonForCorrection as TestCorrectionReason;
  const selectedDeviceTestLength = queueItem.deviceType.testLength;

  const [removePatientFromQueue] = useRemovePatientFromQueueMutation();
  const [submitTestResult, { loading }] = useSubmitQueueItemMutation();
  const [updateAoe] = useMutation(UPDATE_AOE);
  const [editQueueItem] = useEditQueueItemMutation();

  const DEBOUNCE_TIME = 300;

  const [mutationError, updateMutationError] = useState(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const [isAoeModalOpen, updateIsAoeModalOpen] = useState(false);
  const [aoeAnswers, setAoeAnswers] = useState({
    noSymptoms: queueItem.noSymptoms,
    symptoms: queueItem.symptoms,
    symptomOnset: queueItem.symptomOnset,
    pregnancy: queueItem.pregnancy,
  } as AoEAnswers);

  const [deviceId, updateDeviceId] = useState<string>(
    queueItem.deviceType.internalId
  );
  const [deviceTypeErrorMessage, setDeviceTypeErrorMessage] = useState<
    string | null
  >(null);
  const [specimenId, updateSpecimenId] = useState<string>(
    queueItem.specimenType.internalId
  );
  const [specimenTypeErrorMessage, setSpecimenTypeErrorMessage] = useState<
    string | null
  >(null);
  const [supportsMultipleDiseases, updateSupportsMultipleDiseases] =
    useState(false);

  const [cacheTestResults, setCacheTestResults] = useState(
    convertFromMultiplexResponse(queueItem.results)
  );

  const [dateTested, updateDateTested] = useState<string | null>(
    queueItem.dateTested || null
  );
  const shouldUseCurrentDateTime = dateTested === null;

  // this tracks if the ui made any edits, this needs to publish update to backend
  const [dirtyState, setDirtyState] = useState(false);

  const updateQueueItem = (props: UpdateQueueItemProps) => {
    return editQueueItem({
      variables: {
        id: queueItem.internalId,
        deviceTypeId: props.deviceId,
        results: props.results,
        dateTested: props.dateTested,
        specimenTypeId: props.specimenTypeId,
      },
    })
      .then((response) => {
        if (!response.data) throw Error("updateQueueItem null response");

        const newDeviceId = response?.data?.editQueueItem?.deviceType;
        if (newDeviceId && newDeviceId.internalId !== deviceId) {
          updateDeviceId(newDeviceId.internalId);
          updateTimer(queueItem.internalId, newDeviceId.testLength);
        }
      })
      .catch(updateMutationError);
  };

  useEffect(() => {
    // Update test card changes from server

    if (dirtyState) {
      // dont update if not done saving changes
      return;
    }

    if (deviceId !== queueItem.deviceType.internalId) {
      updateDeviceId(queueItem.deviceType.internalId);
    }
    if (specimenId !== queueItem.specimenType.internalId) {
      updateSpecimenId(queueItem.specimenType.internalId);
    }

    //update date tested fields
    if (dateTested !== queueItem.dateTested) {
      updateDateTested(queueItem.dateTested);
    }

    //update results
    const updatedResults = convertFromMultiplexResponse(queueItem.results);
    if (!isEqual(cacheTestResults, updatedResults)) {
      setCacheTestResults(updatedResults);
    }

    //update aoe
    const askOnEntry = {
      noSymptoms: queueItem.noSymptoms,
      symptoms: queueItem.symptoms,
      symptomOnset: queueItem.symptomOnset,
      pregnancy: queueItem.pregnancy,
    } as AoEAnswers;
    if (aoeAnswers !== askOnEntry) {
      setAoeAnswers(askOnEntry);
    }

    if (startTestPatientId === queueItem.patient.internalId) {
      testCardElement.current.scrollIntoView({ behavior: "smooth" });
    }
    // eslint-disable-next-line
  }, [queueItem, startTestPatientId]);

  useEffect(() => {
    if (devicesMap.has(deviceId)) {
      let deviceSupportsMultiPlex = doesDeviceSupportMultiPlex(deviceId);
      if (supportsMultipleDiseases !== deviceSupportsMultiPlex) {
        updateSupportsMultipleDiseases(deviceSupportsMultiPlex);
      }
    }
    // eslint-disable-next-line
  }, [deviceId]);

  const doesDeviceSupportMultiPlex = (deviceId: string) => {
    if (devicesMap.has(deviceId)) {
      return (
        devicesMap
          .get(deviceId)!
          .supportedDiseaseTestPerformed.filter(
            (disease) =>
              disease.supportedDisease.name !== MULTIPLEX_DISEASES.COVID_19
          ).length > 0
      );
    }
    return false;
  };

  const isFluOnly = (deviceId: string) => {
    if (devicesMap.has(deviceId)) {
      return devicesMap
        .get(deviceId)!
        .supportedDiseaseTestPerformed.every(
          (disease) =>
            disease.supportedDisease.name === MULTIPLEX_DISEASES.FLU_A ||
            disease.supportedDisease.name === MULTIPLEX_DISEASES.FLU_B
        );
    }
    return false;
  };

  const doesDeviceSupportMultiplexAndCovidOnlyResult = (deviceId: string) => {
    if (devicesMap.has(deviceId)) {
      const deviceTypeCovidDiseases = devicesMap
        .get(deviceId)!
        .supportedDiseaseTestPerformed.filter(
          (disease) =>
            disease.supportedDisease.name === MULTIPLEX_DISEASES.COVID_19
        );

      if (deviceTypeCovidDiseases.length >= 1) {
        const testPerformedLoincs = [
          ...new Set(
            deviceTypeCovidDiseases.map((value) => value.testPerformedLoincCode)
          ),
        ].filter((item): item is string => !!item);
        const testOrderedLoincs = [
          ...new Set(
            deviceTypeCovidDiseases.map((value) => value.testOrderedLoincCode)
          ),
        ].filter((item): item is string => !!item);
        const hasSingleCovidTestPerformedLoinc =
          testPerformedLoincs.length === 1;
        const hasMultipleCovidTestOrderedLoincs = testOrderedLoincs.length > 1;
        return (
          hasSingleCovidTestPerformedLoinc && hasMultipleCovidTestOrderedLoincs
        );
      }
    }
    return false;
  };

  useEffect(() => {
    if (deviceTypeIsInvalid()) {
      setDeviceTypeErrorMessage("Please select a device");
      setSaveState("error");
    } else if (specimenTypeIsInvalid()) {
      setSpecimenTypeErrorMessage("Please select a swab type");
      setSaveState("error");
    }
    // eslint-disable-next-line
  }, [devicesMap, deviceId, specimenId]);

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    if (dirtyState) {
      setDirtyState(false);
      setSaveState("editing");
      debounceTimer = setTimeout(async () => {
        await updateQueueItem({
          deviceId,
          dateTested,
          specimenTypeId: specimenId,
          results: doesDeviceSupportMultiPlex(deviceId)
            ? cacheTestResults
            : cacheTestResults.filter(
                (result) => result.diseaseName === MULTIPLEX_DISEASES.COVID_19
              ),
        });
        setSaveState("idle");
      }, DEBOUNCE_TIME);
    }
    return () => {
      clearTimeout(debounceTimer);
      setSaveState("idle");
    };
    // eslint-disable-next-line
  }, [deviceId, specimenId, dateTested, cacheTestResults]);

  const organization = useSelector<RootState, Organization>(
    (state: any) => state.organization as Organization
  );

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

    return dateTested > EARLIEST_TEST_DATE && dateTested < new Date();
  }

  const covidResult = findResultByDiseaseName(cacheTestResults, "COVID-19");
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
        queueItem.patient
      ),
    };

    if (response?.data?.submitQueueItem.deliverySuccess === false) {
      let deliveryFailureTitle = `Unable to text result to ${patientFullName}`;
      let deliveryFailureMsg =
        "The phone number provided may not be valid or may not be able to accept text messages";
      showError(deliveryFailureMsg, deliveryFailureTitle);
    }
    showSuccess(body, title);
  };

  const deviceTypeIsInvalid = () => !devicesMap.has(deviceId);
  const specimenTypeIsInvalid = () =>
    devicesMap.has(deviceId) &&
    devicesMap
      .get(deviceId)!
      .swabTypes.filter((s) => s.internalId === specimenId).length === 0;

  const onTestResultSubmit = async (forceSubmit: boolean = false) => {
    if (dateTested && !isValidCustomDateTested(dateTested)) {
      const message =
        new Date(dateTested) < EARLIEST_TEST_DATE
          ? `Test date must be after ${moment(EARLIEST_TEST_DATE).format(
              "MM/DD/YYYY"
            )}`
          : "Test date can't be in the future";

      showError(message, "Invalid test date");

      setSaveState("error");
      return;
    }

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
          patientId: queueItem.patient?.internalId,
          deviceTypeId: deviceId,
          specimenTypeId: specimenId,
          dateTested: dateTested,
          results: doesDeviceSupportMultiPlex(deviceId)
            ? cacheTestResults
            : cacheTestResults.filter(
                (result) => result.diseaseName === MULTIPLEX_DISEASES.COVID_19
              ),
        },
      });
      testResultsSubmitted(result);
      refetchQueue();
      removeTimer(queueItem.internalId);
      setStartTestPatientId(null);
    } catch (error: any) {
      setSaveState("error");
      updateMutationError(error);
    }
  };

  const onDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.currentTarget.value;
    updateDeviceId(deviceId);
    devicesMap.has(deviceId) &&
      updateSpecimenId(devicesMap.get(deviceId)!.swabTypes[0].internalId);
    setDeviceTypeErrorMessage(null);
    setDirtyState(true);
  };

  const onSpecimenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSpecimenId(e.currentTarget.value);
    setSpecimenTypeErrorMessage(null);
    setDirtyState(true);
  };

  const onDateTestedChange = (date: moment.Moment) => {
    // the date string returned from the server is only precise to seconds; moment's
    // toISOString method returns millisecond precision. as a result, an onChange event
    // was being fired when this component initialized, sending an EditQueueItem to
    // the back end w/ the same data that it already had. this prevents it:
    if (!moment(dateTested).isSame(date)) {
      // Save any date given as input to React state, valid or otherwise. Validation
      // is performed on submit
      updateDateTested(date.toISOString());
      setDirtyState(true);
    }
  };

  const onTestResultChange = (resultsFromForm: MultiplexResultInput[]) => {
    setCacheTestResults(resultsFromForm);
    setDirtyState(true);
  };

  const removeFromQueue = () => {
    setConfirmationType("none");
    if (appInsights) {
      trackRemovePatientFromQueue();
    }
    removePatientFromQueue({
      variables: {
        patientId: removePatientId ?? "",
      },
    })
      .then(() => refetchQueue())
      .then(() => setStartTestPatientId(null))
      .then(() => removeTimer(queueItem.internalId))
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
        patientId: queueItem.patient.internalId,
      },
    })
      .then(() => refetchQueue())
      .catch(updateMutationError);
  };

  const onUseCurrentDateChange = (checked: boolean) => {
    if (checked) {
      // if we want to use the current date time
      updateDateTested(null);
      setBeforeDateWarning(false);
    } else {
      // if we want to use a custom date
      updateDateTested(moment().toISOString());
    }
    setDirtyState(true);
  };

  const patientFullName = displayFullName(
    queueItem.patient.firstName,
    queueItem.patient.middleName,
    queueItem.patient.lastName
  );

  const closeButton = (
    <button
      onClick={() => {
        setRemovePatientId(queueItem.patient.internalId);
        setConfirmationType("removeFromQueue");
      }}
      className="prime-close-button"
      aria-label={`Close test for ${patientFullName}`}
    >
      <span className="fa-layers">
        <FontAwesomeIcon
          alt-text="close-circle"
          icon={"circle"}
          size="2x"
          inverse
        />
        <FontAwesomeIcon alt-text="close-x" icon={"times-circle"} size="2x" />
      </span>
    </button>
  );

  const isBeforeDateWarningThreshold = (date: Moment) => {
    return date < moment().subtract(6, "months");
  };

  const [dateBeforeWarnThreshold, setBeforeDateWarning] = useState(
    isBeforeDateWarningThreshold(moment(dateTested))
  );

  const handleDateChange = (date: string) => {
    if (date) {
      const newDate = moment(date);
      if (dateTested) {
        const oldDateTested = moment(dateTested);
        newDate.hour(oldDateTested.hours());
        newDate.minute(oldDateTested.minutes());
      }

      if (isBeforeDateWarningThreshold(newDate)) {
        setBeforeDateWarning(true);
      }
      // unset warning state
      else if (
        !isBeforeDateWarningThreshold(newDate) &&
        dateBeforeWarnThreshold
      ) {
        setBeforeDateWarning(false);
      }
      onDateTestedChange(newDate);
    }
  };

  const handleTimeChange = (timeStamp: string) => {
    const [hours, minutes] = timeStamp.split(":");
    const newDate = moment(dateTested)
      .hours(parseInt(hours))
      .minutes(parseInt(minutes));
    onDateTestedChange(newDate);
  };

  const timer = useTestTimer(queueItem.internalId, selectedDeviceTestLength);

  function cardColorDisplay() {
    const prefix = "prime-queue-item__";
    if (isCorrection) {
      return prefix + "ready";
    }
    if (saveState === "error") {
      return prefix + "error";
    }
    if (timer.countdown < 0 && covidResult === "UNKNOWN") {
      return prefix + "ready";
    }
    if (startTestPatientId === queueItem.patient.internalId) {
      return prefix + "info";
    }
    if (dateBeforeWarnThreshold) {
      return prefix + "ready";
    }
    return undefined;
  }

  const containerClasses = classnames(
    "position-relative",
    "grid-container",
    "prime-container",
    "prime-queue-item card-container queue-container-wide",
    timer.countdown < 0 &&
      covidResult !== "UNKNOWN" &&
      "prime-queue-item__completed",
    cardColorDisplay()
  );

  const timerContext = {
    organizationName: organization.name,
    facilityName: facility!.name,
    patientId: queueItem.patient.internalId,
    testOrderId: queueItem.internalId,
  };

  function getDeviceTypeOptions() {
    let deviceTypeOptions = [...facility!.deviceTypes]
      .sort(alphabetizeByName)
      .map((d) => ({
        label: d.name,
        value: d.internalId,
      }));

    if (!devicesMap.has(deviceId)) {
      // this adds an empty option for when the device has been deleted from the facility, but it's on the test order
      deviceTypeOptions = [{ label: "", value: "" }, ...deviceTypeOptions];
    }
    return deviceTypeOptions;
  }

  let deviceTypeOptions = getDeviceTypeOptions();

  function getSpecimenTypeOptions() {
    let specimenTypeOptions =
      deviceId && devicesMap.has(deviceId)
        ? [...devicesMap.get(deviceId)!.swabTypes]
            .sort(alphabetizeByName)
            .map((s: SpecimenType) => ({
              label: s.name,
              value: s.internalId,
            }))
        : [];

    if (specimenTypeIsInvalid()) {
      // this adds a empty option for when the specimen has been deleted from the device, but it's on the test order
      specimenTypeOptions = [{ label: "", value: "" }, ...specimenTypeOptions];
    }
    return specimenTypeOptions;
  }

  let specimenTypeOptions = getSpecimenTypeOptions();

  function displayDateTimeInput() {
    if (!shouldUseCurrentDateTime) {
      return (
        <>
          <input
            hidden={shouldUseCurrentDateTime}
            className={classnames(
              "card-test-input",
              saveState === "error" && "card-test-input__error",
              dateBeforeWarnThreshold && "card-correction-input"
            )}
            aria-label="Test date"
            id={`test-date-${queueItem.patient.internalId}`}
            data-testid="test-date"
            name="test-date"
            type="date"
            min={formatDate(new Date("Jan 1, 2020"))}
            max={formatDate(moment().toDate())}
            value={formatDate(moment(dateTested).toDate())}
            onChange={(event) => handleDateChange(event.target.value)}
            disabled={deviceTypeIsInvalid() || specimenTypeIsInvalid()}
          />
          <input
            hidden={shouldUseCurrentDateTime}
            className={classnames(
              "card-test-input",
              saveState === "error" && "card-test-input__error",
              dateBeforeWarnThreshold && "card-correction-input"
            )}
            name={"test-time"}
            aria-label="Test time"
            data-testid="test-time"
            type="time"
            step="60"
            value={moment(dateTested).format("HH:mm")}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={deviceTypeIsInvalid() || specimenTypeIsInvalid()}
          />
        </>
      );
    }
    return null;
  }

  return (
    <React.Fragment>
      <div
        className={containerClasses}
        data-testid={`test-card-${queueItem.patient.internalId}`}
      >
        <QueueItemSubmitLoader
          show={saveState === "saving"}
          name={patientFullName}
        />
        <div className="prime-card-container" ref={testCardElement}>
          {saveState !== "saving" && closeButton}
          <div className="grid-row">
            {dateBeforeWarnThreshold && (
              <div
                className={classnames("tablet:grid-col-12", "card-correction")}
                data-testid="test-correction-header"
              >
                <strong>Check test date:</strong> The date you selected is more
                than six months ago. Please make sure it's correct before
                submitting.
              </div>
            )}
            <CorrectionStatusBanner
              isCorrection={isCorrection}
              reasonForCorrection={reasonForCorrection}
            />
            <div
              className={
                supportsMultipleDiseases
                  ? "tablet:grid-col-fill"
                  : "tablet:grid-col-9"
              }
            >
              <div
                className="grid-row prime-test-name usa-card__header"
                id={`patient-name-header-${queueItem.patient.internalId}`}
              >
                <div className="card-header">
                  <h2>
                    <Button
                      variant="unstyled"
                      className="card-name"
                      onClick={() => {
                        navigate({
                          pathname: `/patient/${queueItem.patient.internalId}`,
                          search: `?facility=${facility!.id}&fromQueue=true`,
                        });
                      }}
                    >
                      {patientFullName}
                    </Button>
                  </h2>
                  <div className="card-dob">
                    Date of birth:
                    <span className="card-date">
                      {" "}
                      {moment(queueItem.patient.birthDate).format("MM/DD/yyyy")}
                    </span>
                  </div>
                </div>
                <TestTimerWidget timer={timer} context={timerContext} />
              </div>
              <div className="margin-top-2 margin-left-2 margin-bottom-2">
                <div className="grid-row">
                  <div className="desktop:grid-col-4 flex-col-container padding-right-2">
                    <Button
                      variant="unstyled"
                      label="Test questionnaire"
                      onClick={openAoeModal}
                      className="test-questionnaire-btn"
                    />
                    <AoEModalForm
                      isOpen={isAoeModalOpen}
                      onClose={closeAoeModal}
                      patient={queueItem.patient}
                      loadState={aoeAnswers}
                      saveCallback={saveAoeCallback}
                    />
                    <div className="margin-bottom-1">
                      <AskOnEntryTag aoeAnswers={aoeAnswers} />
                    </div>
                  </div>

                  <div className="desktop:grid-col-fill flex-col-container">
                    <div
                      className={classnames(
                        saveState === "error" &&
                          !deviceTypeErrorMessage &&
                          !specimenTypeErrorMessage &&
                          "queue-item-error-message",
                        dateBeforeWarnThreshold && "card-correction-label"
                      )}
                    >
                      Test date and time
                    </div>
                    <div className="test-date-time-container">
                      {displayDateTimeInput()}
                      <div className="check-box-container">
                        <div className="usa-checkbox">
                          <input
                            id={`current-date-check-${queueItem.patient.internalId}`}
                            className="usa-checkbox__input margin"
                            checked={shouldUseCurrentDateTime}
                            type="checkbox"
                            onChange={(e) =>
                              onUseCurrentDateChange(e.target.checked)
                            }
                            aria-label="Use current date and time"
                            disabled={
                              deviceTypeIsInvalid() || specimenTypeIsInvalid()
                            }
                          />
                          <label
                            className="usa-checkbox__label margin-0 margin-right-05em"
                            htmlFor={`current-date-check-${queueItem.patient.internalId}`}
                          >
                            Current date/time
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={classnames(
                    "queue-item__form prime-ul grid-row",
                    !shouldUseCurrentDateTime && "queue-item__form--open"
                  )}
                >
                  <div className="prime-li flex-align-self-end tablet:grid-col-4 padding-right-2">
                    <Dropdown
                      options={deviceTypeOptions}
                      label={
                        <>
                          <TextWithTooltip
                            text="Device"
                            tooltip="Don’t see the test you’re using? Ask your organization admin to add the correct test and it'll show up here."
                            position="right"
                          />
                        </>
                      }
                      name="testDevice"
                      selectedValue={deviceId}
                      onChange={onDeviceChange}
                      className="card-dropdown"
                      data-testid="device-type-dropdown"
                      errorMessage={deviceTypeErrorMessage}
                      validationStatus={
                        deviceTypeErrorMessage ? "error" : "success"
                      }
                    />
                  </div>
                  <div className="prime-li flex-align-self-end tablet:grid-col-5 padding-right-2">
                    <Dropdown
                      options={specimenTypeOptions}
                      label="Swab type"
                      name="swabType"
                      selectedValue={specimenId}
                      onChange={onSpecimenChange}
                      className="card-dropdown"
                      data-testid="specimen-type-dropdown"
                      disabled={specimenTypeOptions.length === 0}
                      errorMessage={specimenTypeErrorMessage}
                      validationStatus={
                        specimenTypeErrorMessage ? "error" : "success"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            <div
              className={`prime-test-result ${
                supportsMultipleDiseases
                  ? "tablet:grid-col-5 desktop:grid-col-auto "
                  : "tablet:grid-col-3"
              }`}
            >
              <AreYouSure
                isOpen={confirmationType !== "none"}
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
                {getCloseMessage(
                  confirmationType,
                  patientFullName,
                  isCorrection
                )}
              </AreYouSure>

              {supportsMultipleDiseases ? (
                <MultiplexResultInputForm
                  queueItemId={queueItem.internalId}
                  testResults={cacheTestResults}
                  isSubmitDisabled={
                    loading ||
                    saveState === "editing" ||
                    saveState === "saving" ||
                    deviceTypeIsInvalid() ||
                    specimenTypeIsInvalid()
                  }
                  deviceSupportsCovidOnlyResult={doesDeviceSupportMultiplexAndCovidOnlyResult(
                    deviceId
                  )}
                  isFluOnly={isFluOnly(deviceId)}
                  onSubmit={onTestResultSubmit}
                  onChange={onTestResultChange}
                />
              ) : (
                <CovidResultInputForm
                  queueItemId={queueItem.internalId}
                  testResults={cacheTestResults}
                  isSubmitDisabled={
                    loading ||
                    saveState === "editing" ||
                    saveState === "saving" ||
                    deviceTypeIsInvalid() ||
                    specimenTypeIsInvalid()
                  }
                  onSubmit={onTestResultSubmit}
                  onChange={onTestResultChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default QueueItem;
