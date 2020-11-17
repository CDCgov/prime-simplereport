import React from "react";
import { displayFullName } from "../../utils";
import { DateField } from "@cmsgov/design-system";
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
import {dateToString} from "../dteUtils";

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
      <ManagedDateField
        name="symptom_onset"
        label="Date of symptom onset"
        managedDate={onsetDate}
        setManagedDate={setOnsetDate}
        maxAllowedDate="now"
      />
    </React.Fragment>
  );

  return (
    <React.Fragment>
      <RadioGroup
        type="checkbox"
        name="symptom_list"
        label="Are you experiencing any of the following symptoms?"
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
        label="Is this the first test?"
        legend="First covid test?"
        name="prior_test_flag"
        horizontal
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
          { value: "positive", label: "Positive" },
          { value: "negative", label: "Negative" },
          { value: "undetermined", label: "Undetermined" },
        ]}
        label="Result of prior test"
        name="prior_test_result"
        selectedValue={priorTestResult}
        onChange={(e) => setPriorTestResult(e.target.value)}
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
    // symptomConfig.forEach((opt) => {
    //   const val = opt.value;
    //   initialSymptoms[val] = false;
    // });
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
    const priorTest = isFirstTest ? {
      firstTest: true,
      priorTestDate: null,
      priorTestType: null,
      priorTestResult: null,
    } : {
      firstTest: false,
      priorTestDate: dateToString(priorTestDate),
      priorTestType: priorTestType,
      priorTestResult: priorTestResult,
    };


    const newState = {
      symptoms: JSON.stringify(saveSymptoms),
      symptomOnset: dateToString(onsetDate),
      ...priorTest,
      pregnancy: pregnancyResponse,
    };
    saveCallback(newState);
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
        label="Pregnancy"
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
