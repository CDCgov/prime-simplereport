import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";
import moment from "moment";
import { Prompt } from "react-router-dom";
import { Redirect } from "react-router";

import {
  PATIENT_TERM_PLURAL_CAP,
  PATIENT_TERM_CAP,
  stateCodes,
} from "../../config/constants";
import Breadcrumbs from "../commonComponents/Breadcrumbs";
import TextInput from "../commonComponents/TextInput";
import RadioGroup from "../commonComponents/RadioGroup";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Dropdown from "../commonComponents/Dropdown";
import { displayFullName, showError, showNotification } from "../utils";
import "./EditPatient.scss";
import Alert from "../commonComponents/Alert";

const ADD_PATIENT = gql`
  mutation(
    $lookupId: String
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: String!
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $telephone: String!
    $role: String
    $email: String
    $county: String
    $race: String
    $ethnicity: String
    $gender: String
    $residentCongregateSetting: Boolean!
    $employedInHealthcare: Boolean!
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
      telephone: $telephone
      role: $role
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
    $patientId: String!
    $lookupId: String
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: String!
    $street: String!
    $streetTwo: String
    $city: String
    $state: String!
    $zipCode: String!
    $telephone: String!
    $role: String
    $email: String
    $county: String
    $race: String
    $ethnicity: String
    $gender: String
    $residentCongregateSetting: Boolean!
    $employedInHealthcare: Boolean!
  ) {
    updatePatient(
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
      telephone: $telephone
      role: $role
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
  const appInsights = useAppInsightsContext();
  const trackAddPatient = useTrackEvent(appInsights, "Add Patient");
  const trackUpdatePatient = useTrackEvent(appInsights, "Update Patient");

  const [addPatient] = useMutation(ADD_PATIENT);
  const [updatePatient] = useMutation(UPDATE_PATIENT);
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  const [submitted, setSubmitted] = useState(false);

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
      telephone: patient.telephone,
      role: patient.role,
      email: patient.email,
      county: patient.county,
      race: patient.race,
      ethnicity: patient.ethnicity,
      gender: patient.gender,
      residentCongregateSetting: patient.residentCongregateSetting === "YES",
      employedInHealthcare: patient.employedInHealthcare === "YES",
    };
    if (props.patientId) {
      trackUpdatePatient();
      updatePatient({
        variables: {
          patientId: props.patientId,
          ...variables,
        },
      }).then(
        () => {
          showNotification(
            toast,
            <Alert
              type="success"
              title={`${PATIENT_TERM_CAP} Record Saved`}
              body="Information record has been updated."
            />
          );
          setSubmitted(true);
        },
        (error) => {
          appInsights.trackException(error);
          showError(
            toast,
            `${PATIENT_TERM_CAP} Data Error`,
            "Please check for missing data or typos."
          );
        }
      );
    } else {
      trackAddPatient();
      addPatient({ variables }).then(
        () => {
          showNotification(
            toast,
            <Alert
              type="success"
              title={`${PATIENT_TERM_CAP} Record Created`}
              body="New information record has been created."
            />
          );
          setSubmitted(true);
        },
        (error) => {
          appInsights.trackException(error);
          showError(
            toast,
            `${PATIENT_TERM_CAP} Data Error`,
            "Please check for missing data or typos."
          );
        }
      );
    }
  };
  // after the submit was success, redirect back to the List page
  if (submitted) {
    return <Redirect to="/patients" />;
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
            text: !props.patientId
              ? `Create New ${PATIENT_TERM_CAP}`
              : fullName,
          },
        ]}
      />
      <div className="prime-edit-patient-heading">
        <div>
          <h2>
            {!props.patientId ? `Create New ${PATIENT_TERM_CAP}` : fullName}
          </h2>
          <RequiredMessage/>
        </div>
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
            required
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
            required
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
            name="role"
            selectedValue={patient.role}
            onChange={onChange}
            options={[
              { label: "Staff", value: "STAFF" },
              { label: "Resident", value: "RESIDENT" },
              { label: "Student", value: "STUDENT" },
              { label: "Visitor", value: "VISITOR" },
            ]}
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            type="date"
            label="Date of Birth (mm/dd/yyyy)"
            name="birthDate"
            value={patient.birthDate}
            onChange={onChange}
            required
          />
        </div>
      </Fieldset>
      <Fieldset legend="Contact Information">
        <div className="prime-form-line">
          <TextInput
            label="Phone Number"
            name="telephone"
            value={patient.telephone}
            addClass="prime-phone"
            onChange={onChange}
            required
          />
          <TextInput
            label="Email Address"
            name="email"
            value={patient.email}
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
            required
          />
        </div>
        <div className="prime-form-line">
          <TextInput
            label="Street address 2"
            name="streetTwo"
            value={patient.streetTwo}
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
            required
          />
          <TextInput
            label="Zip"
            name="zipCode"
            value={patient.zipCode}
            addClass="prime-zip"
            onChange={onChange}
            required
          />
        </div>
      </Fieldset>
      <Fieldset legend="Demographics">
        <div>
          <RadioGroup
            legend="Race"
            displayLegend
            name="race"
            buttons={[
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
            selectedRadio={patient.race}
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
            name="gender"
            buttons={[
              { label: "Male", value: "male" },
              { label: "Female", value: "female" },
              { label: "Other", value: "other" },
            ]}
            selectedRadio={patient.gender}
            onChange={onChange}
          />
        </div>
      </Fieldset>
      <Fieldset legend="Other">
        <div>
          <RadioGroup
            legend="Resident in congregate care/living setting?"
            displayLegend
            name="residentCongregateSetting"
            buttons={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            selectedRadio={patient.residentCongregateSetting}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <RadioGroup
            legend="Work in Healthcare?"
            displayLegend
            name="employedInHealthcare"
            buttons={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            selectedRadio={patient.employedInHealthcare}
            onChange={onChange}
            required
          />
        </div>
      </Fieldset>
      <Fieldset legend="Test History">
        {patient.testResults && patient.testResults.length && (
          <table className="usa-table usa-table--borderless">
            <thead>
              <tr>
                <th scope="col">Date of Test</th>
                <th scope="col">Result</th>
              </tr>
            </thead>
            <tbody>
              {patient.testResults.map((r, i) => (
                <tr key={i}>
                  <td>{moment(r.dateTested).format("lll")}</td>
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
