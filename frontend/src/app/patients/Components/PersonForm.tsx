import React, { useState } from "react";
import { Prompt } from "react-router-dom";
import { useSelector } from "react-redux";
import classnames from "classnames";
import { toast } from "react-toastify";

import {
  PATIENT_TERM_PLURAL_CAP,
  PATIENT_TERM_CAP,
  stateCodes,
} from "../../../config/constants";
import {
  RACE_VALUES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
  YES_NO_VALUES,
} from "../../constants";
import Breadcrumbs from "../../commonComponents/Breadcrumbs";
import TextInput from "../../commonComponents/TextInput";
import RadioGroup from "../../commonComponents/RadioGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import Dropdown from "../../commonComponents/Dropdown";
import { displayFullName, showError } from "../../utils";
import "../EditPatient.scss";
import FormGroup from "../../commonComponents/FormGroup";
import Button from "../../commonComponents/Button";

interface Props {
  patient: Person;
  patientId?: string;
  activeFacilityId: string;
  savePerson: (person: Person, facility: string | null) => void;
  backCallback?: () => void;
  isPxpView: boolean;
}

const PersonForm = (props: Props) => {
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  const [errors, setErrors] = useState(
    {} as { [key: string]: string | undefined }
  );
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
        ...(patient as any)[e.target.name],
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

  const onRaceChange = (race: Race) => {
    setFormChanged(true);
    setPatient({ ...patient, race });
  };

  const onEthnicityChange = (ethnicity: Ethnicity) => {
    setFormChanged(true);
    setPatient({ ...patient, ethnicity });
  };

  const onGenderChange = (gender: Gender) => {
    setFormChanged(true);
    setPatient({ ...patient, gender });
  };

  const onResidentCongregateSettingChange = (
    residentCongregateSetting: YesNo
  ) => {
    setFormChanged(true);
    setPatient({ ...patient, residentCongregateSetting });
  };

  const onEmployedInHealthcareChange = (employedInHealthcare: YesNo) => {
    setFormChanged(true);
    setPatient({ ...patient, employedInHealthcare });
  };

  const onSave = () => {
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
    props.savePerson(
      patient,
      currentFacilityId === allFacilities ? null : currentFacilityId
    );
  };

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
          message={() =>
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
                onClick={onSave}
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
              value={patient.streetTwo || ""}
              onChange={onChange}
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="City"
              name="city"
              value={patient.city || ""}
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
          <p className="usa-hint maxw-prose">
            This information is important for public health efforts to recognize
            and address inequality in health outcomes.
          </p>
          <RadioGroup
            legend="Race"
            name="race"
            buttons={RACE_VALUES}
            selectedRadio={patient.race}
            onChange={onRaceChange}
          />
          <RadioGroup
            legend="Ethnicity"
            name="ethnicity"
            buttons={ETHNICITY_VALUES}
            selectedRadio={patient.ethnicity}
            onChange={onEthnicityChange}
          />
          <RadioGroup
            legend="Biological Sex"
            name="gender"
            buttons={GENDER_VALUES}
            selectedRadio={patient.gender}
            onChange={onGenderChange}
          />
        </FormGroup>
        <FormGroup title="Other">
          <RadioGroup
            legend="Resident in congregate care/living setting?"
            name="residentCongregateSetting"
            buttons={YES_NO_VALUES}
            selectedRadio={patient.residentCongregateSetting}
            onChange={onResidentCongregateSettingChange}
            onBlur={validateField}
            validationStatus={validationStatus("residentCongregateSetting")}
            errorMessage={errors.residentCongregateSetting}
            required
          />
          <RadioGroup
            legend="Work in Healthcare?"
            name="employedInHealthcare"
            buttons={YES_NO_VALUES}
            selectedRadio={patient.employedInHealthcare}
            onChange={onEmployedInHealthcareChange}
            onBlur={validateField}
            validationStatus={validationStatus("employedInHealthcare")}
            errorMessage={errors.employedInHealthcare}
            required
          />
        </FormGroup>
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
            onClick={onSave}
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

export default PersonForm;
