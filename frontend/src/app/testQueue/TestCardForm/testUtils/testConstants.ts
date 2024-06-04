import { QueriedFacility, QueriedTestOrder } from "../types";
import mockSupportedDiseaseCovid from "../../mocks/mockSupportedDiseaseCovid";
import mockSupportedDiseaseMultiplex, {
  mockSupportedDiseaseFlu,
} from "../../mocks/mockSupportedDiseaseMultiplex";
import { PhoneType } from "../../../../generated/graphql";

import { TEST_CARD_SYMPTOM_ONSET_DATE_STRING } from "./submissionMocks";

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

export const device1Name = "LumiraDX";
export const device1Id = "DEVICE-1-ID";
export const specimen1Name = "Swab of internal nose";
export const specimen1Id = "SPECIMEN-1-ID";
export const specimen2Name = "Nasopharyngeal swab";
export const specimen2Id = "SPECIMEN-2-ID";
export const FACILITY_INFO_TEST_ID = "f02cfff5-1921-4293-beff-e2a5d03e1fda";

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
  ],
};

export const devicesMap = new Map();
facilityInfo.deviceTypes.map((d) => devicesMap.set(d.internalId, d));

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
