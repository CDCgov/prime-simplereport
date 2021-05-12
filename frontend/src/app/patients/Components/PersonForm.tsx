import React, { useCallback, useState } from "react";
import { Prompt } from "react-router-dom";
import { toast } from "react-toastify";

import { languages, stateCodes } from "../../../config/constants";
import {
  RACE_VALUES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
  ROLE_VALUES,
  TRIBAL_AFFILIATION_VALUES,
} from "../../constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import { showError } from "../../utils";
import FormGroup from "../../commonComponents/FormGroup";
import {
  allPersonErrors,
  personSchema,
  PersonErrors,
  personUpdateSchema,
} from "../personSchema";
import YesNoRadioGroup from "../../commonComponents/YesNoRadioGroup";
import Input from "../../commonComponents/Input";
import Select from "../../commonComponents/Select";
import {
  getBestSuggestion,
  suggestionIsCloseEnough,
} from "../../utils/smartyStreets";
import { AddressConfirmationModal } from "../../commonComponents/AddressConfirmationModal";
import ComboBox from "../../commonComponents/ComboBox";

import FacilitySelect from "./FacilitySelect";

const boolToYesNoUnknown = (
  value: boolean | null | undefined
): YesNoUnknown | undefined => {
  if (value) {
    return "YES";
  }
  if (value === false) {
    return "NO";
  }
  if (value === null) {
    return "UNKNOWN";
  }
  return undefined;
};

const yesNoUnknownToBool = (
  value: YesNoUnknown
): boolean | null | undefined => {
  if (value === "YES") {
    return true;
  }
  if (value === "NO") {
    return false;
  }
  if (value === "UNKNOWN") {
    return null;
  }
  return undefined;
};

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
  isPatientView?: boolean;
}

