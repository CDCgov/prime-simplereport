import React, { useCallback, useState } from "react";
import { Prompt } from "react-router-dom";
import { toast } from "react-toastify";

import { stateCodes } from "../../../config/constants";
import {
  RACE_VALUES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
  ROLE_VALUES,
} from "../../constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import { showError } from "../../utils";
import "../EditPatient.scss";
import FormGroup from "../../commonComponents/FormGroup";
import { allPersonErrors, personSchema, PersonErrors } from "../personSchema";
import YesNoRadioGroup from "../../commonComponents/YesNoRadioGroup";
import Input from "../../commonComponents/Input";
import Select from "../../commonComponents/Select";

import FacilitySelect from "./FacilitySelect";

interface Props {
  patient: Nullable<PersonFormData>;
  patientId?: string;
  activeFacilityId: string;
  savePerson: (person: Nullable<PersonFormData>) => void;
  hideFacilitySelect?: boolean;
  getHeader?: (
    person: Nullable<PersonFormData>,
    onSave: () => void,
    formChanged: boolean
  ) => React.ReactNode;
  getFooter: (onSave: () => void, formChanged: boolean) => React.ReactNode;
}

const PersonForm = (props: Props) => {
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  const [errors, setErrors] = useState<PersonErrors>({});

  const clearError = useCallback(
    (field: keyof PersonErrors) => {
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    },
    [errors]
  );

  const validateField = useCallback(
    async (field: keyof PersonErrors) => {
      try {
        clearError(field);
        await personSchema.validateAt(field, patient);
      } catch (e) {
        setErrors((existingErrors) => ({
          ...existingErrors,
          [field]: allPersonErrors[field],
        }));
      }
    },
    [patient, clearError]
  );

  const onPersonChange = <K extends keyof PersonFormData>(field: K) => (
    value: PersonFormData[K]
  ) => {
    setFormChanged(true);
    setPatient({ ...patient, [field]: value });
  };

  /**
   * This function checks the current validation status of an input
   * It should be attached to a TextInput, Dropdown, or RadioInput via the validationStatus prop
   * @param {string} name - The name of the input to check.
   * @returns {string} "success" if valid, "error" if invalid
   */
  const validationStatus = (name: keyof PersonFormData) => {
    return errors[name] ? "error" : undefined;
  };

  const onSave = async () => {
    try {
      await personSchema.validate(patient, { abortEarly: false });
    } catch (e) {
      const newErrors: PersonErrors = e.inner.reduce(
        (
          acc: PersonErrors,
          el: { path: keyof PersonErrors; message: string }
        ) => {
          acc[el.path] = allPersonErrors[el.path];
          return acc;
        },
        {} as PersonErrors
      );
      setErrors(newErrors);
      let focusedOnError = false;

      Object.entries(newErrors).forEach(([name, error]) => {
        if (!error) {
          return;
        }
        if (!focusedOnError) {
          document.getElementsByName(name)[0].focus();
          focusedOnError = true;
        }
        showError(toast, "Please correct before submitting", error);
      });
      return;
    }
    // If no errors, submit
    setFormChanged(false);
    props.savePerson(patient);
  };

  const commonInputProps = {
    formObject: patient,
    onChange: onPersonChange,
    validate: validateField,
    getValidationStatus: validationStatus,
    errors: errors,
  };

  return (
    <>
      <Prompt
        when={formChanged}
        message={() =>
          "\nYour changes are not yet saved!\n\nClick OK discard changes, Cancel to continue editing."
        }
      />
      {props.getHeader && props.getHeader(patient, onSave, formChanged)}
      <RequiredMessage />
      <FormGroup title="General info">
        <div className="usa-form">
          <Input
            {...commonInputProps}
            label="First name"
            field="firstName"
            required
          />
          <Input {...commonInputProps} field="middleName" label="Middle name" />
          <Input
            {...commonInputProps}
            field="lastName"
            label="Last name"
            required
          />
        </div>
        <div className="usa-form">
          <Input {...commonInputProps} field="lookupId" label="Lookup ID" />
          <Select
            label="Role"
            name="role"
            value={patient.role || ""}
            onChange={onPersonChange("role")}
            options={ROLE_VALUES}
          />
          <FacilitySelect
            facilityId={patient.facilityId}
            onChange={onPersonChange("facilityId")}
            validateField={() => {
              validateField("facilityId");
            }}
            validationStatus={validationStatus}
            errors={errors}
            hidden={props.hideFacilitySelect}
          />
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="birthDate"
            label="Date of birth (mm/dd/yyyy)"
            type="date"
            required
          />
        </div>
      </FormGroup>
      <FormGroup title="Contact information">
        <div className="usa-form">
          <div className="grid-row grid-gap">
            <div className="mobile-lg:grid-col-6">
              <Input
                {...commonInputProps}
                field="telephone"
                label="Phone number"
                type="tel"
                required
              />
            </div>
          </div>
          <Input
            {...commonInputProps}
            field="email"
            label="Email address"
            type="email"
          />
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="street"
            label="Street address 1"
            required
          />
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="streetTwo"
            label="Street address 2"
          />
        </div>
        <div className="usa-form">
          <Input {...commonInputProps} field="city" label="City" />
          <Input {...commonInputProps} field="county" label="County" />
          <div className="grid-row grid-gap">
            <div className="mobile-lg:grid-col-6">
              <Select
                label="State"
                name="state"
                value={patient.state || ""}
                options={stateCodes.map((c) => ({ label: c, value: c }))}
                defaultSelect
                onChange={onPersonChange("state")}
                onBlur={() => {
                  validateField("state");
                }}
                validationStatus={validationStatus("state")}
                errorMessage={errors.state}
                required
              />
            </div>
            <div className="mobile-lg:grid-col-6">
              <Input
                {...commonInputProps}
                field="zipCode"
                label="Zip code"
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
          onChange={onPersonChange("race")}
        />
        <RadioGroup
          legend="Ethnicity"
          name="ethnicity"
          buttons={ETHNICITY_VALUES}
          selectedRadio={patient.ethnicity}
          onChange={onPersonChange("ethnicity")}
        />
        <RadioGroup
          legend="Biological Sex"
          name="gender"
          buttons={GENDER_VALUES}
          selectedRadio={patient.gender}
          onChange={onPersonChange("gender")}
        />
      </FormGroup>
      <FormGroup title="Other">
        <YesNoRadioGroup
          legend="Resident in congregate care/living setting?"
          name="residentCongregateSetting"
          value={patient.residentCongregateSetting}
          onChange={onPersonChange("residentCongregateSetting")}
          onBlur={() => {
            validateField("residentCongregateSetting");
          }}
          validationStatus={validationStatus("residentCongregateSetting")}
          errorMessage={errors.residentCongregateSetting}
          required
        />
        <YesNoRadioGroup
          legend="Work in Healthcare?"
          name="employedInHealthcare"
          value={patient.employedInHealthcare}
          onChange={onPersonChange("employedInHealthcare")}
          onBlur={() => {
            validateField("employedInHealthcare");
          }}
          validationStatus={validationStatus("employedInHealthcare")}
          errorMessage={errors.employedInHealthcare}
          required
        />
      </FormGroup>
      {props.getFooter && props.getFooter(onSave, formChanged)}
    </>
  );
};

export default PersonForm;
