import moment from "moment/moment";

import { PregnancyCode } from "../../../patientApp/timeOfTest/constants";
import { MultiplexResultInput } from "../../../generated/graphql";
import { DevicesMap, QueriedTestOrder } from "../QueueItem";

import { convertFromMultiplexResponse } from "./TestCardForm";

export interface TestFormState {
  dateTested: string;
  dirty: boolean;
  deviceId: string;
  specimenId: string;
  testResults: MultiplexResultInput[];
  covidAoeQuestions: CovidAoeQuestionResponses;
}

export interface CovidAoeQuestionResponses {
  pregnancy?: PregnancyCode;
  symptoms?: string | null;
  symptomOnsetDate?: string;
}

export enum TestFormActionCase {
  UPDATE_DATE_TESTED = "UPDATE_DATE_TESTED",
  UPDATE_TIME_TESTED = "UPDATE_TIME_TESTED",
  UPDATE_DEVICE_ID = "UPDATE_DEVICE_ID",
  UPDATE_SPECIMEN_ID = "UPDATE_SPECIMEN_ID",
  UPDATE_TEST_RESULT = "UPDATE_TEST_RESULT",
  UPDATE_COVID_AOE_RESPONSES = "UPDATE_COVID_AOE_RESPONSES",
  UPDATE_DIRTY_STATE = "UPDATE_DIRTY_STATE",
  UPDATE_WITH_CHANGES_FROM_SERVER = "UPDATE_WITH_CHANGES_FROM_SERVER",
}

export type TestFormAction =
  | { type: TestFormActionCase.UPDATE_DATE_TESTED; payload: string }
  | { type: TestFormActionCase.UPDATE_TIME_TESTED; payload: string }
  | {
      type: TestFormActionCase.UPDATE_DEVICE_ID;
      payload: { deviceId: string; devicesMap: DevicesMap };
    }
  | { type: TestFormActionCase.UPDATE_SPECIMEN_ID; payload: string }
  | {
      type: TestFormActionCase.UPDATE_TEST_RESULT;
      payload: MultiplexResultInput[];
    }
  | {
      type: TestFormActionCase.UPDATE_COVID_AOE_RESPONSES;
      payload: CovidAoeQuestionResponses;
    }
  | {
      type: TestFormActionCase.UPDATE_DIRTY_STATE;
      payload: boolean;
    }
  | {
      type: TestFormActionCase.UPDATE_WITH_CHANGES_FROM_SERVER;
      payload: QueriedTestOrder;
    };

export const testCardFormReducer = (
  prevState: TestFormState,
  { type, payload }: TestFormAction
): TestFormState => {
  switch (type) {
    case TestFormActionCase.UPDATE_DATE_TESTED: {
      // the date string returned from the server is only precise to seconds; moment's
      // toISOString method returns millisecond precision. as a result, an onChange event
      // was being fired when this component initialized, sending an EditQueueItem to
      // the back end w/ the same data that it already had. this prevents it:
      if (!moment(prevState.dateTested).isSame(payload)) {
        const newDate = moment(payload);
        if (prevState.dateTested) {
          const prevDateTested = moment(prevState.dateTested);
          newDate.hour(prevDateTested.hours());
          newDate.minute(prevDateTested.minutes());
        }
        return {
          ...prevState,
          dateTested: newDate.toISOString(),
          dirty: true,
        };
      }
      break;
    }
    case TestFormActionCase.UPDATE_TIME_TESTED: {
      if (payload) {
        const [hours, minutes] = payload.split(":");
        const newDate = moment(prevState.dateTested)
          .hours(parseInt(hours))
          .minutes(parseInt(minutes));
        return {
          ...prevState,
          dateTested: newDate.toISOString(),
          dirty: true,
        };
      }
      break;
    }
    case TestFormActionCase.UPDATE_DEVICE_ID: {
      return {
        ...prevState,
        deviceId: payload.deviceId,
        specimenId:
          payload.devicesMap.get(payload.deviceId)?.swabTypes[0].internalId ??
          prevState.specimenId,
        dirty: true,
      };
    }
    case TestFormActionCase.UPDATE_SPECIMEN_ID: {
      return {
        ...prevState,
        specimenId: payload,
        dirty: true,
      };
    }
    case TestFormActionCase.UPDATE_TEST_RESULT: {
      return {
        ...prevState,
        testResults: payload,
        dirty: true,
      };
    }
    case TestFormActionCase.UPDATE_COVID_AOE_RESPONSES: {
      return {
        ...prevState,
        dirty: true,
        covidAoeQuestions: payload,
      };
    }
    case TestFormActionCase.UPDATE_DIRTY_STATE: {
      return {
        ...prevState,
        dirty: false,
      };
    }
    case TestFormActionCase.UPDATE_WITH_CHANGES_FROM_SERVER: {
      return {
        ...prevState,
        dirty: false,
        deviceId: payload.deviceType.internalId,
        specimenId: payload.specimenType.internalId,
        dateTested: payload.dateTested,
        testResults: convertFromMultiplexResponse(payload.results),
        covidAoeQuestions: {
          ...prevState.covidAoeQuestions,
          symptoms: payload.symptoms,
          symptomOnsetDate: payload.symptomOnset,
          pregnancy: payload.pregnancy as PregnancyCode,
        },
      };
    }
  }
  throw Error("Unknown action: " + type);
};
