import React from "react";
import { displayFullName } from "../../utils";
import CMSDialog from "../../commonComponents/CMSDialog";

import "@cmsgov/design-system/dist/css/index.css";
import { useState } from "react";
import {
  getSymptomList,
  getTestTypes,
  getPregnancyResponses,
} from "./constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import Dropdown from "../../commonComponents/Dropdown";
import Anchor from "../../commonComponents/Anchor";
import Button from "../../commonComponents/Button";
import { COVID_RESULTS } from "../../constants";
import DateInput from "../../commonComponents/DateInput";

// building blocks that *probably* don't want to be exportable components
const SymptomInputs = ({
  symptomListConfig,
  noSymptoms,
  setNoSymptoms,
  currentSymptoms,
  setSymptoms,
  onsetDate,
  setOnsetDate,
}) => {
  const symptomChange = (evt) => {
    const choice = evt.currentTarget;
    setSymptoms({ ...currentSymptoms, [choice.value]: choice.checked });
  };
  const choiceList = symptomListConfig.map((conf) => {
    const { label, value } = conf;
    return { label, value, checked: currentSymptoms[value] };
  });

  // build the choice list we would have without the no-symptom toggle,
  // so we can extract its contents to plug into the wrapper.
  const wrappedSymptomChoiceList = noSymptoms ? null : (
    <React.Fragment>
      <hr />
      <RadioGroup
        type="checkbox"
        name="symptom_list"
        onChange={symptomChange}
        buttons={choiceList}
      />
      <DateInput
        label="Date of symptom onset"
        name="symptom_onset"
        value={onsetDate}
        onChange={setOnsetDate}
        max={new Date().toISOString().split("T")[0]}
      />
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <RadioGroup
        type="checkbox"
        name="symptom_list"
        legend="Are you experiencing any of the following symptoms?"
        displayLegend
        onChange={(evt) => {
          console.log("new value:", evt.currentTarget.checked);
          setNoSymptoms(evt.currentTarget.checked);
        }}
        buttons={[{ value: "hasNoSymptoms", label: "No Symptoms" }]}
        selectedRadio={noSymptoms ? "hasNoSymptoms" : null}
      />
      {wrappedSymptomChoiceList}
    </React.Fragment>
  );
};

const PriorTestInputs = ({
  testTypeConfig,
  isFirstTest,
  setIsFirstTest,
  priorTestDate,
  setPriorTestDate,
  priorTestResult,
  setPriorTestResult,
  priorTestType,
  setPriorTestType,
}) => {
  // disable inputs other than Yes/No if it is "Yes" or unset
  const disableDetails = isFirstTest !== false;

  let radioValue = isFirstTest
    ? "yes"
    : isFirstTest === false
    ? "no"
    : undefined;

  return (
    <React.Fragment>
      <RadioGroup
        buttons={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
        selectedRadio={radioValue}
        onChange={(e) => {
          let value = e.target.value;
          let isFirstTest = value === "yes" ? true : false;
          setIsFirstTest(isFirstTest);
        }}
        legend="First covid test?"
        displayLegend
        name="prior_test_flag"
        horizontal
      />
      {isFirstTest ? null : (
        <>
          <DateInput
            label="Date of most recent prior test?"
            name="prior_test_date"
            value={priorTestDate}
            onChange={setPriorTestDate}
            disabled={disableDetails}
            max={new Date().toISOString().split("T")[0]}
            min="2020-02-01"
          />
          <Dropdown
            options={testTypeConfig}
            label="Type of prior test"
            name="prior_test_type"
            selectedValue={priorTestType}
            onChange={(e) => setPriorTestType(e.target.value)}
            disabled={disableDetails}
          />
          <Dropdown
            options={[
              { value: COVID_RESULTS.POSITIVE, label: "Positive" },
              { value: COVID_RESULTS.NEGATIVE, label: "Negative" },
              { value: COVID_RESULTS.INCONCLUSIVE, label: "Undetermined" },
            ]}
            label="Result of prior test"
            name="prior_test_result"
            selectedValue={priorTestResult}
            onChange={(e) => setPriorTestResult(e.target.value)}
            disabled={disableDetails}
          />
        </>
      )}
    </React.Fragment>
  );
};

const AoEModalForm = ({
  saveButtonText = "Save",
  onClose,
  patient,
  loadState = {},
  saveCallback = () => null,
}) => {
  const testConfig = getTestTypes();
  const symptomConfig = getSymptomList();

  // this seems like it will do a bunch of wasted work on re-renders and non-renders,
  // but it's all small-ball stuff for now
  const initialSymptoms = {};
  if (loadState.symptoms) {
    const loadedSymptoms = JSON.parse(loadState.symptoms);

    symptomConfig.forEach((opt) => {
      const val = opt.value;
      if (typeof loadedSymptoms[val] === "string") {
        initialSymptoms[val] = loadedSymptoms[val] === "true" || false;
      } else {
        initialSymptoms[val] = loadedSymptoms[val];

      }
    });
  } else {
    symptomConfig.forEach((opt) => {
      const val = opt.value;
      initialSymptoms[val] = false;
    });
  }


  const [noSymptoms, setNoSymptoms] = useState(loadState.noSymptoms || false);
  const [currentSymptoms, setSymptoms] = useState(initialSymptoms);
  const [onsetDate, setOnsetDate] = useState(loadState.symptomOnset);

  const [isFirstTest, setIsFirstTest] = useState(loadState.firstTest);
  const [priorTestDate, setPriorTestDate] = useState(
    loadState.priorTestDate
  );
  const [priorTestType, setPriorTestType] = useState(loadState.priorTestType);
  const [priorTestResult, setPriorTestResult] = useState(
    loadState.priorTestResult
  );

  const [pregnancyResponse, setPregnancyResponse] = useState(
    loadState.pregnancy
  );

  const saveAnswers = (evt) => {
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
          priorTestResult: priorTestResult,
        };

    saveCallback({
      noSymptoms,
      symptoms: JSON.stringify(saveSymptoms),
      symptomOnset: onsetDate,
      ...priorTest,
      pregnancy: pregnancyResponse,
    });
    onClose();
  };

  const actionButtons = (
    <div style={{ float: "right" }}>
      <Anchor text="Cancel" onClick={onClose} />
      <Button label={saveButtonText} onClick={saveAnswers} />
    </div>
  );
  const patientName = displayFullName(
    patient.firstName,
    patient.middleName,
    patient.lastName
  );
  return (
    <CMSDialog
      onExit={onClose}
      closeText="Cancel"
      heading={patientName}
      getApplicationNode={() => {
        document.getElementById("#root");
      }}
      actions={actionButtons}
      actionsInHeader={true}
    >
      <h2>Symptoms</h2>
      <SymptomInputs
        noSymptoms={noSymptoms}
        setNoSymptoms={setNoSymptoms}
        currentSymptoms={currentSymptoms}
        setSymptoms={setSymptoms}
        symptomListConfig={symptomConfig}
        setOnsetDate={setOnsetDate}
        onsetDate={onsetDate}
      />

      <h2>Past Tests</h2>
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
      />

      <h2>Pregnancy</h2>
      <RadioGroup
        legend="Currently pregnant?"
        displayLegend
        name="pregnancy"
        type="radio"
        onChange={(evt) => setPregnancyResponse(evt.currentTarget.value)}
        buttons={getPregnancyResponses()}
        selectedRadio={pregnancyResponse}
      />
    </CMSDialog>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
