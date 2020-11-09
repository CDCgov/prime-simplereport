import React from "react";

import Button from "../commonComponents/Button";
import Breadcrumbs from "../commonComponents/Breadcrumbs";
import { PATIENT_TERM_PLURAL_CAP } from "../../config/constants";
import TextInput from "../commonComponents/TextInput";
import RadioGroup from "../commonComponents/RadioGroup";
import Checkboxes from "../commonComponents/Checkboxes";

const Fieldset = (props) => (
  <fieldset className="prime-fieldset">
    <legend>
      <h3>{props.legend}</h3>
    </legend>
    {props.children}
  </fieldset>
);

const EditPatient = (props) => {
  const onChange = (e) => {
    console.log("Change", e.target.name, e.target.value);
  };
  const patient = {
    /*TODO: sync up names and plumbing*/
  };
  return (
    <main className="prime-edit-patient prime-home">
      <Breadcrumbs
        crumbs={[
          { link: "../patients", text: PATIENT_TERM_PLURAL_CAP },
          { text: props.patientId },
        ]}
      />
      <Fieldset legend="General info">
        <div>
          <TextInput
            label="First Name"
            name="first_name"
            value={patient.first_name}
            onChange={onChange}
          />
          <TextInput
            label="Middle Name (optional)"
            name="middle_name"
            value={patient.middle_name}
            onChange={onChange}
          />
          <TextInput
            label="Last Name"
            name="last_name"
            value={patient.last_name}
            onChange={onChange}
          />
        </div>
        <div>
          <TextInput
            label="Unique ID"
            name="patientId"
            value={patient.patientId}
            onChange={onChange}
          />
          <RadioGroup
            horizontal
            legend="Type"
            displayLegend
            name="patientType"
            buttons={[
              { label: "Staff", value: "staff" },
              { label: "Resident", value: "resident" },
            ]}
            value={patient.patientType}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Contact Information">
        <div>
          <TextInput
            label="Phone"
            name="phone_number"
            value={patient.phone_number}
            onChange={onChange}
          />
          <TextInput
            label="Email"
            name="email_address"
            value={patient.email_address}
            onChange={onChange}
          />
        </div>
        <div>
          <TextInput
            label="Street address 1"
            name="street"
            value={patient.street}
            onChange={onChange}
          />
        </div>
        <div>
          <TextInput
            label="Street address 2"
            name="street2"
            value={patient.street2}
            onChange={onChange}
          />
        </div>
        <div>
          <TextInput
            label="City"
            name="city"
            value={patient.city}
            onChange={onChange}
          />
          <TextInput
            label="County"
            name="county"
            value={patient.county}
            onChange={onChange}
          />
          <TextInput
            label="State"
            name="state"
            value={patient.state}
            onChange={onChange}
          />
          <TextInput
            label="Zip"
            name="zip_code"
            value={patient.zip_code}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Demographics">
        <div>
          <Checkboxes
            legend="Race"
            displayLegend
            name="race"
            checkedValues={{}}
            checkboxes={[
              {
                value: "native",
                label: "American Indian or Alaskan Native",
              },
              {
                value: "asian",
                label: "Asian",
              },
              {
                value: "black",
                label: "Black or African American",
              },
              {
                value: "pacific",
                label: "Native Hawaiian or other Pacific Islander",
              },
              {
                value: "white",
                label: "White",
              },
              {
                value: "unknown",
                label: "Unknown",
              },
              {
                value: "refused",
                label: "Refused to Answer",
              },
            ]}
          />
        </div>
        <div>
          <RadioGroup
            legend="Ethnicity"
            displayLegend
            name="ethnicity"
            buttons={[
              { label: "Hispanic or Latino", value: "hispanic" },
              { label: "Not Hispanic", value: "not_hispanic" },
            ]}
            value={patient.ethnicity}
            onChange={onChange}
          />
        </div>
        <div>
          <RadioGroup
            legend="Biological Sex"
            displayLegend
            name="sex"
            buttons={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
            value={patient.sex}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Other">
        <div>
          <RadioGroup
            legend="Resident in congregate care/living setting?"
            displayLegend
            name="resident_congregate_setting"
            buttons={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            value={patient.resident_congregate_setting}
            onChange={onChange}
          />
        </div>
        <div>
          <RadioGroup
            legend="Work in Healthcare?"
            displayLegend
            name="employed_in_healthcare"
            buttons={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            value={patient.employed_in_healthcare}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Test History"></Fieldset>
    </main>
  );
};

export default EditPatient;
