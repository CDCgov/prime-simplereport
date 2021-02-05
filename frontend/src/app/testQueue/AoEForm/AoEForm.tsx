import React, { useState } from "react";
import { gql } from "@apollo/client";
import {
  getSymptomList,
  getTestTypes,
  getPregnancyResponses,
} from "../../../patientApp/timeOfTest/constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import Button from "../../commonComponents/Button";
import FormGroup from "../../commonComponents/FormGroup";
import { useQuery } from "@apollo/client";
import "./AoEForm.scss";
import SymptomInputs from "./SymptomInputs";
import PriorTestInputs from "./PriorTestInputs";
import { Redirect } from "react-router";

interface Data {
  patient: {
    lastTest: {
      dateTested: string;
      result: string;
    };
  };
}

const lastTestQuery = gql`
  query GetPatientsLastResult($patientId: String!) {
    patient(id: $patientId) {
      lastTest {
        dateTested
        result
      }
    }
  }
`;

// Get the value associate with a button label
// TODO: move to utility?
const findValueForLabel = (
  label: string,
  list: { label: string; value: string }[]
) => (list.filter((item) => item.label === label)[0] || {}).value;

interface Props {
  saveButtonText: string;
  onClose?: () => void;
  patient: {
    internalId: string;
    gender: string;
  };
  loadState?: {
    noSymptoms: boolean;
    symptoms: string;
    symptomOnset: string;
    priorTestDate: string;
    priorTestResult: string;
    priorTestType: string;
    firstTest: boolean;
    pregnancy: string;
  };
  saveCallback: (response: {
    noSymptoms: boolean;
    symptoms: string;
    symptomOnset: string | undefined;
    priorTestDate: string | undefined | null;
    priorTestResult: string | undefined | null;
    priorTestType: string | undefined | null;
    firstTest: boolean;
    pregnancy: string | undefined;
  }) => void;
  isModal: boolean;
  noValidation: boolean;
}

