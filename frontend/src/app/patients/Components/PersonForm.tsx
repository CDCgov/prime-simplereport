import React, { useCallback, useState, useEffect, useRef } from "react";
import { SchemaOf } from "yup";
import { useTranslation } from "react-i18next";
import { ComboBox } from "@trussworks/react-uswds";

import {
  canadianProvinceCodes,
  countryOptions,
  stateCodes,
} from "../../../config/constants";
import getLanguages from "../../utils/languages";
import i18n from "../../../i18n";
import {
  TRIBAL_AFFILIATION_VALUES,
  useTranslatedConstants,
} from "../../constants";
import RadioGroup from "../../commonComponents/RadioGroup";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import { showError } from "../../utils/srToast";
import FormGroup from "../../commonComponents/FormGroup";
import {
  PersonErrors,
  PersonUpdateFields,
  usePersonSchemata,
} from "../personSchema";
import { TestResultDeliveryPreference } from "../TestResultDeliveryPreference";
import Input from "../../commonComponents/Input";
import Select from "../../commonComponents/Select";
import {
  getBestSuggestion,
  getZipCodeData,
  isValidZipCodeForState,
  suggestionIsCloseEnough,
} from "../../utils/smartyStreets";
import { AddressConfirmationModal } from "../../commonComponents/AddressConfirmationModal";
import { formatDate } from "../../utils/date";
import {
  getSelectedDeliveryPreferencesEmail,
  toggleDeliveryPreferenceEmail,
} from "../../utils/deliveryPreferences";
import Prompt from "../../utils/Prompt";
import YesNoNotSureRadioGroup, {
  boolToYesNoNotSure,
  yesNoNotSureToBool,
} from "../../commonComponents/YesNoNotSureRadioGroup";

import FacilitySelect from "./FacilitySelect";
import ManagePhoneNumbers from "./ManagePhoneNumbers";
import ManageEmails from "./ManageEmails";

export type ValidateField = (field: keyof PersonErrors) => Promise<void>;

export enum PersonFormView {
  APP,
  PXP,
  SELF_REGISTRATION,
}

interface Props {
  patient: Nullable<PersonFormData>;
  patientId?: string;
  savePerson: (person: Nullable<PersonFormData>, startTest?: boolean) => void;
  onBlur?: (person: Nullable<PersonFormData>) => void;
  hideFacilitySelect?: boolean;
  getHeader?: (
    person: Nullable<PersonFormData>,
    onSave: (startTest?: boolean) => void,
    formChanged: boolean
  ) => React.ReactNode;
  getFooter: (
    onSave: (startTest?: boolean) => void,
    formChanged: boolean
  ) => React.ReactNode;
  view?: PersonFormView;
  headerClassName?: string;
}

