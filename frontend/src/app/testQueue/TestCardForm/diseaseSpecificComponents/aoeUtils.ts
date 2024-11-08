import moment from "moment";
import React from "react";
import _ from "lodash";

import { AoeQuestionResponses } from "../TestCardFormReducer";
import {
  hepatitisCSymptomDefinitions,
  hepatitisCSymptomsMap,
  PregnancyCode,
  respiratorySymptomDefinitions,
  respiratorySymptomsMap,
  SymptomDefinitionMap,
  SyphilisHistoryCode,
  syphilisSymptomDefinitions,
  syphilisSymptomsMap,
} from "../../../../patientApp/timeOfTest/constants";
import { AOEFormOption } from "../TestCardForm.utils";

export interface AoeQuestionProps {
  testOrderId: string;
  responses: AoeQuestionResponses;
  onResponseChange: (responses: AoeQuestionResponses) => void;
  hasAttemptedSubmit: boolean;
  required?: boolean;
  sensitiveTopicsTooltipModal?: React.ReactNode;
}

export function generateAoeListenerHooks(
  onResponseChange: (responses: AoeQuestionResponses) => void,
  responses: AoeQuestionResponses
) {
  const onPregnancyChange = (pregnancyCode: PregnancyCode) => {
    onResponseChange({ ...responses, pregnancy: pregnancyCode });
  };

  const onHasAnySymptomsChange = (hasAnySymptoms: YesNo) => {
    onResponseChange({
      ...responses,
      noSymptoms: hasAnySymptoms === "NO",
    });
  };

  const onSymptomOnsetDateChange = (symptomOnsetDate: string) => {
    onResponseChange({
      ...responses,
      symptomOnset: symptomOnsetDate
        ? moment(symptomOnsetDate).format("YYYY-MM-DD")
        : undefined,
    });
  };

  const onSymptomsChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    currentSymptoms: Record<string, boolean>
  ) => {
    onResponseChange({
      ...responses,
      symptoms: JSON.stringify({
        ...currentSymptoms,
        [event.target.value]: event.target.checked,
      }),
    });
  };

  const onSexualPartnerGenderChange = (selectedItems: string[]) => {
    onResponseChange({
      ...responses,
      genderOfSexualPartners: selectedItems,
    });
  };
  const onSyphilisHistoryChange = (syphilisHistory: SyphilisHistoryCode) => {
    onResponseChange({ ...responses, syphilisHistory: syphilisHistory });
  };

  return {
    onPregnancyChange,
    onHasAnySymptomsChange,
    onSymptomOnsetDateChange,
    onSymptomsChange,
    onSexualPartnerGenderChange,
    onSyphilisHistoryChange,
  };
}

export function generateSexualActivityAoeConstants(
  responses: AoeQuestionResponses,
  hasAttemptedSubmit: boolean
) {
  const isPregnancyFilled = !!responses.pregnancy;
  const isGenderOfSexualPartnersAnswered =
    !!responses.genderOfSexualPartners &&
    responses.genderOfSexualPartners.length > 0;

  const showPregnancyError = hasAttemptedSubmit && !isPregnancyFilled;
  const showGenderOfSexualPartnersError =
    hasAttemptedSubmit && !isGenderOfSexualPartnersAnswered;

  const isSyphilisHistoryFilled = !!responses.syphilisHistory;
  const showSyphilisHistoryError =
    hasAttemptedSubmit && !isSyphilisHistoryFilled;

  const selectedGenders: string[] = [];
  responses.genderOfSexualPartners?.forEach((g) => {
    if (g) {
      selectedGenders.push(g);
    }
  });

  return {
    showPregnancyError,
    showGenderOfSexualPartnersError,
    showSyphilisHistoryError,
    selectedGenders,
  };
}

