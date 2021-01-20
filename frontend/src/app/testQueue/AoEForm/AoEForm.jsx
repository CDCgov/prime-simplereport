import React from "react";
import { displayFullName } from "../../utils";
import { useState } from "react";
import {
  getSymptomList,
  getTestTypes,
  getPregnancyResponses,
} from "./constants";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../../constants";
import Checkboxes from "../../commonComponents/Checkboxes";
import RadioGroup from "../../commonComponents/RadioGroup";
import Dropdown from "../../commonComponents/Dropdown";
import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";
import FormGroup from "../../commonComponents/FormGroup";
import Optional from "../../commonComponents/Optional";
import { testResultQuery } from "../../testResults/TestResultsList";
import { useQuery } from "@apollo/client";
import moment from "moment";

// Get the value associate with a button label
// TODO: move to utility?
const findValueForLabel = (label, list) =>
  (list.filter((item) => item.label === label)[0] || {}).value;

// building blocks that *probably* don't want to be exportable components
const SymptomInputs = ({
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
  const symptomChange = (e) => {
    setSymptoms({ ...currentSymptoms, [e.target.value]: e.target.checked });
  };

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
          validationStatus={symptomError ? "error" : null}
        />
        {!noSymptoms && (
          <>
            <div className="border-top-1px border-base-lighter margin-top-2 margin-bottom-05"></div>
            <Checkboxes
              legend="What are your symptoms?"
              legendSrOnly
              name="symptom_list"
              onChange={symptomChange}
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
          validationStatus={symptomOnsetError ? "error" : null}
        />
      )}
    </>
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
  mostRecentTest,
}) => {
  const recentDate = (mostRecentTest?.dateTested || "").split("T")[0];
  const filledPriorTest =
    priorTestDate &&
    recentDate === priorTestDate &&
    mostRecentTest.result === priorTestResult;
  const [mostRecentTestAnswer, setMostRecentTestAnswer] = useState(
    !priorTestDate || isFirstTest === undefined
      ? undefined
      : filledPriorTest
      ? "yes"
      : "no"
  );
  const previousTestEntry = (
    <>
      <TextInput
        type="date"
        label="Date of Most Recent Test"
        name="prior_test_date"
        value={priorTestDate}
        onChange={(e) => setPriorTestDate(e.target.value)}
        max={new Date().toISOString().split("T")[0]}
        min="2020-02-01"
      />
      <Dropdown
        options={testTypeConfig}
        label="Type of Prior Test"
        name="prior_test_type"
        selectedValue={priorTestType}
        onChange={(e) => setPriorTestType(e.target.value)}
        defaultSelect
      />
      <Dropdown
        options={[
          {
            value: COVID_RESULTS.POSITIVE,
            label: TEST_RESULT_DESCRIPTIONS.POSITIVE,
          },
          {
            value: COVID_RESULTS.NEGATIVE,
            label: TEST_RESULT_DESCRIPTIONS.NEGATIVE,
          },
          {
            value: COVID_RESULTS.INCONCLUSIVE,
            label: TEST_RESULT_DESCRIPTIONS.UNDETERMINED,
          },
        ]}
        label="Result of Prior Test"
        name="prior_test_result"
        selectedValue={priorTestResult}
        defaultSelect
        onChange={(e) => setPriorTestResult(e.target.value)}
      />
    </>
  );

  // If mostRecentTest matches priorTest, offer to fill it
  if (mostRecentTest) {
    // Suggest a prior test
    // TODO: ARIA/508 compliance
    const legendIsh = (
      <>
        <div className="margin-top-2">
          <b>Was this your most recent COVID-19 test?</b>
          <Optional/>
        </div>
        <p className="prime-previous-test-display margin-top-2 margin-bottom-0 line-height-sans-5">
          <b>Date: </b>
          {moment(mostRecentTest.dateTested).format("LLLL")}<br />
          <b>Type: </b>
          Antigen<br />
          <b>Result: </b>
          {mostRecentTest.result}
        </p>
      </>
    );
    return (
      <>
        {legendIsh}
        <RadioGroup
          buttons={[
            { label: "Yes", value: "yes" },
            { label: "No", value: "no" },
          ]}
          selectedRadio={mostRecentTestAnswer}
          onChange={(e) => {
            setIsFirstTest(false);
            setMostRecentTestAnswer(e.target.value);
            if (e.target.value === "yes") {
              // Fill in last test info using this data
              // TODO: update when test history has test type
              setPriorTestType("2");
              setPriorTestDate((mostRecentTest.dateTested || "").split("T")[0]);
              setPriorTestResult(mostRecentTest?.result);
            } else {
              setPriorTestType(null);
              setPriorTestDate(null);
              setPriorTestResult(null);
            }
          }}
          legend="Was this your most recent COVID-19 test?"
          legendSrOnly
          name="most_recent_flag"
          variant="horizontal"
        />
        {mostRecentTestAnswer === "no" && previousTestEntry}
      </>
    );
  }

  return (
    <>
      <div className="usa-legend">
        Is this your first COVID-19 test?
        <Optional />
      </div>
      <div className="prime-previous-test-display margin-top-2">
        SimpleReport did not find any previous test data
      </div>

      <RadioGroup
        buttons={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
        selectedRadio={
          isFirstTest === true ? "yes" : isFirstTest === false ? "no" : ""
        }
        onChange={(e) => {
          setIsFirstTest(e.target.value === "yes");
        }}
        legend="Is this your first covid test?"
        legendSrOnly
        name="prior_test_flag"
        variant="horizontal"
      />
      {isFirstTest === false && previousTestEntry}
    </>
  );
};

const AoEForm = ({
  saveButtonText,
  onClose = {},
  patient,
  facilityId,
  loadState = {},
  saveCallback = {},
  isModal,
}) => {
  // this seems like it will do a bunch of wasted work on re-renders and non-renders,
  // but it's all small-ball stuff for now
  const testConfig = getTestTypes();
  const symptomConfig = getSymptomList();
  const initialSymptoms = {};
  if (loadState.symptoms) {
    const loadedSymptoms = JSON.parse(loadState.symptoms);

    symptomConfig.forEach((opt) => {
      const val = opt.value;
      if (typeof loadedSymptoms[val] === "string") {
        initialSymptoms[val] = loadedSymptoms[val] === "true";
      } else {
        initialSymptoms[val] = loadedSymptoms[val];
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

  // form validation
  const [symptomError, setSymptomError] = useState(null);
  const [symptomOnsetError, setSymptomOnsetError] = useState(null);


  const isValidForm = () => {
    const hasSymptoms = Object.keys(currentSymptoms).some((key) => currentSymptoms[key]);
    if (!noSymptoms && !hasSymptoms) {
      setSymptomError('Select your symptoms')
      setSymptomOnsetError(null)
      return false;
    }

    if (noSymptoms) {
      setSymptomError(null)
      setSymptomOnsetError(null)
      return true;
    }

    if (hasSymptoms && !onsetDate) {
      setSymptomError(null);
      setSymptomOnsetError("Enter the date of symptom onset");
      return false;
    }

    if (hasSymptoms && onsetDate) {
      setSymptomError(null);
      setSymptomOnsetError(null);
      return true;
    }
  };

  // TODO: only get most recent test from the backend
  const { data, loading, error } = useQuery(testResultQuery, {
    fetchPolicy: "no-cache",
    variables: { facilityId },
  });
  if (loading) return null;
  if (error) throw error;
  const mostRecentFirst = (a, b) => {
    const ma = moment(a.dateTested);
    const mb = moment(b.dateTested);
    if (ma && ma.isAfter(mb)) return -1;
    if (ma && ma.isBefore(mb)) return 1;
    return 0;
  };
  const mostRecentTest = data.testResults
    .filter((r) => r.patient.internalId === patient.internalId)
    .sort(mostRecentFirst)[0];

  // Auto-answer pregnancy question for males
  const pregnancyResponses = getPregnancyResponses();
  if (patient.gender === "male" && !pregnancyResponse) {
    setPregnancyResponse(findValueForLabel("No", pregnancyResponses));
  }

  const saveAnswers = (e) => {
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
      onClose();
    } else {
      e.preventDefault();
    }
  };

  const buttonGroup = (
    <div className="sr-time-of-test-buttons">
      {isModal && (
        <Button variant="unstyled" label="Cancel" onClick={onClose} />
      )}
      <Button label={saveButtonText} type={"submit"}/>
    </div>
  );

  return (
    <>
      <form onSubmit={(e) => { saveAnswers(e); }}>
        {isModal && (
          <>
            {buttonGroup}
            <h1 className="patient-name">
              {displayFullName(
                patient.firstName,
                patient.middleName,
                patient.lastName
              )}
            </h1>
          </>
        )}
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
        <div className="sr-time-of-test-footer">{buttonGroup}</div>
      </form>
    </>
  );
};

AoEForm.propTypes = {};

export default AoEForm;
