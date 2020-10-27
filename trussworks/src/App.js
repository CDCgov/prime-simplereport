import React, { useState } from "react";

import "uswds/dist/css/uswds.css";
import "@trussworks/react-uswds/lib/index.css";
import {
  Button,
  Dropdown,
  Label,
  Radio,
  Checkbox,
  Fieldset,
  DateInput,
  DateInputGroup,
} from "@trussworks/react-uswds";
import { Modal, connectModal } from "@trussworks/react-uswds";
// reimplemented this rather than figure out why it broke
// import { useModal } from "@trussworks/react-uswds";

const symptomList = [
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
const testTypes = [
  { label: "PCR", value: "1" },
  { label: "Rapid", value: "2" },
  { label: "Home", value: "3" },
];

const pregnancyAnswers = [
  { label: "Yes", value: "77386006" },
  { label: "No", value: "60001007" },
  { label: "None of your damn business", value: "261665006" },
];

const dialogContent = function () {
  const choices = symptomList.map((c) => (
    <Checkbox value={c.value} label={c.label} id={c.value} />
  ));
  return (
    <React.Fragment>
      <h2>Symptoms</h2>
      <Fieldset legend="Are you experiencing any of the following symptoms?">
        {choices}
      </Fieldset>
      <Fieldset legend="Date of symptom onset">
        <span className="usa-hint" id="dateOfBirthHint">
          For example: 4 28 1986
        </span>
        <DateInputGroup>
          <DateInput
            id="testDateInput"
            name="testName"
            label="Month"
            unit="month"
            maxLength={2}
            minLength={2}
          />
          <DateInput
            id="testDateInput"
            name="testName"
            label="Day"
            unit="day"
            maxLength={2}
            minLength={2}
          />
          <DateInput
            id="testDateInput"
            name="testName"
            label="Year"
            unit="year"
            maxLength={4}
            minLength={4}
          />
        </DateInputGroup>
      </Fieldset>

      <h2>Past tests</h2>
      <Fieldset legend="First test?">
        <Radio
          id="first-test-true"
          name="first-test-true"
          label="Yes"
          value="true"
        />
        <Radio
          id="first-test-false"
          name="first-test-false"
          label="No"
          value="false"
        />
      </Fieldset>
      <Fieldset legend="Date of most recent prior test?">
        <span className="usa-hint" id="dateOfBirthHint">
          For example: 4/28/2020
        </span>
        <DateInputGroup>
          <DateInput
            id="testDateInput"
            name="testName"
            label="Month"
            unit="month"
            maxLength={2}
            minLength={2}
          />
          <DateInput
            id="testDateInput"
            name="testName"
            label="Day"
            unit="day"
            maxLength={2}
            minLength={2}
          />
          <DateInput
            id="testDateInput"
            name="testName"
            label="Year"
            unit="year"
            maxLength={4}
            minLength={4}
          />
        </DateInputGroup>
      </Fieldset>
      <Label htmlFor="test-type">Type of prior test</Label>
      <Dropdown id="test-type" name="test-type">
        <option selected disabled>
          - Select -{" "}
        </option>
        {testTypes.map((tt) => (
          <option value={tt.value}>{tt.label}</option>
        ))}
      </Dropdown>
      <Label htmlFor="test-result">Result of prior test</Label>
      <Dropdown id="test-result" name="test-result">
        <option selected disabled>
          - Select -{" "}
        </option>
        <option value="value1">Positive</option>
        <option value="value2">Negative</option>
        <option value="value3">Eeek</option>
      </Dropdown>

      <h2>Pregnancy</h2>
      <Fieldset legend="Pregnant?">
        {pregnancyAnswers.map((row) => (
          <Radio
            id={"pregnant-" + row.value}
            name={"pregnant-" + row.value}
            value={row.value}
            label={row.label}
          />
        ))}
      </Fieldset>
    </React.Fragment>
  );
};

const buildModal = function (contentGenerator, callback) {
  return (
    <Modal
      style={{ "overflow-y": "scroll" }}
      title="Hill, Sam"
      actions={
        <React.Fragment>
          <Button onClick={callback} unstyled>
            Cancel
          </Button>
          <Button onClick={callback}>Add to queue</Button>
        </React.Fragment>
      }
    >
      {contentGenerator()}
    </Modal>
  );
};

function App() {
  const [isOpen, dialogToggle] = useState(false);
  const openModal = ()=>{dialogToggle(true);};
  const closeModal = ()=>{dialogToggle(false);};
  // this worked originally and then broke when I rebuilt from scratch. Not bothering with it now.
  // const { isOpen, openModal, closeModal } = useModal();
  const MyModal = () => buildModal(dialogContent, closeModal);
  const ConnectedModal = connectModal(MyModal);
  return (
    <div id="truss-app">
      <Button onClick={openModal} size="big" variation="success">
        Click to show modal
      </Button>
      <ConnectedModal isOpen={isOpen} onClose={closeModal} />
    </div>
  );
}

export default App;
