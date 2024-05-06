import React from "react";
import moment from "moment";

import RadioGroup from "../../../commonComponents/RadioGroup";
import {
  getPregnancyResponses,
  PregnancyCode,
  getSyphilisHistoryValues,
  SyphilisHistoryCode,
  syphilisSymptomDefinitions,
} from "../../../../patientApp/timeOfTest/constants";
import { useTranslatedConstants } from "../../../constants";
import MultiSelect from "../../../commonComponents/MultiSelect/MultiSelect";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";
import YesNoRadioGroup from "../../../commonComponents/YesNoRadioGroup";
import Checkboxes from "../../../commonComponents/Checkboxes";
import { parseSymptoms } from "../utils";
import TextInput from "../../../commonComponents/TextInput";
import { formatDate } from "../../../utils/date";

interface SyphillisAoeFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  hasAttemptedSubmit: boolean;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();
const syphilisHistoryResponses = getSyphilisHistoryValues();

export const parseSyphilisSymptoms = (
  symptomsJsonString: string | null | undefined
) => {
  return parseSymptoms(symptomsJsonString, syphilisSymptomDefinitions);
};
export const SyphilisAoEForm = ({
  testOrder,
  responses,
  hasAttemptedSubmit,
  onResponseChange,
}: SyphillisAoeFormProps) => {
  const symptoms: Record<string, boolean> = parseSyphilisSymptoms(
    responses.symptoms
  );

  const onPregnancyChange = (pregnancyCode: PregnancyCode) => {
    onResponseChange({ ...responses, pregnancy: pregnancyCode });
  };

  const onSyphilisHistoryChange = (syphilisHistory: SyphilisHistoryCode) => {
    onResponseChange({ ...responses, syphilisHistory: syphilisHistory });
  };

  const { GENDER_IDENTITY_VALUES } = useTranslatedConstants();

  const onSexualPartnerGenderChange = (selectedItems: string[]) => {
    onResponseChange({
      ...responses,
      genderOfSexualPartners: selectedItems,
    });
  };

  const isSyphilisHistoryFilled = !!responses.syphilisHistory;
  const isPregnancyFilled = !!responses.pregnancy;
  const isGenderOfSexualPartnersAnswered =
    !!responses.genderOfSexualPartners &&
    responses.genderOfSexualPartners.length > 0;

  const isSymptomsAnswered = typeof responses.noSymptoms == "boolean";
  const isSymptomOnsetDateAnswered = !!responses.symptomOnset;
  const isSymptomOnsetAnswered =
    !!responses.symptoms &&
    Object.values(parseSyphilisSymptoms(responses.symptoms)).some((x) =>
      x?.valueOf()
    );

  const showPregnancyError = hasAttemptedSubmit && !isPregnancyFilled;
  const showGenderOfSexualPartnersError =
    hasAttemptedSubmit && !isGenderOfSexualPartnersAnswered;
  const showSyphilisHistoryError =
    hasAttemptedSubmit && !isSyphilisHistoryFilled;
  const showSymptomsError = hasAttemptedSubmit && !isSymptomsAnswered;

  const showSymptomOnsetError =
    hasAttemptedSubmit &&
    isSymptomsAnswered &&
    responses.noSymptoms === false &&
    !isSymptomOnsetAnswered;

  const showSymptomOnsetDateError =
    hasAttemptedSubmit &&
    isSymptomsAnswered &&
    responses.noSymptoms === false &&
    !isSymptomOnsetDateAnswered;

  const selectedGenders: string[] = [];
  responses.genderOfSexualPartners?.forEach((g) => {
    if (g) {
      selectedGenders.push(g);
    }
  });

  let hasSymptoms: YesNo | undefined = undefined;
  if (responses.noSymptoms) {
    hasSymptoms = "NO";
  }
  if (responses.noSymptoms === false) {
    hasSymptoms = "YES";
  }
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
  const CHECKBOX_COLS_TO_DISPLAY = 3;
  return (
    <div
      className="grid-col"
      id={`syphillis-aoe-form-${testOrder.patient.internalId}`}
    >
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
        <div className="tablet:grid-col-6">
          <MultiSelect
            name={`sexual-partner-gender-${testOrder.internalId}`}
            options={GENDER_IDENTITY_VALUES}
            onChange={onSexualPartnerGenderChange}
            initialSelectedValues={selectedGenders}
            label={"What is the gender of their sexual partners?"}
            required
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
        <div className="grid-col-auto">
          <YesNoRadioGroup
            name={`has-any-symptoms-${testOrder.internalId}`}
            legend="Is the patient currently experiencing any symptoms?"
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
        <div className={"grid-row grid-gap width-full flex-start"}>
          <div className={`flex-${CHECKBOX_COLS_TO_DISPLAY - 1}`}>
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
              validationStatus={showSymptomOnsetError ? "error" : undefined}
              errorMessage={
                showSymptomOnsetError
                  ? "Please answer this required question."
                  : ""
              }
            />
          </div>

          <TextInput
            data-testid="symptom-date"
            name={`symptom-date-${testOrder.internalId}`}
            type="date"
            required
            label="Date of symptom onset"
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
              showSymptomOnsetDateError &&
              "Please answer this required question."
            }
          ></TextInput>
        </div>
      )}
    </div>
  );
};
