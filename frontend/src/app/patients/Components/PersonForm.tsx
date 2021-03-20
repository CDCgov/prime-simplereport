import React, { useCallback, useState } from "react";
import { Prompt } from "react-router-dom";
import classnames from "classnames";
import { toast } from "react-toastify";

import {
  PATIENT_TERM_PLURAL_CAP,
  PATIENT_TERM_CAP,
  stateCodes,
} from "../../../config/constants";
import { RACE_VALUES, ETHNICITY_VALUES, GENDER_VALUES } from "../../constants";
import Breadcrumbs from "../../commonComponents/Breadcrumbs";
import TextInput from "../../commonComponents/TextInput";
import RadioGroup from "../../commonComponents/RadioGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import Dropdown from "../../commonComponents/Dropdown";
import { displayFullName, showError } from "../../utils";
import "../EditPatient.scss";
import FormGroup from "../../commonComponents/FormGroup";
import Button from "../../commonComponents/Button";
import { allPersonErrors, personSchema, PersonErrors } from "../personSchema";
import YesNoRadioGroup from "../../commonComponents/YesNoRadioGroup";

import FacilitySelect from "./FacilitySelect";

interface Props {
  patient: Nullable<PersonFormData>;
  patientId?: string;
  activeFacilityId: string;
  savePerson: (person: Nullable<PersonFormData>) => void;
  backCallback?: () => void;
  isPxpView: boolean;
  hideFacilitySelect?: boolean;
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
        setErrors((errors) => ({
          ...errors,
          [field]: allPersonErrors[field],
        }));
      }
    },
    [patient, clearError]
  );

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let value: string | null = e.target.value;
    if (e.target.type === "checkbox") {
      value = {
        ...(patient as any)[e.target.name],
        [e.target.value]: (e.target as any).checked,
      };
    }
    setFormChanged(true);
    setPatient({ ...patient, [e.target.name]: value });
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
    residentCongregateSetting: boolean
  ) => {
    setFormChanged(true);
    setPatient({ ...patient, residentCongregateSetting });
  };

  const onEmployedInHealthcareChange = (employedInHealthcare: boolean) => {
    setFormChanged(true);
    setPatient({ ...patient, employedInHealthcare });
  };

  const onFacilityChange = (facilityId: string | null) => {
    setFormChanged(true);
    setPatient({ ...patient, facilityId });
  };

  const onSave = async () => {
    try {
      await personSchema.validate(patient, { abortEarly: false });
    } catch (e) {
      const errors: PersonErrors = e.inner.reduce(
        (
          acc: PersonErrors,
          el: { path: keyof PersonErrors; message: string }
        ) => {
          acc[el.path] = allPersonErrors[el.path];
          return acc;
        },
        {} as PersonErrors
      );
      setErrors(errors);
      let focusedOnError = false;

      Object.entries(errors).forEach(([name, error]) => {
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
              value={patient.firstName || ""}
              onChange={onChange}
              onBlur={() => {
                validateField("firstName");
              }}
              validationStatus={validationStatus("firstName")}
              errorMessage={errors.firstName}
              required
            />
            <TextInput
              label="Middle name"
              name="middleName"
              value={patient.middleName || ""}
              onChange={onChange}
            />
            <TextInput
              label="Last name"
              name="lastName"
              value={patient.lastName || ""}
              onChange={onChange}
              onBlur={() => {
                validateField("lastName");
              }}
              validationStatus={validationStatus("lastName")}
              errorMessage={errors.lastName}
              required
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="Lookup ID"
              name="lookupId"
              value={patient.lookupId || ""}
              onChange={onChange}
            />
            <Dropdown
              label="Role"
              name="role"
              selectedValue={patient.role || ""}
              onChange={onChange}
              options={[
                { label: "-Select-", value: "" },
                { label: "Staff", value: "STAFF" },
                { label: "Resident", value: "RESIDENT" },
                { label: "Student", value: "STUDENT" },
                { label: "Visitor", value: "VISITOR" },
              ]}
            />
            <FacilitySelect
              facilityId={patient.facilityId}
              onChange={onFacilityChange}
              validateField={() => {
                validateField("facilityId");
              }}
              validationStatus={validationStatus}
              errors={errors}
              hidden={props.hideFacilitySelect}
            />
          </div>
          <div className="usa-form">
            <TextInput
              type="date"
              label="Date of birth (mm/dd/yyyy)"
              name="birthDate"
              value={patient.birthDate || ""}
              onChange={onChange}
              onBlur={() => {
                validateField("birthDate");
              }}
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
                  value={patient.telephone || ""}
                  onChange={onChange}
                  onBlur={() => {
                    validateField("telephone");
                  }}
                  validationStatus={validationStatus("telephone")}
                  errorMessage={errors.telephone}
                  required
                />
              </div>
            </div>
            <TextInput
              type="email"
              label="Email address"
              name="email"
              value={patient.email || ""}
              onChange={onChange}
              onBlur={() => {
                validateField("email");
              }}
              validationStatus={validationStatus("email")}
              errorMessage={errors.email}
            />
          </div>
          <div className="usa-form">
            <TextInput
              label="Street address 1"
              name="street"
              value={patient.street || ""}
              onChange={onChange}
              onBlur={() => {
                validateField("street");
              }}
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
              value={patient.county || ""}
              onChange={onChange}
            />
            <div className="grid-row grid-gap">
              <div className="mobile-lg:grid-col-6">
                <Dropdown
                  label="State"
                  name="state"
                  selectedValue={patient.state || ""}
                  options={stateCodes.map((c) => ({ label: c, value: c }))}
                  defaultSelect
                  onChange={onChange}
                  onBlur={() => {
                    validateField("state");
                  }}
                  validationStatus={validationStatus("state")}
                  errorMessage={errors.state}
                  required
                />
              </div>
              <div className="mobile-lg:grid-col-6">
                <TextInput
                  label="Zip code"
                  name="zipCode"
                  value={patient.zipCode || ""}
                  onChange={onChange}
                  onBlur={() => {
                    validateField("zipCode");
                  }}
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
          <YesNoRadioGroup
            legend="Resident in congregate care/living setting?"
            name="residentCongregateSetting"
            value={patient.residentCongregateSetting}
            onChange={onResidentCongregateSettingChange}
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
            onChange={onEmployedInHealthcareChange}
            onBlur={() => {
              validateField("employedInHealthcare");
            }}
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
