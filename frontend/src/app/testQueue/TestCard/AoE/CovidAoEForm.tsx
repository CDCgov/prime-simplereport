import moment from "moment/moment";
import React, { useState } from "react";

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
import { QueriedTestOrder } from "../../QueueItem";
import { CovidAoeQuestionResponses } from "../TestCardFormReducer";

export interface CovidAoEFormProps {
  testOrder: QueriedTestOrder;
  responses: CovidAoeQuestionResponses;
  onResponseChange: (responses: CovidAoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();

const parseSymptoms = (symptomsJsonString: string | null | undefined) => {
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
  const [hasAnySymptoms, setHasAnySymptoms] = useState<YesNoUnknown>();

  const symptoms: Record<string, boolean> = parseSymptoms(responses.symptoms);

  const onPregnancyChange = (pregnancyCode: PregnancyCode) => {
    onResponseChange({ ...responses, pregnancy: pregnancyCode });
  };

  const onSymptomOnsetDateChange = (symptomOnsetDate: string) => {
    onResponseChange({
      ...responses,
      symptomOnsetDate: moment(symptomOnsetDate).toISOString(),
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

  return (
    <>
      <div className="grid-col-auto">
        <div className="grid-row">
          <div className="grid-col-auto">
            <RadioGroup
              legend="Is the patient pregnant?"
              name="pregnancy"
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
              value={hasAnySymptoms}
              onChange={(e) => setHasAnySymptoms(e)}
            />
          </div>
        </div>
        {hasAnySymptoms === "YES" && (
          <>
            <div className="grid-row grid-gap">
              <TextInput
                id={`symptom-onset-date-${testOrder.patient.internalId}`}
                data-testid="symptom-date"
                name="symptom-date"
                type="date"
                label="When did the patient's symptoms start?"
                aria-label="Symptom onset date"
                min={formatDate(new Date("Jan 1, 2020"))}
                max={formatDate(moment().toDate())}
                value={formatDate(moment(responses.symptomOnsetDate).toDate())}
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
    </>
  );
};

export default CovidAoEForm;
