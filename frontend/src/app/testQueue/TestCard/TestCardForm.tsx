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
import { FetchResult } from "@apollo/client";

import TextInput from "../../commonComponents/TextInput";
import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { formatDate } from "../../utils/date";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import Dropdown from "../../commonComponents/Dropdown";
import { MULTIPLEX_DISEASES } from "../../testResults/constants";
import {
  MultiplexResultInput,
  SubmitQueueItemMutation,
  useEditQueueItemMutation,
  useSubmitQueueItemMutation,
  useUpdateAoeMutation,
} from "../../../generated/graphql";
import { removeTimer, updateTimer } from "../TestTimer";
import { getAppInsights } from "../../TelemetryService";
import { ALERT_CONTENT, QUEUE_NOTIFICATION_TYPES } from "../constants";
import { showError, showSuccess } from "../../utils/srToast";
import { displayFullName } from "../../utils";
import "./TestCardForm.scss";

import {
  TestCorrectionReason,
  TestCorrectionReasons,
} from "../../testResults/TestResultCorrectionModal";
import { PregnancyCode } from "../../../patientApp/timeOfTest/constants";

import {
  TestFormActionCase,
  TestFormState,
  testCardFormReducer,
} from "./TestCardFormReducer";
import CovidResultInputGroup from "./diseaseSpecificComponents/CovidResultInputGroup";
import MultiplexResultInputGroup, {
  convertFromMultiplexResultInputs,
  validateMultiplexResultState,
} from "./diseaseSpecificComponents/MultiplexResultInputGroup";
import CovidAoEForm from "./diseaseSpecificComponents/CovidAoEForm";
import { SaveStatus } from "./TestCard";
import { TestCardSubmitLoader } from "./TestCardSubmitLoader";

export interface TestFormProps {
  testOrder: QueriedTestOrder;
  devicesMap: DevicesMap;
  facility: QueriedFacility;
  refetchQueue: () => void;
  startTestPatientId: string | null;
  setStartTestPatientId: React.Dispatch<React.SetStateAction<string | null>>;
}

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

