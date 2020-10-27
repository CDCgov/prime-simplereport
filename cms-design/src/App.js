import React, { useState } from "react";
import "./App.css";
import {
  Button,
  ChoiceList,
  DateField,
  Dropdown,
  Dialog,
} from "@cmsgov/design-system";

import "@cmsgov/design-system/dist/css/index.css";
const askOnOrderEntry = () => {
  return (
    <React.Fragment>
      <h2>Symptoms</h2>
      <ChoiceList
        label="Are you experiencing any of the following symptoms?"
        name="symptoms"
        type="checkbox" // super irritating that this is required
        choices={[
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
        ]}
      />
      <DateField name="onset" label="Date of symptom onset" />
      <h2>Past Tests</h2>
      <ChoiceList
        label="First test?"
        name="prior_test_flag"
        type="radio"
        classname=""
        choices={[
          { label: "Yes", value: "yes" },
          { label: "No", value: "no" },
        ]}
      />
      <DateField
        name="prior_test_date"
        label="Date of most recent prior test?"
      />
      <Dropdown
        label="Type of prior test"
        name="prior_test_type"
        options={[
          { label: "PCR", value: "1" },
          { label: "Rapid", value: "2" },
          { label: "Home", value: "3" },
        ]}
      />
      <Dropdown
        label="Result of prior test"
        name="prior_test_result"
        options={[]}
      >
        <option value="" disabled="true" selected="true">
          - Select -
        </option>
        <option value="positive"> Positive</option>
        <option value="negative">Negative</option>
        <option value="undetermined">Weird</option>
      </Dropdown>

      <ChoiceList
        label="Pregnancy"
        name="prior_test_flag"
        type="radio"
        classname=""
        choices={[
          { label: "Yes", value: "77386006" },
          { label: "No", value: "60001007" },
          { label: "None of your damn business", value: "261665006" },
        ]}
      />
    </React.Fragment>
  );
};

const buildModal = (contentCallback, closeCallback) => {
  const saveButton = (
    <div style={{ float: "right" }}>
      <Button variation="transparent" onClick={closeCallback}>
        Cancel
      </Button>
      <Button variation="primary" onClick={closeCallback}>
        Add to Queue
      </Button>
    </div>
  );
  const dialogHeader = (
    <React.Fragment>
      Smith, John Quincy
      {saveButton}
    </React.Fragment>
  );
  return (
    <Dialog onExit={closeCallback} heading={dialogHeader} closeText={null}>
      {contentCallback()}
      {saveButton}
    </Dialog>
  );
};
function App() {
  const [isDialogActive, showDialog] = useState(false);
  const closeDialog = () => showDialog(false);
  return (
    <div id="design-app">
      <Button onClick={() => showDialog(true)} size="big" variation="success">
        Click to show modal
      </Button>
      {isDialogActive && buildModal(askOnOrderEntry, closeDialog)}
    </div>
  );
}

export default App;
