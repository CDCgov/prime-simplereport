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
  SymptomCode,
} from "../../../../patientApp/timeOfTest/constants";
import { QueriedTestOrder } from "../../QueueItem";
import { CovidAoeQuestionResponses } from "../TestCardFormReducer";

export interface CovidAoEFormProps {
  testOrder: QueriedTestOrder;
  responses: CovidAoeQuestionResponses;
  onResponseChange: (responses: CovidAoeQuestionResponses) => void;
}

const pregnancyResponses = getPregnancyResponses();

const CovidAoEForm = ({
  testOrder,
  responses,
  onResponseChange,
}: CovidAoEFormProps) => {
  const [hasAnySymptoms, setHasAnySymptoms] = useState<YesNoUnknown>();

  const onPregnancyChange = (pregnancyCode: PregnancyCode) => {
    onResponseChange({ ...responses, pregnancy: pregnancyCode });
  };

  const onSymptomOnsetDateChange = (symptomOnsetDate: string) => {
    onResponseChange({
      ...responses,
      symptomOnsetDate: moment(symptomOnsetDate).toISOString(),
    });
  };

  const onSymptomsChange = (symptom: string) => {
    let updateSymptoms = { ...responses.symptoms };
    updateSymptoms[symptom] = !updateSymptoms[symptom];
    onResponseChange({
      ...responses,
      symptoms: updateSymptoms,
    });
  };

  return (
    <>
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
              boxes={globalSymptomDefinitions}
              legend="Select any symptoms the patient is experiencing"
              name={`symptoms-${testOrder.internalId}`}
              onChange={(e) => onSymptomsChange(e.target.value as SymptomCode)}
            />
          </div>
        </>
      )}
    </>
  );
};

export default CovidAoEForm;
