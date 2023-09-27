import moment from "moment/moment";
import { isEqual, sortBy } from "lodash";

import { PregnancyCode } from "../../../patientApp/timeOfTest/constants";
import { MultiplexResultInput } from "../../../generated/graphql";
import { DevicesMap, QueriedTestOrder } from "../QueueItem";

import { convertFromMultiplexResponse } from "./TestCardForm.utils";

export interface TestFormState {
  dateTested: string;
  dirty: boolean;
  deviceId: string;
  devicesMap: DevicesMap;
  specimenId: string;
  testResults: MultiplexResultInput[];
  covidAOEResponses: CovidAoeQuestionResponses;
}

export interface CovidAoeQuestionResponses {
  pregnancy?: PregnancyCode;
  noSymptoms?: boolean | null;
  symptoms?: string | null;
  symptomOnsetDate?: string;
}

export enum TestFormActionCase {
  UPDATE_DATE_TESTED = "UPDATE_DATE_TESTED",
  UPDATE_TIME_TESTED = "UPDATE_TIME_TESTED",
  UPDATE_DEVICE_ID = "UPDATE_DEVICE_ID",
  UPDATE_DEVICES_MAP = "UPDATE_DEVICES_MAP",
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
      payload: string;
    }
  | {
      type: TestFormActionCase.UPDATE_DEVICES_MAP;
      payload: DevicesMap;
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
        deviceId: payload,
        specimenId:
          prevState.devicesMap.get(payload)?.swabTypes[0].internalId ??
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
        covidAOEResponses: payload,
      };
    }
    case TestFormActionCase.UPDATE_DIRTY_STATE: {
      return {
        ...prevState,
        dirty: payload,
      };
    }
    case TestFormActionCase.UPDATE_WITH_CHANGES_FROM_SERVER: {
      const resultState = { ...prevState, dirty: false };

      if (prevState.deviceId !== payload.deviceType.internalId) {
        resultState.deviceId = payload.deviceType.internalId;
      }
      if (prevState.specimenId !== payload.specimenType.internalId) {
        resultState.specimenId = payload.specimenType.internalId;
      }
      if (prevState.dateTested !== payload.dateTested) {
        resultState.dateTested = payload.dateTested;
      }
      const updatedResults = convertFromMultiplexResponse(payload.results);
      // We need to sort before comparing because the order of results within the array does not always match
      // and the deep comparison would then return false even if individual test results are the same
      if (
        !isEqual(
          sortBy(prevState.testResults, "diseaseName"),
          sortBy(updatedResults, "diseaseName")
        )
      ) {
        resultState.testResults = updatedResults;
      }
      const aoeAnswers = {
        noSymptoms: payload.noSymptoms,
        symptoms: payload.symptoms,
        symptomOnset: payload.symptomOnset,
        pregnancy: payload.pregnancy,
      } as CovidAoeQuestionResponses;
      if (!isEqual(aoeAnswers, prevState.covidAOEResponses)) {
        resultState.covidAOEResponses = aoeAnswers;
      }

      return resultState;
    }
    case TestFormActionCase.UPDATE_DEVICES_MAP: {
      return {
        ...prevState,
        devicesMap: payload,
      };
    }
  }
  throw Error("Unknown action: " + type);
};
