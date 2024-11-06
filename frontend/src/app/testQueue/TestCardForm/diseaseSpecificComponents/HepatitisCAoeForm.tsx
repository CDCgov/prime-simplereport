import React from "react";
import moment from "moment";

import { hepatitisCSymptomDefinitions } from "../../../../patientApp/timeOfTest/constants";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";
import YesNoRadioGroup from "../../../commonComponents/YesNoRadioGroup";
import Checkboxes from "../../../commonComponents/Checkboxes";
import TextInput from "../../../commonComponents/TextInput";
import { formatDate } from "../../../utils/date";
import { AoeQuestionName } from "../TestCardForm.utils";

import {
  generateAoeListenerHooks,
  generateSymptomAoeConstants,
} from "./aoeUtils";
import { PregnancyAoe } from "./aoeQuestionComponents/PregnancyAoe";
import { GenderOfSexualPartnersAoe } from "./aoeQuestionComponents/GenderOfSexualPartnersAoe";
import { SensitiveTopicsTooltipModal } from "./SensitiveTopicsTooltipModal";

interface HepatitisCAoeFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  hasAttemptedSubmit: boolean;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

export const HepatitisCAoeForm = ({
  testOrder,
  responses,
  hasAttemptedSubmit,
  onResponseChange,
}: HepatitisCAoeFormProps) => {
  const { onHasAnySymptomsChange, onSymptomOnsetDateChange, onSymptomsChange } =
    generateAoeListenerHooks(onResponseChange, responses);

  const {
    showSymptomsError,
    showSymptomOnsetDateError,
    hasSymptoms,
    showSymptomSelectionError,
    symptoms,
  } = generateSymptomAoeConstants(
    responses,
    hasAttemptedSubmit,
    hepatitisCSymptomDefinitions
  );

  const CHECKBOX_COLS_TO_DISPLAY = 3;
  return (
    <div
      className="grid-col"
      id={`hepatitis-c-aoe-form-${testOrder.patient.internalId}`}
    >
      <div className="grid-row">
        <div className="grid-col-auto">
          <GenderOfSexualPartnersAoe
            testOrderId={testOrder.internalId}
            responses={responses}
            hasAttemptedSubmit={hasAttemptedSubmit}
            onResponseChange={onResponseChange}
            required
            sensitiveTopicsTooltipModal={
              <SensitiveTopicsTooltipModal
                aoeQuestionTopics={[
                  AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
                  AoeQuestionName.PREGNANCY,
                ]}
              />
            }
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <PregnancyAoe
            testOrderId={testOrder.internalId}
            responses={responses}
            hasAttemptedSubmit={hasAttemptedSubmit}
            onResponseChange={onResponseChange}
            required
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <YesNoRadioGroup
            name={`has-any-symptoms-${testOrder.internalId}`}
            legend="Is the patient currently experiencing or showing signs of symptoms?"
            value={hasSymptoms}
            onChange={onHasAnySymptomsChange}
            required
            validationStatus={showSymptomsError ? "error" : undefined}
            errorMessage={
              showSymptomsError && "Please answer this required question."
            }
          />
        </div>
      </div>
      {hasSymptoms === "YES" && (
        <div className={"grid-row grid-gap width-full"}>
          <div className={"grid-col-auto"}>
            <Checkboxes
              boxes={hepatitisCSymptomDefinitions.map(({ label, value }) => ({
                label,
                value,
                checked: symptoms[value],
              }))}
              legend="Select any symptoms the patient is experiencing"
              name={`symptoms-${testOrder.internalId}`}
              onChange={(e) => onSymptomsChange(e, symptoms)}
              numColumnsToDisplay={CHECKBOX_COLS_TO_DISPLAY}
              validationStatus={showSymptomSelectionError ? "error" : undefined}
              errorMessage={
                showSymptomSelectionError
                  ? "Please answer this required question."
                  : ""
              }
            />
          </div>
          <div className="grid-col-auto">
            <TextInput
              data-testid="symptom-date"
              name={`symptom-date-${testOrder.internalId}`}
              type="date"
              label="Date of symptom onset"
              aria-label="Symptom onset date"
              className={""}
              min={formatDate(new Date("Jan 1, 2020"))}
              max={formatDate(moment().toDate())}
              required
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
                showSymptomOnsetDateError &&
                "Please answer this required question."
              }
            ></TextInput>
          </div>
        </div>
      )}
    </div>
  );
};
