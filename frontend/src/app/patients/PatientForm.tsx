import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";
import moment from "moment";
import { Prompt, Redirect } from "react-router-dom";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import classnames from "classnames";

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
import { setPatient as reduxSetPatient } from "../../app/store";
import { PxpApi } from "../../patientApp/PxpApiService";
import iconClose from "../../../node_modules/uswds/dist/img/usa-icons/close.svg";

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
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState(
    {} as { [key: string]: string | undefined }
  );
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const plid = useSelector((state: any) => state.plid);
  const patientInStore = useSelector((state: any) => state.patient);

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
    let name: string | null = e.target.name;
    let value: string | null = e.target.value;
    if (e.target.type === "checkbox") {
      value = {
        ...patient[e.target.name],
        [e.target.value]: (e.target as any).checked,
      };
    } else if (value === allFacilities) {
      value = null;
    }
    if (errors[name]) {
      validateField(e);
    }
    setFormChanged(true);
    setPatient({ ...patient, [e.target.name]: value });
  };

  /**
   * This function runs validation checks on form inputs.
   * It can be attached to the onBlur prop of a TextInput, Dropdown, or RadioGroup
   * @param {(HTMLInputElement|HTMLSelectElement)} target - The input to validate.
   * @param {boolean} [setState=true] - Whether or not to update the state of the errors variable immediately. Defaults to true.
   * @returns {(string|undefined)} The resulting error message for the input after validation
   */
  const validateField = (
    { target }: { target: HTMLInputElement | HTMLSelectElement },
    setState = true
  ) => {
    // Get input name, value, and label
    const { name } = target;
    let value: string | null = target.value;
    let label = (target.labels as any)[0].firstChild.data;

    // For radio groups, value should indicate whether one radio is checked or not
    if (
      name === "residentCongregateSetting" ||
      name === "employedInHealthcare"
    ) {
      // Two parents above the input is div.usa-form-group, which contains both radio buttons
      const radioInputs = target?.parentElement?.parentElement?.getElementsByTagName(
        "input"
      );
      // If either is checked, return a value, if neither is checked, value is null
      value = [0, 1].map((i) => radioInputs?.item(i)?.checked).filter((v) => v)
        .length
        ? "true"
        : null;
      // The label for a RadioGroup comes from the text in fieldset.prime-radios legend
      label =
        target?.parentElement?.parentElement?.parentElement?.firstChild
          ?.firstChild?.textContent;
    }

    // Get validation relevant properties of the input, required and format
    const required: boolean =
      target.getAttribute("aria-required") === "true" ||
      target.getAttribute("data-required") === "true";
    const format: string | null = target.getAttribute("data-format");

    // Initialize error message
    let errorMessage = undefined;

    // Required validation check
    if ((!value || value === "- Select -") && required) {
      errorMessage = `${label} is required`;
      // Format validation check
    } else if (format) {
      const regex = new RegExp(format);
      if (value && !value.match(regex)) {
        const formatMessage: string | null = target.getAttribute(
          "data-format-message"
        );
        errorMessage = formatMessage || `${label} has an incorrect format`;
      }
    }

    // Only set errors state variable if setState is true
    // It should be false on form submit, since we are validating many fields at once
    if (setState) {
      setErrors({
        ...errors,
        [name]: errorMessage,
      });
    }

    return errorMessage;
  };

  /**
   * This function checks the current validation status of an input
   * It should be attached to a TextInput, Dropdown, or RadioInput via the validationStatus prop
   * @param {string} name - The name of the input to check.
   * @returns {string} "success" if valid, "error" if invalid
   */
  const validationStatus = (name: string) => {
    // If the input has never been validated before, initialize a key into the errors state variable
    if (!(name in errors)) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
      return "success";
    } else if (errors[name] === undefined) {
      return "success";
    } else {
      return "error";
    }
  };

  const fullName = displayFullName(
    patient.firstName,
    patient.middleName,
    patient.lastName
  );

  const savePatientData = () => {
    // Validate all fields with validation set up
    const fieldsToValidate = Object.keys(errors).map(
      (name) =>
        document.getElementsByName(name)[0] as
          | HTMLInputElement
          | HTMLSelectElement
    );
    const newErrors: { [key: string]: string | undefined } = {};
    fieldsToValidate.forEach(
      (field) =>
        (newErrors[field.name] = validateField({ target: field }, false))
    );
    const remainingErrors = Object.entries(newErrors).filter(
      ([name, error]) => error !== undefined
    );
    if (remainingErrors.length) {
      remainingErrors.reverse();
      const firstErrorName = remainingErrors[0][0];
      const firstErrorField = document.getElementsByName(firstErrorName)[0] as
        | HTMLInputElement
        | HTMLSelectElement;
      firstErrorField.focus();
      remainingErrors.forEach(([name, error]) =>
        showError(toast, "Please correct before submitting", error)
      );
      setErrors(newErrors);
      return;
    }
    // If no errors, submit
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
      // due to @JsonIgnores on Person to avoid duplicate recording, we have to
      // inline the address so that it can be deserialized outside the context
      // of GraphQL, which understands the flattened shape in its schema
      const {
        street,
        streetTwo,
        city,
        state,
        county,
        zipCode,
        ...withoutAddress
      } = variables;
      PxpApi.updatePatient(plid, patientInStore.birthDate, {
        ...withoutAddress,
        address: {
          street: [street, streetTwo],
          city,
          state,
          county,
          zipCode,
        },
      }).then((updatedPatientFromApi: any) => {
        showNotification(
          toast,
          <Alert
            type="success"
            title={`Your profile changes have been saved`}
          />
        );

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
      });
    } else if (props.patientId) {
      trackUpdatePatient({});
      updatePatient({
        variables: {
          patientId: props.patientId,
          ...variables,
        },
      }).then(() => {
        showNotification(
          toast,
          <Alert
            type="success"
            title={`${PATIENT_TERM_CAP} Record Saved`}
            body="Information record has been updated."
          />
        );
        setSubmitted(true);
      });
    } else {
      trackAddPatient({});
      addPatient({ variables }).then(() => {
        showNotification(
          toast,
          <Alert
            type="success"
            title={`${PATIENT_TERM_CAP} Record Created`}
            body="New information record has been created."
          />
        );
        setSubmitted(true);
      });
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
              onBlur={validateField}
              validationStatus={validationStatus("firstName")}
              errorMessage={errors.firstName}
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
              onBlur={validateField}
              validationStatus={validationStatus("lastName")}
              errorMessage={errors.lastName}
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
              label="Role"
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
                onBlur={validateField}
                validationStatus={validationStatus("currentFacilityId")}
                errorMessage={errors.currentFacilityId}
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
              onBlur={validateField}
              validationStatus={validationStatus("birthDate")}
              errorMessage={errors.birthDate}
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
                  onBlur={validateField}
                  validationStatus={validationStatus("telephone")}
                  errorMessage={errors.telephone}
                  format={
                    "^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$"
                  }
                  formatMessage={"Phone number should have 10 digits"}
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
              onBlur={validateField}
              validationStatus={validationStatus("email")}
              errorMessage={errors.email}
              format={
                '^(([^<>()[\\]\\.,;:\\s@\\"]+(\\.[^<>()[\\]\\.,;:\\s@\\"]+)*)|(\\".+\\"))@(([^<>()[\\]\\.,;:\\s@\\"]+\\.)+[^<>()[\\]\\.,;:\\s@\\"]{2,})$'
              }
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="Street address 1"
              name="street"
              value={patient.street}
              onChange={onChange}
              onBlur={validateField}
              validationStatus={validationStatus("street")}
              errorMessage={errors.street}
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
                  onBlur={validateField}
                  validationStatus={validationStatus("state")}
                  errorMessage={errors.state}
                  required
                />
              </div>
              <div className="mobile-lg:grid-col-6">
                <TextInput
                  label="Zip code"
                  name="zipCode"
                  value={patient.zipCode}
                  onChange={onChange}
                  onBlur={validateField}
                  validationStatus={validationStatus("zipCode")}
                  errorMessage={errors.zipCode}
                  format={"^\\d{5}(-\\d{4})?$"}
                  formatMessage={"Zip code should have 5 digits"}
                  required
                />
              </div>
            </div>
          </div>
        </FormGroup>
        <FormGroup title="Demographics">
          {props.isPxpView && (
            <Button
              className="usa-button--unstyled margin-top-1 margin-bottom-2 line-height-sans-2"
              onClick={() => setHelpModalOpen(true)}
              label="Why are we asking for this information?"
            />
          )}
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
            onBlur={validateField}
            validationStatus={validationStatus("residentCongregateSetting")}
            errorMessage={errors.residentCongregateSetting}
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
            onBlur={validateField}
            validationStatus={validationStatus("employedInHealthcare")}
            errorMessage={errors.employedInHealthcare}
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
            id="edit-patient-save-lower"
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
      <Modal
        portalClassName="modal--basic"
        isOpen={helpModalOpen}
        onRequestClose={() => setHelpModalOpen(false)}
        style={{
          content: {
            position: "initial",
          },
        }}
        overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      >
        <div className="modal__container">
          <button
            className="modal__close-button"
            style={{ cursor: "pointer" }}
            onClick={() => setHelpModalOpen(false)}
          >
            <img className="modal__close-img" src={iconClose} alt="Close" />
          </button>
          <div className="modal__content">
            <h3 className="modal__heading">
              Why are we asking for this information?
            </h3>
            <p>
              Collecting data on demographics is important for improving public
              health.
            </p>
            <p>
              We know that public health problems are disproportionately higher
              in some populations in the U.S., and this information can assist
              with public health efforts to recognize and mitigate disparities
              in health outcomes.
            </p>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default PatientForm;
