import React from "react";
import { displayFullName } from "../../utils";
import Modal from "react-modal";

import { useState } from "react";
import {
  getSymptomList,
  getTestTypes,
  getPregnancyResponses,
} from "./constants";
import Checkboxes from "../../commonComponents/Checkboxes";
import RadioGroup from "../../commonComponents/RadioGroup";
import Dropdown from "../../commonComponents/Dropdown";
import Button from "../../commonComponents/Button";
import { COVID_RESULTS, TEST_RESULT_DESCRIPTIONS } from "../../constants";
import TextInput from "../../commonComponents/TextInput";
import { testResultQuery } from "../../testResults/TestResultsList";
import { useQuery } from "@apollo/client";
import moment from "moment";
import "./AoEModalForm.scss";

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
}) => {
  const symptomChange = (e) => {
    setSymptoms({ ...currentSymptoms, [e.target.value]: e.target.checked });
  };

  return (
    <>
      <Checkboxes
        name="symptom_list"
        legend="Are you experiencing any of the following symptoms?"
        onChange={(e) => setNoSymptoms(e.target.checked)}
        boxes={[{ value: "no", label: "No Symptoms", checked: noSymptoms }]}
      />
      {!noSymptoms && (
        <>
          <hr />
          <Checkboxes
            legend="Symptoms"
            legendSrOnly
            name="symptom_list"
            onChange={symptomChange}
            boxes={symptomListConfig.map(({ label, value }) => ({
              label,
              value,
              checked: currentSymptoms[value],
            }))}
          />
          <TextInput
            type="date"
            label="Date of symptom onset"
            name="symptom_onset"
            value={onsetDate}
            onChange={(e) => setOnsetDate(e.target.value)}
            min="2020-02-01"
            max={new Date().toISOString().split("T")[0]}
          />
        </>
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
        <div className="usa-legend">
          <b>Was this your most recent COVID-19 test?</b>
        </div>
        <div className="usa-legend prime-previous-test-display">
          <div>
            <b>Date: </b>
            {moment(mostRecentTest.dateTested).format("LLLL")}
          </div>
          <div>
            <b>Type: </b> Antigen <b>Result: </b>
            {mostRecentTest.result}
          </div>
        </div>
      </>
    );
    return (
      <div className="sr-section">
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
      </div>
    );
  }

  return (
    <>
      <div className="usa-legend">
        <b>Is this your first COVID-19 test?</b>
      </div>
      <div className="usa-legend prime-previous-test-display">
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

const AoEModalForm = ({
  saveButtonText = "Save",
  onClose,
  patient,
  facilityId,
  loadState = {},
  saveCallback,
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
  };

  const buttonGroup = (
    <div className="sr-time-of-test-buttons" style={{ float: "right" }}>
      <Button variant="unstyled" label="Cancel" onClick={onClose} />
      <Button label={saveButtonText} onClick={saveAnswers} />
    </div>
  );

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          inset: "3em auto auto auto",
          overflow: "auto",
          maxHeight: "90vh",
          width: "50%",
          minWidth: "20em",
          marginRight: "50%",
          transform: "translate(50%, 0)",
        },
      }}
      overlayClassName="prime-modal-overlay"
      contentLabel="Time of Test Questions"
    >
      {buttonGroup}
      <h2>
        {displayFullName(
          patient.firstName,
          patient.middleName,
          patient.lastName
        )}
      </h2>
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

      <h2>Test History</h2>
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

      {patient.gender !== "male" && (
        <>
          <h2>Pregnancy</h2>
          <RadioGroup
            legend="Currently pregnant?"
            name="pregnancy"
            type="radio"
            onChange={(evt) => setPregnancyResponse(evt.currentTarget.value)}
            buttons={pregnancyResponses}
            selectedRadio={pregnancyResponse}
          />
        </>
      )}
      <div className="sr-time-of-test-footer">{buttonGroup}</div>
    </Modal>
  );
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
