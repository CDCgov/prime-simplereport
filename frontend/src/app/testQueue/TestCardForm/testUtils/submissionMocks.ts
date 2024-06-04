import {
  EditQueueItemDocument,
  SubmitQueueItemDocument,
  SubmitQueueItemMutationVariables,
  UpdateAoeDocument,
  UpdateAoeMutationVariables,
} from "../../../../generated/graphql";
import {
  MULTIPLEX_DISEASES,
  TEST_RESULTS,
} from "../../../testResults/constants";

import {
  device1Id,
  specimen1Id,
  sharedTestOrderInfo,
  symptomaticTestOrderInfo,
} from "./testConstants";

export const BLURRED_VISION_LITERAL = "Blurred vision";
export const TEST_CARD_SYMPTOM_ONSET_DATE_STRING = "2024-05-14";

const NO_SYMPTOMS_FALSE_OVERRIDE = { noSymptoms: false };
const NO_SYMPTOMS_TRUE_OVERRIDE = { noSymptoms: true };

const PREGNANCY_OVERRIDE = { pregnancy: "77386006" };
const COUGH_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":true,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
};
const SYMPTOM_ONSET_DATE_OVERRIDE = {
  symptomOnset: TEST_CARD_SYMPTOM_ONSET_DATE_STRING,
};
const SYPHILIS_HISTORY_OVERRIDE = { syphilisHistory: "1087151000119108" };
const GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE = {
  genderOfSexualPartners: ["female"],
};
const BLURRED_VISION_OVERRIDE = {
  symptoms:
    '{"15188001":false,"26284000":false,"46636008":true,"56940005":false,"68225006":false,"91554004":false,"195469007":false,"266128007":false,"724386005":false}',
};

const baseUpdateAoeMutationRequest = (
  variableOverrides?: Partial<UpdateAoeMutationVariables>
) => {
  return {
    request: {
      query: UpdateAoeDocument,
      variables: {
        patientId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
        symptoms: "{}",
        symptomOnset: null,
        genderOfSexualPartners: null,
        ...variableOverrides,
      },
    },
  };
};

const mutationResponse = {
  result: {
    data: {
      testResult: {
        internalId: "a4581a50-6f00-4bc1-b713-b190f282eabb",
        __typename: "Test Result",
      },
      deliverySuccess: true,
      testEventId: "07c330a2-99b6-4dad-9fef-5c37773847b3",
      __typename: "Test Event",
    },
  },
};

export const blankUpdateAoeEventMock = {
  ...baseUpdateAoeMutationRequest(),
  ...mutationResponse,
};

export const falseNoSymptomAoeMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
  }),
  ...mutationResponse,
};

export const falseNoSymptomWithSymptomOnsetUpdateAoeMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...SYMPTOM_ONSET_DATE_OVERRIDE,
  }),
  ...mutationResponse,
};

const updatePregnancyAoeEventMock = {
  ...baseUpdateAoeMutationRequest({
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};

const updateSymptomAoeEventMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};
const updateCoughSymptomAoeEventMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...COUGH_OVERRIDE,
  }),
  ...mutationResponse,
};

const updateOnsetSymptomDateAoeEventMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...COUGH_OVERRIDE,
    ...SYMPTOM_ONSET_DATE_OVERRIDE,
  }),
  ...mutationResponse,
};

export const updateAoeMocks = [
  updatePregnancyAoeEventMock,
  updateSymptomAoeEventMock,
  updateCoughSymptomAoeEventMock,
  updateOnsetSymptomDateAoeEventMock,
];

// Syphilis card
const baseSyphilisAoeUpdateMock = (
  variableOverrides?: Partial<UpdateAoeMutationVariables>
) => {
  return {
    ...baseUpdateAoeMutationRequest({
      genderOfSexualPartners: [],
      ...variableOverrides,
    }),
    ...mutationResponse,
  };
};
const yesSyphilisHistoryMock = {
  ...baseSyphilisAoeUpdateMock({
    ...SYPHILIS_HISTORY_OVERRIDE,
  }),
};

