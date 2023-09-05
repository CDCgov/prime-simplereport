import moment from "moment";
import { Alert, Button } from "@trussworks/react-uswds";
import React, { useMemo, useReducer, useState } from "react";

import TextInput from "../../commonComponents/TextInput";
import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { formatDate } from "../../utils/date";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import Dropdown from "../../commonComponents/Dropdown";
import RadioGroup from "../../commonComponents/RadioGroup";
import {
  getPregnancyResponses,
  globalSymptomDefinitions,
  SymptomCode,
} from "../../../patientApp/timeOfTest/constants";
import YesNoRadioGroup from "../../commonComponents/YesNoRadioGroup";
import Checkboxes from "../../commonComponents/Checkboxes";
import { MULTIPLEX_DISEASES } from "../../testResults/constants";

import {
  TestFormActionCase,
  TestFormState,
  testCardFormReducer,
} from "./TestCardFormReducer";
import CovidResultInputGroup from "./CovidResultInputGroup";
import MultiplexResultInputGroup from "./MultiplexResultInputGroup";

export interface TestFormProps {
  testOrder: QueriedTestOrder;
  devicesMap: DevicesMap;
  facility: QueriedFacility;
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

const pregnancyResponses = getPregnancyResponses();

const TestCardForm = ({ testOrder, devicesMap, facility }: TestFormProps) => {
  const initialFormState: TestFormState = {
    dirty: false,
    dateTested: testOrder.dateTested,
    deviceId: testOrder.deviceType.internalId ?? "",
    specimenId: testOrder.specimenType.internalId ?? "",
    testResults: testOrder.results,
    questions: { symptoms: {} },
    errors: { dateTested: "", deviceId: "", specimenId: "" },
  };
  const [state, dispatch] = useReducer(testCardFormReducer, initialFormState);
  const [hasAnySymptoms, setHasAnySymptoms] = useState<YesNoUnknown>();

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
    if (devicesMap.has(state.deviceId)) {
      return (
        devicesMap
          .get(state.deviceId)!
          .supportedDiseaseTestPerformed.filter(
            (disease) =>
              disease.supportedDisease.name !== MULTIPLEX_DISEASES.COVID_19
          ).length > 0
      );
    }
    return false;
  }, [devicesMap, state.deviceId]);

  const isBeforeDateWarningThreshold =
    moment(state.dateTested) < moment().subtract(6, "months");

  return (
    <>
      {isBeforeDateWarningThreshold && (
        <div className="grid-row grid-gap">
          <div className="grid-col-auto">
            <Alert type="warning" headingLevel="h4" slim>
              <strong>Check test date:</strong> The date you selected is more
              than six months ago. Please make sure it's correct before
              submitting.
            </Alert>
          </div>
        </div>
      )}
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
            onChange={(e) =>
              dispatch({
                type: TestFormActionCase.UPDATE_DATE_TESTED,
                payload: e.target.value,
              })
            }
            disabled={deviceTypeIsInvalid || specimenTypeIsInvalid}
          ></TextInput>
        </div>
        <div className="grid-col-auto display-flex">
          <TextInput
            className="flex-align-self-end"
            id={`test-time-id`}
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
            disabled={deviceTypeIsInvalid || specimenTypeIsInvalid}
          ></TextInput>
        </div>
      </div>
      <div className="grid-row grid-gap margin-top-2">
        <div className="grid-col-auto">
          <Dropdown
            options={deviceTypeOptions}
            label={
              <>
                <TextWithTooltip
                  text="Test Device"
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
                payload: { deviceId: e.target.value, devicesMap },
              })
            }
            className="card-dropdown"
            data-testid="device-type-dropdown"
            errorMessage={state.errors.deviceId}
            validationStatus={state.errors.deviceId ? "error" : "success"}
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
            errorMessage={state.errors.specimenId}
            validationStatus={state.errors.specimenId ? "error" : "success"}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
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
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <RadioGroup
            legend="Is the patient pregnant?"
            name="pregnancy"
            onChange={(pregnancyCode) =>
              dispatch({
                type: TestFormActionCase.UPDATE_PREGNANCY,
                payload: pregnancyCode,
              })
            }
            buttons={pregnancyResponses}
            selectedRadio={state.questions.pregnancy}
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <YesNoRadioGroup
            name={`has-any-symptoms-${testOrder.internalId}`}
            legend="Is the patient currently experiencing any symptoms?"
            value={hasAnySymptoms}
            onChange={(e) => setHasAnySymptoms(e)}
          />
        </div>
      </div>
      {hasAnySymptoms === "YES" && (
        <>
          <div className="grid-row grid-gap">
            <TextInput
              id={`symptom-onset-date-${testOrder.patient.internalId}`}
              data-testid="symptom-date"
              name="symptom-date"
              type="date"
              label="When did the patient's symptoms start?"
              aria-label="Symptom onset date"
              min={formatDate(new Date("Jan 1, 2020"))}
              max={formatDate(moment().toDate())}
              value={formatDate(
                moment(state.questions.symptomOnsetDate).toDate()
              )}
              onChange={(e) =>
                dispatch({
                  type: TestFormActionCase.UPDATE_SYMPTOM_ONSET_DATE,
                  payload: e.target.value,
                })
              }
            ></TextInput>
          </div>
          <div className="grid-row grid-gap">
            <Checkboxes
              boxes={globalSymptomDefinitions}
              legend="Select any symptoms the patient is experiencing"
              name={`symptoms-${testOrder.internalId}`}
              onChange={(e) =>
                dispatch({
                  type: TestFormActionCase.TOGGLE_SYMPTOM,
                  payload: e.target.value as SymptomCode,
                })
              }
            />
          </div>
        </>
      )}
      <div className="grid-row margin-top-4">
        <div className="grid-col-auto">
          <Button type={"submit"}>Submit results</Button>
        </div>
      </div>
    </>
  );
};

export default TestCardForm;
