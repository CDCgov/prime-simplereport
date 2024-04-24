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

const resultCSVHeadersString = [
  "Patient first name",
  "Patient middle name",
  "Patient first name",
  "Patient middle name",
  "Patient last name",
  "Patient full name",
  "Patient date of birth",
  "Test date",
  "Condition",
  "Result",
  "Result reported date",
  "Test correction status",
  "Test correction reason",
  "Device name",
  "Device manufacturer",
  "Device model",
  "Device swab type",
  "Has symptoms",
  "Symptoms present",
  "Symptom onset",
  "Facility name",
  "Submitter",
  "Patient role",
  "Patient ID (Student ID, Employee ID, etc.)",
  "Patient preferred language",
  "Patient phone number",
  "Patient email",
  "Patient street address",
  "Patient street address 2",
  "Patient city",
  "Patient state",
  "Patient zip code",
  "Patient county",
  "Patient country",
  "Patient gender",
  "Patient race",
  "Patient ethnicity",
  "Patient tribal affiliation",
] as const;

const resultCSVHeadersBoolean = [
  "Patient is a resident in a congregate setting",
  "Patient is employed in healthcare",
] as const;

export type ResultCsvRow =
  | {
      [K in (typeof resultCSVHeadersString)[number]]: string | null | undefined;
    }
  | {
      [K in (typeof resultCSVHeadersBoolean)[number]]:
        | boolean
        | null
        | undefined;
    };

export function parseDataForCSV(
  data: QueriedTestResult[],
  excludedDiseases: MULTIPLEX_DISEASES[] = []
): ResultCsvRow[] {
  let csvRows: ResultCsvRow[] = [];
  data.sort(byDateTested).forEach((r: QueriedTestResult) => {
    const symptomList = r?.symptoms ? symptomsStringToArray(r.symptoms) : [];

    const swabTypes = r?.deviceType?.swabTypes ?? [];

    const csvOrderedColumns1: Partial<ResultCsvRow> = {
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
    const csvOrderedColumns2: Partial<ResultCsvRow> = {
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
        ...csvOrderedColumns1,
        ...csvConditionData,
        ...csvOrderedColumns2,
      } as ResultCsvRow);
    });
  });
  return csvRows;
}
