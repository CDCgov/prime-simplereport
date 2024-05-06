import moment from "moment/moment";
import React from "react";

import RadioGroup from "../../../commonComponents/RadioGroup";
import YesNoRadioGroup from "../../../commonComponents/YesNoRadioGroup";
import TextInput from "../../../commonComponents/TextInput";
import { formatDate } from "../../../utils/date";
import Checkboxes from "../../../commonComponents/Checkboxes";
import {
  getPregnancyResponses,
  respiratorySymptomDefinitions,
  PregnancyCode,
} from "../../../../patientApp/timeOfTest/constants";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";
import { parseSymptoms } from "../utils";

export interface CovidAoEFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();

export const parseRespiratorySymptoms = (
  symptomsJsonString: string | null | undefined
) => {
  return parseSymptoms(symptomsJsonString, respiratorySymptomDefinitions);
};

const CovidAoEForm = ({
  testOrder,
  responses,
  onResponseChange,
}: CovidAoEFormProps) => {
  const symptoms: Record<string, boolean> = parseRespiratorySymptoms(
    responses.symptoms
  );

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

  // backend currently stores this in "noSymptoms"
  // so we need to convert to YesNo or undefined
  let hasSymptoms: YesNo | undefined = undefined;
  if (responses.noSymptoms) {
    hasSymptoms = "NO";
  }
  if (responses.noSymptoms === false) {
    hasSymptoms = "YES";
  }

  return (
    <div className="grid-col" id="covid-aoe-form">
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
          <YesNoRadioGroup
            name={`has-any-symptoms-${testOrder.internalId}`}
            legend="Is the patient currently experiencing any symptoms?"
            value={hasSymptoms}
            onChange={onHasAnySymptomsChange}
          />
        </div>
      </div>
      {hasSymptoms === "YES" && (
        <>
          <div className="grid-row">
            <TextInput
              data-testid="symptom-date"
              name={`symptom-date-${testOrder.internalId}`}
              type="date"
              label="When did the patient's symptoms start?"
              aria-label="Symptom onset date"
              min={formatDate(new Date("Jan 1, 2020"))}
              max={formatDate(moment().toDate())}
              value={
                responses.symptomOnset
                  ? formatDate(
                      moment(responses.symptomOnset).format("YYYY-MM-DD")
                    )
                  : ""
              }
              onChange={(e) => onSymptomOnsetDateChange(e.target.value)}
            ></TextInput>
          </div>
          <Checkboxes
            boxes={respiratorySymptomDefinitions.map(({ label, value }) => ({
              label,
              value,
              checked: symptoms[value],
            }))}
            legend="Select any symptoms the patient is experiencing"
            name={`symptoms-${testOrder.internalId}`}
            onChange={(e) => onSymptomsChange(e, symptoms)}
          />
        </>
      )}
    </div>
  );
};

export default CovidAoEForm;
