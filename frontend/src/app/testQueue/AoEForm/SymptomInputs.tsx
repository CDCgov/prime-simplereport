import React from "react";
import { Label } from "@trussworks/react-uswds";

import { globalSymptomDefinitions } from "../../../patientApp/timeOfTest/constants";
import Checkboxes from "../../commonComponents/Checkboxes";
import { formatDate } from "../../utils/date";

interface Symptoms {
  [key: string]: boolean;
}

interface Props {
  noSymptoms: boolean;
  setNoSymptoms: (noSymptoms: boolean) => void;
  currentSymptoms: Symptoms;
  setSymptoms: (symptoms: Symptoms) => void;
  onsetDate: ISODate | undefined | null;
  setOnsetDate: (onsetDate: ISODate | undefined | null) => void;
  symptomError: string | undefined;
  symptomOnsetError: string | undefined;
  symptomRef: React.RefObject<HTMLInputElement>;
  symptomOnsetRef: React.ForwardedRef<HTMLInputElement>;
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
  function setFormattedOnsetDate(input: string | null | undefined) {
    return setOnsetDate(formatDate(input));
  }
  return (
    <>
      <div className={symptomError ? "usa-form-group--error" : "usa-fieldset"}>
        <Checkboxes
          name="no_symptoms"
          legend="Are you experiencing any of the following symptoms?"
          onChange={(e) => setNoSymptoms(e.target.checked)}
          boxes={[{ value: "no", label: "No symptoms", checked: noSymptoms }]}
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
        <div className="usa-form-group">
          <Label htmlFor="symptom_onset_date">Date of symptom onset</Label>
          {symptomOnsetError && (
            <span className="usa-error-message" role="alert">
              <span className="usa-sr-only">Error: </span>
              {symptomOnsetError}
            </span>
          )}
          <input
            className="symptom-onset-date"
            id="symptom_onset_date"
            data-testid="symptom_onset_date"
            name="symptom_onset"
            defaultValue={onsetDate || undefined}
            min="2020-02-01"
            type="date"
            max={formatDate(new Date())}
            onChange={(event) => {
              const date = event.target.value;
              if (date) {
                setFormattedOnsetDate(date);
              }
            }}
            required={Object.keys(currentSymptoms).some(
              (key) => currentSymptoms[key]
            )}
            ref={symptomOnsetRef}
          />
        </div>
      )}
    </>
  );
};

const WithRef = React.forwardRef<
  HTMLInputElement,
  Omit<Props, "symtomOnsetRef">
>((props, ref) => <SymptomInputs {...props} symptomOnsetRef={ref} />);

export default WithRef;
