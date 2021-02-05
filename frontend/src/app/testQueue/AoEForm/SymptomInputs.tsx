import React from "react";
import Checkboxes from "../../commonComponents/Checkboxes";
import TextInput from "../../commonComponents/TextInput";

interface Symptoms {
  [key: string]: boolean;
}

interface Props {
  symptomListConfig: {
    label: string;
    value: string;
  }[];
  noSymptoms: boolean;
  setNoSymptoms: (noSymptoms: boolean) => void;
  currentSymptoms: Symptoms;
  setSymptoms: (symptoms: Symptoms) => void;
  onsetDate: string | undefined;
  setOnsetDate: (onsetDate: string) => void;
  symptomError: string | undefined;
  symptomOnsetError: string | undefined;
}

const SymptomInputs: React.FC<Props> = ({
  symptomListConfig,
  noSymptoms,
  setNoSymptoms,
  currentSymptoms,
  setSymptoms,
  onsetDate,
  setOnsetDate,
  symptomError,
  symptomOnsetError,
}) => {
  return (
    <>
      <div className={symptomError ? "usa-form-group--error" : "usa-fieldset"}>
        <Checkboxes
          name="symptom_list"
          legend="Are you experiencing any of the following symptoms?"
          onChange={(e) => setNoSymptoms(e.target.checked)}
          boxes={[{ value: "no", label: "No Symptoms", checked: noSymptoms }]}
          required
          errorMessage={symptomError}
          validationStatus={symptomError ? "error" : undefined}
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
              boxes={symptomListConfig.map(({ label, value }) => ({
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
        />
      )}
    </>
  );
};

export default SymptomInputs;