const PersonForm = (props: Props) => {
  const [formChanged, setFormChanged] = useState(false);
  const [startTest, setStartTest] = useState(false);
  const [patient, setPatient] = useState(props.patient);
  // Default country to USA if it's not set
  if (patient.country === null) {
    setPatient({ ...patient, country: "USA" });
  }
  const [errors, setErrors] = useState<PersonErrors>({});
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressSuggestion, setAddressSuggestion] = useState<
    AddressWithMetaData | undefined
  >();
  const phoneNumberValidator = useRef<Function | null>(null);
  const emailValidator = useRef<Function | null>(null);

  const languages = getLanguages();

  const { view = PersonFormView.APP, onBlur } = props;

  const { t } = useTranslation();

  const {
    personSchema,
    personUpdateSchema,
    selfRegistrationSchema,
    defaultValidationError,
    getValidationError,
  } = usePersonSchemata();

  const schemata: Record<PersonFormView, SchemaOf<PersonUpdateFields>> = {
    [PersonFormView.APP]: personSchema,
    [PersonFormView.PXP]: personUpdateSchema,
    [PersonFormView.SELF_REGISTRATION]: selfRegistrationSchema,
  };

  const schema = schemata[view];

  // Language settings may persist into a non-i18nized view, so explicitly revert back to the
  // default language in such cases
  useEffect(() => {
    if (i18n.language !== "en" && schema !== selfRegistrationSchema) {
      i18n.changeLanguage("en");
    }
  }, [schema, selfRegistrationSchema]);

  const clearError = useCallback(
    (field: keyof PersonErrors) => {
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    },
    [errors]
  );

  const onBlurField = useCallback(
    async (field: keyof PersonErrors) => {
      onBlur?.(patient);
      try {
        await schema.validateAt(field, patient);
        clearError(field);
      } catch (e: any) {
        setErrors((existingErrors) => ({
          ...existingErrors,
          [field]: getValidationError(e),
        }));
      }
    },
    [patient, clearError, schema, getValidationError, onBlur]
  );

  // Make sure all existing errors are up-to-date (including translations)
  useEffect(() => {
    Object.entries(errors).forEach(async ([field, message]) => {
      try {
        await schema.validateAt(field, patient);
      } catch (e: any) {
        const error = getValidationError(e);
        if (message && error !== message) {
          setErrors((existing) => ({
            ...existing,
            [field]: error,
          }));
        }
      }
    });
  }, [errors, schema, patient, getValidationError]);

  const onPersonChange =
    <K extends keyof PersonFormData>(field: K) =>
    (value: PersonFormData[K]) => {
      if (value === patient[field]) {
        return;
      }
      // If a patient has an international address, use special values for state and zip code
      if (field === "country") {
        setFormChanged(true);

        if (value !== "USA") {
          setPatient({
            ...patient,
            [field]: value,
            state: "NA",
            zipCode: "00000",
          });
        } else {
          setPatient({ ...patient, [field]: value, state: "", zipCode: "" });
        }
        return;
      }
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
      city: p.city || "",
      state: p.state || "",
      zipCode: p.zipCode || "",
      county: p.county || "",
    };
  };

  const validatePatientAddress = async (shouldStartTest = false) => {
    const originalAddress = getAddress(patient);

    const zipCodeData = await getZipCodeData(originalAddress.zipCode);
    const isValidZipForState = isValidZipCodeForState(
      originalAddress.state,
      zipCodeData
    );

    if (!isValidZipForState) {
      showError(
        t("patient.form.errors.validationMsg"),
        t("patient.form.errors.zipForState")
      );
      return;
    }

    const suggestedAddress = await getBestSuggestion(originalAddress);
    if (suggestionIsCloseEnough(originalAddress, suggestedAddress)) {
      onSave(suggestedAddress, shouldStartTest);
    } else {
      setAddressSuggestion(suggestedAddress);
      setAddressModalOpen(true);
    }
  };
  const getSchemaNameOrder = () => {
    const schemaInfo = schema.describe();
    const schemaOrder: { [key: string]: number } = {};
    Object.keys(schemaInfo.fields).forEach((schemaName, idx) => {
      schemaOrder[schemaName] = idx;
    });
    return schemaOrder;
  };

  function handlePhoneNumberAndEmailErrorFocus(earliestErrorName: string) {
    const elementClassPrefix =
      earliestErrorName === "phoneNumbers" ? "phoneNumber" : "email";
    const elementsToCheck = Array.from(
      document.getElementsByClassName(`${elementClassPrefix}FormElement`)
    ) as HTMLElement[];
    for (const element of elementsToCheck) {
      const errorContent = element.textContent;
      if (errorContent && errorContent.match("Error")) {
        // the parent div element isn't in the tabindex and
        // therefore isn't focusable, so grab the closest input child element
        document
          .getElementById(element.id)
          ?.getElementsByTagName("input")[0]
          .focus();
        break;
      }
    }
  }

  function handleValidationErrors(e: any) {
    const newErrors: PersonErrors = e.inner.reduce(
      (
        acc: PersonErrors,
        el: { path: keyof PersonErrors; message: string }
      ) => {
        acc[el.path] = el?.message || defaultValidationError;
        return acc;
      },
      {} as PersonErrors
    );
    setErrors(newErrors);
    const schemaOrder = getSchemaNameOrder();
    Object.values(newErrors).forEach((error) => {
      if (!error) {
        return;
      }
      showError(t("patient.form.errors.validationMsg"), error);
    });

    let earliestErrorIndex = Number.POSITIVE_INFINITY;
    let earliestErrorName = "";
    Object.keys(newErrors).forEach((name) => {
      const errorOrder = schemaOrder[name];
      if (earliestErrorIndex > errorOrder) {
        earliestErrorIndex = errorOrder;
        earliestErrorName = name;
      }
    });

    // phone/email fields might have multiple entries, so handle those elements
    // via their field ID's
    if (
      earliestErrorName === "phoneNumbers" ||
      earliestErrorName === "emails"
    ) {
      handlePhoneNumberAndEmailErrorFocus(earliestErrorName);
    } else {
      document.getElementsByName(earliestErrorName)[0]?.focus();
    }
  }

  const validateForm = async (shouldStartTest: boolean = false) => {
    // The `startTest` param here originates from a child Add/Edit Patient form,
    // but we must also track it in state here to preserve the redirect throughout
    // address confirmation
    if (shouldStartTest) {
      setStartTest(true);
    }

    try {
      phoneNumberValidator.current?.();
      await schema.validate(patient, { abortEarly: false });
    } catch (e: any) {
      handleValidationErrors(e);
      return;
    }

    if (
      JSON.stringify(getAddress(patient)) ===
        JSON.stringify(getAddress(props.patient)) ||
      patient.country !== "USA"
    ) {
      onSave(undefined, shouldStartTest);
    } else {
      validatePatientAddress(shouldStartTest);
    }
  };

  const onSave = (
    address?: AddressWithMetaData,
    shouldStartTest: boolean = false
  ) => {
    const person = address ? { ...patient, ...address } : patient;
    // in the case where we have an empty additional phone number, filter it out
    person.phoneNumbers = person.phoneNumbers
      ? person.phoneNumbers.filter((pn) => pn.number && pn.type)
      : person.phoneNumbers;
    setPatient(person);
    setAddressModalOpen(false);
    setFormChanged(false);
    props.savePerson(person, shouldStartTest);
  };

  const commonInputProps = {
    formObject: patient,
    onChange: onPersonChange,
    validate: onBlurField,
    getValidationStatus: validationStatus,
    errors: errors,
  };

  const {
    RACE_VALUES,
    ETHNICITY_VALUES,
    GENDER_VALUES,
    ROLE_VALUES,
    TEST_RESULT_DELIVERY_PREFERENCE_VALUES_EMAIL,
  } = useTranslatedConstants();
  return (
    <>
      <Prompt when={formChanged} message={t("patient.form.errors.unsaved")} />
      {view === PersonFormView.APP && props.getHeader && (
        <div className={`patient__header ${props.headerClassName || ""}`}>
          {props.getHeader(patient, validateForm, formChanged)}
        </div>
      )}
      <FormGroup title={t("patient.form.general.heading")}>
        <RequiredMessage message={t("common.required")} />
        <div className="usa-form">
          <Input
            {...commonInputProps}
            label={t("patient.form.general.firstName")}
            field="firstName"
            required={view !== PersonFormView.PXP}
            disabled={view === PersonFormView.PXP}
          />
          <Input
            {...commonInputProps}
            field="middleName"
            label={t("patient.form.general.middleName")}
            disabled={view === PersonFormView.PXP}
          />
          <Input
            {...commonInputProps}
            field="lastName"
            label={t("patient.form.general.lastName")}
            required={view !== PersonFormView.PXP}
            disabled={view === PersonFormView.PXP}
          />
        </div>
        <div className="usa-form">
          <Select
            label={t("patient.form.general.role")}
            name="role"
            value={patient.role || ""}
            onChange={onPersonChange("role")}
            options={ROLE_VALUES}
            defaultOption={t("common.defaultDropdownOption")}
            defaultSelect={true}
          />
          {patient.role === "STUDENT" && (
            <Input
              {...commonInputProps}
              field="lookupId"
              label={t("patient.form.general.studentId")}
            />
          )}
          {view !== PersonFormView.SELF_REGISTRATION && (
            <FacilitySelect
              facilityId={patient.facilityId}
              onChange={onPersonChange("facilityId")}
              validateField={() => {
                onBlurField("facilityId");
              }}
              validationStatus={validationStatus}
              errors={errors}
              hidden={props.hideFacilitySelect}
            />
          )}
          <div className="usa-form-group">
            <label className="usa-label" htmlFor="preferred-language">
              {t("patient.form.general.preferredLanguage")}
            </label>
            <ComboBox
              id="preferred-language"
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
            label={
              t("patient.form.general.dob") +
              " (" +
              t("patient.form.general.dobFormat") +
              ")"
            }
            type="date"
            required={view !== PersonFormView.PXP}
            disabled={view === PersonFormView.PXP}
            min={formatDate(new Date("Jan 1, 1900"))}
            max={formatDate(new Date())}
          />
        </div>
      </FormGroup>
      <FormGroup title={t("patient.form.contact.heading")}>
        <p className="usa-hint maxw-prose">
          {t("patient.form.contact.helpText")}
        </p>
        <ManagePhoneNumbers
          phoneNumbers={patient.phoneNumbers || []}
          testResultDelivery={patient.testResultDelivery}
          updatePhoneNumbers={onPersonChange("phoneNumbers")}
          updateTestResultDelivery={onPersonChange("testResultDelivery")}
          phoneNumberValidator={phoneNumberValidator}
        />
        <div className="usa-form">
          <ManageEmails
            emails={patient.emails}
            patient={patient}
            updateEmails={onPersonChange("emails")}
            emailValidator={emailValidator}
          />
          {patient.emails && patient?.emails?.length > 0 && (
            <RadioGroup
              legend={
                (patient.emails || []).length === 1
                  ? t("patient.form.testResultDelivery.email")
                  : t("patient.form.testResultDelivery.email_plural")
              }
              name="testResultDeliveryEmail"
              buttons={TEST_RESULT_DELIVERY_PREFERENCE_VALUES_EMAIL}
              onChange={(newPreference) => {
                onPersonChange("testResultDelivery")(
                  toggleDeliveryPreferenceEmail(
                    patient.testResultDelivery,
                    newPreference
                  )
                );
              }}
              selectedRadio={getSelectedDeliveryPreferencesEmail(
                patient.testResultDelivery as TestResultDeliveryPreference
              )}
            />
          )}
        </div>
        <div className="usa-form">
          <Select
            label={t("patient.form.contact.country")}
            name="country"
            value={patient.country || "USA"}
            options={countryOptions}
            onChange={onPersonChange("country")}
            onBlur={() => {
              onBlurField("country");
            }}
            validationStatus={validationStatus("country")}
            errorMessage={errors.country}
            required
          />
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="street"
            label={t("patient.form.contact.street1")}
            required
          />
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="streetTwo"
            label={t("patient.form.contact.street2")}
          />
        </div>
        <div className="usa-form">
          <Input
            {...commonInputProps}
            field="city"
            label={t("patient.form.contact.city")}
            required
          />
          {view !== PersonFormView.SELF_REGISTRATION && (
            <Input
              {...commonInputProps}
              field="county"
              label={t("patient.form.contact.county")}
            />
          )}
          {patient.country === "USA" ? (
            <div className="grid-row grid-gap">
              <div className="mobile-lg:grid-col-6">
                <Select
                  label={t("patient.form.contact.state")}
                  name="state"
                  value={patient.state || ""}
                  options={stateCodes.map((c) => ({ label: c, value: c }))}
                  defaultOption={t("common.defaultDropdownOption")}
                  defaultSelect
                  onChange={onPersonChange("state")}
                  onBlur={() => {
                    onBlurField("state");
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
                  label={t("patient.form.contact.zip")}
                  required
                />
              </div>
            </div>
          ) : null}
          {patient.country === "CAN" ? (
            <div className="grid-row grid-gap">
              <div className="mobile-lg:grid-col-6">
                <Select
                  label={t("patient.form.contact.state")}
                  name="state"
                  value={patient.state || ""}
                  options={canadianProvinceCodes.map((c) => ({
                    label: c,
                    value: c,
                  }))}
                  defaultOption={t("common.defaultDropdownOption")}
                  defaultSelect
                  onChange={onPersonChange("state")}
                  onBlur={() => {
                    onBlurField("state");
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
                  label={t("patient.form.contact.zip")}
                  required
                />
              </div>
            </div>
          ) : null}
        </div>
      </FormGroup>
      <FormGroup title={t("patient.form.demographics.heading")}>
        <p className="usa-hint maxw-prose">
          {t("patient.form.demographics.helpText")}
        </p>
        <RadioGroup
          legend={t("patient.form.demographics.race")}
          name="race"
          buttons={RACE_VALUES}
          selectedRadio={patient.race}
          onChange={onPersonChange("race")}
          required
          validationStatus={validationStatus("race")}
          errorMessage={errors.race}
        />
        <div className="usa-form-group">
          <label className="usa-legend" htmlFor="tribal-affiliation">
            {t("patient.form.demographics.tribalAffiliation")}
          </label>
          <ComboBox
            id="tribal-affiliation"
            name="tribal-affiliation"
            options={TRIBAL_AFFILIATION_VALUES}
            onChange={
              onPersonChange("tribalAffiliation") as (value?: string) => void
            }
            defaultValue={patient.tribalAffiliation || undefined}
          />
        </div>
        <RadioGroup
          legend={t("patient.form.demographics.ethnicity")}
          name="ethnicity"
          buttons={ETHNICITY_VALUES}
          selectedRadio={patient.ethnicity}
          onChange={onPersonChange("ethnicity")}
          required
          validationStatus={validationStatus("ethnicity")}
          errorMessage={errors.ethnicity}
        />
        <RadioGroup
          legend={t("patient.form.demographics.gender")}
          hintText={t("patient.form.demographics.genderHelpText")}
          name="gender"
          required={view !== PersonFormView.PXP}
          validationStatus={validationStatus("gender")}
          buttons={GENDER_VALUES}
          selectedRadio={patient.gender}
          onChange={onPersonChange("gender")}
          errorMessage={errors.gender}
        />
      </FormGroup>
      <FormGroup title={t("patient.form.housingAndWork.heading")}>
        <YesNoNotSureRadioGroup
          legend={t("patient.form.housingAndWork.congregateLiving.heading")}
          hintText={t("patient.form.housingAndWork.congregateLiving.helpText")}
          name="residentCongregateSetting"
          value={boolToYesNoNotSure(patient.residentCongregateSetting)}
          onChange={(v) =>
            onPersonChange("residentCongregateSetting")(yesNoNotSureToBool(v))
          }
          onBlur={() => {
            onBlurField("residentCongregateSetting");
          }}
          validationStatus={validationStatus("residentCongregateSetting")}
          errorMessage={errors.residentCongregateSetting}
        />
        <YesNoNotSureRadioGroup
          legend={t("patient.form.housingAndWork.healthcareWorker")}
          name="employedInHealthcare"
          value={boolToYesNoNotSure(patient.employedInHealthcare)}
          onChange={(v) =>
            onPersonChange("employedInHealthcare")(yesNoNotSureToBool(v))
          }
          onBlur={() => {
            onBlurField("employedInHealthcare");
          }}
          validationStatus={validationStatus("employedInHealthcare")}
          errorMessage={errors.employedInHealthcare}
        />
      </FormGroup>
      {props.getFooter && props.getFooter(validateForm, formChanged)}
      <AddressConfirmationModal
        addressSuggestionConfig={[
          {
            key: "person",
            userEnteredAddress: getAddress(patient),
            suggestedAddress: addressSuggestion,
          },
        ]}
        showModal={addressModalOpen}
        onConfirm={(data) => onSave(data.person, startTest)}
        onClose={() => setAddressModalOpen(false)}
      />
    </>
  );
};

export default PersonForm;
