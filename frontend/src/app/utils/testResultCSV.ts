import moment from "moment";

import { byDateTested } from "../testResults/viewResults/TestResultsList";
import { MULTIPLEX_DISEASES } from "../testResults/constants";
import { GetFacilityResultsForCsvWithCountQuery } from "../../generated/graphql";

import { hasSymptomsForView, symptomsStringToArray } from "./symptoms";

import { displayFullName, facilityDisplayName } from "./index";

export type QueriedTestResult = NonNullable<
  NonNullable<
    GetFacilityResultsForCsvWithCountQuery["testResultsPage"]
  >["content"]
>[number];

export interface ResultCsvRow {
  "Patient first name": string | null | undefined;
  "Patient middle name": string | null | undefined;
  "Patient last name": string | null | undefined;
  "Patient full name": string | null | undefined;
  "Patient date of birth": string | null | undefined;
  "Test date": string | null | undefined;
  Condition: string | null | undefined;
  Result: string | null | undefined;
  "Result reported date": string | null | undefined;
  "Test correction status": string | null | undefined;
  "Test correction reason": string | null | undefined;
  "Device name": string | null | undefined;
  "Device manufacturer": string | null | undefined;
  "Device model": string | null | undefined;
  "Device swab type": string | null | undefined;
  "Has symptoms": string | null | undefined;
  "Symptoms present": string | null | undefined;
  "Symptom onset": string | null | undefined;
  "Facility name": string | null | undefined;
  Submitter: string | null | undefined;
  "Patient role": string | null | undefined;
  "Patient ID (Student ID, Employee ID, etc.)": string | null | undefined;
  "Patient preferred language": string | null | undefined;
  "Patient phone number": string | null | undefined;
  "Patient email": string | null | undefined;
  "Patient street address": string | null | undefined;
  "Patient street address 2": string | null | undefined;
  "Patient city": string | null | undefined;
  "Patient state": string | null | undefined;
  "Patient zip code": string | null | undefined;
  "Patient county": string | null | undefined;
  "Patient country": string | null | undefined;
  "Patient gender": string | null | undefined;
  "Patient race": string | null | undefined;
  "Patient ethnicity": string | null | undefined;
  "Patient tribal affiliation": string | null | undefined;
  "Patient is a resident in a congregate setting": boolean | null | undefined;
  "Patient is employed in healthcare": boolean | null | undefined;
}

export function parseDataForCSV(
  data: QueriedTestResult[],
  excludedDiseases: MULTIPLEX_DISEASES[] = []
): ResultCsvRow[] {
  let csvRows: ResultCsvRow[] = [];
  data.sort(byDateTested).forEach((r: QueriedTestResult) => {
    const symptomList = r?.symptoms ? symptomsStringToArray(r.symptoms) : [];

    const swabTypes = r?.deviceType?.swabTypes ?? [];

    const csvData1: Partial<ResultCsvRow> = {
      "Patient first name": r?.patient?.firstName,
      "Patient middle name": r?.patient?.middleName,
      "Patient last name": r?.patient?.lastName,
      "Patient full name": displayFullName(
        r?.patient?.firstName,
        r?.patient?.middleName,
        r?.patient?.lastName
      ),
      "Patient date of birth": moment(r?.patient?.birthDate).format(
        "MM/DD/YYYY"
      ),
      "Test date": moment(r?.dateTested).format("MM/DD/YYYY h:mma"),
    };
    const csvData2: Partial<ResultCsvRow> = {
      "Result reported date": moment(r?.dateUpdated).format("MM/DD/YYYY h:mma"),
      "Test correction status": r?.correctionStatus,
      "Test correction reason": r?.reasonForCorrection,
      "Device name": r?.deviceType?.name,
      "Device manufacturer": r?.deviceType?.manufacturer,
      "Device model": r?.deviceType?.model,
      "Device swab type": swabTypes.length > 0 ? swabTypes[0].name : "",
      "Has symptoms": hasSymptomsForView(
        r?.noSymptoms ?? false,
        r?.symptoms ?? "{}"
      ),
      "Symptoms present":
        symptomList.length > 0 ? symptomList.join(", ") : "No symptoms",
      "Symptom onset": moment(r?.symptomOnset).format("MM/DD/YYYY"),
      "Facility name": facilityDisplayName(
        r?.facility?.name ?? "",
        r?.facility?.isDeleted ?? false
      ),
      Submitter: displayFullName(
        r?.createdBy?.nameInfo?.firstName,
        r?.createdBy?.nameInfo?.middleName,
        r?.createdBy?.nameInfo?.lastName
      ),
      "Patient role": r?.patient?.role,
      "Patient ID (Student ID, Employee ID, etc.)": r?.patient?.lookupId,
      "Patient preferred language": r?.patient?.preferredLanguage,
      "Patient phone number": r?.patient?.telephone,
      "Patient email": r?.patient?.email,
      "Patient street address": r?.patient?.street,
      "Patient street address 2": r?.patient?.streetTwo,
      "Patient city": r?.patient?.city,
      "Patient state": r?.patient?.state,
      "Patient zip code": r?.patient?.zipCode,
      "Patient county": r?.patient?.county,
      "Patient country": r?.patient?.country,
      "Patient gender": r?.patient?.gender,
      "Patient race": r?.patient?.race,
      "Patient ethnicity": r?.patient?.ethnicity,
      "Patient tribal affiliation":
        r?.patient?.tribalAffiliation?.join(", ") || "",
      "Patient is a resident in a congregate setting":
        r?.patient?.residentCongregateSetting,
      "Patient is employed in healthcare": r?.patient?.employedInHealthcare,
    };

    // individual rows for each result on a single test event
    r?.results?.forEach((result) => {
      if (
        excludedDiseases.some(
          (d) => d.toLowerCase() === result?.disease.name.toLowerCase()
        )
      ) {
        return;
      }
      const csvConditionData = {
        Condition: result?.disease.name,
        Result: result?.testResult ?? "Unknown",
      };
      csvRows.push({
        ...csvData1,
        ...csvConditionData,
        ...csvData2,
      } as ResultCsvRow);
    });
  });
  return csvRows;
}