const doesDeviceSupportMultiplex = (
  deviceId: string,
  devicesMap: DevicesMap
) => {
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

export const convertFromMultiplexResponse = (
  responseResult: QueriedTestOrder["results"]
): MultiplexResultInput[] => {
  return responseResult.map((result) => ({
    diseaseName: result.disease?.name,
    testResult: result.testResult,
  }));
};

/**
 * Add more options as other disease AOEs are needed
 */
enum AOEFormOptions {
  COVID = "COVID",
}

const areAOEAnswersComplete = (
  formState: TestFormState,
  whichAOE: AOEFormOptions
) => {
  if (whichAOE === AOEFormOptions.COVID) {
    const isPregnancyAnswered = !!formState.covidAOEResponses.pregnancy;
    const isHasAnySymptomsAnswered = !!formState.covidAOEResponses.noSymptoms;
    if (formState.covidAOEResponses.noSymptoms === false) {
      const areSymptomsFilledIn = !!formState.covidAOEResponses.symptoms;
      const isSymptomOnsetDateAnswered =
        !!formState.covidAOEResponses.symptomOnsetDate;
      return (
        isPregnancyAnswered &&
        isHasAnySymptomsAnswered &&
        areSymptomsFilledIn &&
        isSymptomOnsetDateAnswered
      );
    }
    return isPregnancyAnswered && isHasAnySymptomsAnswered;
  }
};

const TestCardForm = ({
  testOrder,
  devicesMap,
  facility,
  refetchQueue,
  startTestPatientId,
  setStartTestPatientId,
}: TestFormProps) => {
  const initialFormState: TestFormState = {
    dirty: false,
    dateTested: testOrder.dateTested,
    deviceId: testOrder.deviceType.internalId ?? "",
    devicesMap: devicesMap,
    specimenId: testOrder.specimenType.internalId ?? "",
    testResults: testOrder.results,
    covidAOEResponses: {
      pregnancy: testOrder.pregnancy as PregnancyCode,
      noSymptoms: testOrder.noSymptoms,
      symptomOnsetDate: testOrder.symptomOnset,
      symptoms: testOrder.symptoms,
    },
  };
  const [state, dispatch] = useReducer(testCardFormReducer, initialFormState);
  const [dateTestedTouched, setDateTestedTouched] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [testResultsError, setTestResultsError] = useState("");
  const [editQueueItem] = useEditQueueItemMutation();
  const [updateAoeMutation] = useUpdateAoeMutation();
  const [submitTestResult] = useSubmitQueueItemMutation();
  const [useCurrentTime, setUseCurrentTime] = useState(true);
  const appInsights = getAppInsights();
  const submitModalRef = useRef<ModalRef>(null);

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

  const DEBOUNCE_TIME = 300;

  let deviceTypeOptions = useMemo(
    () =>
      [...facility!.deviceTypes].sort(alphabetizeByName).map((d) => ({
        label: d.name,
        value: d.internalId,
      })),
    [facility]
  );
  const deviceTypeIsInvalid = !devicesMap.has(state.deviceId);

  if (state.deviceId && !devicesMap.has(state.deviceId)) {
    // this adds an empty option for when the device has been deleted from the facility, but it's on the test order
    deviceTypeOptions = [{ label: "", value: "" }, ...deviceTypeOptions];
  }

  let specimenTypeOptions = useMemo(
    () =>
      state.deviceId && devicesMap.has(state.deviceId)
        ? [...devicesMap.get(state.deviceId)!.swabTypes]
            .sort(alphabetizeByName)
            .map((s: SpecimenType) => ({
              label: s.name,
              value: s.internalId,
            }))
        : [],
    [state.deviceId, devicesMap]
  );
  const specimenTypeIsInvalid =
    devicesMap.has(state.deviceId) &&
    devicesMap
      .get(state.deviceId)!
      .swabTypes.filter((s) => s.internalId === state.specimenId).length === 0;

  if (specimenTypeIsInvalid) {
    // this adds an empty option for when the specimen has been deleted from the device, but it's on the test order
    specimenTypeOptions = [{ label: "", value: "" }, ...specimenTypeOptions];
  }

  const deviceSupportsMultiplex = useMemo(() => {
    return doesDeviceSupportMultiplex(state.deviceId, devicesMap);
  }, [devicesMap, state.deviceId]);

  // when other diseases are added, update this to use the correct AOE for that disease
  const whichAOEFormOption = AOEFormOptions.COVID;

  const validateDateTested = () => {
    const EARLIEST_TEST_DATE = new Date("01/01/2020 12:00:00 AM");
    if (!state.dateTested) {
      return "";
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

  let dateTestedErrorMessage = validateDateTested();

  const saveAOEResponses = async () => {
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
        refetchQueue();
      } catch (e) {
        // caught upstream by error boundary
        throw e;
      }
    }
  };

  const saveTestOrderChanges = async () => {
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
      const newDeviceId = response.data.editQueueItem?.deviceType;
      if (newDeviceId && newDeviceId.internalId !== state.deviceId) {
        dispatch({
          type: TestFormActionCase.UPDATE_DEVICE_ID,
          payload: newDeviceId.internalId,
        });
        updateTimer(testOrder.internalId, newDeviceId.testLength);
      }
    } catch (e) {
      // caught upstream by error boundary
      throw e;
    }
  };

  // when user makes changes, send update to backend
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    if (state.dirty) {
      dispatch({ type: TestFormActionCase.UPDATE_DIRTY_STATE, payload: false });
      setSaveStatus("editing");
      debounceTimer = setTimeout(async () => {
        await saveTestOrderChanges();
        await saveAOEResponses();
        setSaveStatus("idle");
      }, DEBOUNCE_TIME);
    }
    return () => {
      clearTimeout(debounceTimer);
      setSaveStatus("idle");
    };
    // eslint-disable-next-line
  }, [state.deviceId, state.specimenId, state.dateTested, state.testResults]);

  // when backend sends an updated test order, update the form state
  useEffect(() => {
    // don't update if not done saving changes
    if (state.dirty) return;
    dispatch({
      type: TestFormActionCase.UPDATE_WITH_CHANGES_FROM_SERVER,
      payload: testOrder,
    });
    // eslint-disable-next-line
  }, [testOrder]);

  // when backend sends an updated devices map, update the form state
  useEffect(() => {
    // don't update if not done saving changes
    if (state.dirty) return;
    dispatch({
      type: TestFormActionCase.UPDATE_DEVICES_MAP,
      payload: devicesMap,
    });
    // eslint-disable-next-line
  }, [devicesMap]);

  const validateForm = () => {
    dateTestedErrorMessage = validateDateTested();
    setTestResultsError("");
    if (state.dateTested && dateTestedErrorMessage.length > 0) {
      showError(dateTestedErrorMessage, "Invalid test date");
      return false;
    }
    if (deviceSupportsMultiplex) {
      const multiplexResults = convertFromMultiplexResultInputs(
        state.testResults
      );
      const isMultiplexValid = validateMultiplexResultState(
        multiplexResults,
        state.deviceId,
        devicesMap
      );
      if (!isMultiplexValid) {
        // TODO: provide better error message based on device rules
        const multiplexErrorMessage = "Multiplex result is not valid";
        setTestResultsError(multiplexErrorMessage);
        showError(multiplexErrorMessage, "Invalid test results");
        return false;
      }
    }
    return true;
  };

  const submitForm = async (forceSubmit: boolean = false) => {
    if (!validateForm()) {
      return;
    }

    if (!forceSubmit && !areAOEAnswersComplete(state, whichAOEFormOption)) {
      submitModalRef.current?.toggleModal();
      return;
    }

    setSaveStatus("saving");
    if (appInsights) {
      trackSubmitTestResult();
    }
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
      notifyUserOnResponse(result);
      if (startTestPatientId === testOrder.patient.internalId) {
        setStartTestPatientId(null);
      }
      removeTimer(testOrder.internalId);
      refetchQueue();
    } catch (error: any) {
      // should we send error alert here that it failed instead of default error boundary?
      setSaveStatus("error");
      throw error;
    }
  };

  const notifyUserOnResponse = (
    response: FetchResult<SubmitQueueItemMutation>
  ) => {
    let { title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
        testOrder.patient
      ),
    };

    const patientFullName = displayFullName(
      testOrder.patient.firstName,
      testOrder.patient.middleName,
      testOrder.patient.lastName
    );

    if (response?.data?.submitQueueItem?.deliverySuccess === false) {
      let deliveryFailureTitle = `Unable to text result to ${patientFullName}`;
      let deliveryFailureMsg =
        "The phone number provided may not be valid or may not be able to accept text messages";
      showError(deliveryFailureMsg, deliveryFailureTitle);
    }
    showSuccess(body, title);
  };

  const onUseCurrentDateTime = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUseCurrentTime(event.target.checked);
    dispatch({
      type: TestFormActionCase.UPDATE_DATE_TESTED,
      payload: event.target.checked ? "" : moment().toISOString(),
    });
  };

  const patientFullName = displayFullName(
    testOrder.patient.firstName,
    testOrder.patient.middleName,
    testOrder.patient.lastName
  );

  const isCorrection = testOrder.correctionStatus === "CORRECTED";
  const reasonForCorrection =
    testOrder.reasonForCorrection as TestCorrectionReason;

  const showDateMonthsAgoWarning =
    moment(state.dateTested) < moment().subtract(6, "months") &&
    dateTestedErrorMessage.length === 0;

  const showErrorSummary =
    dateTestedErrorMessage.length > 0 || testResultsError.length > 0;

  return (
    <>
      <TestCardSubmitLoader
        show={saveStatus === "saving"}
        name={patientFullName}
      />
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
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
        >
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
              <strong>Check test date:</strong> The date you selected is more
              than six months ago. Please make sure it's correct before
              submitting.
            </Alert>
          )}
          {showErrorSummary && (
            <Alert
              type={"error"}
              headingLevel={"h4"}
              className="margin-top-2"
              validation
            >
              <div>
                <strong>Please correct the following errors:</strong>
              </div>
              <ul className={"margin-y-0"}>
                {dateTestedErrorMessage && <li>{dateTestedErrorMessage}</li>}
                {testResultsError && <li>{testResultsError}</li>}
              </ul>
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
                  onBlur={(e) => setDateTestedTouched(true)}
                  onChange={(e) =>
                    dispatch({
                      type: TestFormActionCase.UPDATE_DATE_TESTED,
                      payload: e.target.value,
                    })
                  }
                  disabled={deviceTypeIsInvalid || specimenTypeIsInvalid}
                  validationStatus={
                    dateTestedTouched && dateTestedErrorMessage
                      ? "error"
                      : undefined
                  }
                  errorMessage={dateTestedTouched && dateTestedErrorMessage}
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
                  validationStatus={
                    dateTestedTouched && dateTestedErrorMessage
                      ? "error"
                      : undefined
                  }
                  disabled={deviceTypeIsInvalid || specimenTypeIsInvalid}
                ></TextInput>
              </div>
            </div>
          )}
          <div className="grid-row grid-gap">
            <div className="grid-col-auto">
              {useCurrentTime && (
                <Label className={"margin-top-3"} htmlFor={"current-date-time"}>
                  Test date and time
                </Label>
              )}
              <Checkbox
                id={`current-date-time-${testOrder.patient.internalId}`}
                name={"current-date-time"}
                label={"Current date and time"}
                checked={useCurrentTime}
                onChange={onUseCurrentDateTime}
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
              <Button type={"submit"}>Submit results</Button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default TestCardForm;
