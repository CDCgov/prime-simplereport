import moment from "moment/moment";

import {
  PregnancyCode,
  SymptomCode,
} from "../../../patientApp/timeOfTest/constants";
import { MultiplexResultInput } from "../../../generated/graphql";
import { DevicesMap } from "../QueueItem";

export interface TestFormState {
  dateTested?: string;
  dirty: boolean;
  deviceId: string;
  specimenId: string;
  testResults: MultiplexResultInput[];
  questions: TestQuestionResponses;
  errors: {
    dateTested: string;
    deviceId: string;
    specimenId: string;
  };
}

export interface TestQuestionResponses {
  pregnancy?: PregnancyCode;
  // SymptomInputs should probably be updated to use SymptomCode and SymptomName types
  symptoms: Record<string, boolean>;
  symptomOnsetDate?: string;
}

export enum TestCardFormAction {
  UPDATE_DATE_TESTED = "UPDATE_DATE_TESTED",
  UPDATE_TIME_TESTED = "UPDATE_TIME_TESTED",
  UPDATE_DEVICE_ID = "UPDATE_DEVICE_ID",
  UPDATE_SPECIMEN_ID = "UPDATE_SPECIMEN_ID",
  UPDATE_TEST_RESULT = "UPDATE_TEST_RESULT",
  UPDATE_PREGNANCY = "UPDATE_PREGNANCY",
  TOGGLE_SYMPTOM = "TOGGLE_SYMPTOM",
  UPDATE_SYMPTOMS = "UPDATE_SYMPTOMS",
  UPDATE_SYMPTOM_ONSET_DATE = "UPDATE_SYMPTOM_ONSET_DATE",
}

export type TestQueueFormAction =
  | { type: TestCardFormAction.UPDATE_DATE_TESTED; payload: string }
  | { type: TestCardFormAction.UPDATE_TIME_TESTED; payload: string }
  | {
      type: TestCardFormAction.UPDATE_DEVICE_ID;
      payload: { deviceId: string; devicesMap: DevicesMap };
    }
  | { type: TestCardFormAction.UPDATE_SPECIMEN_ID; payload: string }
  | {
      type: TestCardFormAction.UPDATE_TEST_RESULT;
      payload: MultiplexResultInput[];
    }
  | { type: TestCardFormAction.UPDATE_PREGNANCY; payload: PregnancyCode }
  | { type: TestCardFormAction.TOGGLE_SYMPTOM; payload: SymptomCode }
  | {
      type: TestCardFormAction.UPDATE_SYMPTOMS;
      payload: Record<SymptomCode, boolean>;
    }
  | { type: TestCardFormAction.UPDATE_SYMPTOM_ONSET_DATE; payload: string };

export const testCardFormReducer = (
  prevState: TestFormState,
  { type, payload }: TestQueueFormAction
): TestFormState => {
  switch (type) {
    case TestCardFormAction.UPDATE_DATE_TESTED: {
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
    case TestCardFormAction.UPDATE_TIME_TESTED: {
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
    case TestCardFormAction.UPDATE_DEVICE_ID: {
      return {
        ...prevState,
        deviceId: payload.deviceId,
        specimenId:
          payload.devicesMap.get(payload.deviceId)?.swabTypes[0].internalId ??
          prevState.specimenId,
        dirty: true,
      };
    }
    case TestCardFormAction.UPDATE_SPECIMEN_ID: {
      return {
        ...prevState,
        specimenId: payload,
        dirty: true,
      };
    }
    case TestCardFormAction.UPDATE_TEST_RESULT: {
      console.log(prevState, payload);
      return {
        ...prevState,
        testResults: payload,
        dirty: true,
      };
    }
    case TestCardFormAction.UPDATE_PREGNANCY: {
      return {
        ...prevState,
        questions: {
          ...prevState.questions,
          pregnancy: payload,
        },
      };
    }
    case TestCardFormAction.TOGGLE_SYMPTOM: {
      return {
        ...prevState,
        questions: {
          ...prevState.questions,
          symptoms: {
            ...prevState.questions.symptoms,
          },
        },
      };
    }
    case TestCardFormAction.UPDATE_SYMPTOM_ONSET_DATE: {
      return {
        ...prevState,
        questions: {
          ...prevState.questions,
          symptomOnsetDate: moment(payload).toISOString(),
        },
      };
    }
  }
  throw Error("Unknown action: " + type);
};
