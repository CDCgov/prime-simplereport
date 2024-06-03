import moment from "moment";
import {
  Alert,
  Button,
  Checkbox,
  FormGroup,
  Label,
} from "@trussworks/react-uswds";
import React, { useEffect, useReducer, useState } from "react";

import TextInput from "../../commonComponents/TextInput";
import { formatDate } from "../../utils/date";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import Dropdown from "../../commonComponents/Dropdown";
import { TEST_RESULTS } from "../../testResults/constants";
import {
  MultiplexResultInput,
  useEditQueueItemMutation,
  useSubmitQueueItemMutation,
  useUpdateAoeMutation,
} from "../../../generated/graphql";
import { removeTimer, updateTimer } from "../TestTimer";
import { showError } from "../../utils/srToast";
import "./TestCardForm.scss";
import {
  TestCorrectionReason,
  TestCorrectionReasons,
} from "../../testResults/viewResults/actionMenuModals/TestResultCorrectionModal";
import {
  PregnancyCode,
  SyphilisHistoryCode,
} from "../../../patientApp/timeOfTest/constants";
import { QueueItemSubmitLoader } from "../QueueItemSubmitLoader";

import {
  testCardFormReducer,
  TestFormActionCase,
  TestFormState,
} from "./TestCardFormReducer";
import CovidAoEForm from "./diseaseSpecificComponents/CovidAoEForm";
import {
  AOEFormOption,
  generateAoeValidationState,
  convertFromMultiplexResponse,
  showTestResultDeliveryStatusAlert,
  useAOEFormOption,
  useAppInsightTestCardEvents,
  useDeviceTypeOptions,
  useFilteredDeviceTypes,
  useSpecimenTypeOptions,
  useTestOrderPatient,
  AoeValidationErrorMessages,
} from "./TestCardForm.utils";
import { TestResultInputGroup } from "./diseaseSpecificComponents/TestResultInputGroup";
import { DevicesMap, QueriedFacility, QueriedTestOrder } from "./types";
import { IncompleteAOEWarningModal } from "./IncompleteAOEWarningModal";
import { HIVAoEForm } from "./diseaseSpecificComponents/HIVAoEForm";
import { stringifySymptomJsonForAoeUpdate } from "./diseaseSpecificComponents/aoeUtils";
import { SyphilisAoEForm } from "./diseaseSpecificComponents/SyphilisAoEForm";

const DEBOUNCE_TIME = 300;

