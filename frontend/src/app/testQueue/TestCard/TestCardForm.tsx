import moment from "moment";
import { Alert, Button } from "@trussworks/react-uswds";
import React, { useEffect, useMemo, useReducer, useState } from "react";

import TextInput from "../../commonComponents/TextInput";
import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { formatDate } from "../../utils/date";
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import Dropdown from "../../commonComponents/Dropdown";
import { MULTIPLEX_DISEASES } from "../../testResults/constants";
import {
  MultiplexResultInput,
  useEditQueueItemMutation,
} from "../../../generated/graphql";
import { updateTimer } from "../TestTimer";

import {
  TestFormActionCase,
  TestFormState,
  testCardFormReducer,
} from "./TestCardFormReducer";
import CovidResultInputGroup from "./CovidResultInputGroup";
import MultiplexResultInputGroup from "./MultiplexResultInputGroup";
import CovidAoEForm from "./AoE/CovidAoEForm";

export interface TestFormProps {
  testOrder: QueriedTestOrder;
  devicesMap: DevicesMap;
  facility: QueriedFacility;
}

interface UpdateQueueItemProps {
  deviceId?: string;
  specimenTypeId?: string;
  testLength?: number;
  results?: MultiplexResultInput[];
  dateTested: string | null;
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

export type SaveState = "idle" | "editing" | "saving" | "error";

export const convertFromMultiplexResponse = (
  responseResult: QueriedTestOrder["results"]
): MultiplexResultInput[] => {
  return responseResult.map((result) => ({
    diseaseName: result.disease?.name,
    testResult: result.testResult,
  }));
};

const TestCardForm = ({ testOrder, devicesMap, facility }: TestFormProps) => {
  const initialFormState: TestFormState = {
    dirty: false,
    dateTested: testOrder.dateTested,
    deviceId: testOrder.deviceType.internalId ?? "",
    specimenId: testOrder.specimenType.internalId ?? "",
    testResults: testOrder.results,
    covidAoeQuestions: {},
    errors: { dateTested: "", deviceId: "", specimenId: "" },
  };
  const [state, dispatch] = useReducer(testCardFormReducer, initialFormState);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [editQueueItem] = useEditQueueItemMutation();

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

  const isBeforeDateWarningThreshold =
    moment(state.dateTested) < moment().subtract(6, "months");

  const updateQueueItem = (props: UpdateQueueItemProps) => {
    return editQueueItem({
      variables: {
        id: testOrder.internalId,
        deviceTypeId: props.deviceId,
        results: props.results,
        dateTested: props.dateTested,
        specimenTypeId: props.specimenTypeId,
      },
    })
      .then((response) => {
        if (!response.data) throw Error("updateQueueItem null response");

        // potentially update the other fields returned from editQueueItem?
        const newDeviceId = response?.data?.editQueueItem?.deviceType;
        if (newDeviceId && newDeviceId.internalId !== state.deviceId) {
          dispatch({
            type: TestFormActionCase.UPDATE_DEVICE_ID,
            payload: { deviceId: newDeviceId.internalId, devicesMap },
          });
          updateTimer(testOrder.internalId, newDeviceId.testLength);
        }
      })
      .catch((e) => console.error("temp dev test, will be caught by apollo"));
  };

  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    if (state.dirty) {
      dispatch({ type: TestFormActionCase.UPDATE_DIRTY_STATE, payload: false });
      setSaveState("editing");
      debounceTimer = setTimeout(async () => {
        await updateQueueItem({
          deviceId: state.deviceId,
          dateTested: state.dateTested,
          specimenTypeId: state.specimenId,
          results: doesDeviceSupportMultiplex(state.deviceId, devicesMap)
            ? state.testResults
            : state.testResults.filter(
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
  }, [state.deviceId, state.specimenId, state.dateTested, state.testResults]);

  useEffect(() => {
    if (state.dirty) {
      // don't update if not done saving changes
      return;
    }
    dispatch({
      type: TestFormActionCase.UPDATE_WITH_CHANGES_FROM_SERVER,
      payload: testOrder,
    });
    // eslint-disable-next-line
  }, [testOrder]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit", state);
  };

  return (
    <form onSubmit={onSubmit}>
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
      <CovidAoEForm
        testOrder={testOrder}
        responses={state.covidAoeQuestions}
        onResponseChange={(responses) => {
          dispatch({
            type: TestFormActionCase.UPDATE_COVID_AOE_RESPONSES,
            payload: responses,
          });
        }}
      />
      <div className="grid-row margin-top-4">
        <div className="grid-col-auto">
          <Button type={"submit"}>Submit results</Button>
        </div>
      </div>
    </form>
  );
};

export default TestCardForm;
