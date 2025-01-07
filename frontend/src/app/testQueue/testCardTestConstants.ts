import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../testResults/constants";
import {
  EditQueueItemDocument,
  PhoneType,
  SubmitQueueItemDocument,
  SubmitQueueItemMutationVariables,
  UpdateAoeDocument,
  UpdateAoeMutationVariables,
} from "../../generated/graphql";
import mockSupportedDiseaseTestPerformedHIV from "../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedHIV";
import mockSupportedDiseaseTestPerformedSyphilis from "../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedSyphilis";
import mockSupportedDiseaseTestPerformedGonorrhea from "../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedGonorrhea";
import mockSupportedDiseaseTestPerformedChlamydia from "../supportAdmin/DeviceType/mocks/mockSupportedDiseaseTestPerformedChlamydia";

import { QueriedFacility, QueriedTestOrder } from "./TestCardForm/types";
import mockSupportedDiseaseCovid from "./mocks/mockSupportedDiseaseCovid";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "./mocks/mockSupportedDiseaseMultiplex";

export const covidDeviceName = "LumiraDX";
export const multiplexDeviceName = "Multiplex";
export const multiplexAndCovidOnlyDeviceName = "MultiplexAndCovidOnly";
export const fluDeviceName = "FLU";
export const hivDeviceName = "HIV";

export const covidDeviceId = "COVID-DEVICE-ID";
export const multiplexDeviceId = "MULTIPLEX-DEVICE-ID";
export const multiplexAndCovidOnlyDeviceId = "MULTIPLEX-COVID-DEVICE-ID";
export const fluDeviceId = "FLU-DEVICE-ID";
export const hivDeviceId = "HIV-DEVICE-ID";
export const FACILITY_INFO_TEST_ID = "f02cfff5-1921-4293-beff-e2a5d03e1fda";
export const syphilisDeviceName = "SYPHILIS";
export const syphilisDeviceId = "SYPHILIS-DEVICE-ID";
export const hepatitisCDeviceName = "HEPATITIS C";
export const hepatitisCDeviceId = "HEPATITIS C-DEVICE-ID";
export const gonorrheaDeviceName = "GONORRHEA";
export const gonorrheaDeviceId = "GONORRHEA-DEVICE-ID";
export const chlamydiaDeviceName = "Chlamydia device";
export const chlamydiaDeviceId = "CHLAMYDIA-DEVICE-ID";

// 6 instead of 7 because HIV devices are filtered out when HIV feature flag is disabled
export const DEFAULT_DEVICE_OPTIONS_LENGTH = 6;
export const device1Name = "LumiraDX";
export const device2Name = "Abbott BinaxNow";
export const device3Name = "BD Veritor";

export const device4Name = "Multiplex";
export const device5Name = "MultiplexAndCovidOnly";
export const device6Name = "FluOnly";
export const device7Name = "HIV device";
export const device8Name = "Syphilis device";
export const device9Name = "Hepatitis C device";
export const device10Name = "Gonorrhea device";
export const chlamydiaDeviceName = "Chlamydia device";

export const device1Id = "DEVICE-1-ID";
export const device2Id = "DEVICE-2-ID";
export const device3Id = "DEVICE-3-ID";
export const device4Id = "DEVICE-4-ID";
export const device5Id = "DEVICE-5-ID";
export const device6Id = "DEVICE-6-ID";
export const device7Id = "DEVICE-7-ID";
export const device8Id = "DEVICE-8-ID";
export const device9Id = "DEVICE-9-ID";
export const device10Id = "DEVICE-10-ID";
export const chlamydiaDeviceId = "CHLAMYDIA-DEVICE-ID";

export const deletedDeviceId = "DELETED-DEVICE-ID";
export const deletedDeviceName = "Deleted";
export const deletedSpecimenId = "DELETED-SPECIMEN-ID";

export const specimen1Name = "Swab of internal nose";
export const specimen1Id = "SPECIMEN-1-ID";
export const specimen2Name = "Nasopharyngeal swab";
export const specimen2Id = "SPECIMEN-2-ID";
export const specimen3Name = "Venous blood specimen";
export const specimen3Id = "SPECIMEN-3-ID";

