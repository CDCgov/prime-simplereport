import moment from "moment/moment";

import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { displayFullName } from "../../utils";
import { MULTIPLEX_DISEASES } from "../../testResults/constants";
import { MultiplexResultInput } from "../../../generated/graphql";
import { getAppInsights } from "../../TelemetryService";
import {
  ALERT_CONTENT,
  QUEUE_NOTIFICATION_TYPES,
  SomeoneWithName,
} from "../constants";
import { showError, showSuccess } from "../../utils/srToast";

import { TestFormState } from "./TestCardFormReducer";
import { parseSymptoms } from "./diseaseSpecificComponents/CovidAoEForm";

/** Add more options as other disease AOEs are needed */
export enum AOEFormOption {
  COVID = "COVID",
  NONE = "NONE",
}

export function useTestOrderPatient(testOrder: QueriedTestOrder) {
  const patientFullName = displayFullName(
    testOrder.patient.firstName,
    testOrder.patient.middleName,
    testOrder.patient.lastName
  );

  const patientDateOfBirth = moment(testOrder.patient.birthDate);

  return { patientFullName, patientDateOfBirth };
}

export function useDeviceTypeOptions(
  facility: QueriedFacility,
  state: TestFormState
) {
  let deviceTypeOptions = [...facility!.deviceTypes]
    .sort(alphabetizeByName)
    .map((d) => ({
      label: d.name,
      value: d.internalId,
    }));

  const deviceTypeIsInvalid = !state.devicesMap.has(state.deviceId);

  if (state.deviceId && deviceTypeIsInvalid) {
    // this adds an empty option for when the device has been deleted from the facility, but it's on the test order
    deviceTypeOptions = [{ label: "", value: "" }, ...deviceTypeOptions];
  }
  return { deviceTypeOptions, deviceTypeIsInvalid };
}

export function useSpecimenTypeOptions(state: TestFormState) {
  let specimenTypeOptions =
    state.deviceId && state.devicesMap.has(state.deviceId)
      ? [...state.devicesMap.get(state.deviceId)!.swabTypes]
          .sort(alphabetizeByName)
          .map((s: SpecimenType) => ({
            label: s.name,
            value: s.internalId,
          }))
      : [];

  const specimenTypeIsInvalid =
    state.devicesMap.has(state.deviceId) &&
    state.devicesMap
      .get(state.deviceId)!
      .swabTypes.filter((s) => s.internalId === state.specimenId).length === 0;

  if (specimenTypeIsInvalid) {
    // this adds an empty option for when the specimen has been deleted from the device, but it's on the test order
    specimenTypeOptions = [{ label: "", value: "" }, ...specimenTypeOptions];
  }
  return { specimenTypeOptions, specimenTypeIsInvalid };
}

export function useAppInsightTestCardEvents() {
  const appInsights = getAppInsights();
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
  return { trackSubmitTestResult, trackUpdateAoEResponse };
}

export function alphabetizeByName(
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

export const doesDeviceSupportMultiplex = (
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

export const isDeviceFluOnly = (deviceId: string, devicesMap: DevicesMap) => {
  if (devicesMap.has(deviceId)) {
    const supportedDiseaseTests =
      devicesMap.get(deviceId)?.supportedDiseaseTestPerformed ?? [];

    return (
      supportedDiseaseTests.length > 0 &&
      supportedDiseaseTests.every(
        (disease) =>
          disease.supportedDisease.name === MULTIPLEX_DISEASES.FLU_A ||
          disease.supportedDisease.name === MULTIPLEX_DISEASES.FLU_B
      )
    );
  }
  return false;
};

export const hasAnySupportedDiseaseTests = (
  deviceId: string,
  devicesMap: DevicesMap
) => {
  if (devicesMap.has(deviceId)) {
    const supportedDiseaseTests =
      devicesMap.get(deviceId)?.supportedDiseaseTestPerformed ?? [];
    return supportedDiseaseTests.length > 0;
  }
  return false;
};

// when other diseases are added, update this to use the correct AOE for that disease
export const useAOEFormOption = (deviceId: string, devicesMap: DevicesMap) => {
  // some devices don't have any supported disease tests saved because historically they only supported COVID
  // this is often seen in some of the dev environments
  if (!hasAnySupportedDiseaseTests(deviceId, devicesMap)) {
    return AOEFormOption.COVID;
  }
  return isDeviceFluOnly(deviceId, devicesMap)
    ? AOEFormOption.NONE
    : AOEFormOption.COVID;
};

export const convertFromMultiplexResponse = (
  responseResult: QueriedTestOrder["results"]
): MultiplexResultInput[] => {
  return responseResult.map((result) => ({
    diseaseName: result.disease?.name,
    testResult: result.testResult,
  }));
};

export const areAOEAnswersComplete = (
  formState: TestFormState,
  whichAOE: AOEFormOption
) => {
  if (whichAOE === AOEFormOption.COVID) {
    const isPregnancyAnswered = !!formState.covidAOEResponses.pregnancy;
    const hasNoSymptoms = formState.covidAOEResponses.noSymptoms;
    if (formState.covidAOEResponses.noSymptoms === false) {
      const symptoms = parseSymptoms(formState.covidAOEResponses.symptoms);
      const areSymptomsFilledIn = Object.values(symptoms).some((x) =>
        x.valueOf()
      );
      const isSymptomOnsetDateAnswered =
        !!formState.covidAOEResponses.symptomOnset;
      return (
        isPregnancyAnswered &&
        !hasNoSymptoms &&
        areSymptomsFilledIn &&
        isSymptomOnsetDateAnswered
      );
    }
    return isPregnancyAnswered && hasNoSymptoms;
  }
  return true;
};

export const showTestResultDeliveryStatusAlert = (
  deliverySuccess: boolean | null | undefined,
  patient: SomeoneWithName
) => {
  if (deliverySuccess === false) {
    const { title, body } = {
      ...ALERT_CONTENT[
        QUEUE_NOTIFICATION_TYPES.DELIVERED_RESULT_TO_PATIENT__FAILURE
      ](patient),
    };
    return showError(body, title);
  }
  const { title, body } = {
    ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.SUBMITTED_RESULT__SUCCESS](
      patient
    ),
  };
  showSuccess(body, title);
};