export interface TestCardFormProps {
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
    aoeResponses: {
      pregnancy: testOrder.pregnancy as PregnancyCode,
      syphilisHistory: testOrder.syphilisHistory as SyphilisHistoryCode,
      noSymptoms: testOrder.noSymptoms,
      symptomOnset: testOrder.symptomOnset,
      symptoms: stringifySymptomJsonForAoeUpdate(testOrder.symptoms),
      genderOfSexualPartners: testOrder.genderOfSexualPartners,
    },
  };
  const [state, dispatch] = useReducer(testCardFormReducer, initialFormState);
  const [useCurrentTime, setUseCurrentTime] = useState(!testOrder.dateTested);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  const [editQueueItem, { loading: editQueueItemMutationLoading }] =
    useEditQueueItemMutation();
  const [updateAoeMutation, { loading: updateAoeMutationLoading }] =
    useUpdateAoeMutation();
  const [submitTestResult, { loading: submitLoading }] =
    useSubmitQueueItemMutation();

  const { trackSubmitTestResult, trackUpdateAoEResponse } =
    useAppInsightTestCardEvents();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  const filteredDeviceTypes = useFilteredDeviceTypes(facility);

  const { deviceTypeOptions, deviceTypeIsInvalid } = useDeviceTypeOptions(
    filteredDeviceTypes,
    state
  );
  const { specimenTypeOptions, specimenTypeIsInvalid } =
    useSpecimenTypeOptions(state);

  const { patientFullName } = useTestOrderPatient(testOrder);

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
    if (state.dirty) {
      dispatch({ type: TestFormActionCase.UPDATE_DIRTY_STATE, payload: false });
      updateAOE();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.aoeResponses]);

  const updateAOE = async () => {
    trackUpdateAoEResponse();
    await updateAoeMutation({
      variables: {
        patientId: testOrder.patient.internalId,
        noSymptoms: state.aoeResponses.noSymptoms,
        symptoms: stringifySymptomJsonForAoeUpdate(state.aoeResponses.symptoms),
        symptomOnset: state.aoeResponses.symptomOnset
          ? state.aoeResponses.symptomOnset
          : null,
        pregnancy: state.aoeResponses.pregnancy,
        syphilisHistory: state.aoeResponses.syphilisHistory,
        genderOfSexualPartners:
          state.aoeResponses.genderOfSexualPartners ?? null,
      },
    });
  };

  const updateTestOrder = async () => {
    const response = await editQueueItem({
      variables: {
        id: testOrder.internalId,
        deviceTypeId: state.deviceId,
        dateTested: state.dateTested,
        specimenTypeId: state.specimenId,
        results: state.testResults,
      },
    });
    if (!response.data) {
      throw Error("updateQueueItem null response data");
    }
  };

  const getDateTestedError = () => {
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
    return null;
  };

  const getDeviceTypeError = () =>
    deviceTypeIsInvalid ? "Please select a device." : null;

  const getSpecimenTypeError = () =>
    specimenTypeIsInvalid ? "Please select a specimen type." : null;

  const getTestResultsError = () => {
    const supportedDiseaseNames =
      state.devicesMap
        .get(state.deviceId)
        ?.supportedDiseaseTestPerformed.map(
          (supportedTest) => supportedTest.supportedDisease.name
        ) ?? [];
    let validResults: MultiplexResultInput[] = [];
    state.testResults.forEach((result) => {
      // check that result's disease name is supported by the current device
      const hasSupportedDiseaseName = supportedDiseaseNames.some(
        (diseaseName) => diseaseName === result.diseaseName
      );
      const isFilled =
        result.testResult === TEST_RESULTS.POSITIVE ||
        result.testResult === TEST_RESULTS.NEGATIVE ||
        result.testResult === TEST_RESULTS.UNDETERMINED;

      if (isFilled && hasSupportedDiseaseName) {
        validResults.push(result);
      }
    });
    if (validResults.length === 0) {
      return "Please enter a valid test result.";
    }

    return null;
  };

  const whichAoeFormOption = useAOEFormOption(state, devicesMap);

  const validateAoeForm = () => {
    const aoeValidationMessage = generateAoeValidationState(
      state,
      whichAoeFormOption
    );
    if (aoeValidationMessage === AoeValidationErrorMessages.COMPLETE) {
      return true;
    }
    if (aoeValidationMessage === AoeValidationErrorMessages.INCOMPLETE) {
      if (whichAoeFormOption === AOEFormOption.COVID) {
        setIsSubmitModalOpen(true);
      } else {
        showError(
          "Please complete the required questions",
          "Invalid test questionnaire"
        );
      }
      return false;
    }
    if (
      aoeValidationMessage ===
      AoeValidationErrorMessages.SYMPTOM_VALIDATION_ERROR
    ) {
      showError(
        "Please complete symptom details or indicate patient doesn't have symptoms",
        "Invalid test questionnaire"
      );
      return false;
    }
    showError(
      "Something unexpected went wrong. Please try again or contact support@simplereport.gov for help",
      "Invalid test questionnaire"
    );
    return false;
  };

  const dateTestedError = getDateTestedError();
  const deviceTypeError = getDeviceTypeError();
  const specimenTypeError = getSpecimenTypeError();
  const testResultsError = getTestResultsError();
  const showTestResultsError = hasAttemptedSubmit && testResultsError !== null;
  // only show warning if date tested has no error
  const showDateMonthsAgoWarning =
    moment(state.dateTested) < moment().subtract(6, "months") &&
    dateTestedError === null;

  const showCorrectionWarning = testOrder.correctionStatus === "CORRECTED";
  const reasonForCorrection =
    testOrder.reasonForCorrection as TestCorrectionReason;

  const validateForm = () => {
    if (dateTestedError) {
      showError(dateTestedError, "Invalid test date");
    }
    if (deviceTypeError) {
      showError(deviceTypeError, "Invalid test device");
    }
    if (specimenTypeError) {
      showError(specimenTypeError, "Invalid specimen type");
    }
    if (testResultsError) {
      showError(testResultsError, "Invalid test results");
    }
    return (
      dateTestedError === null &&
      deviceTypeError === null &&
      specimenTypeError === null &&
      testResultsError === null
    );
  };

  const submitForm = async (forceSubmit: boolean = false) => {
    setHasAttemptedSubmit(true);
    if (!validateForm()) return;
    if (!forceSubmit && !validateAoeForm()) return;

    trackSubmitTestResult();
    setIsSubmitModalOpen(false);
    const result = await submitTestResult({
      variables: {
        patientId: testOrder.patient?.internalId,
        deviceTypeId: state.deviceId,
        specimenTypeId: state.specimenId,
        dateTested: state.dateTested,
        results: state.testResults,
      },
    });
    showTestResultDeliveryStatusAlert(
      result.data?.submitQueueItem?.deliverySuccess,
      testOrder.patient
    );
    if (startTestPatientId === testOrder.patient.internalId) {
      setStartTestPatientId(null);
    }
    removeTimer(testOrder.internalId);
    refetchQueue();
  };

  return (
    <>
      <QueueItemSubmitLoader show={submitLoading} name={patientFullName} />
      <IncompleteAOEWarningModal
        name={patientFullName}
        submitForm={submitForm}
        showModal={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
      />
      <div className="grid-container">
        {/* error and warning alerts */}
        {showCorrectionWarning && (
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
                onChange={(e) => {
                  if (e.target.value) {
                    dispatch({
                      type: TestFormActionCase.UPDATE_DATE_TESTED,
                      payload: e.target.value,
                    });
                  }
                }}
                required={true}
                validationStatus={dateTestedError ? "error" : undefined}
                errorMessage={dateTestedError}
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
                onChange={(e) => {
                  if (e.target.value) {
                    dispatch({
                      type: TestFormActionCase.UPDATE_TIME_TESTED,
                      payload: e.target.value,
                    });
                  }
                }}
                validationStatus={dateTestedError ? "error" : undefined}
              ></TextInput>
            </div>
          </div>
        )}
        <div className="grid-row grid-gap">
          <div className="grid-col-auto">
            {useCurrentTime && (
              <Label className={"margin-top-3"} htmlFor={"current-date-time"}>
                Test date and time{" "}
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
        <div
          className="grid-row grid-gap"
          data-testid="device-type-dropdown-container"
        >
          <div className="grid-col-auto">
            <Dropdown
              id={`test-device-${testOrder.patient.internalId}`}
              options={deviceTypeOptions}
              label={
                <TextWithTooltip
                  text="Test device"
                  tooltip="Don’t see the test you’re using? Ask your organization admin to add the correct test and it'll show up here."
                  position="right"
                />
              }
              name="testDevice"
              ariaLabel="Test device"
              selectedValue={state.deviceId}
              onChange={(e) =>
                dispatch({
                  type: TestFormActionCase.UPDATE_DEVICE_ID,
                  payload: e.target.value,
                })
              }
              className="card-dropdown"
              data-testid="device-type-dropdown"
              errorMessage={deviceTypeError}
              validationStatus={deviceTypeError ? "error" : undefined}
              required={true}
            />
          </div>
          <div
            className="grid-col-auto"
            data-testid="specimen-type-dropdown-container"
          >
            <Dropdown
              id={`specimen-type-${testOrder.patient.internalId}`}
              options={specimenTypeOptions}
              label="Specimen type"
              name="specimenType"
              ariaLabel="Specimen type"
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
              errorMessage={specimenTypeError}
              validationStatus={specimenTypeError ? "error" : undefined}
              required={true}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <FormGroup>
            <TestResultInputGroup
              testOrderId={testOrder.internalId}
              testResults={state.testResults}
              deviceId={state.deviceId}
              deviceTypes={filteredDeviceTypes}
              onChange={(results) =>
                dispatch({
                  type: TestFormActionCase.UPDATE_TEST_RESULT,
                  payload: results,
                })
              }
            ></TestResultInputGroup>
          </FormGroup>
        </div>
        {whichAoeFormOption === AOEFormOption.COVID && (
          <div className="grid-row grid-gap">
            <CovidAoEForm
              testOrder={testOrder}
              responses={state.aoeResponses}
              hasAttemptedSubmit={hasAttemptedSubmit}
              onResponseChange={(responses) => {
                dispatch({
                  type: TestFormActionCase.UPDATE_AOE_RESPONSES,
                  payload: responses,
                });
              }}
            />
          </div>
        )}
        {whichAoeFormOption === AOEFormOption.HIV && (
          <div className="grid-row grid-gap">
            <HIVAoEForm
              testOrder={testOrder}
              responses={state.aoeResponses}
              hasAttemptedSubmit={hasAttemptedSubmit}
              onResponseChange={(responses) => {
                dispatch({
                  type: TestFormActionCase.UPDATE_AOE_RESPONSES,
                  payload: responses,
                });
              }}
            />
          </div>
        )}
        {whichAoeFormOption === AOEFormOption.SYPHILIS && (
          <div className="grid-row grid-gap">
            <SyphilisAoEForm
              testOrder={testOrder}
              responses={state.aoeResponses}
              hasAttemptedSubmit={hasAttemptedSubmit}
              onResponseChange={(responses) => {
                setHasAttemptedSubmit(false);
                dispatch({
                  type: TestFormActionCase.UPDATE_AOE_RESPONSES,
                  payload: responses,
                });
              }}
            />
          </div>
        )}
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
