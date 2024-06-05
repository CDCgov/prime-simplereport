import moment from "moment/moment";
import React from "react";

import RadioGroup from "../../../commonComponents/RadioGroup";
import YesNoRadioGroup from "../../../commonComponents/YesNoRadioGroup";
import TextInput from "../../../commonComponents/TextInput";
import { formatDate } from "../../../utils/date";
import Checkboxes from "../../../commonComponents/Checkboxes";
import {
  getPregnancyResponses,
  ONSET_DATE_LABEL,
  respiratorySymptomDefinitions,
  SYMPTOM_SUBQUESTION_ERROR,
} from "../../../../patientApp/timeOfTest/constants";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";

import {
  generateAoeListenerHooks,
  generateSymptomAoeConstants,
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
  const {
    onPregnancyChange,
    onHasAnySymptomsChange,
    onSymptomsChange,
    onSymptomOnsetDateChange,
  } = generateAoeListenerHooks(onResponseChange, responses);
  const {
    hasSymptoms,
    symptoms,
    showSymptomSelectionError,
    showSymptomOnsetDateError,
  } = generateSymptomAoeConstants(
    responses,
    hasAttemptedSubmit,
    respiratorySymptomDefinitions
  );
  return (
    <div
      className="grid-col-auto"
      id={`covid-aoe-form-${testOrder.patient.internalId}`}
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
          <div className="grid-row grid-gap" data-testid="symptom-date">
            <TextInput
              name={`symptom-date-${testOrder.internalId}`}
              type="date"
              label={ONSET_DATE_LABEL}
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
              validationStatus={showSymptomOnsetDateError ? "error" : undefined}
              errorMessage={
                showSymptomOnsetDateError
                  ? SYMPTOM_SUBQUESTION_ERROR
                  : undefined
              }
              className={showSymptomOnsetDateError ? "margin-left-0" : ""}
            ></TextInput>
          </div>
          <div
            className="grid-row grid-gap margin-left-0"
            data-testid={`symptom-selection-${testOrder.internalId}`}
          >
            <Checkboxes
              boxes={respiratorySymptomDefinitions.map(({ label, value }) => ({
                label,
                value,
                checked: symptoms[value],
              }))}
              legend="Select any symptoms the patient is experiencing"
              name={`symptoms-${testOrder.internalId}`}
              onChange={(e) => onSymptomsChange(e, symptoms)}
              validationStatus={showSymptomSelectionError ? "error" : undefined}
              errorMessage={
                showSymptomSelectionError
                  ? SYMPTOM_SUBQUESTION_ERROR
                  : undefined
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default CovidAoEForm;
