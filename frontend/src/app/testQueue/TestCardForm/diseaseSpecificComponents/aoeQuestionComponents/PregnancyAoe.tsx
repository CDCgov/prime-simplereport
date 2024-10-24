import React from "react";

import RadioGroup from "../../../../commonComponents/RadioGroup";
import {
  getPregnancyResponses,
  PregnancyCode,
} from "../../../../../patientApp/timeOfTest/constants";
import { AoeQuestionProps } from "../aoeUtils";

const pregnancyResponses = getPregnancyResponses();

export const PregnancyAoe = ({
  testOrderId,
  responses,
  hasAttemptedSubmit,
  onResponseChange,
  required = false,
}: AoeQuestionProps) => {
  const onPregnancyChange = (pregnancyCode: PregnancyCode) => {
    onResponseChange({ ...responses, pregnancy: pregnancyCode });
  };
  const isPregnancyFilled = !!responses.pregnancy;
  const showPregnancyError = hasAttemptedSubmit && !isPregnancyFilled;

  return (
    <RadioGroup
      legend="Is the patient pregnant?"
      name={`pregnancy-${testOrderId}`}
      onChange={onPregnancyChange}
      buttons={pregnancyResponses}
      selectedRadio={responses.pregnancy}
      required={required}
      validationStatus={showPregnancyError ? "error" : undefined}
      errorMessage={
        showPregnancyError && "Please answer this required question."
      }
    />
  );
};
