import moment from "moment/moment";
import { useMemo } from "react";

import { DevicesMap, QueriedFacility, QueriedTestOrder } from "../QueueItem";
import { displayFullName } from "../../utils";
import { MULTIPLEX_DISEASES } from "../../testResults/constants";
import { MultiplexResultInput } from "../../../generated/graphql";
import { getAppInsights } from "../../TelemetryService";

import { TestFormState } from "./TestCardFormReducer";

/** Add more options as other disease AOEs are needed */
export enum AOEFormOptions {
  COVID = "COVID",
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
  let deviceTypeOptions = useMemo(
    () =>
      [...facility!.deviceTypes].sort(alphabetizeByName).map((d) => ({
        label: d.name,
        value: d.internalId,
      })),
    [facility]
  );
  const deviceTypeIsInvalid = !state.devicesMap.has(state.deviceId);

  if (state.deviceId && deviceTypeIsInvalid) {
    // this adds an empty option for when the device has been deleted from the facility, but it's on the test order
    deviceTypeOptions = [{ label: "", value: "" }, ...deviceTypeOptions];
  }
  return { deviceTypeOptions, deviceTypeIsInvalid };
}

export function useSpecimenTypeOptions(state: TestFormState) {
  let specimenTypeOptions = useMemo(
    () =>
      state.deviceId && state.devicesMap.has(state.deviceId)
        ? [...state.devicesMap.get(state.deviceId)!.swabTypes]
            .sort(alphabetizeByName)
            .map((s: SpecimenType) => ({
              label: s.name,
              value: s.internalId,
            }))
        : [],
    [state.deviceId, state.devicesMap]
  );
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