export const BLURRED_VISION_LITERAL = "Blurred vision";
export const TEST_CARD_SYMPTOM_ONSET_DATE_STRING = "2024-05-14";

export const NO_SYMPTOMS_FALSE_OVERRIDE = { noSymptoms: false };
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
    '{"15188001":false,"26284000":false,"56317004":false,"56940005":false,"91554004":false,"195469007":false,"246636008":true,"266128007":false,"724386005":false}',
};

const FIRST_CARD_SYMPTOM_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":true,"44169009":false,"49727002":false,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"261665006":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
};

const SECOND_CARD_SYMPTOM_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":true,"44169009":false,"49727002":false,"62315008":false,"64531003":true,"68235000":false,"68962001":true,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"261665006":false,"267036007":false,"422400008":false,"422587007":true,"426000000":false}',
};
export const testOrderInfo: QueriedTestOrder = {
  internalId: "1b02363b-ce71-4f30-a2d6-d82b56a91b39",
  dateAdded: "2022-11-08 13:33:07.503",
  symptoms:
    '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
  symptomOnset: null,
  noSymptoms: true,
  deviceType: {
    internalId: device1Id,
    name: device1Name,
    model: "LumiraDx SARS-CoV-2 Ag Test*",
    testLength: 15,
  },
  specimenType: {
    internalId: specimen1Id,
    name: specimen1Name,
    typeCode: "445297001",
  },
  patient: {
    internalId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
    telephone: "(571) 867-5309",
    birthDate: "2015-09-20",
    firstName: "Althea",
    middleName: "Hedda Mclaughlin",
    lastName: "Dixon",
    gender: "refused",
    testResultDelivery: null,
    preferredLanguage: null,
    email: "sywaporoce@mailinator.com",
    emails: ["sywaporoce@mailinator.com"],
    phoneNumbers: [
      {
        type: PhoneType.Mobile,
        number: "(553) 223-0559",
      },
      {
        type: PhoneType.Landline,
        number: "(669) 789-0799",
      },
    ],
  },
  results: [],
  dateTested: null,
  correctionStatus: "ORIGINAL",
  reasonForCorrection: null,
};
export const secondTestOrder: QueriedTestOrder = {
  internalId: "01c807c9-d42b-45c7-aa9f-1fd290eb2fdf",
  dateAdded: "2024-06-05 22:03:12.205",
  symptoms:
    '{"64531003":"true","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"true","422587007":"true","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
  symptomOnset: null,
  noSymptoms: true,
  deviceType: {
    internalId: device3Id,
    name: device3Name,
    model: "LumiraDx SARS-CoV-2 Ag Test*",
    testLength: 15,
  },
  specimenType: {
    internalId: specimen1Id,
    name: specimen1Name,
    typeCode: "445297001",
  },
  patient: {
    internalId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
    telephone: "(571) 867-5309",
    birthDate: "2015-09-20",
    firstName: "Althea",
    middleName: "Hedda Mclaughlin",
    lastName: "Dixon",
    gender: "refused",
    testResultDelivery: null,
    preferredLanguage: null,
    email: "sywaporoce@mailinator.com",
    emails: ["sywaporoce@mailinator.com"],
    phoneNumbers: [
      {
        type: PhoneType.Mobile,
        number: "(553) 223-0559",
      },
      {
        type: PhoneType.Landline,
        number: "(669) 789-0799",
      },
    ],
  },
  results: [],
  dateTested: null,
  correctionStatus: "ORIGINAL",
  reasonForCorrection: null,
};

