import moment from "moment";

import { byDateTested } from "../testResults/viewResults/TestResultsList";
import { GetResultsForDownloadQuery } from "../../generated/graphql";
import { MULTIPLEX_DISEASES } from "../testResults/constants";

import { hasSymptomsForView, symptomsStringToArray } from "./symptoms";

import { displayFullName, facilityDisplayName } from "./index";

export type QueriedTestResult = NonNullable<
  NonNullable<GetResultsForDownloadQuery["resultsPage"]>["content"]
>[number];

const _resultCSVHeadersString = [
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

const _resultCSVHeadersBoolean = [
  "Patient is a resident in a congregate setting",
  "Patient is employed in healthcare",
] as const;

export type ResultCsvRow =
  | {
      [_K in (typeof _resultCSVHeadersString)[number]]:
        | string
        | null
        | undefined;
    }
  | {
      [_K in (typeof _resultCSVHeadersBoolean)[number]]:
        | boolean
        | null
        | undefined;
    };

export function parseDataForCSV(
  data: QueriedTestResult[],
  disabledFeatureDiseaseList: MULTIPLEX_DISEASES[] = []
): ResultCsvRow[] {
  let csvRows: ResultCsvRow[] = [];
  data
    .filter((r) =>
      disabledFeatureDiseaseList.every(
        (d) => d.toLowerCase() !== r?.disease.toLowerCase()
      )
    )
    .sort(byDateTested)
    .forEach((r: QueriedTestResult) => {
      const symptomList = r?.surveyData?.symptoms
        ? symptomsStringToArray(r.surveyData.symptoms)
        : [];

      const swabTypes = r?.deviceType?.swabTypes ?? [];

      const resultRow: ResultCsvRow = {
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
        Condition: r?.disease,
        Result: r?.testResult,
        "Result reported date": moment(r?.dateUpdated).format(
          "MM/DD/YYYY h:mma"
        ),
        "Test correction status": r?.correctionStatus,
        "Test correction reason": r?.reasonForCorrection,
        "Device name": r?.deviceType?.name,
        "Device manufacturer": r?.deviceType?.manufacturer,
        "Device model": r?.deviceType?.model,
        "Device swab type": swabTypes.length > 0 ? swabTypes[0].name : "",
        "Has symptoms": hasSymptomsForView(
          r?.surveyData?.noSymptoms ?? false,
          r?.surveyData?.symptoms ?? "{}"
        ),
        "Symptoms present":
          symptomList.length > 0 ? symptomList.join(", ") : "No symptoms",
        "Symptom onset": moment(r?.surveyData?.symptomOnset).format(
          "MM/DD/YYYY"
        ),
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
        "Patient phone number": r?.patient?.phoneNumbers?.at(0)?.number ?? "",
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
      csvRows.push(resultRow);
    });
  return csvRows;
}
