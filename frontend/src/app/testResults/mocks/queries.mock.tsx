import {
  GetAllFacilitiesDocument,
  GetFacilityResultsForCsvDocument,
  GetFacilityResultsMultiplexDocument,
  GetResultsCountByFacilityDocument,
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

export const mocks = [
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResults.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsForCsvDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 3,
      },
    },
    result: {
      data: {
        testResults: testResultsForCsv,
      },
    },
  },
  {
    request: {
      query: testResultDetailsQuery,
      variables: {
        id: testResults[0].internalId,
      },
    },
    result: {
      data: {
        testResult: {
          dateTested: "2021-03-17T19:27:23.806Z",
          result: "NEGATIVE",
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
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByPatient.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByPatient,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByResultValue.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        result: "NEGATIVE",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByResultValue,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByRole.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        role: "RESIDENT",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByRole,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDate.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByStartDate,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-18T23:59:59.999Z",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDateAndEndDate.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
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
        testResults: testResultsByStartDateAndEndDate,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "2",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByFacility.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "2",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByFacility,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: null,
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByAllFacility.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: null,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsByAllFacility,
      },
    },
  },
  {
    request: {
      query: QUERY_PATIENT,
      variables: {
        facilityId: "1",
        namePrefixMatch: "Cragell",
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
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResults.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults,
      },
    },
  },
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "3",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsMultiplex.length,
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
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "3",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsMultiplex,
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
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
        patientId: "48c523e8-7c65-4047-955c-e3f65bb8b58a",
        startDate: "2021-03-18T00:00:00.000Z",
        endDate: "2021-03-19T23:59:59.999Z",
        role: "STAFF",
        result: "NEGATIVE",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsByStartDateAndEndDate.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
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
        testResults: testResultsByStartDateAndEndDate,
      },
    },
  },
];

export const mocksWithMultiplex = [
  {
    request: {
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: null,
      },
    },
    result: {
      data: {
        testResultsCount: testResultsMultiplex.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: null,
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsMultiplex,
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
      query: GetResultsCountByFacilityDocument,
      variables: {
        facilityId: "1",
      },
    },
    result: {
      data: {
        testResultsCount: testResultsMultiplex.length,
      },
    },
  },
  {
    request: {
      query: GetFacilityResultsMultiplexDocument,
      variables: {
        facilityId: "1",
        pageNumber: 0,
        pageSize: 20,
      },
    },
    result: {
      data: {
        testResults: testResultsMultiplex,
      },
    },
  },
];
