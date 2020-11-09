import React from "react";
import { displayFullName } from "../utils";
import { Button, ChoiceList, DateField, Dropdown } from "@cmsgov/design-system";
import CMSDialog from "../commonComponents/CMSDialog";

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
  { label: "Molecular", value: "1" },
  { label: "Antigen", value: "2" },
  { label: "Antibody/Serology", value: "3" },
  { label: "Unknown", value: "4" },
];
const getPregnancyResponses = () => [
  { label: "Yes", value: "77386006" },
  { label: "No", value: "60001007" },
  { label: "Would not state", value: "261665006" },
];
// END things that should be service calls

export const areAnswersComplete = (answerDict) => {
  if (!answerDict.noSymptomFlag) {
    let symptomFound = false;
    Object.values(answerDict.symptoms).forEach((val) => {
      if (val) {
        symptomFound = true;
      }
    });
    if (!symptomFound) {
      return false;
    }
    if (!answerDict.symptomOnset) {
      const onsetDate = answerDict.symptomOnsset;
      if (
        onsetDate.year === "" ||
        onsetDate.month === "" ||
        onsetDate.day === ""
      ) {
        return false;
      }
    }
  }
  const priorTest = answerDict.priorTest;
  if (!priorTest) {
    return false;
  } else if (!priorTest.exists) {
    // this field name is incorrect!
    if (
      priorTest.date.year === "" ||
      priorTest.date.month === "" ||
      priorTest.date.day === ""
    ) {
      return false;
    }
    if (!priorTest.type || !priorTest.result) {
      return false;
    }
  }
  if (!answerDict.pregnancy) {
    return false;
  }
  return true;
};

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
  maxAllowedDate,
  minAllowedDate,
  ...additionalProps
}) => {
  const [yearInvalid, setYearInvalid] = useState(false);
  const [monthInvalid, setMonthInvalid] = useState(false);
  const [dayInvalid, setDayInvalid] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const setAll = (isInvalid, message = "") => {
    setYearInvalid(isInvalid);
    setMonthInvalid(isInvalid);
    setDayInvalid(isInvalid);
    setErrorMessage(message);
  };

  const findTimestamp = (dateString) => {
    if (dateString === undefined) {
      return;
    }
    if (dateString === "now") {
      return Date.now(); // this has a time zone problem, of course...
    }
    return Date.parse(dateString);
  };
  const maxAllowedTimestamp = findTimestamp(maxAllowedDate);
  const minAllowedTimestamp = findTimestamp(minAllowedDate);

  const onComponentBlur = (evt) => {
    if (!managedDate.year && !managedDate.month && !managedDate.day) {
      setAll(false);
      return;
    }
    if (!managedDate.year || managedDate.year.length < 4) {
      setErrorMessage("Please enter a four-digit year");
      setYearInvalid(true);
      return;
    }
    const managedTimestamp = Date.parse(
      `${managedDate.year}-${managedDate.month}-${managedDate.day}`
    );
    if (isNaN(managedTimestamp)) {
      setAll(true, "Please enter a valid date");
    } else if (
      maxAllowedTimestamp !== undefined &&
      managedTimestamp > maxAllowedTimestamp
    ) {
      setAll(
        true,
        "Please enter a date in  " +
          (maxAllowedDate === "now" ? "the past" : "the allowed date range")
      );
    } else if (
      minAllowedTimestamp !== undefined &&
      managedTimestamp < minAllowedTimestamp
    ) {
      setAll(
        true,
        "Please enter a date in  " +
          (minAllowedDate === "now" ? "the future" : "the allowed date range")
      );
    } else {
      setAll(false);
    }
  };

  return (
    <DateField
      name={name}
      label={label}
      onChange={(_, newDate) => {
        setManagedDate(newDate);
      }}
      monthValue={managedDate.month}
      dayValue={managedDate.day}
      yearValue={managedDate.year}
      onComponentBlur={onComponentBlur}
      errorMessage={errorMessage}
      yearInvalid={yearInvalid}
      monthInvalid={monthInvalid}
      dayInvalid={dayInvalid}
      {...additionalProps}
    />
  );
};
const NoDefaultDropdown = ({
  label,
  name,
  options,
  value,
  onChange,
  stateSetter,
  placeholder = " - Select - ",
  ...additionalProps
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
      {...additionalProps}
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
  const wrappedSymptomChoiceList = new ChoiceList({
    name: "symptom_list",
    label: "__",
    onChange: symptomChange,
    type: "checkbox",
    choices: choiceList,
  });

  // this is the wrapper choice: if it is unchecked, we show the list
  // we generated above (and the date field); otherwise, nothing to see
  const symptomToggleChoice = {
    label: "No symptoms",
    value: "",
    checked: noSymptoms,
    uncheckedChildren: (
      <React.Fragment>
        <hr />
        {wrappedSymptomChoiceList.choices()}
        <ManagedDateField
          name="symptom_onset"
          label="Date of symptom onset"
          managedDate={onsetDate}
          setManagedDate={setOnsetDate}
          maxAllowedDate="now"
        />
      </React.Fragment>
    ),
  };
  return (
    <ChoiceList
      name="symptom_list"
      label="Are you experiencing any of the following symptoms?"
      type="checkbox" // super irritating that this is required
      choices={[symptomToggleChoice]}
      onChange={(evt) => setNoSymptoms(evt.currentTarget.checked)}
    />
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
  return (
    <React.Fragment>
      <YesNoRadio
        name="prior_test_flag"
        label="First test?"
        isYes={isFirstTest}
        setIsYes={setIsFirstTest}
      />
      <ManagedDateField
        name="prior_test_date"
        label="Date of most recent prior test?"
        managedDate={priorTestDate}
        setManagedDate={setPriorTestDate}
        disabled={disableDetails}
        maxAllowedDate="now"
        minAllowedDate="2020-02-01"
      />
      <NoDefaultDropdown
        label="Type of prior test"
        name="prior_test_type"
        value={priorTestType}
        stateSetter={setPriorTestType}
        options={testTypeConfig}
        disabled={disableDetails}
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
        disabled={disableDetails}
      />
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

  const [noSymptoms, setNoSymptoms] = useState(
    loadState.noSymptomFlag || false
  );
  const [currentSymptoms, setSymptoms] = useState(initialSymptoms);
  const [onsetDate, setOnsetDate] = useDateState(loadState.symptomOnset);

  const priorTestPreload = loadState.priorTest || {};
  const [isFirstTest, setIsFirstTest] = useState(priorTestPreload.exists);
  const [priorTestDate, setPriorTestDate] = useDateState(priorTestPreload.date);
  const [priorTestType, setPriorTestType] = useState(priorTestPreload.type);
  const [priorTestResult, setPriorTestResult] = useState(
    priorTestPreload.result
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
    const newState = {
      symptoms: saveSymptoms,
      noSymptomFlag: noSymptoms,
      symptomOnset: onsetDate,
      priorTest: {
        exists: isFirstTest,
        date: priorTestDate,
        type: priorTestType,
        result: priorTestResult,
      },
      pregnancy: pregnancyResponse,
    };
    saveCallback(newState);
  };

  const actionButtons = (
    <div style={{ float: "right" }}>
      <Button variation="transparent" onClick={onClose}>
        Cancel
      </Button>
      <Button variation="primary" onClick={saveAnswers}>
        {saveButtonText}
      </Button>
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
    </CMSDialog>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
