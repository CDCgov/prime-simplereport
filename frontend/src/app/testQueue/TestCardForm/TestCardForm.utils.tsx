import moment from "moment/moment";
import { useFeature } from "flagged";

import { displayFullName } from "../../utils";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";
import { MultiplexResultInput } from "../../../generated/graphql";
import { getAppInsights } from "../../TelemetryService";
import {
  ALERT_CONTENT,
  QUEUE_NOTIFICATION_TYPES,
  SomeoneWithName,
} from "../constants";
import { showError, showSuccess } from "../../utils/srToast";

import { AoeQuestionResponses, TestFormState } from "./TestCardFormReducer";
import {
  DevicesMap,
  QueriedDeviceType,
  QueriedFacility,
  QueriedTestOrder,
} from "./types";
import { mapSpecifiedSymptomBoolLiteralsToBool } from "./diseaseSpecificComponents/aoeUtils";

/** Add more options as other disease AOEs are needed */
export enum AOEFormOption {
  COVID = "COVID",
  HIV = "HIV",
  SYPHILIS = "SYPHILIS",
  HEPATITIS_C = "HEPATITIS_C",
  GONORRHEA = "GONORRHEA",
  CHLAMYDIA = "CHLAMYDIA",
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

const filterDiseaseFromAllDevices = (
  deviceTypes: QueriedDeviceType[],
  diseaseName: MULTIPLEX_DISEASES
) => {
  const filteredDeviceTypes = deviceTypes.map((d) => {
    const filteredSupportedTests = d.supportedDiseaseTestPerformed.filter(
      (t) => t.supportedDisease.name !== diseaseName
    );
    return {
      ...d,
      supportedDiseaseTestPerformed: filteredSupportedTests,
    };
  });

  return filteredDeviceTypes.filter(
    (d) => d.supportedDiseaseTestPerformed.length > 0
  );
};

export function useFilteredDeviceTypes(facility: QueriedFacility) {
  const hivEnabled = useFeature("hivEnabled");
  const syphilisEnabled = useFeature("syphilisEnabled");
  const hepatitisCEnabled = useFeature("hepatitisCEnabled");
  const gonorrheaEnabled = useFeature("gonorrheaEnabled");
  const chlamydiaEnabled = useFeature("chlamydiaEnabled");

  let deviceTypes = [...facility!.deviceTypes];

  if (!hivEnabled) {
    deviceTypes = filterDiseaseFromAllDevices(
      deviceTypes,
      MULTIPLEX_DISEASES.HIV
    );
  }
  if (!syphilisEnabled) {
    deviceTypes = filterDiseaseFromAllDevices(
      deviceTypes,
      MULTIPLEX_DISEASES.SYPHILIS
    );
  }
  if (!hepatitisCEnabled) {
    deviceTypes = filterDiseaseFromAllDevices(
      deviceTypes,
      MULTIPLEX_DISEASES.HEPATITIS_C
    );
  }
  if (!gonorrheaEnabled) {
    deviceTypes = filterDiseaseFromAllDevices(
      deviceTypes,
      MULTIPLEX_DISEASES.GONORRHEA
    );
  }
  if (!chlamydiaEnabled) {
    deviceTypes = filterDiseaseFromAllDevices(
      deviceTypes,
      MULTIPLEX_DISEASES.CHLAMYDIA
    );
  }
  return deviceTypes;
}

export function useDeviceTypeOptions(
  deviceTypes: QueriedDeviceType[],
  state: TestFormState
) {
  let deviceTypeOptions = [...deviceTypes].sort(alphabetizeByName).map((d) => ({
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
export const useAOEFormOption = (
  testFormState: TestFormState,
  devicesMap: DevicesMap
) => {
  const resultHasPositive = testFormState.testResults.some(
    (x) => x.testResult === TEST_RESULTS.POSITIVE
  );
  // some devices don't have any supported disease tests saved because historically they only supported COVID
  // this is often seen in some of the dev environments
  if (!hasAnySupportedDiseaseTests(testFormState.deviceId, devicesMap)) {
    return AOEFormOption.COVID;
  }
  if (
    devicesMap
      .get(testFormState.deviceId)
      ?.supportedDiseaseTestPerformed.filter(
        (x) => x.supportedDisease.name === MULTIPLEX_DISEASES.CHLAMYDIA
      ).length === 1
  ) {
    return resultHasPositive ? AOEFormOption.CHLAMYDIA : AOEFormOption.NONE;
  }
  if (
    devicesMap
      .get(testFormState.deviceId)
      ?.supportedDiseaseTestPerformed.filter(
        (x) => x.supportedDisease.name === MULTIPLEX_DISEASES.GONORRHEA
      ).length === 1
  ) {
    return resultHasPositive ? AOEFormOption.GONORRHEA : AOEFormOption.NONE;
  }
  if (
    devicesMap
      .get(testFormState.deviceId)
      ?.supportedDiseaseTestPerformed.filter(
        (x) => x.supportedDisease.name === MULTIPLEX_DISEASES.HEPATITIS_C
      ).length === 1
  ) {
    return resultHasPositive ? AOEFormOption.HEPATITIS_C : AOEFormOption.NONE;
  }
  if (
    devicesMap
      .get(testFormState.deviceId)
      ?.supportedDiseaseTestPerformed.filter(
        (x) => x.supportedDisease.name === MULTIPLEX_DISEASES.HIV
      ).length === 1
  ) {
    return resultHasPositive ? AOEFormOption.HIV : AOEFormOption.NONE;
  }
  if (
    devicesMap
      .get(testFormState.deviceId)
      ?.supportedDiseaseTestPerformed.filter(
        (x) => x.supportedDisease.name === MULTIPLEX_DISEASES.SYPHILIS
      ).length === 1
  ) {
    return resultHasPositive ? AOEFormOption.SYPHILIS : AOEFormOption.NONE;
  }
  return isDeviceFluOnly(testFormState.deviceId, devicesMap)
    ? AOEFormOption.NONE
    : AOEFormOption.COVID;
};

export const convertFromMultiplexResponse = (
  responseResult: QueriedTestOrder["results"]
): MultiplexResultInput[] => {
  return responseResult.map((result) => {
    const isResultValidEnum = Object.values<string>(TEST_RESULTS).includes(
      result.testResult
    );
    return {
      diseaseName: result.disease?.name,
      testResult: isResultValidEnum ? result.testResult : TEST_RESULTS.UNKNOWN,
    };
  });
};

export const AoeValidationErrorMessages = {
  COMPLETE: "COMPLETE",
  SYMPTOM_VALIDATION_ERROR: "SYMPTOM_VALIDATION_ERROR",
  INCOMPLETE: "INCOMPLETE",
  UNKNOWN: "UNKNOWN",
} as const;

export enum AoeQuestionName {
  PREGNANCY = "pregnancy",
  NO_SYMPTOMS = "noSymptoms",
  GENDER_OF_SEXUAL_PARTNERS = "genderOfSexualPartners",
  SYPHILIS_HISTORY = "syphilisHistory",
}

export const REQUIRED_AOE_QUESTIONS_BY_DISEASE: {
  [_key in AOEFormOption]: Array<keyof AoeQuestionResponses>;
} = {
  // AOE responses for COVID not required, but include in completion validation
  // to show "are you sure" modal if not filled
  [AOEFormOption.COVID]: [
    AoeQuestionName.PREGNANCY,
    AoeQuestionName.NO_SYMPTOMS,
  ],
  [AOEFormOption.HIV]: [
    AoeQuestionName.PREGNANCY,
    AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
  ],
  [AOEFormOption.SYPHILIS]: [
    AoeQuestionName.PREGNANCY,
    AoeQuestionName.SYPHILIS_HISTORY,
    AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
    AoeQuestionName.NO_SYMPTOMS,
  ],
  [AOEFormOption.HEPATITIS_C]: [
    AoeQuestionName.PREGNANCY,
    AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
    AoeQuestionName.NO_SYMPTOMS,
  ],
  [AOEFormOption.GONORRHEA]: [
    AoeQuestionName.PREGNANCY,
    AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
    AoeQuestionName.NO_SYMPTOMS,
  ],
  [AOEFormOption.CHLAMYDIA]: [
    AoeQuestionName.PREGNANCY,
    AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
    AoeQuestionName.NO_SYMPTOMS,
  ],
  [AOEFormOption.NONE]: [],
};

export function generateAoeValidationState(
  formState: TestFormState,
  whichAOE: AOEFormOption
): keyof typeof AoeValidationErrorMessages {
  const {
    allNonSymptomAoeQuestionsAnswered,
    hasSymptomsQuestionAnswered,
    symptomOnsetAndSelectionQuestionsAnswered,
  } = areAoeQuestionsAnswered(formState, whichAOE);

  if (
    hasSymptomsQuestionAnswered &&
    !symptomOnsetAndSelectionQuestionsAnswered
  ) {
    return AoeValidationErrorMessages.SYMPTOM_VALIDATION_ERROR;
  }
  if (!allNonSymptomAoeQuestionsAnswered || !hasSymptomsQuestionAnswered) {
    return AoeValidationErrorMessages.INCOMPLETE;
  }
  if (symptomOnsetAndSelectionQuestionsAnswered) {
    return AoeValidationErrorMessages.COMPLETE;
  }
  return AoeValidationErrorMessages.UNKNOWN;
}

export function areAoeQuestionsAnswered(
  formState: TestFormState,
  whichAOE: AOEFormOption
) {
  const aoeQuestionsToCheck = REQUIRED_AOE_QUESTIONS_BY_DISEASE[whichAOE];
  const nonSymptomAoeStatusMap: {
    [_key in keyof AoeQuestionResponses]: boolean;
  } = {};
  const symptomAoeStatusMap: {
    [_key in keyof AoeQuestionResponses]: boolean;
  } = {};
  aoeQuestionsToCheck.forEach((aoeQuestionKey) => {
    if (aoeQuestionKey === "noSymptoms") {
      const {
        hasSymptomsQuestionAnswered,
        symptomOnsetAndSelectionQuestionsAnswered,
      } = areSymptomAoeQuestionsAnswered(formState, whichAOE);
      symptomAoeStatusMap["noSymptoms"] = hasSymptomsQuestionAnswered;
      symptomAoeStatusMap["symptoms"] =
        symptomOnsetAndSelectionQuestionsAnswered;
      symptomAoeStatusMap["symptomOnset"] =
        symptomOnsetAndSelectionQuestionsAnswered;
    } else {
      nonSymptomAoeStatusMap[aoeQuestionKey] =
        areNonSymptomAoeQuestionsAnswered(aoeQuestionKey, formState);
    }
  });
  const allNonSymptomAoeQuestionsAnswered = Object.values(
    nonSymptomAoeStatusMap
  ).every(Boolean);

  // if undefined, symptoms questions are not required for that disease. Coerce the status of those questions to true
  const hasSymptomsQuestionAnswered = symptomAoeStatusMap["noSymptoms"] ?? true;
  const symptomOnsetAndSelectionQuestionsAnswered =
    symptomAoeStatusMap["symptomOnset"] ??
    symptomAoeStatusMap["symptoms"] ??
    true;

  return {
    allNonSymptomAoeQuestionsAnswered,
    hasSymptomsQuestionAnswered,
    symptomOnsetAndSelectionQuestionsAnswered,
  };
}

export function areNonSymptomAoeQuestionsAnswered(
  aoeQuestionKey: keyof AoeQuestionResponses,
  formState: TestFormState
) {
  const aoeResponse = formState.aoeResponses[aoeQuestionKey];
  if (Array.isArray(aoeResponse)) return aoeResponse.length > 0;
  return Boolean(aoeResponse);
}

export function areSymptomAoeQuestionsAnswered(
  formState: TestFormState,
  whichAOE: AOEFormOption
): {
  hasSymptomsQuestionAnswered: boolean;
  symptomOnsetAndSelectionQuestionsAnswered: boolean;
} {
  if (formState.aoeResponses.noSymptoms == null) {
    return {
      hasSymptomsQuestionAnswered: false,
      symptomOnsetAndSelectionQuestionsAnswered: false,
    };
  }
  if (formState.aoeResponses.noSymptoms) {
    return {
      hasSymptomsQuestionAnswered: true,
      symptomOnsetAndSelectionQuestionsAnswered: true,
    };
  }

  const symptoms = mapSpecifiedSymptomBoolLiteralsToBool(
    formState.aoeResponses.symptoms,
    whichAOE
  );
  const areSymptomsFilledIn = Object.values(symptoms).some((x) => x?.valueOf());
  const isSymptomOnsetDateAnswered = !!formState.aoeResponses.symptomOnset;
  return {
    hasSymptomsQuestionAnswered: true,
    symptomOnsetAndSelectionQuestionsAnswered:
      areSymptomsFilledIn && isSymptomOnsetDateAnswered,
  };
}

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
