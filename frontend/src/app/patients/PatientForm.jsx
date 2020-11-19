import React, { useState } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";

import {
  PATIENT_TERM_PLURAL_CAP,
  PATIENT_TERM_CAP,
  stateCodes,
} from "../../config/constants";
import Breadcrumbs from "../commonComponents/Breadcrumbs";
import TextInput from "../commonComponents/TextInput";
import RadioGroup from "../commonComponents/RadioGroup";
import Checkboxes from "../commonComponents/Checkboxes";
import { Prompt } from "react-router-dom";
import moment from "moment";
import Dropdown from "../commonComponents/Dropdown";
import { displayFullName } from "../utils";
import "./EditPatient.scss";


const ADD_PATIENT = gql`
mutation(
  $lookupId: String
  $firstName: String
  $middleName: String
  $lastName: String
  $birthDate: String
  $street: String
  $streetTwo: String
  $city: String
  $state: String
  $zipCode: String
  $phone: String
  $typeOfHealthcareProfessional: String
  $email: String
  $county: String
  $race: String
  $ethnicity: String
  $gender: String
  $residentCongregateSetting: Boolean
  $employedInHealthcare: Boolean
) {
  addPatient(
    lookupId: $lookupId
    firstName: $firstName
    middleName: $middleName
    lastName: $lastName
    birthDate: $birthDate
    street: $street
    streetTwo: $streetTwo
    city: $city
    state: $state
    zipCode: $zipCode
    phone: $phone
    typeOfHealthcareProfessional: $typeOfHealthcareProfessional
    email: $email
    county: $county
    race: $race
    ethnicity: $ethnicity
    gender: $gender
    residentCongregateSetting: $residentCongregateSetting
    employedInHealthcare: $employedInHealthcare
  )
}
`;

const UPDATE_PATIENT = gql`
mutation(
  $patientId: String
  $lookupId: String
  $firstName: String
  $middleName: String
  $lastName: String
  $birthDate: String
  $street: String
  $streetTwo: String
  $city: String
  $state: String
  $zipCode: String
  $phone: String
  $typeOfHealthcareProfessional: String
  $email: String
  $county: String
  $race: String
  $ethnicity: String
  $gender: String
  $residentCongregateSetting: Boolean
  $employedInHealthcare: Boolean
) {
  addPatient(
    patientId: $patientId
    lookupId: $lookupId
    firstName: $firstName
    middleName: $middleName
    lastName: $lastName
    birthDate: $birthDate
    street: $street
    streetTwo: $streetTwo
    city: $city
    state: $state
    zipCode: $zipCode
    phone: $phone
    typeOfHealthcareProfessional: $typeOfHealthcareProfessional
    email: $email
    county: $county
    race: $race
    ethnicity: $ethnicity
    gender: $gender
    residentCongregateSetting: $residentCongregateSetting
    employedInHealthcare: $employedInHealthcare
  )
}
`;

const Fieldset = (props) => (
  <fieldset className="prime-fieldset">
    <legend>
      <h3>{props.legend}</h3>
    </legend>
    {props.children}
  </fieldset>
);

