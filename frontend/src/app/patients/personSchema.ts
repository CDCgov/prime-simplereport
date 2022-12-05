import * as yup from "yup";
import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { TFunction } from "i18next";
import { TestContext } from "yup";

import {
  RACE_VALUES,
  ROLE_VALUES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
  TRIBAL_AFFILIATION_VALUES,
  PHONE_TYPE_VALUES,
} from "../constants";
import { Option } from "../commonComponents/Dropdown";
import { languages } from "../../config/constants";
import { emailIsValid } from "../utils/email";

import { TestResultDeliveryPreferences } from "./TestResultDeliveryPreference";

const phoneUtil = PhoneNumberUtil.getInstance();

const MAX_LENGTH = 256;

type TranslatedSchema<T> = (t: TFunction) => yup.SchemaOf<T>;

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UpdateOptionalFields =
  | "lookupId"
  | "role"
  | "emails"
  | "streetTwo"
  | "city"
  | "county"
  | "race"
  | "ethnicity"
  | "tribalAffiliation"
  | "residentCongregateSetting"
  | "employedInHealthcare"
  | "preferredLanguage"
  | "testResultDelivery";

type OptionalFields = UpdateOptionalFields | "middleName";

export type RequiredPersonFields = PartialBy<
  Nullable<PersonFormData>,
  OptionalFields
>;

export type PersonUpdateFields = PartialBy<
  Nullable<PersonUpdate>,
  UpdateOptionalFields
>;

export type SelfRegistationFields = Omit<RequiredPersonFields, "facilityId">;

export const getValues = (options: Option[]) =>
  options.map(({ value }) => value);

export function hasPhoneType(phoneNumbers: any) {
  return (phoneNumbers || []).every((phoneNumber: any) => {
    // Empty numbers are allowable in some cases
    // `number` is OK for this validation
    if (!phoneNumber?.number) {
      return true;
    }

    return Boolean(phoneNumber?.type);
  });
}

export function phoneNumberIsValid(input: any) {
  if (!input) {
    return false;
  }

  try {
    const number = phoneUtil.parseAndKeepRawInput(input, "US");
    return phoneUtil.isValidNumber(number);
  } catch (e: any) {
    return false;
  }
}

export function areUniquePhoneNumbers(phoneNumbers: any) {
  // Only check valid phone numbers for uniqueness - blank or invalid
  // phone numbers should be handled by other validators as appropriate
  const validPhoneNumbers = phoneNumbers
    .filter(function removeInvalidPhoneNumbers(pn: PhoneNumber) {
      return phoneNumberIsValid(pn.number);
    })
    .map(function formatPhoneNumbers(pn: PhoneNumber) {
      const parsedNumber = phoneUtil.parse(pn.number, "US");
      return phoneUtil.format(parsedNumber, PhoneNumberFormat.E164);
    });

  return new Set(validPhoneNumbers).size === validPhoneNumbers.length;
}

export function areValidPhoneNumbers(phoneNumbers: any) {
  // At least one phone number is required
  if (!phoneNumbers || phoneNumbers.length === 0) {
    return false;
  }

  return phoneNumbers.every((phoneNumber: any, idx: number) => {
    // The first phone number is considered the "primary" phone number and must
    // be provided
    if (idx === 0) {
      if (!phoneNumber || !phoneNumber.number || !phoneNumber.type) {
        return false;
      }
    } else {
      // Subsequent phone numbers are optional and may be fully blank...
      if (!phoneNumber || (!phoneNumber.number && !phoneNumber.type)) {
        return true;
      }

      // ...but not partially blank...
      if (!phoneNumber.number || !phoneNumber.type) {
        return false;
      }
    }

    // ...and must validate if provided
    return phoneNumberIsValid(phoneNumber.number);
  });
}

export function isValidBirthdate18n(t: TFunction) {
  return function isValidBirthdate(
    this: TestContext,
    date: string | undefined
  ) {
    if (date === undefined) {
      return false;
    }
    if (date.split("/").length === 3 && date.split("/")[2].length < 4) {
      return false;
    }
    const parsedDate = moment(date);
    if (!parsedDate.isValid()) {
      return false;
    }
    if (parsedDate.year() < 1900) {
      return this.createError({
        message: t("patient.form.errors.birthDate.past", undefined),
      });
    }
    if (parsedDate.isAfter(moment())) {
      return this.createError({
        message: t("patient.form.errors.birthDate.future", undefined),
      });
    }
    return true;
  };
}

function isValidEmail18n(t: TFunction) {
  return function isValidEmail(this: TestContext, email: string | undefined) {
    if ([undefined, ""].includes(email)) {
      return true;
    }

    if (!emailIsValid(email)) {
      return false;
    }

    if (email && email.length > MAX_LENGTH) {
      return this.createError({
        message: t("patient.form.errors.fieldLength", undefined),
      });
    }

    return true;
  };
}

