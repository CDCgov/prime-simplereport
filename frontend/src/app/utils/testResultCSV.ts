import moment from "moment";

import { byDateTested, Results } from "../testResults/TestResultsList";
import { TEST_RESULT_DESCRIPTIONS } from "../constants";

import { symptomsStringToArray, hasSymptomsForView } from "./symptoms";
import { getResultByDiseaseName } from "./testResults";

import { displayFullName, facilityDisplayName } from "./index";

export function parseDataForCSV(data: any[], multiplexEnabled: boolean) {
  return data.sort(byDateTested).map((r: any) => {
    const symptomList = r.symptoms ? symptomsStringToArray(r.symptoms) : [];

    return {
      "Patient first name": r.patient.firstName,
      "Patient middle name": r.patient.middleName,
      "Patient last name": r.patient.lastName,
      "Patient full name": displayFullName(
        r.patient.firstName,
        r.patient.middleName,
        r.patient.lastName
      ),
      "Patient date of birth": moment(r.patient.birthDate).format("MM/DD/YYYY"),
      "Test date": moment(r.dateTested).format("MM/DD/YYYY h:mma"),
      "COVID-19 result":
        TEST_RESULT_DESCRIPTIONS[
          getResultByDiseaseName(r.results, "COVID-19") as Results
        ],
      ...(multiplexEnabled && {
        "Flu A result":
          TEST_RESULT_DESCRIPTIONS[
            getResultByDiseaseName(r.results, "Flu A") as Results
          ],
        "Flu B result":
          TEST_RESULT_DESCRIPTIONS[
            getResultByDiseaseName(r.results, "Flu B") as Results
          ],
      }),
      "Result reported date": moment(r.dateUpdated).format("MM/DD/YYYY h:mma"),
      "Test correction status": r.correctionStatus,
      "Test correction reason": r.reasonForCorrection,
      "Device name": r.deviceType.name,
      "Device manufacturer": r.deviceType.manufacturer,
      "Device model": r.deviceType.model,
      "Device swab type": r.deviceType.swabType,
      "Has symptoms": hasSymptomsForView(r.noSymptoms, r.symptoms),
      "Symptoms present":
        symptomList.length > 0 ? symptomList.join(", ") : "No symptoms",
      "Symptom onset": moment(r.symptomOnset).format("MM/DD/YYYY"),
      "Facility name": facilityDisplayName(
        r.facility.name,
        r.facility.isDeleted
      ),
      Submitter: displayFullName(
        r.createdBy.nameInfo.firstName,
        r.createdBy.nameInfo.middleName,
        r.createdBy.nameInfo.lastName
      ),
      "Patient role": r.patient.role,
      "Patient ID (Student ID, Employee ID, etc.)": r.patient.lookupId,
      "Patient preferred language": r.patient.preferredLanguage,
      "Patient phone number": r.patient.telephone,
      "Patient email": r.patient.email,
      "Patient street address": r.patient.street,
      "Patient street address 2": r.patient.streetTwo,
      "Patient city": r.patient.city,
      "Patient state": r.patient.state,
      "Patient zip code": r.patient.zipCode,
      "Patient county": r.patient.county,
      "Patient country": r.patient.country,
      "Patient gender": r.patient.gender,
      "Patient race": r.patient.race,
      "Patient ethnicity": r.patient.ethnicity,
      "Patient tribal affiliation":
        r.patient.tribalAffiliation?.join(", ") || "",
      "Patient is a resident in a congregate setting":
        r.patient.residentCongregateSetting,
      "Patient is employed in healthcare": r.patient.employedInHealthcare,
    };
  });
}
