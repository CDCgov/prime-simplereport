import {
  GetAllFacilitiesDocument,
  GetFacilityResultsMultiplexWithCountDocument,
  GetTestResultDetailsDocument,
  GetTestResultForCorrectionDocument,
  GetTestResultForPrintDocument,
  GetTestResultForResendingEmailsDocument,
  GetTestResultForTextDocument,
  GetFacilityResultsForCsvWithCountDocument,
  ArchivedStatus,
} from "../../../generated/graphql";
import { testResultDetailsQuery } from "../TestResultDetailsModal";
import { QUERY_PATIENT } from "../../testQueue/addToQueue/AddToQueueSearch";

import testResults from "./resultsCovid.mock";
import testResultsForCsv from "./resultsCSV.mock";
import testResultsByRole from "./resultsByRole.mock";
import testResultsByFacility from "./resultsByFacility.mock";
import testResultsByAllFacility from "./resultsByAllFacilities.mock";
import testResultsByStartDate from "./resultsByStartDate.mock";
import testResultsByResultValue from "./resultsByResultValue.mock";
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

export const mocks = [
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResults,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResults,
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
      query: testResultDetailsQuery,
      variables: {
        id: testResults.content[0].internalId,
      },
    },
    result: {
      data: {
        testResult: {
          dateTested: "2021-03-17T19:27:23.806Z",
          results: [{ disease: { name: "COVID-19" }, testResult: "NEGATIVE" }],
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
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByPatient,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByResultValue,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByRole,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByStartDate,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
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
        testResultsPage: testResultsByStartDateAndEndDate,
      },
    },
  },

  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "2",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByFacility,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: null,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByAllFacility,
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
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResults,
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
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "3",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsMultiplex,
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
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-19T23:59:59.999Z",
        role: "STAFF",
        result: "NEGATIVE",
      },
    },
    result: {
      data: {
        testResultsPage: testResultsByStartDateAndEndDate,
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
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: null,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsMultiplex,
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
      query: GetFacilityResultsMultiplexWithCountDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResultsPage: testResultsMultiplex,
      },
    },
  },
];
