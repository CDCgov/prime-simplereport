import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMutation } from "@apollo/client";
import Modal from "react-modal";
import classnames from "classnames";
import moment, { Moment } from "moment";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { throttle } from "lodash";
import { useFeature } from "flagged";

import {
  MultiplexResultInput,
  useRemovePatientFromQueueMutation,
  useEditQueueItemMultiplexResultMutation,
  useAddMultiplexResultMutation,
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

const EARLIEST_TEST_DATE = new Date("01/01/2020 12:00:00 AM");

interface EditQueueItemParams {
  id: string;
  deviceId?: string;
  deviceSpecimenType: string;
  results?: MultiplexResultInput[];
  dateTested?: string;
}

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

const convertFromMultiplexResponse = (
  responseResult: MultiplexResult[]
): MultiplexResultInput[] => {
  const multiplexResultInputs: MultiplexResultInput[] = responseResult.map(
    (result) => ({
      diseaseName: result.disease.name,
      testResult: result.testResult,
    })
  );
  return multiplexResultInputs;
};

if (process.env.NODE_ENV !== "test") {
  Modal.setAppElement("#root");
}

export interface QueueItemProps {
  internalId: string;
  patient: TestQueuePerson;
  startTestPatientId: string | null;
  setStartTestPatientId: any;
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
  selectedTestResults: MultiplexResult[];
  dateTestedProp: string;
  refetchQueue: () => void;
  facilityName: string | undefined;
  facilityId: string;
  isCorrection?: boolean;
  reasonForCorrection?: TestCorrectionReason;
}

interface updateQueueItemProps {
  deviceId?: string;
  deviceSpecimenType: string;
  testLength?: number;
  results?: MultiplexResultInput[];
  dateTested?: string;
}

type SaveState = "idle" | "editing" | "saving" | "error";

const QueueItem = ({
  internalId,
  patient,
  startTestPatientId,
  setStartTestPatientId,
  deviceSpecimenTypes,
  askOnEntry,
  selectedDeviceId,
  selectedDeviceSpecimenTypeId,
  selectedDeviceTestLength,
  selectedTestResults,
  refetchQueue,
  facilityName,
  facilityId,
  dateTestedProp,
  isCorrection = false,
  reasonForCorrection,
}: QueueItemProps) => {
  const appInsights = getAppInsights();
  const navigate = useNavigate();
  const multiplexFlag = useFeature("multiplexEnabled");

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
  const [removePatientFromQueue] = useRemovePatientFromQueueMutation();
  const [submitTestResult, { loading }] = useAddMultiplexResultMutation();
  const [updateAoe] = useMutation(UPDATE_AOE);
  const [editQueueItem] = useEditQueueItemMultiplexResultMutation();

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
  const [supportsMultipleDiseases, updateSupportsMultipleDiseases] = useState(
    false
  );

  // Populate device+specimen state variables from selected device specimen type
  useEffect(() => {
    // Asserting this type should be OK - the parent component is responsible
    // for removing invalid or deleted device specimen types from the collection
    // passed in as props
    const deviceSpecimenType = deviceSpecimenTypes.find(
      (dst) => dst.internalId === deviceSpecimenTypeId
    ) as DeviceSpecimenType;

    let supportsMultipleDiseases;
    if (
      multiplexFlag &&
      deviceSpecimenType.deviceType.supportedDiseases.filter(
        (d: any) => d.name !== "COVID-19"
      ).length > 0
    ) {
      supportsMultipleDiseases = true;
    } else {
      supportsMultipleDiseases = false;
    }

    updateDeviceSpecimenTypeId(deviceSpecimenType.internalId);
    updateDeviceId(deviceSpecimenType.deviceType.internalId);
    updateSpecimenId(deviceSpecimenType.specimenType.internalId);
    updateSupportsMultipleDiseases(supportsMultipleDiseases);
  }, [deviceSpecimenTypes, deviceSpecimenTypeId, multiplexFlag]);

  const testCardElement = useRef() as React.MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    if (startTestPatientId === patient.internalId) {
      testCardElement.current.scrollIntoView({ behavior: "smooth" });
    }
  });

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

    return dateTested > EARLIEST_TEST_DATE && dateTested < new Date();
  }

  /***
   * Handle caching of results
   */

  const [cacheTestResults, setCacheTestResults] = useState(
    convertFromMultiplexResponse(selectedTestResults)
  );
  const multiplexResultInputsRef = useRef<MultiplexResultInput[]>(
    cacheTestResults
  ); // persistent reference to use in Effect

  useEffect(() => {
    // update cache when selectedTestResults prop update
    setCacheTestResults(convertFromMultiplexResponse(selectedTestResults));
    multiplexResultInputsRef.current = convertFromMultiplexResponse(
      selectedTestResults
    );
  }, [selectedTestResults]);

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
        patient
      ),
    };

    if (response?.data?.addMultiplexResult.deliverySuccess === false) {
      let deliveryFailureTitle = `Unable to text result to ${patientFullName}`;
      let deliveryFailureMsg =
        "The phone number provided may not be valid or may not be able to accept text messages";
      showError(deliveryFailureMsg, deliveryFailureTitle);
    }
    showSuccess(body, title);
  };

  const onTestResultSubmit = async (forceSubmit: boolean = false) => {
    if (
      dateTested &&
      !shouldUseCurrentDateTime() &&
      !isValidCustomDateTested(dateTested)
    ) {
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
      const results = Object.assign([], cacheTestResults);

      const result = await submitTestResult({
        variables: {
          patientId: patient.internalId,
          deviceId: deviceId,
          deviceSpecimenType: deviceSpecimenTypeId,
          results,
          dateTested: shouldUseCurrentDateTime() ? null : dateTested,
        },
      });
      testResultsSubmitted(result);
      refetchQueue();
      removeTimer(internalId);
      setStartTestPatientId(null);
    } catch (error: any) {
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
          results: props.results,
          dateTested: props.dateTested,
          deviceSpecimenType: props.deviceSpecimenType,
        },
      })
        .then((response) => {
          if (!response.data) throw Error("updateQueueItem null response");
          updateDeviceSpecimenTypeId(
            response?.data?.editQueueItemMultiplexResult?.deviceSpecimenType
              ?.internalId ?? ""
          );
          updateTimer(
            internalId,
            response?.data?.editQueueItemMultiplexResult?.deviceSpecimenType
              ?.deviceType.testLength as number
          );
          updateDeviceTestLength(
            (response?.data?.editQueueItemMultiplexResult?.deviceSpecimenType
              ?.deviceType?.testLength as number) ?? 15
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

    // the date string returned from the server is only precise to seconds; moment's
    // toISOString method returns millisecond precision. as a result, an onChange event
    // was being fired when this component initialized, sending an EditQueueItem to
    // the back end w/ the same data that it already had. this prevents it:
    if (moment(dateTested).isSame(date)) {
      return;
    }

    // Save any date given as input to React state, valid or otherwise. Validation
    // is performed on submit
    updateDateTested(newDateTested);
    setSelectedDate(date);
  };

  const isMounted = useRef(false);
  const DEBOUNCE_TIME = 300;

  useEffect(() => {
    const results = Object.assign([], multiplexResultInputsRef.current);

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
          results,
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
    updateQueueItem,
    multiplexResultInputsRef,
  ]);

  const editQueueItemService = (resultsFromForm: MultiplexResultInput[]) => {
    editQueueItem({
      variables: {
        id: internalId,
        deviceId: deviceId,
        results: resultsFromForm,
        dateTested: dateTested,
        deviceSpecimenType: deviceSpecimenTypeId,
      } as EditQueueItemParams,
    });
  };

  const throttleEditQueueItemService = useMemo(
    () => throttle(editQueueItemService, 500),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    return () => {
      throttleEditQueueItemService.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onTestResultChange = (resultsFromForm: MultiplexResultInput[]) => {
    throttleEditQueueItemService(resultsFromForm);
    setCacheTestResults(resultsFromForm);
    multiplexResultInputsRef.current = Object.assign([], resultsFromForm);
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
      .then(() => refetchQueue())
      .catch(updateMutationError);
  };

  const onUseCurrentDateChange = () => {
    // if we want to use a custom date
    if (shouldUseCurrentDateTime()) {
      setSelectedDate(moment());
      updateUseCurrentDateTime("false");
    }
    // if we want to use the current date time
    else {
      updateDateTested(undefined);
      setBeforeDateWarning(false);
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

  const [selectedDate, setSelectedDate] = useState(
    dateTested ? moment(dateTested) : moment()
  );

  const handleDateChange = (date: string) => {
    if (date) {
      const newDate = moment(date)
        .hour(selectedDate.hours())
        .minute(selectedDate.minutes());

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
    const newDate = moment(selectedDate)
      .hours(parseInt(hours))
      .minutes(parseInt(minutes));
    onDateTestedChange(newDate);
  };

  const timer = useTestTimer(internalId, deviceTestLength);

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
    if (startTestPatientId === patient.internalId) {
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
    facilityName: facilityName,
    patientId: patient.internalId,
    testOrderId: internalId,
  };

  return (
    <React.Fragment>
      <div
        className={containerClasses}
        data-testid={`test-card-${patient.internalId}`}
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
            {isCorrection && reasonForCorrection && (
              <div
                className={classnames("tablet:grid-col-12", "card-correction")}
              >
                <strong>Correction:</strong>{" "}
                {reasonForCorrection in TestCorrectionReasons
                  ? TestCorrectionReasons[reasonForCorrection]
                  : reasonForCorrection}
              </div>
            )}
            <div
              className={
                supportsMultipleDiseases
                  ? "tablet:grid-col-fill"
                  : "tablet:grid-col-9"
              }
            >
              <div
                className="grid-row prime-test-name usa-card__header"
                id="patient-name-header"
              >
                <div className="card-header">
                  <h2>
                    <Button
                      variant="unstyled"
                      className="card-name"
                      onClick={() => {
                        navigate({
                          pathname: `/patient/${patient.internalId}`,
                          search: `?facility=${facilityId}&fromQueue=true`,
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
                      {moment(patient.birthDate).format("MM/DD/yyyy")}
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
                    {isAoeModalOpen && (
                      <AoEModalForm
                        onClose={closeAoeModal}
                        patient={patient}
                        loadState={aoeAnswers}
                        saveCallback={saveAoeCallback}
                      />
                    )}
                    <div className="margin-bottom-1">
                      <AskOnEntryTag aoeAnswers={aoeAnswers} />
                    </div>
                  </div>

                  <div className="desktop:grid-col-fill flex-col-container">
                    <div
                      className={classnames(
                        saveState === "error" && "queue-item-error-message",
                        dateBeforeWarnThreshold && "card-correction-label"
                      )}
                    >
                      Test date and time
                    </div>
                    <div className="test-date-time-container">
                      <input
                        hidden={useCurrentDateTime !== "false"}
                        className={classnames(
                          "card-test-input",
                          saveState === "error" && "card-test-input__error",
                          dateBeforeWarnThreshold && "card-correction-input"
                        )}
                        aria-label="Test date"
                        id="test-date"
                        data-testid="test-date"
                        name="test-date"
                        type="date"
                        min={formatDate(new Date("Jan 1, 2020"))}
                        max={formatDate(moment().toDate())}
                        value={formatDate(selectedDate.toDate())}
                        onChange={(event) =>
                          handleDateChange(event.target.value)
                        }
                      />
                      <input
                        hidden={useCurrentDateTime !== "false"}
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
                        value={selectedDate.format("HH:mm")}
                        onChange={(e) => handleTimeChange(e.target.value)}
                      />

                      <div className="check-box-container">
                        <div className="usa-checkbox">
                          <input
                            id={`current-date-check-${patient.internalId}`}
                            className="usa-checkbox__input margin"
                            value={useCurrentDateTime}
                            checked={useCurrentDateTime === "true"}
                            type="checkbox"
                            onChange={onUseCurrentDateChange}
                            aria-label="Use current date and time"
                          />
                          <label
                            className="usa-checkbox__label margin-0 margin-right-05em"
                            htmlFor={`current-date-check-${patient.internalId}`}
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
                    useCurrentDateTime === "false" && "queue-item__form--open"
                  )}
                >
                  <div className="prime-li flex-align-self-end tablet:grid-col-4 padding-right-2">
                    <Dropdown
                      options={Array.from(deviceLookup.keys())
                        .sort(alphabetizeByName)
                        .map((d: DeviceType) => ({
                          label: d.name,
                          value: d.internalId,
                        }))}
                      label={
                        <>
                          <span>Device</span>
                          <TextWithTooltip
                            buttonLabel="Device"
                            tooltip="Don’t see the test you’re using? Ask your organization admin to add the correct test and it'll show up here."
                            position="right"
                          />
                        </>
                      }
                      name="testDevice"
                      selectedValue={deviceId}
                      onChange={onDeviceChange}
                      className="card-dropdown"
                    />
                  </div>
                  <div className="prime-li flex-align-self-end tablet:grid-col-5 padding-right-2">
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
                      className="card-dropdown"
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
                  ) : isCorrection ? (
                    <p>
                      Are you sure you want to cancel <b>{patientFullName}'s</b>{" "}
                      test correction? The original test result won’t be
                      changed.
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
              {multiplexFlag && supportsMultipleDiseases ? (
                <MultiplexResultInputForm
                  queueItemId={internalId}
                  testResults={cacheTestResults}
                  isSubmitDisabled={
                    loading || saveState === "editing" || saveState === "saving"
                  }
                  onSubmit={onTestResultSubmit}
                  onChange={onTestResultChange}
                />
              ) : (
                <CovidResultInputForm
                  queueItemId={internalId}
                  testResults={cacheTestResults}
                  isSubmitDisabled={
                    loading || saveState === "editing" || saveState === "saving"
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