const yesSyphilisHistoryPregnancyMock = {
  ...baseSyphilisAoeUpdateMock({
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};

const yesSyphilisHistoryPregnancyFemaleSexPartnerMock = {
  ...baseSyphilisAoeUpdateMock({
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
  }),
  ...mutationResponse,
};

const falseNoSymptomOnsetDateBlankSymptomsAndYesSyphilisAoeMock = {
  ...baseSyphilisAoeUpdateMock({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
  }),
  ...mutationResponse,
};

const falseNoSymptomBlurredVisionMockAndYesSyphilisAoeMock = {
  ...baseSyphilisAoeUpdateMock({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
    ...BLURRED_VISION_OVERRIDE,
  }),
  ...mutationResponse,
};

const falseNoSymptomBlurredVisionOnsetDateAndYesSyphilisAoeMock = {
  ...baseSyphilisAoeUpdateMock({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
    ...BLURRED_VISION_OVERRIDE,
    ...SYMPTOM_ONSET_DATE_OVERRIDE,
  }),
  ...mutationResponse,
};

const noSymptomsTrueSymptomsBlankSyphilisHistory = {
  ...baseSyphilisAoeUpdateMock({
    ...NO_SYMPTOMS_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
  }),
  ...mutationResponse,
};

const noSymptomsTrueSymptomsBlankSyphilisFemaleHistory = {
  ...baseSyphilisAoeUpdateMock({
    ...NO_SYMPTOMS_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
  }),
  ...mutationResponse,
};

export const updateSyphilisAoeMocks = [
  blankUpdateAoeEventMock,
  generateEditQueueMock(MULTIPLEX_DISEASES.SYPHILIS, TEST_RESULTS.POSITIVE, {
    device: {
      deviceId: "DEVICE-8-ID",
    },
    specimen: {
      specimenId: "SPECIMEN-3-ID",
    },
  }),
  generateSubmitQueueMock(MULTIPLEX_DISEASES.SYPHILIS, TEST_RESULTS.POSITIVE, {
    device: {
      deviceId: "DEVICE-8-ID",
    },
    specimen: {
      specimenId: "SPECIMEN-3-ID",
    },
  }),
  yesSyphilisHistoryMock,
  yesSyphilisHistoryPregnancyMock,
  yesSyphilisHistoryPregnancyFemaleSexPartnerMock,
  falseNoSymptomBlurredVisionMockAndYesSyphilisAoeMock,
  falseNoSymptomBlurredVisionOnsetDateAndYesSyphilisAoeMock,
  falseNoSymptomOnsetDateBlankSymptomsAndYesSyphilisAoeMock,
  noSymptomsTrueSymptomsBlankSyphilisHistory,
  noSymptomsTrueSymptomsBlankSyphilisFemaleHistory,
];

type EditQueueMockParams = {
  diseaseResults?:
    | []
    | [{ diseaseName: MULTIPLEX_DISEASES; testResult: TEST_RESULTS }];
  dateTested?: string;
  device?: {
    deviceName?: string;
    deviceId: string;
    supportedDiseases?: {
      internalId: string;
      loinc: string;
      name: MULTIPLEX_DISEASES;
    }[];
  };
  specimen?: {
    specimenName?: string;
    specimenId: string;
  };
};

export function generateEmptyEditQueueMock() {
  // dummy covid unknown submission that's overrided by the empty array
  return generateEditQueueMock(
    MULTIPLEX_DISEASES.COVID_19,
    TEST_RESULTS.UNKNOWN,
    {
      diseaseResults: [],
    }
  );
}

export function generateEditQueueMock(
  disease: MULTIPLEX_DISEASES,
  testResult: TEST_RESULTS,
  overrideParams?: EditQueueMockParams
) {
  return {
    request: {
      query: EditQueueItemDocument,
      variables: {
        id: sharedTestOrderInfo?.internalId,
        deviceTypeId: overrideParams?.device?.deviceId ?? device1Id,
        specimenTypeId: overrideParams?.specimen?.specimenId ?? specimen1Id,
        results: overrideParams?.diseaseResults ?? [
          {
            diseaseName: disease,
            testResult: testResult,
          },
        ],
        dateTested: overrideParams?.dateTested ?? null,
      },
    },
    result: {
      data: {
        editQueueItem: {
          results: overrideParams?.diseaseResults,
        },
        dateTested: overrideParams?.dateTested,
        deviceType: {
          internalId: overrideParams?.device?.deviceId ?? device1Id,
          testLength: 15,
        },
      },
    },
  };
}

type SubmitQueueMockParams = EditQueueMockParams & {
  deliverySuccess?: boolean;
};

export function generateSubmitQueueMock(
  disease: MULTIPLEX_DISEASES,
  testResult: TEST_RESULTS,
  overrideParams?: SubmitQueueMockParams
) {
  return {
    request: {
      query: SubmitQueueItemDocument,
      variables: {
        patientId: symptomaticTestOrderInfo?.patient.internalId,
        deviceTypeId: overrideParams?.device?.deviceId ?? device1Id,
        specimenTypeId: overrideParams?.specimen?.specimenId ?? specimen1Id,
        results: overrideParams?.diseaseResults ?? [
          { diseaseName: disease, testResult: testResult },
        ],
        dateTested: overrideParams?.dateTested ?? null,
      } as SubmitQueueItemMutationVariables,
    },
    result: {
      data: {
        submitQueueItem: {
          testResult: {
            internalId: symptomaticTestOrderInfo?.internalId,
          },
          deliverySuccess: overrideParams?.deliverySuccess ?? true,
        },
      },
    },
  };
}
