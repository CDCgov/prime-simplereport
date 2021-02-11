import React from "react";

import { globalSymptomDefinitions } from "../../../patientApp/timeOfTest/constants";

import Checkboxes from "../../commonComponents/Checkboxes";
import TextInput from "../../commonComponents/TextInput";

interface Symptoms {
  [key: string]: boolean;
}

interface Props {
  noSymptoms: boolean;
  setNoSymptoms: (noSymptoms: boolean) => void;
  currentSymptoms: Symptoms;
  setSymptoms: (symptoms: Symptoms) => void;
  onsetDate: string | undefined;
  setOnsetDate: (onsetDate: string) => void;
  symptomError: string | undefined;
  symptomOnsetError: string | undefined;
  symptomRef: React.RefObject<HTMLInputElement>;
  symptomOnsetRef: React.RefObject<HTMLInputElement>;
}

const SymptomInputs: React.FC<Props> = ({
  noSymptoms,
  setNoSymptoms,
  currentSymptoms,
  setSymptoms,
  onsetDate,
  setOnsetDate,
  symptomError,
  symptomOnsetError,
  symptomRef,
  symptomOnsetRef,
}) => {
  return (
    <>
      <div className={symptomError ? "usa-form-group--error" : "usa-fieldset"}>
        <Checkboxes
          name="no_symptoms"
          legend="Are you experiencing any of the following symptoms?"
          onChange={(e) => setNoSymptoms(e.target.checked)}
          boxes={[{ value: "no", label: "No Symptoms", checked: noSymptoms }]}
          required
          errorMessage={symptomError}
          validationStatus={symptomError ? "error" : undefined}
          inputRef={symptomRef}
        />
        {!noSymptoms && (
          <>
            <div className="border-top-1px border-base-lighter margin-y-2"></div>
            <Checkboxes
              legend="What are your symptoms?"
              legendSrOnly
              name="symptom_list"
              className="symptom-checkboxes"
              onChange={(e) =>
                setSymptoms({
                  ...currentSymptoms,
                  [e.target.value]: e.target.checked,
                })
              }
              boxes={globalSymptomDefinitions.map(({ label, value }) => ({
                label,
                value,
                checked: currentSymptoms[value],
              }))}
            />
          </>
        )}
      </div>
      {!noSymptoms && (
        <TextInput
          type="date"
          label="Date of symptom onset"
          name="symptom_onset"
          value={onsetDate}
          onChange={(e) => setOnsetDate(e.target.value)}
          min="2020-02-01"
          max={new Date().toISOString().split("T")[0]}
          required={Object.keys(currentSymptoms).some(
            (key) => currentSymptoms[key]
          )}
          errorMessage={symptomOnsetError}
          validationStatus={symptomOnsetError ? "error" : undefined}
          inputRef={symptomOnsetRef}
        />
      )}
    </>
  );
};

export default SymptomInputs;