export function generateSymptomAoeConstants(
  responses: AoeQuestionResponses,
  hasAttemptedSubmit: boolean,
  symptomDefinitionMap: SymptomDefinitionMap[]
) {
  const isSymptomsAnswered = typeof responses.noSymptoms == "boolean";
  const isSymptomOnsetDateAnswered = !!responses.symptomOnset;

  const showSymptomsError = hasAttemptedSubmit && !isSymptomsAnswered;
  const showSymptomOnsetDateError =
    hasAttemptedSubmit &&
    isSymptomsAnswered &&
    responses.noSymptoms === false &&
    !isSymptomOnsetDateAnswered;

  let hasSymptoms: YesNo | undefined = undefined;
  if (responses.noSymptoms) {
    hasSymptoms = "NO";
  }
  if (responses.noSymptoms === false) {
    hasSymptoms = "YES";
  }
  const symptoms: Record<string, boolean> = mapSymptomBoolLiteralsToBool(
    responses.symptoms,
    symptomDefinitionMap
  );

  const isSymptomOnsetAnswered =
    !!responses.symptoms && Object.values(symptoms).some((x) => x?.valueOf());

  const showSymptomSelectionError =
    hasAttemptedSubmit &&
    isSymptomsAnswered &&
    responses.noSymptoms === false &&
    !isSymptomOnsetAnswered;

  return {
    showSymptomsError,
    showSymptomOnsetDateError,
    hasSymptoms,
    showSymptomSelectionError,
    symptoms,
  };
}

export function stringifySymptomJsonForAoeUpdate(
  symptomJson: string | undefined | null
) {
  let symptomPayload = "{}";
  if (!symptomJson) return symptomPayload;

  const parsedSymptoms = JSON.parse(symptomJson);
  const symptomKeys = Object.keys(parsedSymptoms);

  if (_.isEqual(symptomKeys, Object.keys(respiratorySymptomsMap))) {
    symptomPayload = JSON.stringify(
      mapSymptomBoolLiteralsToBool(symptomJson, respiratorySymptomDefinitions)
    );
  }
  if (_.isEqual(symptomKeys, Object.keys(syphilisSymptomsMap))) {
    symptomPayload = JSON.stringify(
      mapSymptomBoolLiteralsToBool(symptomJson, syphilisSymptomDefinitions)
    );
  }
  if (_.isEqual(symptomKeys, Object.keys(hepatitisCSymptomsMap))) {
    symptomPayload = JSON.stringify(
      mapSymptomBoolLiteralsToBool(symptomJson, hepatitisCSymptomDefinitions)
    );
  }
  return symptomPayload;
}

export function mapSpecifiedSymptomBoolLiteralsToBool(
  symptomsJsonString: string | null | undefined,
  disease: AOEFormOption
) {
  let symptomDefinitionToParse;
  if (disease === AOEFormOption.COVID) {
    symptomDefinitionToParse = respiratorySymptomDefinitions;
  }
  if (disease === AOEFormOption.SYPHILIS) {
    symptomDefinitionToParse = syphilisSymptomDefinitions;
  }
  if (disease === AOEFormOption.HEPATITIS_C) {
    symptomDefinitionToParse = hepatitisCSymptomDefinitions;
  }
  // there are no symptoms for that test card, so return true
  if (!symptomDefinitionToParse) return { shouldReturn: true };
  return mapSymptomBoolLiteralsToBool(
    symptomsJsonString,
    symptomDefinitionToParse
  );
}

export const mapSymptomBoolLiteralsToBool = (
  symptomsJsonString: string | null | undefined,
  symptomSelectionMap: SymptomDefinitionMap[]
) => {
  const symptoms: Record<string, boolean> = {};

  if (symptomsJsonString) {
    const parsedSymptoms: { [key: string]: string | boolean } =
      JSON.parse(symptomsJsonString);

    symptomSelectionMap.forEach((opt) => {
      const val = opt?.value;
      if (typeof parsedSymptoms[val] === "string") {
        symptoms[val] = parsedSymptoms[val] === "true";
      } else {
        symptoms[val] = Boolean(parsedSymptoms[val]);
      }
    });
  } else {
    symptomSelectionMap.forEach((opt) => {
      symptoms[opt?.value] = false;
    });
  }
  return symptoms;
};