const PatientForm = (props) => {
  const [addPatient] = useMutation(ADD_PATIENT);
  const [updatePatient] = useMutation(UPDATE_PATIENT);
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);

  const onChange = (e) => {
    let value = e.target.value;
    if (e.target.type === "checkbox") {
      value = {
        ...patient[e.target.name],
        [e.target.value]: e.target.checked,
      };
    }
    setFormChanged(true);
    setPatient({ ...patient, [e.target.name]: value });
  };
  console.log(props)
  const fullName = displayFullName(
    patient.firstName,
    patient.middleName,
    patient.lastName
  );

  const savePatientData = () => {
    setFormChanged(false);
    const variables = {
      lookupId: patient.lookupId,
      firstName: patient.firstName,
      middleName: patient.middleName,
      lastName: patient.lastName,
      birthDate: patient.birthDate,
      street: patient.street,
      streetTwo: patient.streetTwo,
      city: patient.city,
      state: patient.state,
      zipCode: patient.zipCode,
      phone: patient.phone,
      typeOfHealthcareProfessional: patient.patientType,
      email: patient.email_address,
      county: patient.county,
      race: patient.race,
      ethnicity: patient.ethnicity,
      gender: patient.sex,
      residentCongregateSetting: patient.resident_congregate_setting,
      employedInHealthcare: patient.employed_in_healthcare
    }
    if (props.patientId) {
      updatePatient({variables: {
        patientId: props.patientId,
        ...variables
      }}).then(
        () => console.log("success!!!"),
        (error) => console.error(error),
      );
    } else {
      addPatient({variables}).then(
        () => console.log("success!!!"),
        (error) => console.error(error),
      );
    }
  }
  //TODO: when to save initial data? What if name isn't filled? required fields?
  return (
    <main className="prime-edit-patient prime-home">
      <Prompt
        when={formChanged}
        message={(location) =>
          "\nYour changes are not yet saved!\n\nClick OK discard changes, Cancel to continue editing."
        }
      />
      <Breadcrumbs
        crumbs={[
          { link: "../patients", text: PATIENT_TERM_PLURAL_CAP },
          {
            text: !props.patientId ? `Create New ${PATIENT_TERM_CAP}` : fullName,
          },
        ]}
      />
      <div className="prime-edit-patient-heading">
        <h2>{!props.patientId ? `Create New ${PATIENT_TERM_CAP}` : fullName}</h2>
        <button
          className="usa-button prime-save-patient-changes"
          disabled={!formChanged}
          onClick={savePatientData}
        >
          Save Changes
        </button>
      </div>
      <Fieldset legend="General info">
        <div className="prime-form-line">
          <TextInput
            label="First Name"
            name="firstName"
            value={patient.firstName}
            onChange={onChange}
          />
          <TextInput
            label="Middle Name (optional)"
            name="middleName"
            value={patient.middleName}
            onChange={onChange}
          />
          <TextInput
            label="Last Name"
            name="lastName"
            value={patient.lastName}
            onChange={onChange}
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            label="Lookup ID"
            name="lookupId"
            value={patient.lookupId}
            onChange={onChange}
          />
          <Dropdown
            label="Role"
            name="patientType"
            selectedValue={patient.patientType}
            onChange={onChange}
            options={[
              { label: "Staff", value: "staff" },
              { label: "Resident", value: "resident" },
              { label: "Student", value: "student" },
              { label: "Visitor", value: "visitor" },
            ]}
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            label="Date of Birth"
            name="birthDate"
            value={patient.birthDate}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Contact Information">
        <div className="prime-form-line">
          <TextInput
            label="Phone Number"
            name="phone_number"
            value={patient.phone_number}
            addClass="prime-phone"
            onChange={onChange}
          />
          <TextInput
            label="Email Address"
            name="email_address"
            value={patient.email_address}
            addClass="prime-email"
            onChange={onChange}
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            label="Street address 1"
            name="street"
            value={patient.street}
            addClass="prime-street-address"
            onChange={onChange}
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            label="Street address 2"
            name="street2"
            value={patient.street2}
            addClass="prime-street-address"
            onChange={onChange}
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            label="City"
            name="city"
            value={patient.city}
            addClass="prime-city"
            onChange={onChange}
          />
          <TextInput
            label="County"
            name="county"
            value={patient.county}
            addClass="prime-county"
            onChange={onChange}
          />
          <Dropdown
            label="State"
            name="state"
            selectedValue={patient.state}
            options={stateCodes.map((c) => ({ label: c, value: c }))}
            addClass="prime-state"
            onChange={onChange}
          />
          <TextInput
            label="Zip"
            name="zip_code"
            value={patient.zip_code}
            addClass="prime-zip"
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
            checkedValues={patient.race}
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
            onChange={onChange}
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
            selectedRadio={patient.ethnicity}
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
            selectedRadio={patient.sex}
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
            selectedRadio={patient.resident_congregate_setting}
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
            selectedRadio={patient.employed_in_healthcare}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Test History">
        {patient.results && patient.results.length && (
          <table className="usa-table usa-table--borderless">
            <thead>
              <tr>
                <th scope="col">Date of Test</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {patient.results.map((r, i) => (
                <tr key={i}>
                  <td>{moment(r.dateTested).format("MMM DD YYYY")}</td>
                  <td>{r.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Fieldset>
      <div className="prime-edit-patient-heading">
        <div></div>
        <button
          className="usa-button prime-save-patient-changes"
          disabled={!formChanged}
          onClick={savePatientData}
        >
          Save Changes
        </button>
      </div>
    </main>
  );
};

export default PatientForm;
