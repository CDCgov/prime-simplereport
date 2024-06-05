import {
  baseUpdateAoeMutationRequest,
  generateEditQueueMock,
  mutationResponse,
  NO_SYMPTOMS_FALSE_OVERRIDE,
} from "../TestCardForm/testUtils/submissionMocks";
import { MULTIPLEX_DISEASES, TEST_RESULTS } from "../../testResults/constants";

const FIRST_CARD_SYMPTOM_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":true,"44169009":false,"49727002":false,"62315008":false,"64531003":false,"68235000":false,"68962001":false,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"261665006":false,"267036007":false,"422400008":false,"422587007":false,"426000000":false}',
};

const SECOND_CARD_SYMPTOM_OVERRIDE = {
  symptoms:
    '{"25064002":false,"36955009":false,"43724002":true,"44169009":false,"49727002":false,"62315008":false,"64531003":true,"68235000":false,"68962001":true,"84229001":false,"103001002":false,"162397003":false,"230145002":false,"261665006":false,"267036007":false,"422400008":false,"422587007":true,"426000000":false}',
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