function areValidEmails18n(t: TFunction) {
  const validator = isValidEmail18n(t);

  return function areValidEmails(emails: string[] | null | undefined) {
    if (!Array.isArray(emails)) {
      return true;
    }

    return emails.every(validator);
  };
}
const updateFieldSchemata: (
  t: TFunction
) => Record<keyof PersonUpdate, yup.AnySchema> = (t) => ({
  lookupId: yup.string().nullable(),
  role: yup
    .mixed()
    .oneOf(
      [...getValues(ROLE_VALUES), "UNKNOWN", "", null],
      t("patient.form.errors.role", undefined)
    ),
  telephone: yup.mixed().optional(),
  phoneNumbers: yup
    .array()
    .test(
      "phone-numbers",
      t("patient.form.errors.phoneNumbers", undefined),
      areValidPhoneNumbers
    )
    .test(
      "phone-numbers",
      t("patient.form.errors.phoneNumbersDuplicate", undefined),
      areUniquePhoneNumbers
    )
    .test(
      "phone-numbers",
      t("patient.form.errors.phoneNumbersType", undefined),
      hasPhoneType
    )
    .required(),
  emails: yup
    .array()
    .test(
      "emails",
      t("patient.form.errors.email", undefined),
      areValidEmails18n(t)
    )
    .nullable(),
  street: yup
    .string()
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .required(t("patient.form.errors.street", undefined)),
  streetTwo: yup
    .string()
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .nullable(),
  city: yup
    .string()
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .nullable(),
  county: yup
    .string()
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .nullable(),
  state: yup.string().required(t("patient.form.errors.state", undefined)),
  zipCode: yup
    .string()
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .required(t("patient.form.errors.zipCode", undefined)),
  country: yup.string().required(t("patient.form.errors.country", undefined)),
  race: yup
    .mixed()
    .oneOf(getValues(RACE_VALUES), t("patient.form.errors.race", undefined)),
  ethnicity: yup
    .mixed()
    .oneOf(
      getValues(ETHNICITY_VALUES),
      t("patient.form.errors.ethnicity", undefined)
    ),
  gender: yup
    .mixed()
    .oneOf(
      getValues(GENDER_VALUES),
      t("patient.form.errors.gender", undefined)
    ),
  residentCongregateSetting: yup.boolean().nullable(),
  employedInHealthcare: yup.boolean().nullable(),
  tribalAffiliation: yup
    .mixed()
    .oneOf(
      [...getValues(TRIBAL_AFFILIATION_VALUES), "", null],
      t("patient.form.errors.tribalAffiliation", undefined)
    ),
  preferredLanguage: yup
    .mixed()
    .oneOf(
      [...languages, "", null],
      t("patient.form.errors.preferredLanguage", undefined)
    ),
  testResultDelivery: yup
    .mixed()
    .oneOf(
      [...Object.values(TestResultDeliveryPreferences), "", null],
      t("patient.form.errors.testResultDelivery", undefined)
    ),
});

const updatePhoneNumberSchemata: (
  t: TFunction
) => Record<keyof PhoneNumber, yup.AnySchema> = (t) => ({
  number: yup
    .string()
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .test(
      "phone-number",
      t("patient.form.errors.telephone", undefined),
      phoneNumberIsValid
    )
    .required(),
  type: yup
    .mixed()
    .oneOf(
      getValues(PHONE_TYPE_VALUES),
      t("patient.form.errors.phoneNumbersType", undefined)
    ),
});

const translateUpdateEmailSchemata = (t: TFunction) => {
  return yup
    .string()
    .email(t("patient.form.errors.email", undefined))
    .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
    .nullable();
};

const translatePhoneNumberUpdateSchema: TranslatedSchema<PhoneNumber> = (t) =>
  yup.object(updatePhoneNumberSchemata(t));

const translatePersonUpdateSchema: TranslatedSchema<PersonUpdateFields> = (t) =>
  yup.object(updateFieldSchemata(t));

const translatePersonSchema: TranslatedSchema<RequiredPersonFields> = (t) =>
  yup.object({
    firstName: yup
      .string()
      .required(t("patient.form.errors.firstName", undefined)),
    middleName: yup.string().nullable(),
    lastName: yup
      .string()
      .required(t("patient.form.errors.lastName", undefined)),
    birthDate: yup
      .string()
      .test(
        "birth-date",
        t("patient.form.errors.birthDate.base", undefined),
        isValidBirthdate18n(t)
      )
      .required(t("patient.form.errors.birthDate.base", undefined)),
    facilityId: yup
      .string()
      .nullable()
      .min(1, t("patient.form.errors.facilityId", undefined)) as any,
    ...updateFieldSchemata(t),
  });

const translateSelfRegistrationSchema: TranslatedSchema<
  SelfRegistationFields
> = (t) =>
  yup.object({
    firstName: yup
      .string()
      .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
      .required(t("patient.form.errors.firstName", undefined)),
    middleName: yup
      .string()
      .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined))
      .nullable(),
    lastName: yup
      .string()
      .required(t("patient.form.errors.lastName", undefined))
      .max(MAX_LENGTH, t("patient.form.errors.fieldLength", undefined)),
    birthDate: yup
      .string()
      .test(
        "birth-date",
        t("patient.form.errors.birthDate.base", undefined),
        isValidBirthdate18n(t)
      )
      .required(t("patient.form.errors.birthDate.base", undefined)),
    ...updateFieldSchemata(t),
  });

export type PersonErrors = Partial<Record<keyof PersonFormData, string>>;

export type PhoneNumberErrors = Partial<Record<keyof PhoneNumber, string>>;

export const usePersonSchemata = () => {
  const { t } = useTranslation();
  // TODO: translate this default error
  const defaultValidationError = "Field is missing or invalid";

  return {
    phoneNumberUpdateSchema: translatePhoneNumberUpdateSchema(t),
    personUpdateSchema: translatePersonUpdateSchema(t),
    personSchema: translatePersonSchema(t),
    emailUpdateSchema: translateUpdateEmailSchemata(t),
    selfRegistrationSchema: translateSelfRegistrationSchema(t),
    defaultValidationError,
    getValidationError: (e: yup.ValidationError) =>
      e.errors?.join(", ") || e?.message || defaultValidationError,
  };
};
