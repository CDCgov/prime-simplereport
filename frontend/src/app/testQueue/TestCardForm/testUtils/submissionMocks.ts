import {
  EditQueueItemDocument,
  PhoneType,
  SubmitQueueItemDocument,
  SubmitQueueItemMutationVariables,
  UpdateAoeDocument,
  UpdateAoeMutationVariables,
} from "../../../../generated/graphql";
import { QueriedTestOrder } from "../types";
import { MULTIPLEX_DISEASES } from "../../../testResults/constants";

const SYMPTOM_TRUE_OVERRIDE = { noSymptoms: false };
const PREGNANCY_OVERRIDE = { pregnancy: "77386006" };
const COUGH_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":true,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
};
const ALL_FALSE_SYMPTOM_OVERRIDE = {
  noSymptoms: false,
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":false,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
};
export const TEST_CARD_SYMPTOM_ONSET_DATE_STRING = "2024-05-14";
const SYMPTOM_ONSET_DATE_OVERRIDE = {
  symptomOnset: TEST_CARD_SYMPTOM_ONSET_DATE_STRING,
};
export const updateAoeMutationRequest = (
  variableOverrides?: Partial<UpdateAoeMutationVariables>
) => {
  return {
    request: {
      query: UpdateAoeDocument,
      variables: {
        patientId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
        noSymptoms: true,
        symptoms: "{}",
        symptomOnset: null,
        pregnancy: null,
        genderOfSexualPartners: null,
        ...variableOverrides,
      },
    },
  };
};

const updateAoeMutationRequestWithoutNoSymptomsAndPregnancy = (
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

export const submitEventMock = {
  request: {
    query: SubmitQueueItemDocument,
    variables: {
      patientId: "72b3ce1e-9d5a-4ad2-9ae8-e1099ed1b7e0",
      deviceTypeId: "MULTIPLEX-DEVICE-ID",
      specimenTypeId: "SPECIMEN-1-ID",
      dateTested: null,
      results: [
        { diseaseName: "COVID-19", testResult: "POSITIVE" },
        {
          diseaseName: "Flu A",
          testResult: "UNKNOWN",
        },
        { diseaseName: "Flu B", testResult: "UNKNOWN" },
      ],
    },
  },
  ...mutationResponse,
};

export const blankUpdateAoeEventMock = {
  ...updateAoeMutationRequestWithoutNoSymptomsAndPregnancy(),
  ...mutationResponse,
};

export const allFalseSymptomUpdateAoeEventMock = {
  ...updateAoeMutationRequestWithoutNoSymptomsAndPregnancy({
    ...ALL_FALSE_SYMPTOM_OVERRIDE,
  }),
  ...mutationResponse,
};

export const allFalseSymptomUpdateAoeEventMockWithSymptomOnset = {
  ...updateAoeMutationRequestWithoutNoSymptomsAndPregnancy({
    ...ALL_FALSE_SYMPTOM_OVERRIDE,
    symptomOnset: TEST_CARD_SYMPTOM_ONSET_DATE_STRING,
  }),
  ...mutationResponse,
};

const updatePregnancyAoeEventMock = {
  ...updateAoeMutationRequest({
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};

const updateSymptomAoeEventMock = {
  ...updateAoeMutationRequest({
    ...SYMPTOM_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};
const updateCoughSymptomAoeEventMock = {
  ...updateAoeMutationRequest({
    ...SYMPTOM_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...COUGH_OVERRIDE,
  }),
  ...mutationResponse,
};

const updateOnsetSymptomDateAoeEventMock = {
  ...updateAoeMutationRequest({
    ...SYMPTOM_TRUE_OVERRIDE,
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

type EditQueueMockParams = {
  diseaseResults: [{ diseaseName: MULTIPLEX_DISEASES; testResult: TestResult }];
  dateTested?: string;
  device?: {
    deviceName: string;
    deviceId: string;
  };
  specimen?: {
    specimenName: string;
    specimenId: string;
  };
};

const device1Name = "LumiraDX";
const device1Id = "DEVICE-1-ID";
const specimen1Name = "Swab of internal nose";
const specimen1Id = "SPECIMEN-1-ID";

export function generateEditQueueMock(params: EditQueueMockParams) {
  return {
    request: {
      query: EditQueueItemDocument,
      variables: {
        id: testOrderInfo.internalId,
        deviceTypeId: params.device?.deviceId ?? device1Id,
        specimenTypeId: params.specimen?.specimenId ?? specimen1Id,
        results: params.diseaseResults,
        dateTested: params.dateTested,
      },
      result: {
        data: {
          editQueueItem: {
            results: params.diseaseResults,
          },
          dateTested: params.dateTested,
          deviceType: {
            internalId: params.device?.deviceId ?? device1Id,
            testLength: 15,
          },
        },
      },
    },
  };
}

const testOrderInfo: QueriedTestOrder = {
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
