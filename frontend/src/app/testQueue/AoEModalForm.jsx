import React from "react";
import { displayFullName } from "../utils";
import {
  Button,
  ChoiceList,
  DateField,
  Dropdown,
  Dialog,
} from "@cmsgov/design-system";

import "@cmsgov/design-system/dist/css/index.css";
import { useState } from "react";

// BEGIN things that should be service calls
const globalSymptomDefinitions = [
  { value: "426000000", label: "Fever over 100.4F" },
  { value: "103001002", label: "Feeling feverish" },
  { value: "43724002", label: "Chills" },
  { value: "49727002", label: "Cough" },
  { value: "267036007", label: "Shortness of breath" },
  { value: "230145002", label: "Difficulty breathing" },
  { value: "84229001", label: "Fatigue" },
  { value: "68962001", label: "Muscle or body aches" },
  { value: "25064002", label: "Headache" },
  { value: "36955009", label: "New loss of taste" },
  { value: "44169009", label: "New loss of smell" },
  { value: "162397003", label: "Sore throat" },
  { value: "68235000", label: "Nasal congestion" },
  { value: "64531003", label: "Runny nose" },
  { value: "422587007", label: "Nausea" },
  { value: "422400008", label: "Vomiting" },
  { value: "62315008", label: "Diarrhea" },
];

const getSymptomList = () => globalSymptomDefinitions;
const getTestTypes = () => [
  { label: "PCR", value: "1" },
  { label: "Rapid", value: "2" },
  { label: "Home", value: "3" },
];
const getPregnancyResponses = () => [
  { label: "Yes", value: "77386006" },
  { label: "No", value: "60001007" },
  { label: "Would not state", value: "261665006" },
];
// END things that should be service calls

// this should get styled to render horizontally
const YesNoRadio = ({ label, name, isYes, setIsYes }) => {
  return (
    <ChoiceList
      label={label}
      name={name}
      type="radio"
      onChange={(evt) => setIsYes(evt.currentTarget.value === "yes")}
      choices={[
        { label: "Yes", value: "yes", checked: isYes === true },
        { label: "No", value: "no", checked: isYes === false },
      ]}
    />
  );
};

const ManagedDateField = ({
  name,
  label,
  managedDate = { month: "", day: "", year: "" },
  setManagedDate,
}) => (
  <DateField
    name={name}
    label={label}
    onChange={(_, newDate) => {
      setManagedDate(newDate);
    }}
    monthValue={managedDate.month}
    dayValue={managedDate.day}
    yearValue={managedDate.year}
  />
);
const NoDefaultDropdown = ({
  label,
  name,
  options,
  value,
  onChange,
  stateSetter,
  placeholder = " - Select - ",
}) => {
  const defaultValue = value === undefined ? "" : undefined;
  if (stateSetter !== undefined && onChange !== undefined) {
    throw new Error("Cannot have both stateSetter and onChange defined");
  }
  const changeHandler =
    stateSetter === undefined
      ? onChange
      : (evt) => stateSetter(evt.currentTarget.value);
  return (
    <Dropdown
      label={label}
      name={name}
      options={[]}
      defaultValue={defaultValue}
      value={value}
      onChange={changeHandler}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((opt) => (
        <option value={opt.value} key={opt.value}>
          {opt.label}
        </option>
      ))}
    </Dropdown>
  );
};

// building block functions that *probably* don't want to be exportable components
const SymptomInputs = ({
  symptomListConfig,
  currentSymptoms,
  setSymptoms,
  onsetDate,
  setOnsetDate,
}) => {
  const symptomChange = (evt) => {
    const choice = evt.currentTarget;
    const newSymptoms = { ...currentSymptoms };
    newSymptoms[choice.value] = choice.checked;
    setSymptoms(newSymptoms);
  };
  const choiceList = symptomListConfig.map((conf) => {
    const { label, value } = conf;
    return { label, value, checked: currentSymptoms[value] };
  });
  return (
    <React.Fragment>
      <ChoiceList
        onChange={symptomChange}
        label="Are you experiencing any of the following symptoms?"
        name="symptoms"
        type="checkbox" // super irritating that this is required
        choices={choiceList}
      />
      <ManagedDateField
        name="symptom_onset"
        label="Date of symptom onset"
        managedDate={onsetDate}
        setManagedDate={setOnsetDate}
      />
    </React.Fragment>
  );
};

