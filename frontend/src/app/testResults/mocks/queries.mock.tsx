import {
  GetAllFacilitiesDocument,
  GetTestResultDetailsDocument,
  GetTestResultForCorrectionDocument,
  GetTestResultForPrintDocument,
  GetTestResultForResendingEmailsDocument,
  GetTestResultForTextDocument,
  GetFacilityResultsForCsvWithCountDocument,
  GetResultsMultiplexWithCountDocument,
  ArchivedStatus,
} from "../../../generated/graphql";
import { QUERY_PATIENT } from "../../testQueue/addToQueue/AddToQueueSearch";

import testResults from "./resultsCovid.mock";
import testResultsForCsv from "./resultsCSV.mock";
import testResultsByRole from "./resultsByRole.mock";
import testResultsByFacility from "./resultsByFacility.mock";
import testResultsByAllFacility from "./resultsByAllFacilities.mock";
import testResultsByStartDate from "./resultsByStartDate.mock";
import testResultsByResultValue from "./resultsByResultValue.mock";
import testResultsByCondition from "./resultsByCondition.mock";
import testResultsByPatient from "./resultsByPatient.mock";
import testResultsByStartDateAndEndDate from "./resultsByStartAndEndDate.mock";
import testResultsMultiplex from "./resultsMultiplex.mock";
import { facilities, facilitiesIncludeArchived } from "./facilities.mock";
import { patients } from "./patients.mock";
import resultForPrint from "./resultForPrint";
import resultForText from "./resultForText";
import resultForEmail from "./resultForEmail";
import resultForViewing from "./resultForViewing";
import resultForCorrection from "./resultForCorrection";

export const mockWithFacilityAndPositiveResult = {
  request: {
    query: GetResultsMultiplexWithCountDocument,
    variables: {
      facilityId: "1",
      pageNumber: 0,
      pageSize: 20,
      result: "POSITIVE",
    },
  },
  result: {
    data: {
      resultsPage: testResults,
    },
  },
};
export const mocks = [
  mockWithFacilityAndPositiveResult,
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResults,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResults,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsForCsvWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 3,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsForCsv,
      },
    },
  },
  {
    request: {
      query: GetTestResultDetailsDocument,
      variables: {
        id: testResults.content[0].id,
      },
    },
    result: {
      data: {
        testResult: {
          dateTested: "2021-03-17T19:27:23.806Z",
          // TODO: test error here
          results: [{ disease: { name: "COVID-19", testResult: "NEGATIVE" } }],
          correctionStatus: "ORIGINAL",
          deviceType: {
            name: "Abbott IDNow",
            __typename: "DeviceType",
          },
          patient: {
            firstName: "Barb",
            middleName: "Whitaker",
            lastName: "Cragell",
            birthDate: "1960-11-07",
          },
          createdBy: {
            name: {
              firstName: "Arthur",
              middleName: "A",
              lastName: "Admin",
            },
          },
          symptoms: "{}",
          symptomOnset: null,
          pregnancy: null,
          __typename: "TestResult",
        },
      },
    },
  },

  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByPatient,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByResultValue,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        disease: "COVID-19",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByCondition,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByRole,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByStartDate,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-18T23:59:59.999Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByStartDateAndEndDate,
      },
    },
  },

  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "2",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByFacility,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: null,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsByAllFacility,
      },
    },
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        facilityId: "1",
        namePrefixMatch: "Cragell",
        archivedStatus: ArchivedStatus.All,
        includeArchivedFacilities: true,
      },
    },
    result: {
      data: {
        patients,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResults,
      },
    },
  },
  {
    request: {
      query: GetAllFacilitiesDocument,
      variables: {
        showArchived: true,
      },
    },
    result: {
      data: {
        facilities: facilitiesIncludeArchived,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "3",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsMultiplex,
      },
    },
  },
  {
    request: {
      query: GetAllFacilitiesDocument,
      variables: {
        showArchived: false,
      },
    },
    result: {
      data: {
        facilities,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-19T23:59:59.999Z",
        disease: "COVID-19",
        role: "STAFF",
        result: "NEGATIVE",
      },
    },
    result: {
      data: {
        resultsPage: testResultsByStartDateAndEndDate,
      },
    },
  },
  {
    request: {
      query: GetTestResultForPrintDocument,
      variables: {
        id: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
      },
    },
    result: {
      data: {
        testResult: resultForPrint,
      },
    },
  },
  {
    request: {
      query: GetTestResultForTextDocument,
      variables: {
        id: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
      },
    },
    result: {
      data: {
        testResult: resultForText,
      },
    },
  },
  {
    request: {
      query: GetTestResultForResendingEmailsDocument,
      variables: {
        id: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
      },
    },
    result: {
      data: {
        testResult: resultForEmail,
      },
    },
  },
  {
    request: {
      query: GetTestResultDetailsDocument,
      variables: {
        id: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
      },
    },
    result: {
      data: {
        testResult: resultForViewing,
      },
    },
  },
  {
    request: {
      query: GetTestResultForCorrectionDocument,
      variables: {
        id: "7c768a5d-ef90-44cd-8050-b96dd7aaa1d5",
      },
    },
    result: {
      data: {
        testResult: resultForCorrection,
      },
    },
  },
];

export const mocksWithMultiplex = [
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: null,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsMultiplex,
      },
    },
  },
  {
    request: {
      query: GetAllFacilitiesDocument,
      variables: {
        showArchived: true,
      },
    },
    result: {
      data: {
        facilities: facilitiesIncludeArchived,
      },
    },
  },
  {
    request: {
      query: GetResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        resultsPage: testResultsMultiplex,
      },
    },
  },
];
