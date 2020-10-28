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
// END things that should be service calls

// this should get styled to render horizontally
const YesNoRadio = ({ label, name }) => (
  <ChoiceList
    label={label}
    name={name}
    type="radio"
    choices={[
      { label: "Yes", value: "yes" },
      { label: "No", value: "no" },
    ]}
  />
);

const NoDefaultDropdown = ({
  label,
  name,
  options,
  placeholder = " - Select - ",
}) => {
  console.log("Options are", options);
  return (
    <Dropdown label={label} name={name} options={[]}>
      <option disabled selected> {/* TODO: deprecation warning on "selected" */}
        {placeholder}
      </option>
      {options.map((opt) => (
        <option value={opt.value}>{opt.label}</option>
      ))}
    </Dropdown>
  );
};

const buildAoEQuestionContent = (
  symptomListConfig = [],
  testTypeConfig = [],
) => {
  const symptomChoices = (
    <ChoiceList
      label="Are you experiencing any of the following symptoms?"
      name="symptoms"
      type="checkbox" // super irritating that this is required
      choices={symptomListConfig}
    />
  );
  return (
    <React.Fragment>
      <h2>Symptoms</h2>
      {symptomChoices}
      <DateField name="symptom_onset" label="Date of symptom onset" />

      <h2>Past Tests</h2>
      <YesNoRadio name="prior_test_flag" label="First test?" />
      <DateField
        name="prior_test_date"
        label="Date of most recent prior test?"
      />
      <NoDefaultDropdown
        label="Type of prior test"
        name="prior_test_type"
        options={testTypeConfig}
      />
      <NoDefaultDropdown
        label="Result of prior test"
        name="prior_test_result"
        options={[
          {value: "positive", label: "Positive"},
          {value: "negative", label: "Negative"},
          {value: "undetermined", label: "Undetermined"}
        ]}
      />
      <h2>Pregnancy</h2>
      {/* horizontal? */}
      <ChoiceList
        label="Pregnancy"
        name="pregnancy"
        type="radio"
        choices={[
          { label: "Yes", value: "77386006" },
          { label: "No", value: "60001007" },
          { label: "Would not state", value: "261665006" },
        ]}
      />
    </React.Fragment>
  );
};

const AoEModalForm = ({ isOpen, onClose, patient }) => {
  console.log("Test config function is", getTestTypes);
  console.log("Test list is", getTestTypes());
  if (isOpen) {
    const testConfig = getTestTypes();
    const symptomConfig = getSymptomList();
    return (
      <Dialog
        onExit={onClose}
        heading={displayFullName(
          patient.firstName,
          patient.middleName,
          patient.lastName
        )}
        getApplicationNode={()=>{document.getElementById("#root");}}
      >
        {buildAoEQuestionContent(symptomConfig, testConfig)}
      </Dialog>
    );
  }
  return null;
};

AoEModalForm.propTypes = {};

export default AoEModalForm;
