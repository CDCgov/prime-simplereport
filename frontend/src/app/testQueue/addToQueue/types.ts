import { PregnancyCode } from "../../../patientApp/timeOfTest/constants";

export interface AoEAnswersDelivery {
  noSymptoms: boolean;
  symptoms: string;
  symptomOnset: ISODate | null | undefined;
  pregnancy: PregnancyCode | undefined;
  testResultDelivery: string;
}
