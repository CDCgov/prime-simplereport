import moment from "moment";
import {
  Alert,
  Button,
  ButtonGroup,
  Checkbox,
  FormGroup,
  Label,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalRef,
  ModalToggleButton,
} from "@trussworks/react-uswds";
import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";

import TextInput from "../../commonComponents/TextInput";
import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { formatDate } from "../../utils/date";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import Dropdown from "../../commonComponents/Dropdown";
import { MULTIPLEX_DISEASES } from "../../testResults/constants";
import {
  useEditQueueItemMutation,
  useSubmitQueueItemMutation,
  useUpdateAoeMutation,
} from "../../../generated/graphql";
import { removeTimer, updateTimer } from "../TestTimer";
import { ALERT_CONTENT, QUEUE_NOTIFICATION_TYPES } from "../constants";
import { showError, showSuccess } from "../../utils/srToast";
import "./TestCardForm.scss";

import {
  TestCorrectionReason,
  TestCorrectionReasons,
} from "../../testResults/TestResultCorrectionModal";
import { PregnancyCode } from "../../../patientApp/timeOfTest/constants";
import { QueueItemSubmitLoader } from "../QueueItemSubmitLoader";

import {
  TestFormActionCase,
  TestFormState,
  testCardFormReducer,
} from "./TestCardFormReducer";
import CovidResultInputGroup, {
  validateCovidResultInput,
} from "./diseaseSpecificComponents/CovidResultInputGroup";
import MultiplexResultInputGroup, {
  convertFromMultiplexResultInputs,
  validateMultiplexResultState,
} from "./diseaseSpecificComponents/MultiplexResultInputGroup";
import CovidAoEForm from "./diseaseSpecificComponents/CovidAoEForm";
import {
  AOEFormOptions,
  areAOEAnswersComplete,
  convertFromMultiplexResponse,
  doesDeviceSupportMultiplex,
  useAppInsightTestCardEvents,
  useDeviceTypeOptions,
  useSpecimenTypeOptions,
  useTestOrderPatient,
} from "./TestCardForm.utils";

const DEBOUNCE_TIME = 300;

interface TestCardFormProps {
  testOrder: QueriedTestOrder;
  devicesMap: DevicesMap;
  facility: QueriedFacility;
  refetchQueue: () => void;
  startTestPatientId: string | null;
  setStartTestPatientId: React.Dispatch<React.SetStateAction<string | null>>;
}