export const sharedTestOrderInfo = {
  internalId: "1b02363b-ce71-4f30-a2d6-d82b56a91b39",
  dateAdded: "2022-11-08 13:33:07.503",
  deviceType: {
    internalId: covidDeviceId,
    name: covidDeviceName,
    model: covidDeviceName,
    testLength: 15,
  },
  specimenType: {
    internalId: specimen1Id,
    name: specimen1Name,
    typeCode: "445297001",
  },
  patient: {
    internalId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
    telephone: "(571) 867-5309",
    birthDate: "2015-09-20",
    firstName: "Althea",
    middleName: "Hedda Mclaughlin",
    lastName: "Dixon",
    gender: "refused",
    testResultDelivery: null,
    preferredLanguage: null,
    email: "sywaporoce@mailinator.com",
    emails: ["sywaporoce@mailinator.com"],
    phoneNumbers: [
      {
        type: PhoneType.Mobile,
        number: "(553) 223-0559",
      },
      {
        type: PhoneType.Landline,
        number: "(669) 789-0799",
      },
    ],
  },
  results: [],
  dateTested: null,
  correctionStatus: "ORIGINAL",
  reasonForCorrection: null,
};

export const baseUpdateAoeMutationRequest = (
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

export const mutationResponse = {
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

export const firstCardSymptomUpdateMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...FIRST_CARD_SYMPTOM_OVERRIDE,
  }),
  ...mutationResponse,
};

export const secondCardSymptomUpdateMock = {
  ...baseUpdateAoeMutationRequest({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...SECOND_CARD_SYMPTOM_OVERRIDE,
  }),
  ...mutationResponse,
};

export const positiveGenerateMockOne = generateEditQueueMock(
  MULTIPLEX_DISEASES.COVID_19,
  TEST_RESULTS.POSITIVE
);
export const positiveDeviceThreeEditMock = generateEditQueueMock(
  MULTIPLEX_DISEASES.COVID_19,
  TEST_RESULTS.POSITIVE,
  {
    testOrderId: secondTestOrder.internalId,
    device: {
      deviceId: device3Id,
    },
  }
);

export const facilityInfo: QueriedFacility = {
  id: FACILITY_INFO_TEST_ID,
  name: "Testing Site",
  deviceTypes: [
    {
      internalId: covidDeviceId,
      name: covidDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseCovid,
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
        {
          name: specimen2Name,
          internalId: specimen2Id,
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: multiplexDeviceId,
      name: multiplexDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: mockSupportedDiseaseMultiplex,
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
        {
          name: specimen2Name,
          internalId: specimen2Id,
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: fluDeviceId,
      name: fluDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: [...mockSupportedDiseaseFlu],
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
        {
          name: specimen2Name,
          internalId: specimen2Id,
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: multiplexAndCovidOnlyDeviceId,
      name: multiplexAndCovidOnlyDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: [
        ...mockSupportedDiseaseFlu,
        {
          supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
          testPerformedLoincCode: "123456",
          testOrderedLoincCode: "445566",
        },
        {
          supportedDisease: mockSupportedDiseaseCovid[0].supportedDisease,
          testPerformedLoincCode: "123456",
          testOrderedLoincCode: "778899",
        },
      ],
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
        {
          name: specimen2Name,
          internalId: specimen2Id,
          typeCode: "258500001",
        },
      ],
    },
    {
      internalId: syphilisDeviceId,
      name: syphilisDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: [
        ...mockSupportedDiseaseTestPerformedSyphilis,
      ],
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
      ],
    },
    {
      internalId: hivDeviceId,
      name: hivDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: [...mockSupportedDiseaseTestPerformedHIV],
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
      ],
    },
    {
      internalId: gonorrheaDeviceId,
      name: gonorrheaDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: [
        ...mockSupportedDiseaseTestPerformedGonorrhea,
      ],
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
      ],
    },
    {
      internalId: chlamydiaDeviceId,
      name: chlamydiaDeviceName,
      testLength: 15,
      supportedDiseaseTestPerformed: [
        ...mockSupportedDiseaseTestPerformedChlamydia,
      ],
      swabTypes: [
        {
          name: specimen1Name,
          internalId: specimen1Id,
          typeCode: "445297001",
        },
      ],
    },
  ],
};

export const devicesMap = new Map();
facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

