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
import { RACE_VALUES, ETHNICITY_VALUES, GENDER_VALUES } from "../constants";

import Breadcrumbs from "../commonComponents/Breadcrumbs";
import TextInput from "../commonComponents/TextInput";
import RadioGroup from "../commonComponents/RadioGroup";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Dropdown from "../commonComponents/Dropdown";
import { displayFullName, showError, showNotification } from "../utils";
import "./EditPatient.scss";
import Alert from "../commonComponents/Alert";
import FormGroup from "../commonComponents/FormGroup";
import Button from "../../app/commonComponents/Button";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";
import { setPatient as reduxSetPatient } from "../../app/store";

const ADD_PATIENT = gql`
  mutation AddPatient(
    $facilityId: String
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: LocalDate!
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
      facilityId: $facilityId
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
  mutation UpdatePatient(
    $facilityId: String
    $patientId: String!
    $firstName: String!
    $middleName: String
    $lastName: String!
    $birthDate: LocalDate!
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
      facilityId: $facilityId
      patientId: $patientId
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

const PXP_UPDATE_PATIENT = gql`
  mutation PatientLinkUpdatePatient(
    $internalId: String!
    $oldBirthDate: LocalDate!
    $lookupId: String
    $firstName: String!
    $middleName: String
    $lastName: String!
    $newBirthDate: LocalDate!
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
    patientLinkUpdatePatient(
      internalId: $internalId
      oldBirthDate: $oldBirthDate
      lookupId: $lookupId
      firstName: $firstName
      middleName: $middleName
      lastName: $lastName
      newBirthDate: $newBirthDate
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
    ) {
      internalId
      firstName
      middleName
      lastName
      birthDate
      street
      streetTwo
      city
      state
      zipCode
      telephone
      role
      email
      county
      race
      ethnicity
      gender
      residentCongregateSetting
      employedInHealthcare
    }
  }