const TestCardForm = ({
  testOrder,
  devicesMap,
  facility,
  refetchQueue,
  startTestPatientId,
  setStartTestPatientId,
}: TestCardFormProps) => {
  const initialFormState: TestFormState = {
    dirty: false,
    dateTested: testOrder.dateTested,
    deviceId: testOrder.deviceType.internalId ?? "",
    devicesMap: devicesMap,
    specimenId: testOrder.specimenType.internalId ?? "",
    testResults: convertFromMultiplexResponse(testOrder.results),
    covidAOEResponses: {
      pregnancy: testOrder.pregnancy as PregnancyCode,
      noSymptoms: testOrder.noSymptoms,
      symptomOnsetDate: testOrder.symptomOnset,
      symptoms: testOrder.symptoms,
    },
  };
  const [state, dispatch] = useReducer(testCardFormReducer, initialFormState);
  const [useCurrentTime, setUseCurrentTime] = useState(!testOrder.dateTested);

  const [dateTestedTouched, setDateTestedTouched] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [dateTestedError, setDateTestedError] = useState("");
  const [testResultsError, setTestResultsError] = useState("");

  const [editQueueItem, { loading: editQueueItemMutationLoading }] =
    useEditQueueItemMutation();
  const [updateAoeMutation, { loading: updateAoeMutationLoading }] =
    useUpdateAoeMutation();
  const [submitTestResult, { loading: submitLoading }] =
    useSubmitQueueItemMutation();

  const submitModalRef = useRef<ModalRef>(null);

  const { trackSubmitTestResult, trackUpdateAoEResponse } =
    useAppInsightTestCardEvents();

  const { deviceTypeOptions, deviceTypeIsInvalid } = useDeviceTypeOptions(
    facility,
    state
  );

  const { specimenTypeOptions, specimenTypeIsInvalid } =
    useSpecimenTypeOptions(state);

  const { patientFullName } = useTestOrderPatient(testOrder);

  const deviceSupportsMultiplex = useMemo(() => {
    return doesDeviceSupportMultiplex(state.deviceId, devicesMap);
  }, [devicesMap, state.deviceId]);

  // when other diseases are added, update this to use the correct AOE for that disease
  // probably a good use to encapsulate this in a custom hook like useAOEFormOption
  const whichAOEFormOption = AOEFormOptions.COVID;

  /**
   * When backend sends an updated test order, update the form state
   * see refetch function and periodic polling on TestQueue useGetFacilityQueueQuery
   */
  useEffect(() => {
    // don't update if there are unsaved dirty changes or if still awaiting saved edits
    if (state.dirty || editQueueItemMutationLoading || updateAoeMutationLoading)
      return;
    dispatch({
      type: TestFormActionCase.UPDATE_WITH_CHANGES_FROM_SERVER,
      payload: testOrder,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testOrder]);

  /**
   * When backend sends an updated devices map, update the form state
   * see refetch function and periodic polling on TestQueue useGetFacilityQueueQuery
   */
  useEffect(() => {
    // don't update if not done saving changes
    if (state.dirty) return;
    dispatch({
      type: TestFormActionCase.UPDATE_DEVICES_MAP,
      payload: devicesMap,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [devicesMap]);

  /** When device id changes, update the test timer */
  useEffect(() => {
    const deviceTestLength = state.devicesMap.get(state.deviceId)?.testLength;
    if (deviceTestLength) {
      updateTimer(testOrder.internalId, deviceTestLength);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.deviceId]);

  /** When user makes changes on test order fields, send update to backend */
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    if (state.dirty) {
      dispatch({ type: TestFormActionCase.UPDATE_DIRTY_STATE, payload: false });
      debounceTimer = setTimeout(async () => {
        await updateTestOrder();
      }, DEBOUNCE_TIME);
    }
    return () => {
      clearTimeout(debounceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.deviceId, state.specimenId, state.dateTested, state.testResults]);

  /** When user makes changes to AOE responses, send update to backend */
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    if (state.dirty) {
      dispatch({ type: TestFormActionCase.UPDATE_DIRTY_STATE, payload: false });
      debounceTimer = setTimeout(async () => {
        await updateAOE();
      }, DEBOUNCE_TIME);
    }
    return () => {
      clearTimeout(debounceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.covidAOEResponses]);

  /** Validate after dateTested changes */
  useEffect(() => {
    setDateTestedError(validateDateTested());
    // eslint-disable-next-line
  }, [state.dateTested]);

  /** Validate after testResults change */
  useEffect(() => {
    setTestResultsError(validateTestResults());
    // eslint-disable-next-line
  }, [state.testResults, state.deviceId, state.devicesMap]);

  const updateAOE = async () => {
    if (whichAOEFormOption === AOEFormOptions.COVID) {
      trackUpdateAoEResponse();
      try {
        await updateAoeMutation({
          variables: {
            patientId: testOrder.patient.internalId,
            noSymptoms: state.covidAOEResponses.noSymptoms,
            symptoms: state.covidAOEResponses.symptoms,
            symptomOnset: state.covidAOEResponses.symptomOnsetDate,
            pregnancy: state.covidAOEResponses.pregnancy,
            // testResultDelivery will now be determined by user preferences on backend
          },
        });
      } catch (e) {
        // caught upstream by error boundary
        throw e;
      }
    }
  };

  const updateTestOrder = async () => {
    const resultsToSave = doesDeviceSupportMultiplex(state.deviceId, devicesMap)
      ? state.testResults
      : state.testResults.filter(
          (result) => result.diseaseName === MULTIPLEX_DISEASES.COVID_19
        );
    try {
      const response = await editQueueItem({
        variables: {
          id: testOrder.internalId,
          deviceTypeId: state.deviceId,
          dateTested: state.dateTested,
          specimenTypeId: state.specimenId,
          results: resultsToSave,
        },
      });
      if (!response.data) {
        throw Error("updateQueueItem null response data");
      }
    } catch (e) {
      // caught upstream by error boundary
      throw e;
    }
  };

  const validateDateTested = () => {
    const EARLIEST_TEST_DATE = new Date("01/01/2020 12:00:00 AM");
    if (!state.dateTested && !useCurrentTime) {
      return "Test date can't be empty";
    }
    const dateTested = new Date(state.dateTested); // local time, may be an invalid date
    // if it is an invalid date
    if (isNaN(dateTested.getTime())) {
      return "Test date is invalid. Please enter using the format MM/DD/YYYY.";
    }
    if (state.dateTested && dateTested < EARLIEST_TEST_DATE) {
      return `Test date must be after ${moment(EARLIEST_TEST_DATE).format(
        "MM/DD/YYYY"
      )}.`;
    }
    if (state.dateTested && dateTested > new Date()) {
      return "Test date can't be in the future.";
    }
    return "";
  };

  const validateTestResults = () => {
    if (deviceSupportsMultiplex) {
      const multiplexResults = convertFromMultiplexResultInputs(
        state.testResults
      );
      return validateMultiplexResultState(
        multiplexResults,
        state.deviceId,
        devicesMap
      );
    }
    return validateCovidResultInput(state.testResults);
  };

  const validateForm = () => {
    const dateTestedErrorMessage = validateDateTested();
    if (dateTestedErrorMessage) {
      showError(dateTestedErrorMessage, "Invalid test date");
    }
    const testResultsErrorMessage = validateTestResults();
    if (testResultsErrorMessage) {
      showError(testResultsErrorMessage, "Invalid test results");
    }
    setDateTestedError(dateTestedErrorMessage);
    setTestResultsError(testResultsErrorMessage);
    return (
      dateTestedErrorMessage.length === 0 &&
      testResultsErrorMessage.length === 0
    );
  };

  const submitForm = async (forceSubmit: boolean = false) => {
    setHasAttemptedSubmit(true);
    if (!validateForm()) {
      return;
    }

    if (!forceSubmit && !areAOEAnswersComplete(state, whichAOEFormOption)) {
      submitModalRef.current?.toggleModal();
      return;
    }

    trackSubmitTestResult();
    try {
      const result = await submitTestResult({
        variables: {
          patientId: testOrder.patient?.internalId,
          deviceTypeId: state.deviceId,
          specimenTypeId: state.specimenId,
          dateTested: state.dateTested,
          results: doesDeviceSupportMultiplex(state.deviceId, devicesMap)
            ? state.testResults
            : state.testResults.filter(
                (result) => result.diseaseName === MULTIPLEX_DISEASES.COVID_19
              ),
        },
      });
      showTestResultDeliveryStatusAlert(
        result.data?.submitQueueItem?.deliverySuccess
      );
      if (startTestPatientId === testOrder.patient.internalId) {
        setStartTestPatientId(null);
      }
      removeTimer(testOrder.internalId);
      refetchQueue();
    } catch (error) {
      // caught upstream by error boundary
      throw error;
    }
  };

  const showTestResultDeliveryStatusAlert = (
    deliverySuccess: boolean | null | undefined
  ) => {
    const { title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
        testOrder.patient
      ),
    };

    if (deliverySuccess === false) {
      const deliveryFailureTitle = `Unable to text result to ${patientFullName}`;
      const deliveryFailureMsg =
        "The phone number provided may not be valid or may not be able to accept text messages";
      return showError(deliveryFailureMsg, deliveryFailureTitle);
    }
    showSuccess(body, title);
  };

  const isCorrection = testOrder.correctionStatus === "CORRECTED";
  const reasonForCorrection =
    testOrder.reasonForCorrection as TestCorrectionReason;

  const showDateMonthsAgoWarning =
    moment(state.dateTested) < moment().subtract(6, "months") &&
    dateTestedError.length === 0;

  const showDateTestedError =
    (dateTestedTouched || hasAttemptedSubmit) && dateTestedError.length > 0;

  const showTestResultsError =
    hasAttemptedSubmit && testResultsError.length > 0;

  return (
    <>
      <QueueItemSubmitLoader show={submitLoading} name={patientFullName} />
      <Modal
        ref={submitModalRef}
        aria-labelledby={"submit-modal-heading"}
        id="submit-modal"
      >
        <ModalHeading id="submit-modal-heading">
          The test questionnaire for {patientFullName} has not been completed.
        </ModalHeading>
        <p>Do you want to submit results anyway?</p>
        <ModalFooter id={"submit-modal-footer"}>
          <ButtonGroup>
            <ModalToggleButton
              modalRef={submitModalRef}
              closer
              className={"margin-right-1"}
              onClick={() => submitForm(true)}
            >
              Submit anyway.
            </ModalToggleButton>
            <ModalToggleButton modalRef={submitModalRef} unstyled closer>
              No, go back.
            </ModalToggleButton>
          </ButtonGroup>
        </ModalFooter>
      </Modal>
      <div className="grid-container">
        {/* error and warning alerts */}
        {isCorrection && (
          <Alert type="warning" headingLevel="h4" className="margin-top-2">
            <strong>Correction: </strong>
            {reasonForCorrection in TestCorrectionReasons
              ? TestCorrectionReasons[reasonForCorrection]
              : reasonForCorrection}
          </Alert>
        )}
        {showDateMonthsAgoWarning && (
          <Alert type="warning" headingLevel="h4" className="margin-top-2">
            <strong>Check test date:</strong> The date you selected is more than
            six months ago. Please make sure it's correct before submitting.
          </Alert>
        )}
        {showDateTestedError && (
          <Alert
            type={"error"}
            headingLevel={"h4"}
            className="margin-top-2"
            validation
          >
            {dateTestedError}
          </Alert>
        )}
        {showTestResultsError && (
          <Alert
            type={"error"}
            headingLevel={"h4"}
            className="margin-top-2"
            validation
          >
            {testResultsError}
          </Alert>
        )}
        {!useCurrentTime && (
          <div className="grid-row grid-gap">
            <div className="grid-col-auto">
              <TextInput
                id={`test-date-${testOrder.patient.internalId}`}
                data-testid="test-date"
                name="test-date"
                type="date"
                label="Test date and time"
                aria-label="Test date"
                min={formatDate(new Date("Jan 1, 2020"))}
                max={formatDate(moment().toDate())}
                value={formatDate(moment(state.dateTested).toDate())}
                onBlur={() => setDateTestedTouched(true)}
                onChange={(e) =>
                  dispatch({
                    type: TestFormActionCase.UPDATE_DATE_TESTED,
                    payload: e.target.value,
                  })
                }
                required={true}
                disabled={deviceTypeIsInvalid || specimenTypeIsInvalid}
                validationStatus={showDateTestedError ? "error" : undefined}
                errorMessage={showDateTestedError && dateTestedError}
              ></TextInput>
            </div>
            <div className="grid-col-auto display-flex">
              <TextInput
                className="flex-align-self-end no-left-border"
                id={`test-time-${testOrder.patient.internalId}`}
                name="test-time"
                type="time"
                aria-label="Test time"
                data-testid="test-time"
                step="60"
                value={moment(state.dateTested).format("HH:mm")}
                onChange={(e) =>
                  dispatch({
                    type: TestFormActionCase.UPDATE_TIME_TESTED,
                    payload: e.target.value,
                  })
                }
                onBlur={() => setDateTestedTouched(true)}
                validationStatus={showDateTestedError ? "error" : undefined}
                disabled={deviceTypeIsInvalid || specimenTypeIsInvalid}
              ></TextInput>
            </div>
          </div>
        )}
        <div className="grid-row grid-gap">
          <div className="grid-col-auto">
            {useCurrentTime && (
              <Label className={"margin-top-3"} htmlFor={"current-date-time"}>
                <span>Test date and time </span>
                <abbr
                  title="required"
                  className={"usa-hint usa-hint--required"}
                >
                  *
                </abbr>
              </Label>
            )}
            <Checkbox
              id={`current-date-time-${testOrder.patient.internalId}`}
              name={"current-date-time"}
              label={"Current date and time"}
              checked={useCurrentTime}
              onChange={(e) => {
                setUseCurrentTime(e.target.checked);
                dispatch({
                  type: TestFormActionCase.UPDATE_DATE_TESTED,
                  payload: e.target.checked ? "" : moment().toISOString(),
                });
              }}
            ></Checkbox>
          </div>
        </div>
        <div className="grid-row grid-gap margin-top-2">
          <div className="grid-col-auto">
            <Dropdown
              options={deviceTypeOptions}
              label={
                <>
                  <TextWithTooltip
                    text="Test device"
                    tooltip="Don’t see the test you’re using? Ask your organization admin to add the correct test and it'll show up here."
                    position="right"
                  />
                </>
              }
              name="testDevice"
              selectedValue={state.deviceId}
              onChange={(e) =>
                dispatch({
                  type: TestFormActionCase.UPDATE_DEVICE_ID,
                  payload: e.target.value,
                })
              }
              className="card-dropdown"
              data-testid="device-type-dropdown"
              errorMessage={deviceTypeIsInvalid ? "Invalid device type" : ""}
              validationStatus={deviceTypeIsInvalid ? "error" : undefined}
              required={true}
            />
          </div>
          <div className="grid-col-auto">
            <Dropdown
              options={specimenTypeOptions}
              label="Specimen type"
              name="specimenType"
              selectedValue={state.specimenId}
              onChange={(e) =>
                dispatch({
                  type: TestFormActionCase.UPDATE_SPECIMEN_ID,
                  payload: e.target.value,
                })
              }
              className="card-dropdown"
              data-testid="specimen-type-dropdown"
              disabled={specimenTypeOptions.length === 0}
              errorMessage={
                specimenTypeIsInvalid ? "Invalid specimen type" : ""
              }
              validationStatus={specimenTypeIsInvalid ? "error" : undefined}
              required={true}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <FormGroup>
            {deviceSupportsMultiplex ? (
              <MultiplexResultInputGroup
                queueItemId={testOrder.internalId}
                testResults={state.testResults}
                deviceId={state.deviceId}
                devicesMap={devicesMap}
                onChange={(results) =>
                  dispatch({
                    type: TestFormActionCase.UPDATE_TEST_RESULT,
                    payload: results,
                  })
                }
              ></MultiplexResultInputGroup>
            ) : (
              <CovidResultInputGroup
                queueItemId={testOrder.internalId}
                testResults={state.testResults}
                onChange={(results) =>
                  dispatch({
                    type: TestFormActionCase.UPDATE_TEST_RESULT,
                    payload: results,
                  })
                }
              />
            )}
          </FormGroup>
        </div>
        <div className="grid-row grid-gap">
          {whichAOEFormOption === AOEFormOptions.COVID && (
            <CovidAoEForm
              testOrder={testOrder}
              responses={state.covidAOEResponses}
              onResponseChange={(responses) => {
                dispatch({
                  type: TestFormActionCase.UPDATE_COVID_AOE_RESPONSES,
                  payload: responses,
                });
              }}
            />
          )}
        </div>
        <div className="grid-row margin-top-4">
          <div className="grid-col-auto">
            <Button onClick={() => submitForm()} type={"button"}>
              Submit results
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestCardForm;