const AoEForm: React.FC<Props> = ({
  saveButtonText,
  onClose,
  patient,
  loadState = {},
  saveCallback,
  isModal,
  noValidation,
}) => {
  // this seems like it will do a bunch of wasted work on re-renders and non-renders,
  // but it's all small-ball stuff for now
  const testConfig = getTestTypes();
  const symptomConfig = getSymptomList();
  const initialSymptoms: { [key: string]: boolean } = {};
  if (loadState.symptoms) {
    const loadedSymptoms: { [key: string]: string | boolean } = JSON.parse(
      loadState.symptoms
    );

    symptomConfig.forEach((opt) => {
      const val = opt.value;
      if (typeof loadedSymptoms[val] === "string") {
        initialSymptoms[val] = loadedSymptoms[val] === "true";
      } else {
        initialSymptoms[val] = loadedSymptoms[val] as boolean;
      }
    });
  } else {
    symptomConfig.forEach((opt) => {
      initialSymptoms[opt.value] = false;
    });
  }

  const [noSymptoms, setNoSymptoms] = useState(loadState.noSymptoms || false);
  const [currentSymptoms, setSymptoms] = useState(initialSymptoms);
  const [onsetDate, setOnsetDate] = useState(loadState.symptomOnset);
  const [isFirstTest, setIsFirstTest] = useState(loadState.firstTest);
  const [priorTestDate, setPriorTestDate] = useState(loadState.priorTestDate);
  const [priorTestType, setPriorTestType] = useState(loadState.priorTestType);
  const [priorTestResult, setPriorTestResult] = useState(
    loadState.priorTestResult
  );
  const [pregnancyResponse, setPregnancyResponse] = useState(
    loadState.pregnancy
  );
  const [nextPage, setNextPage] = useState(false);

  // form validation
  const [symptomError, setSymptomError] = useState<string | undefined>();
  const [symptomOnsetError, setSymptomOnsetError] = useState<
    string | undefined
  >();

  const isValidForm = () => {
    if (noValidation) return true;
    const hasSymptoms = Object.keys(currentSymptoms).some(
      (key) => currentSymptoms[key]
    );
    if (!noSymptoms && !hasSymptoms) {
      setSymptomError("Select your symptoms");
      setSymptomOnsetError(undefined);
      return false;
    }

    if (noSymptoms) {
      setSymptomError(undefined);
      setSymptomOnsetError(undefined);
      return true;
    }

    if (hasSymptoms && !onsetDate) {
      setSymptomError(undefined);
      setSymptomOnsetError("Enter the date of symptom onset");
      return false;
    }

    if (hasSymptoms && onsetDate) {
      setSymptomError(undefined);
      setSymptomOnsetError(undefined);
      return true;
    }
  };

  // TODO: only get most recent test from the backend
  const { data, loading, error } = useQuery<Data, {}>(lastTestQuery, {
    fetchPolicy: "no-cache",
    variables: { patientId: patient.internalId },
  });
  if (loading) return null;
  if (error) throw error;
  const mostRecentTest = data?.patient.lastTest;

  // Auto-answer pregnancy question for males
  const pregnancyResponses = getPregnancyResponses();
  if (patient.gender === "male" && !pregnancyResponse) {
    setPregnancyResponse(findValueForLabel("No", pregnancyResponses));
  }

  const saveAnswers = (e: React.FormEvent) => {
    if (isValidForm()) {
      const saveSymptoms = { ...currentSymptoms };
      if (noSymptoms) {
        // set all symptoms explicitly to false
        symptomConfig.forEach(({ value }) => {
          saveSymptoms[value] = false;
        });
      }
      const priorTest = isFirstTest
        ? {
            firstTest: true,
            priorTestDate: null,
            priorTestType: null,
            priorTestResult: null,
          }
        : {
            firstTest: false,
            priorTestDate: priorTestDate,
            priorTestType: priorTestType,
            priorTestResult: priorTestResult ? priorTestResult : null,
          };

      saveCallback({
        noSymptoms,
        symptoms: JSON.stringify(saveSymptoms),
        symptomOnset: onsetDate,
        ...priorTest,
        pregnancy: pregnancyResponse,
      });
      if (isModal && onClose) {
        onClose();
      } else {
        setNextPage(true);
      }
    } else {
      e.preventDefault();
    }
  };

  const buttonGroup = (
    <div className="sr-time-of-test-buttons">
      <Button
        id="aoe-form-save-button"
        label={saveButtonText}
        type={"submit"}
      />
    </div>
  );

  if (nextPage) {
    return <Redirect to={"/success"} />;
  }

  return (
    <>
      <form onSubmit={saveAnswers}>
        <FormGroup title="Symptoms">
          <SymptomInputs
            noSymptoms={noSymptoms}
            setNoSymptoms={setNoSymptoms}
            currentSymptoms={currentSymptoms}
            setSymptoms={setSymptoms}
            symptomListConfig={symptomConfig}
            setOnsetDate={setOnsetDate}
            onsetDate={onsetDate}
            symptomError={symptomError}
            symptomOnsetError={symptomOnsetError}
          />
        </FormGroup>

        <FormGroup title="Test History">
          <div className="prime-formgroup__wrapper">
            <PriorTestInputs
              testTypeConfig={testConfig}
              priorTestDate={priorTestDate}
              setPriorTestDate={setPriorTestDate}
              isFirstTest={isFirstTest}
              setIsFirstTest={setIsFirstTest}
              priorTestType={priorTestType}
              setPriorTestType={setPriorTestType}
              priorTestResult={priorTestResult}
              setPriorTestResult={setPriorTestResult}
              mostRecentTest={mostRecentTest}
            />
          </div>
        </FormGroup>

        {patient.gender !== "male" && (
          <FormGroup title="Pregnancy">
            <RadioGroup
              legend="Currently pregnant?"
              name="pregnancy"
              type="radio"
              onChange={(evt) => setPregnancyResponse(evt.currentTarget.value)}
              buttons={pregnancyResponses}
              selectedRadio={pregnancyResponse}
            />
          </FormGroup>
        )}
        <div className="margin-top-4 padding-top-205 border-top border-base-lighter margin-x-neg-205">
          {buttonGroup}
        </div>
      </form>
    </>
  );
};

export default AoEForm;
