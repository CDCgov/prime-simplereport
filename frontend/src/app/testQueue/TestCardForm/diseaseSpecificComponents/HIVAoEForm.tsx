import React from "react";

import RadioGroup from "../../../commonComponents/RadioGroup";
import { getPregnancyResponses } from "../../../../patientApp/timeOfTest/constants";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";
import { useTranslatedConstants } from "../../../constants";
import { AoeQuestionName } from "../TestCardForm.utils";

import {
  generateAoeListenerHooks,
  generateSexualActivityAoeConstants,
} from "./aoeUtils";
import { SensitiveTopicsTooltipModal } from "./SensitiveTopicsTooltipModal";

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

  const { GENDER_VALUES } = useTranslatedConstants();
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
        <div className="grid-col-12 desktop:grid-col-6">
          <MultiSelect
            name={`sexual-partner-gender-${testOrder.internalId}`}
            options={GENDER_VALUES}
            onChange={onSexualPartnerGenderChange}
            initialSelectedValues={selectedGenders}
            label={
              <>
                What is the sex of their sexual partners?{" "}
                <span className={"text-base-dark"}>
                  (Select all that apply.)
                </span>
              </>
            }
            labelClassName={"multi-select-dropdown"}
            required={true}
            validationStatus={
              showGenderOfSexualPartnersError ? "error" : undefined
            }
            hintText={
              <SensitiveTopicsTooltipModal
                aoeQuestionTopics={[
                  AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
                  AoeQuestionName.PREGNANCY,
                ]}
              />
            }
            hintTextClassName={""}
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