const PriorTestInputs = ({
  testTypeConfig,
  hasPriorTest,
  setHasPriorTest,
  priorTestDate,
  setPriorTestDate,
  priorTestResult,
  setPriorTestResult,
  priorTestType,
  setPriorTestType,
}) => {
  return (
    <React.Fragment>
      <YesNoRadio
        name="prior_test_flag"
        label="First test?"
        isYes={hasPriorTest}
        setIsYes={setHasPriorTest}
      />
      <ManagedDateField
        name="prior_test_date"
        label="Date of most recent prior test?"
        managedDate={priorTestDate}
        setManagedDate={setPriorTestDate}
      />
      <NoDefaultDropdown
        label="Type of prior test"
        name="prior_test_type"
        value={priorTestType}
        stateSetter={setPriorTestType}
        options={testTypeConfig}
      />
      <NoDefaultDropdown
        label="Result of prior test"
        name="prior_test_result"
        value={priorTestResult}
        stateSetter={setPriorTestResult}
        options={[
          { value: "positive", label: "Positive" },
          { value: "negative", label: "Negative" },
          { value: "undetermined", label: "Undetermined" },
        ]}
      />
    </React.Fragment>
  );
};

const AoEModalForm = ({
  isOpen,
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
    symptomConfig.forEach((opt) => {
      const val = opt.value;
      initialSymptoms[val] = loadState.symptoms[val];
    });
  } else {
    symptomConfig.forEach((opt) => {
      const val = opt.value;
      initialSymptoms[val] = false;
    });
  }
  const useDateState = (preLoaded) =>
    useState(preLoaded || { month: "", day: "", year: "" });

  const [currentSymptoms, setSymptoms] = useState(initialSymptoms);
  const [onsetDate, setOnsetDate] = useDateState(loadState.symptomOnset);

  const priorTestPreload = loadState.priorTest || {};
  const [hasPriorTest, setHasPriorTest] = useState(priorTestPreload.exists);
  const [priorTestDate, setPriorTestDate] = useDateState(priorTestPreload.date);
  const [priorTestType, setPriorTestType] = useState(priorTestPreload.type);
  const [priorTestResult, setPriorTestResult] = useState(priorTestPreload.result);

  const [pregnancyResponse, setPregnancyResponse] = useState(loadState.pregnancy);

  const saveAnswers = () => {
    const newState = {
      symptoms: currentSymptoms,
      symptomOnset: onsetDate,
      priorTest: {
        exists: hasPriorTest,
        date: priorTestDate,
        type: priorTestType,
        result: priorTestResult
      },
      pregnancy: pregnancyResponse
    };
    saveCallback(newState);
    onClose();
  };

  if (isOpen) {
    const actionButtons = (
      <div style={{ float: "right" }}>
        <Button variation="transparent" onClick={onClose}>
          Cancel
        </Button>
        <Button variation="primary" onClick={saveAnswers}>
          Add to Queue
        </Button>
      </div>
    );

    return (
      <Dialog
        onExit={onClose}
        closeText="Cancel"
        heading={displayFullName(
          patient.firstName,
          patient.middleName,
          patient.lastName
        )}
        getApplicationNode={() => {
          document.getElementById("#root");
        }}
      >
        <h2>Symptoms</h2>
        <SymptomInputs
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
          hasPriorTest={hasPriorTest}
          setHasPriorTest={setHasPriorTest}
          priorTestType={priorTestType}
          setPriorTestType={setPriorTestType}
          priorTestResult={priorTestResult}
          setPriorTestResult={setPriorTestResult}
        />

        <h2>Pregancy</h2>
        {/* horizontal? */}
        <ChoiceList
          label="Pregnancy"
          name="pregnancy"
          type="radio"
          onChange={(evt) => setPregnancyResponse(evt.currentTarget.value)}
          choices={getPregnancyResponses().map((opt) => ({
            ...opt,
            checked: opt.value === pregnancyResponse,
          }))}
        />
        {actionButtons}
      </Dialog>
    );
  }
  return null;
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
