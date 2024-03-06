import moment from "moment/moment";
import React from "react";

import RadioGroup from "../../../commonComponents/RadioGroup";
import YesNoRadioGroup from "../../../commonComponents/YesNoRadioGroup";
import TextInput from "../../../commonComponents/TextInput";
import { formatDate } from "../../../utils/date";
import Checkboxes from "../../../commonComponents/Checkboxes";
import {
  getPregnancyResponses,
  globalSymptomDefinitions,
  PregnancyCode,
} from "../../../../patientApp/timeOfTest/constants";
import { AoeQuestionResponses } from "../TestCardFormReducer";
import { QueriedTestOrder } from "../types";

export interface CovidAoEFormProps {
  testOrder: QueriedTestOrder;
  responses: AoeQuestionResponses;
  onResponseChange: (responses: AoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();

export const parseSymptoms = (
  symptomsJsonString: string | null | undefined
) => {
  const symptoms: Record<string, boolean> = {};
  if (symptomsJsonString) {
    const parsedSymptoms: { [key: string]: string | boolean } =
      JSON.parse(symptomsJsonString);

    globalSymptomDefinitions.forEach((opt) => {
      const val = opt.value;
      if (typeof parsedSymptoms[val] === "string") {
        symptoms[val] = parsedSymptoms[val] === "true";
      } else {
        symptoms[val] = parsedSymptoms[val] as boolean;
      }
    });
  } else {
    globalSymptomDefinitions.forEach((opt) => {
      symptoms[opt.value] = false;
    });
  }
  return symptoms;
};

const CovidAoEForm = ({
  testOrder,
  responses,
  onResponseChange,
}: CovidAoEFormProps) => {
  const symptoms: Record<string, boolean> = parseSymptoms(responses.symptoms);

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
              boxes={globalSymptomDefinitions.map(({ label, value }) => ({
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
