import {
  SubmitQueueItemDocument,
  UpdateAoeDocument,
  UpdateAoeMutationVariables,
} from "../../../../generated/graphql";

const SYMPTOM_TRUE_OVERRIDE = { noSymptoms: false };
const PREGNANCY_OVERRIDE = { pregnancy: "77386006" };
const COUGH_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":false,"44169009":false,"49727002":true,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
};
const SYMPTOM_ONSET_DATE_OVERRIDE = { symptomOnset: "2024-05-14" };
const formMutationRequest = (
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

const cardMutationRequest = (
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
  ...cardMutationRequest(),
  ...mutationResponse,
};

const updatePregnancyAoeEventMock = {
  ...formMutationRequest({
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};

const updateSymptomAoeEventMock = {
  ...formMutationRequest({
    ...SYMPTOM_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
  }),
  ...mutationResponse,
};
const updateCoughSymptomAoeEventMock = {
  ...formMutationRequest({
    ...SYMPTOM_TRUE_OVERRIDE,
    ...PREGNANCY_OVERRIDE,
    ...COUGH_OVERRIDE,
  }),
  ...mutationResponse,
};

const updateOnsetSymptomDateAoeEventMock = {
  ...formMutationRequest({
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
