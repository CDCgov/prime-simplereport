import React from "react";
import moment from "moment";

import RadioGroup from "../../../commonComponents/RadioGroup";
import {
  getPregnancyResponses,
  getSyphilisHistoryValues,
  syphilisSymptomDefinitions,
} from "../../../../patientApp/timeOfTest/constants";
import { useTranslatedConstants } from "../../../constants";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";
import YesNoRadioGroup from "../../../commonComponents/YesNoRadioGroup";
import Checkboxes from "../../../commonComponents/Checkboxes";
import TextInput from "../../../commonComponents/TextInput";
import { formatDate } from "../../../utils/date";
import { AoeQuestionName } from "../TestCardForm.utils";

import {
  generateAoeListenerHooks,
  generateSexualActivityAoeConstants,
  generateSymptomAoeConstants,
} from "./aoeUtils";
import { SensitiveTopicsTooltipModal } from "./SensitiveTopicsTooltipModal";

interface SyphillisAoeFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  hasAttemptedSubmit: boolean;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();
const syphilisHistoryResponses = getSyphilisHistoryValues();

export const SyphilisAoEForm = ({
  testOrder,
  responses,
  hasAttemptedSubmit,
  onResponseChange,
}: SyphillisAoeFormProps) => {
  const {
    onPregnancyChange,
    onHasAnySymptomsChange,
    onSymptomOnsetDateChange,
    onSymptomsChange,
    onSexualPartnerGenderChange,
    onSyphilisHistoryChange,
  } = generateAoeListenerHooks(onResponseChange, responses);

  const {
    showPregnancyError,
    showGenderOfSexualPartnersError,
    showSyphilisHistoryError,
    selectedGenders,
  } = generateSexualActivityAoeConstants(responses, hasAttemptedSubmit);

  const {
    showSymptomsError,
    showSymptomOnsetDateError,
    hasSymptoms,
    showSymptomSelectionError,
    symptoms,
  } = generateSymptomAoeConstants(
    responses,
    hasAttemptedSubmit,
    syphilisSymptomDefinitions
  );

  const CHECKBOX_COLS_TO_DISPLAY = 3;
  const { GENDER_VALUES } = useTranslatedConstants();
  return (
    <div
      className="grid-col"
      id={`syphillis-aoe-form-${testOrder.patient.internalId}`}
    >
      <div className="grid-row">
        <div className="grid-col-auto">
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
            required
            hintText={
              <SensitiveTopicsTooltipModal
                aoeQuestionTopics={[
                  AoeQuestionName.GENDER_OF_SEXUAL_PARTNERS,
                  AoeQuestionName.SYPHILIS_HISTORY,
                  AoeQuestionName.PREGNANCY,
                ]}
              />
            }
            hintTextClassName={""}
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
      <div className="grid-col-auto">
        <RadioGroup
          legend="Has the patient been told they have syphilis before?"
          name={`syphilisHistory-${testOrder.internalId}`}
          onChange={onSyphilisHistoryChange}
          buttons={syphilisHistoryResponses}
          required
          selectedRadio={responses.syphilisHistory}
          validationStatus={showSyphilisHistoryError ? "error" : undefined}
          errorMessage={
            showSyphilisHistoryError && "Please answer this required question."
          }
        />
      </div>
      <div className="grid-row">
        <div className="grid-col-auto">
          <RadioGroup
            legend="Is the patient pregnant?"
            name={`pregnancy-${testOrder.internalId}`}
            onChange={onPregnancyChange}
            buttons={pregnancyResponses}
            selectedRadio={responses.pregnancy}
            required
            validationStatus={showPregnancyError ? "error" : undefined}
            errorMessage={
              showPregnancyError && "Please answer this required question."
            }
          />
        </div>
      </div>
      <div className="grid-row">
        <div className="grid-col-12">
          <YesNoRadioGroup
            name={`has-any-symptoms-${testOrder.internalId}`}
            legend="Is the patient currently experiencing or showing signs of symptoms?"
            value={hasSymptoms}
            required
            onChange={onHasAnySymptomsChange}
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
              boxes={syphilisSymptomDefinitions.map(({ label, value }) => ({
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
              required
              label="Date of symptom onset"
              aria-label="Symptom onset date"
              className={""}
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