`;

interface Props {
  activeFacilityId: string;
  patientId?: string;
  patient?: any; //TODO: TYPES
  isPxpView: boolean;
  backCallback?: () => void;
  saveCallback?: () => void;
}

const PatientForm = (props: Props) => {
  const appInsights = useAppInsightsContext();
  const trackAddPatient = useTrackEvent(appInsights, "Add Patient", {});
  const trackUpdatePatient = useTrackEvent(appInsights, "Update Patient", {});

  const dispatch = useDispatch();

  const [addPatient] = useMutation(ADD_PATIENT);
  const [updatePatient] = useMutation(UPDATE_PATIENT);
  const [pxpUpdatePatient] = useMutation(PXP_UPDATE_PATIENT);
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  const [submitted, setSubmitted] = useState(false);

  const plid = useSelector((state) => (state as any).plid as String);
  const patientInStore = useSelector((state) => (state as any).patient as any);

  const allFacilities = "~~ALL-FACILITIES~~";
  const [currentFacilityId, setCurrentFacilityId] = useState(
    patient.facility === null ? allFacilities : patient.facility?.id
  );
  const facilities = useSelector(
    (state) => (state as any).facilities as Facility[]
  );
  const facilityList = facilities.map((f: any) => ({
    label: f.name,
    value: f.id,
  }));
  facilityList.unshift({ label: "All facilities", value: allFacilities });
  facilityList.unshift({ label: "-Select-", value: "" });

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value: string | null = e.target.value;
    if (e.target.type === "checkbox") {
      value = {
        ...patient[e.target.name],
        [e.target.value]: (e.target as any).checked,
      };
    } else if (value === allFacilities) {
      value = null;
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
      facilityId:
        currentFacilityId === allFacilities ? null : currentFacilityId,
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
    if (props.isPxpView) {
      // TODO: not this
      const pxpVariables = Object.assign({}, variables);
      delete pxpVariables.facilityId;
      const newBirthDate = pxpVariables.birthDate;
      delete pxpVariables.birthDate;
      pxpUpdatePatient({
        variables: {
          internalId: plid,
          oldBirthDate: patientInStore.birthDate,
          newBirthDate,
          ...pxpVariables,
        },
      }).then(
        (res: any) => {
          showNotification(
            toast,
            <Alert
              type="success"
              title={`${PATIENT_TERM_CAP} Record Saved`}
              body="Information record has been updated."
            />
          );
          const updatedPatientFromApi = res.data.patientLinkUpdatePatient;
          const residentCongregateSetting = updatedPatientFromApi.residentCongregateSetting
            ? "YES"
            : "NO";
          const employedInHealthcare = updatedPatientFromApi.employedInHealthcare
            ? "YES"
            : "NO";

          dispatch(
            reduxSetPatient({
              ...updatedPatientFromApi,
              residentCongregateSetting,
              employedInHealthcare,
            })
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
    } else if (props.patientId) {
      trackUpdatePatient({});
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
      trackAddPatient({});
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
    if (!props.isPxpView) {
      return <Redirect to={`/patients/?facility=${props.activeFacilityId}`} />;
    } else {
      const patientInfoConfirmRedirect = () => {
        return (
          <Redirect
            push
            to={{
              pathname: "/patient-info-confirm",
            }}
          />
        );
      };
      props.saveCallback ? props.saveCallback() : patientInfoConfirmRedirect();
    }
  }
  //TODO: when to save initial data? What if name isn't filled? required fields?
  return (
    <main
      className={classnames(
        "prime-edit-patient prime-home",
        props.isPxpView && "padding-top-0"
      )}
    >
      <div
        className={classnames(
          !props.isPxpView && "grid-container margin-bottom-4"
        )}
      >
        <Prompt
          when={formChanged}
          message={(location) =>
            "\nYour changes are not yet saved!\n\nClick OK discard changes, Cancel to continue editing."
          }
        />
        {!props.isPxpView && (
          <>
            <Breadcrumbs
              crumbs={[
                {
                  link: `/patients/?facility=${props.activeFacilityId}`,
                  text: PATIENT_TERM_PLURAL_CAP,
                },
                {
                  link: "",
                  text: !props.patientId
                    ? `Add New ${PATIENT_TERM_CAP}`
                    : fullName,
                },
              ]}
            />
            <div className="prime-edit-patient-heading">
              <div>
                <h1>
                  {!props.patientId ? `Add New ${PATIENT_TERM_CAP}` : fullName}
                </h1>
              </div>
              <button
                className="usa-button prime-save-patient-changes"
                disabled={!formChanged}
                onClick={savePatientData}
              >
                Save changes
              </button>
            </div>
          </>
        )}
        <RequiredMessage />
        <FormGroup title="General info">
          <div className="usa-form">
            <TextInput
              label="First name"
              name="firstName"
              value={patient.firstName}
              onChange={onChange}
              required
            />
            <TextInput
              label="Middle name"
              name="middleName"
              value={patient.middleName}
              onChange={onChange}
            />
            <TextInput
              label="Last name"
              name="lastName"
              value={patient.lastName}
              onChange={onChange}
              required
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="Lookup ID"
              name="lookupId"
              value={patient.lookupId}
              onChange={onChange}
            />
            <Dropdown
              label="Role (optional)"
              name="role"
              selectedValue={patient.role}
              onChange={onChange}
              options={[
                { label: "-Select-", value: "" },
                { label: "Staff", value: "STAFF" },
                { label: "Resident", value: "RESIDENT" },
                { label: "Student", value: "STUDENT" },
                { label: "Visitor", value: "VISITOR" },
              ]}
            />
            {!props.isPxpView && (
              <Dropdown
                label="Facility"
                name="currentFacilityId"
                selectedValue={currentFacilityId}
                onChange={(e) => {
                  setCurrentFacilityId(e.target.value);
                  setFormChanged(true);
                }}
                options={facilityList}
                required
              />
            )}
          </div>
          <div className="usa-form">
            <TextInput
              type="date"
              label="Date of birth (mm/dd/yyyy)"
              name="birthDate"
              value={patient.birthDate}
              onChange={onChange}
              required
            />
          </div>
        </FormGroup>
        <FormGroup title="Contact information">
          <div className="usa-form">
            <div className="grid-row grid-gap">
              <div className="mobile-lg:grid-col-6">
                <TextInput
                  type="tel"
                  label="Phone number"
                  name="telephone"
                  value={patient.telephone}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
            <TextInput
              type="email"
              label="Email address"
              name="email"
              value={patient.email}
              onChange={onChange}
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="Street address 1"
              name="street"
              value={patient.street}
              onChange={onChange}
              required
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="Street address 2"
              name="streetTwo"
              value={patient.streetTwo}
              onChange={onChange}
            />
          </div>
          <div className="usa-form">
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
            <div className="grid-row grid-gap">
              <div className="mobile-lg:grid-col-6">
                <Dropdown
                  label="State"
                  name="state"
                  selectedValue={patient.state}
                  options={stateCodes.map((c) => ({ label: c, value: c }))}
                  defaultSelect
                  onChange={onChange}
                  required
                />
              </div>
              <div className="mobile-lg:grid-col-6">
                <TextInput
                  label="Zip code"
                  name="zipCode"
                  value={patient.zipCode}
                  onChange={onChange}
                  required
                />
              </div>
            </div>
          </div>
        </FormGroup>
        <FormGroup title="Demographics">
          <RadioGroup
            legend="Race"
            name="race"
            buttons={RACE_VALUES}
            selectedRadio={patient.race}
            onChange={onChange}
          />
          <RadioGroup
            legend="Ethnicity"
            name="ethnicity"
            buttons={ETHNICITY_VALUES}
            selectedRadio={patient.ethnicity}
            onChange={onChange}
          />
          <RadioGroup
            legend="Biological Sex"
            name="gender"
            buttons={GENDER_VALUES}
            selectedRadio={patient.gender}
            onChange={onChange}
          />
        </FormGroup>
        <FormGroup title="Other">
          <RadioGroup
            legend="Resident in congregate care/living setting?"
            name="residentCongregateSetting"
            buttons={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            selectedRadio={patient.residentCongregateSetting}
            onChange={onChange}
            required
          />
          <RadioGroup
            legend="Work in Healthcare?"
            name="employedInHealthcare"
            buttons={[
              { label: "Yes", value: "YES" },
              { label: "No", value: "NO" },
            ]}
            selectedRadio={patient.employedInHealthcare}
            onChange={onChange}
            required
          />
        </FormGroup>
        {!props.isPxpView && patient.testResults && (
          <FormGroup title="Test History">
            {patient.testResults.length !== 0 && (
              <table className="usa-table usa-table--borderless">
                <thead>
                  <tr>
                    <th scope="col">Date of Test</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.testResults.map((r: any, i: number) => (
                    <tr key={i}>
                      <td>{moment(r.dateTested).format("lll")}</td>
                      <td>{r.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </FormGroup>
        )}
        <div
          className={
            props.isPxpView
              ? "mobile-lg:display-flex flex-justify-end margin-top-2"
              : "prime-edit-patient-heading"
          }
        >
          <Button
            className={props.isPxpView ? "" : "prime-save-patient-changes"}
            disabled={!formChanged}
            onClick={savePatientData}
            label={props.isPxpView ? "Save and continue" : "Save changes"}
          />
          {props.isPxpView && (
            <Button
              className="margin-top-1 mobile-lg:margin-top-0 margin-right-0"
              variant="outline"
              label={"Back"}
              onClick={props.backCallback}
            />
          )}
        </div>
      </div>
    </main>
  );
};

export default PatientForm;