const PersonForm = (props: Props) => {
  const [formChanged, setFormChanged] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  const [errors, setErrors] = useState<PersonErrors>({});
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressSuggestion, setAddressSuggestion] = useState<
    AddressWithMetaData | undefined
  >();
  const { isPatientView = false } = props;
  const schema = isPatientView ? personUpdateSchema : personSchema;

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
        await schema.validateAt(field, patient);
      } catch (e) {
        setErrors((existingErrors) => ({
          ...existingErrors,
          [field]: allPersonErrors[field],
        }));
      }
    },
    [patient, clearError, schema]
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

  const getAddress = (p: Nullable<PersonFormData>): AddressWithMetaData => {
    return {
      street: p.street || "",
      streetTwo: p.streetTwo,
      city: p.city,
      state: p.state || "",
      zipCode: p.zipCode || "",
      county: p.county || "",
    };
  };

  const validatePatientAddress = async () => {
    const originalAddress = getAddress(patient);
    const suggestedAddress = await getBestSuggestion(originalAddress);
    if (suggestionIsCloseEnough(originalAddress, suggestedAddress)) {
      onSave(suggestedAddress);
    } else {
      setAddressSuggestion(suggestedAddress);
      setAddressModalOpen(true);
    }
  };

  const validateForm = async () => {
    try {
      await schema.validate(patient, { abortEarly: false });
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
    if (
      JSON.stringify(getAddress(patient)) ===
      JSON.stringify(getAddress(props.patient))
    ) {
      onSave();
    } else {
      validatePatientAddress();
    }
  };
  const onSave = (address?: AddressWithMetaData) => {
    const person = address ? { ...patient, ...address } : patient;
    setPatient(person);
    setAddressModalOpen(false);
    setFormChanged(false);
    props.savePerson(person);
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
      {!isPatientView && (
        <div className="patient__header">
          {props.getHeader &&
            props.getHeader(patient, validateForm, formChanged)}
        </div>
      )}
      <FormGroup title="General information">
        <RequiredMessage />
        <div className="usa-form">
          <Input
            {...commonInputProps}
            label="First name"
            field="firstName"
            required={!isPatientView}
            disabled={isPatientView}
          />
          <Input
            {...commonInputProps}
            field="middleName"
            label="Middle name"
            disabled={isPatientView}
          />
          <Input
            {...commonInputProps}
            field="lastName"
            label="Last name"
            required={!isPatientView}
            disabled={isPatientView}
          />
        </div>
        <div className="usa-form">
          <Select
            label="Role"
            name="role"
            value={patient.role || ""}
            onChange={onPersonChange("role")}
            options={ROLE_VALUES}
            defaultSelect={true}
          />
          {patient.role === "STUDENT" && (
            <Input {...commonInputProps} field="lookupId" label="Student ID" />
          )}
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
          <div className="usa-form-group">
            <label className="usa-label" htmlFor="preferred-language">
              Preferred language
            </label>
            <ComboBox
              id="preferred-language-wrapper"
              defaultValue={patient.preferredLanguage || undefined}
              inputProps={{ id: "preferred-language" }}
              name="preferredLanguage"
              options={languages.map((language) => ({
                value: language,
                label: language,
              }))}
              onChange={(value) => {
                onPersonChange("preferredLanguage")(
                  (value as Language) || null
                );
              }}
            />
          </div>
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="birthDate"
            label="Date of birth (mm/dd/yyyy)"
            type="date"
            required={!isPatientView}
            disabled={isPatientView}
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
          This information is collected as part of public health efforts to
          recognize and address inequality in health outcomes.
        </p>
        <RadioGroup
          legend="Race"
          name="race"
          buttons={RACE_VALUES}
          selectedRadio={patient.race}
          onChange={onPersonChange("race")}
        />
        <div className="usa-form-group">
          <label className="usa-legend" htmlFor="tribal-affiliation">
            Tribal affiliation
          </label>
          <ComboBox
            id="tribal-affiliation"
            name="tribal-affiliation"
            options={TRIBAL_AFFILIATION_VALUES}
            onChange={
              onPersonChange("tribalAffiliation") as (value?: string) => void
            }
            defaultValue={String(patient.tribalAffiliation)}
          />
        </div>
        <RadioGroup
          legend="Are you Hispanic or Latino?"
          name="ethnicity"
          buttons={ETHNICITY_VALUES}
          selectedRadio={patient.ethnicity}
          onChange={onPersonChange("ethnicity")}
        />
        <RadioGroup
          legend="Biological sex"
          name="gender"
          buttons={GENDER_VALUES}
          selectedRadio={patient.gender}
          onChange={onPersonChange("gender")}
        />
      </FormGroup>
      <FormGroup title="Other">
        <YesNoRadioGroup
          legend="Are you a resident in a congregate living setting?"
          hintText="For example: nursing home, group home, prison, jail, or military"
          name="residentCongregateSetting"
          value={boolToYesNoUnknown(patient.residentCongregateSetting)}
          onChange={(v) =>
            onPersonChange("residentCongregateSetting")(yesNoUnknownToBool(v))
          }
          onBlur={() => {
            validateField("residentCongregateSetting");
          }}
          validationStatus={validationStatus("residentCongregateSetting")}
          errorMessage={errors.residentCongregateSetting}
          required
        />
        <YesNoRadioGroup
          legend="Are you a health care worker?"
          name="employedInHealthcare"
          value={boolToYesNoUnknown(patient.employedInHealthcare)}
          onChange={(v) =>
            onPersonChange("employedInHealthcare")(yesNoUnknownToBool(v))
          }
          onBlur={() => {
            validateField("employedInHealthcare");
          }}
          validationStatus={validationStatus("employedInHealthcare")}
          errorMessage={errors.employedInHealthcare}
          required
        />
      </FormGroup>
      {props.getFooter && props.getFooter(validateForm, formChanged)}
      <AddressConfirmationModal
        userEnteredAddress={getAddress(patient)}
        suggestedAddress={addressSuggestion}
        showModal={addressModalOpen}
        onConfirm={onSave}
        onClose={() => setAddressModalOpen(false)}
      />
    </>
  );
};

export default PersonForm;