export const asymptomaticTestOrderPartialInfo = {
  symptoms: null,
  symptomOnset: null,
  noSymptoms: true,
};
export const asymptomaticTestOrderInfo: QueriedTestOrder = {
  ...sharedTestOrderInfo,
  ...asymptomaticTestOrderPartialInfo,
};
export const symptomaticTestOrderInfo: QueriedTestOrder = {
  ...sharedTestOrderInfo,
  symptoms:
    '{"64531003":"false","103001002":"false","84229001":"false","68235000":"false","426000000":"false","49727002":"false","68962001":"false","422587007":"false","267036007":"false","62315008":"false","43724002":"false","36955009":"false","44169009":"false","422400008":"false","230145002":"false","25064002":"false","162397003":"false"}',
  symptomOnset: TEST_CARD_SYMPTOM_ONSET_DATE_STRING,
  noSymptoms: false,
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
export const baseStiAoeUpdateMock = (
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
  ...baseStiAoeUpdateMock({
    ...SYPHILIS_HISTORY_OVERRIDE,
  }),
};

const yesSyphilisHistoryPregnancyMock = {
  ...baseStiAoeUpdateMock({
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};

const yesSyphilisHistoryPregnancyFemaleSexPartnerMock = {
  ...baseStiAoeUpdateMock({
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
  }),
  ...mutationResponse,
};

const falseNoSymptomOnsetDateBlankSymptomsAndYesSyphilisAoeMock = {
  ...baseStiAoeUpdateMock({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
  }),
  ...mutationResponse,
};

const falseNoSymptomBlurredVisionMockAndYesSyphilisAoeMock = {
  ...baseStiAoeUpdateMock({
    ...NO_SYMPTOMS_FALSE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
    ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
    ...BLURRED_VISION_OVERRIDE,
  }),
  ...mutationResponse,
};

const falseNoSymptomBlurredVisionOnsetDateAndYesSyphilisAoeMock = {
  ...baseStiAoeUpdateMock({
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
  ...baseStiAoeUpdateMock({
    ...NO_SYMPTOMS_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...SYPHILIS_HISTORY_OVERRIDE,
  }),
  ...mutationResponse,
};

const noSymptomsTrueSymptomsBlankSyphilisFemaleHistory = {
  ...baseStiAoeUpdateMock({
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

export const updateHepCAoeMocks = [
  blankUpdateAoeEventMock,
  generateEditQueueMock(MULTIPLEX_DISEASES.HEPATITIS_C, TEST_RESULTS.POSITIVE, {
    device: {
      deviceId: "DEVICE-9-ID",
    },
    specimen: {
      specimenId: "SPECIMEN-3-ID",
    },
  }),
  generateSubmitQueueMock(
    MULTIPLEX_DISEASES.HEPATITIS_C,
    TEST_RESULTS.POSITIVE,
    {
      device: {
        deviceId: "DEVICE-9-ID",
      },
      specimen: {
        specimenId: "SPECIMEN-3-ID",
      },
    }
  ),
  {
    ...baseStiAoeUpdateMock({ ...PREGNANCY_OVERRIDE }),
    ...mutationResponse,
  },
  {
    ...baseStiAoeUpdateMock({
      ...NO_SYMPTOMS_TRUE_OVERRIDE,
      ...PREGNANCY_OVERRIDE,
    }),
    ...mutationResponse,
  },
  {
    ...baseStiAoeUpdateMock({
      ...GENDER_SEXUAL_PARTNERS_FEMALE_OVERRIDE,
      ...NO_SYMPTOMS_TRUE_OVERRIDE,
      ...PREGNANCY_OVERRIDE,
    }),
    ...mutationResponse,
  },
];

type EditQueueMockParams = {
  testOrderId?: string;
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

export function generateEmptyEditQueueMock(
  overrideParams?: EditQueueMockParams
) {
  // dummy covid unknown submission that's overrided by the empty array
  return generateEditQueueMock(
    MULTIPLEX_DISEASES.COVID_19,
    TEST_RESULTS.UNKNOWN,
    {
      diseaseResults: [],
      ...overrideParams,
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
        id: overrideParams?.testOrderId ?? sharedTestOrderInfo?.internalId,
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
