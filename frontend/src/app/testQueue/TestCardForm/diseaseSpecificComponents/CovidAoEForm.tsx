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
} from "../../../../patientApp/timeOfTest/constants";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";

import {
  generateAoeListenerHooks,
  generateSymptomAoeConstants,
  mapRespiratorySymptomBoolLiteralsToBool,
} from "./aoeUtils";

export interface CovidAoEFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  onResponseChange: (responses: AoeQuestionResponses) => void;
  hasAttemptedSubmit: boolean;
}

const pregnancyResponses = getPregnancyResponses();

const CovidAoEForm = ({
  testOrder,
  responses,
  onResponseChange,
  hasAttemptedSubmit,
}: CovidAoEFormProps) => {
  const symptoms: Record<string, boolean> =
    mapRespiratorySymptomBoolLiteralsToBool(responses.symptoms);

  const {
    onPregnancyChange,
    onHasAnySymptomsChange,
    onSymptomsChange,
    onSymptomOnsetDateChange,
  } = generateAoeListenerHooks(onResponseChange, responses);
  const { hasSymptoms } = generateSymptomAoeConstants(
    responses,
    hasAttemptedSubmit,
    mapRespiratorySymptomBoolLiteralsToBool
  );
  return (
    <div className="grid-col-auto" id="covid-aoe-form">
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
          <div className="grid-row grid-gap">
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
          <div className="grid-row grid-gap">
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
          </div>
        </>
      )}
    </div>
  );
};

export default CovidAoEForm;
