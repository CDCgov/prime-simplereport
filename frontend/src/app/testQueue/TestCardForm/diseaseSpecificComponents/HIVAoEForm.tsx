import React from "react";

import RadioGroup from "../../../commonComponents/RadioGroup";
import {
  getPregnancyResponses,
  PregnancyCode,
} from "../../../../patientApp/timeOfTest/constants";
import { QueriedTestOrder } from "../../QueueItem";
import { useTranslatedConstants } from "../../../constants";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import { AoeQuestionResponses } from "../TestCardFormReducer";

interface HIVAoeFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();

export const HIVAoEForm = ({
  testOrder,
  responses,
  onResponseChange,
}: HIVAoeFormProps) => {
  const onPregnancyChange = (pregnancyCode: PregnancyCode) => {
    onResponseChange({ ...responses, pregnancy: pregnancyCode });
  };

  const { GENDER_IDENTITY_VALUES } = useTranslatedConstants();

  const onSexualPartnerGenderChange = (selectedItems: string[]) => {
    onResponseChange({
      ...responses,
      genderOfSexualPartners: selectedItems,
    });
  };

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
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <MultiSelect
            name={`sexual-partner-gender-${testOrder.internalId}`}
            options={GENDER_IDENTITY_VALUES}
            onChange={onSexualPartnerGenderChange}
            label={"What is the gender of their sexual partners?"}
          ></MultiSelect>
        </div>
      </div>
    </div>
  );
};
