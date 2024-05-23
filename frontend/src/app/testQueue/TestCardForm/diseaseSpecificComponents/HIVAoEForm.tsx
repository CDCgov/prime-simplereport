import React from "react";

import RadioGroup from "../../../commonComponents/RadioGroup";
import { getPregnancyResponses } from "../../../../patientApp/timeOfTest/constants";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";
import { useTranslatedConstants } from "../../../constants";

import {
  generateAoeListenerHooks,
  generateSexualActivityAoeConstants,
} from "./aoeUtils";

interface HIVAoeFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  hasAttemptedSubmit: boolean;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();

export const HIVAoEForm = ({
  testOrder,
  responses,
  hasAttemptedSubmit,
  onResponseChange,
}: HIVAoeFormProps) => {
  const { onPregnancyChange, onSexualPartnerGenderChange } =
    generateAoeListenerHooks(onResponseChange, responses);

  const { GENDER_IDENTITY_VALUES } = useTranslatedConstants();
  const {
    showPregnancyError,
    selectedGenders,
    showGenderOfSexualPartnersError,
  } = generateSexualActivityAoeConstants(responses, hasAttemptedSubmit);
  return (
    <div
      className="grid-col"
      id={`hiv-aoe-form-${testOrder.patient.internalId}`}
    >
      <div className="grid-row">
        <div className="grid-col-auto">
          <RadioGroup
            legend="Is the patient pregnant?"
            name={`pregnancy-${testOrder.internalId}`}
            onChange={onPregnancyChange}
            buttons={pregnancyResponses}
            selectedRadio={responses.pregnancy}
            required={true}
            validationStatus={showPregnancyError ? "error" : undefined}
            errorMessage={
              showPregnancyError && "Please answer this required question."
            }
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="tablet:grid-col-6">
          <MultiSelect
            name={`sexual-partner-gender-${testOrder.internalId}`}
            options={GENDER_IDENTITY_VALUES}
            onChange={onSexualPartnerGenderChange}
            initialSelectedValues={selectedGenders}
            label={"What is the gender of their sexual partners?"}
            required={true}
            validationStatus={
              showGenderOfSexualPartnersError ? "error" : undefined
            }
            errorMessage={
              showGenderOfSexualPartnersError &&
              "Please answer this required question."
            }
          ></MultiSelect>
        </div>
      </div>
    </div>
  );
};
