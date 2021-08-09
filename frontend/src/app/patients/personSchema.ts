import * as yup from "yup";
import { PhoneNumberUtil } from "google-libphonenumber";
import moment from "moment";

import {
  RACE_VALUES,
  ROLE_VALUES,
  ETHNICITY_VALUES,
  GENDER_VALUES,
  TRIBAL_AFFILIATION_VALUES,
  PHONE_TYPE_VALUES,
  TEST_RESULT_DELIVERY_PREFERENCE_VALUES,
} from "../constants";
import { Option } from "../commonComponents/Dropdown";
import { languages } from "../../config/constants";
import i18n from "../../i18n";

const phoneUtil = PhoneNumberUtil.getInstance();

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UpdateOptionalFields =
  | "lookupId"
  | "role"
  | "email"
  | "streetTwo"
  | "city"
  | "county"
  | "race"
  | "ethnicity"
  | "gender"
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

const getValues = (options: Option[]) => options.map(({ value }) => value);

export function phoneNumberIsValid(input: any) {
  if (!input) {
    return false;
  }
  const number = phoneUtil.parseAndKeepRawInput(input, "US");
  return phoneUtil.isValidNumber(number);
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

export function isValidBirthdate(date: string | undefined) {
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
    return false;
  }
  if (parsedDate.isAfter(moment())) {
    return false;
  }
  return true;
}

const updateFieldSchemata: Record<keyof PersonUpdate, yup.AnySchema> = {
  lookupId: yup.string().nullable(),
  role: yup
    .mixed()
    .oneOf(
      [...getValues(ROLE_VALUES), "UNKNOWN", "", null],
      i18n.t("patient.form.errors.role")
    ),
  telephone: yup.mixed().optional(),
  phoneNumbers: yup
    .array()
    .test(
      "phone-numbers",
      i18n.t("patient.form.errors.phoneNumbers"),
      areValidPhoneNumbers
    )
    .required(),
  email: yup.string().email(i18n.t("patient.form.errors.email")).nullable(),
  street: yup.string().required(i18n.t("patient.form.errors.street")),
  streetTwo: yup.string().nullable(),
  city: yup.string().nullable(),
  county: yup.string().nullable(),
  state: yup.string().required(i18n.t("patient.form.errors.state")),
  zipCode: yup.string().required(i18n.t("patient.form.errors.zipCode")),
  race: yup
    .mixed()
    .oneOf(
      [...getValues(RACE_VALUES), "", null],
      i18n.t("patient.form.errors.race")
    ),
  ethnicity: yup
    .mixed()
    .oneOf(
      [...getValues(ETHNICITY_VALUES), "", null],
      i18n.t("patient.form.errors.ethnicity")
    ),
  gender: yup
    .mixed()
    .oneOf(
      [...getValues(GENDER_VALUES), "", null],
      i18n.t("patient.form.errors.gender")
    ),
  residentCongregateSetting: yup.boolean().nullable(),
  employedInHealthcare: yup.boolean().nullable(),
  tribalAffiliation: yup
    .mixed()
    .oneOf(
      [...getValues(TRIBAL_AFFILIATION_VALUES), "", null],
      i18n.t("patient.form.errors.tribalAffiliation")
    ),
  preferredLanguage: yup
    .mixed()
    .oneOf(
      [...languages, "", null],
      i18n.t("patient.form.errors.preferredLanguage")
    ),
  testResultDelivery: yup
    .mixed()
    .oneOf(
      [...getValues(TEST_RESULT_DELIVERY_PREFERENCE_VALUES), "", null],
      i18n.t("patient.form.errors.testResultDelivery")
    ),
};

const updatePhoneNumberSchemata: Record<keyof PhoneNumber, yup.AnySchema> = {
  number: yup.string().test(phoneNumberIsValid).required(),
  type: yup.mixed().oneOf(getValues(PHONE_TYPE_VALUES)),
};

export const phoneNumberUpdateSchema: yup.SchemaOf<PhoneNumber> = yup.object(
  updatePhoneNumberSchemata
);

export const personUpdateSchema: yup.SchemaOf<PersonUpdateFields> = yup.object(
  updateFieldSchemata
);

export const personSchema: yup.SchemaOf<RequiredPersonFields> = yup.object({
  firstName: yup.string().required(i18n.t("patient.form.errors.firstName")),
  middleName: yup.string().nullable(),
  lastName: yup.string().required(i18n.t("patient.form.errors.lastName")),
  birthDate: yup
    .string()
    .test(
      "birth-date",
      i18n.t("patient.form.errors.birthDate"),
      isValidBirthdate
    )
    .required(i18n.t("patient.form.errors.birthDate")),
  facilityId: yup
    .string()
    .nullable()
    .min(1, i18n.t("patient.form.errors.facilityId")) as any,
  ...updateFieldSchemata,
});

export const selfRegistrationSchema: yup.SchemaOf<SelfRegistationFields> = yup.object(
  {
    firstName: yup.string().required(i18n.t("patient.form.errors.firstName")),
    middleName: yup.string().nullable(),
    lastName: yup.string().required(),
    birthDate: yup.string().test(isValidBirthdate).required(),
    ...updateFieldSchemata,
  }
);

export type PersonErrors = Partial<Record<keyof PersonFormData, string>>;

export const allPersonErrors: Required<PersonErrors> = {
  firstName: i18n.t("patient.form.errors.firstName"),
  middleName: i18n.t("patient.form.errors.middleName"),
  lastName: i18n.t("patient.form.errors.lastName"),
  lookupId: i18n.t("patient.form.errors.lookupId"),
  role: i18n.t("patient.form.errors.role"),
  facilityId: i18n.t("patient.form.errors.facilityId"),
  birthDate: i18n.t("patient.form.errors.birthDate"),
  telephone: i18n.t("patient.form.errors.telephone"),
  phoneNumbers: i18n.t("patient.form.errors.phoneNumbers"),
  email: i18n.t("patient.form.errors.email"),
  street: i18n.t("patient.form.errors.street"),
  streetTwo: i18n.t("patient.form.errors.streetTwo"),
  zipCode: i18n.t("patient.form.errors.zipCode"),
  state: i18n.t("patient.form.errors.state"),
  city: i18n.t("patient.form.errors.city"),
  county: i18n.t("patient.form.errors.county"),
  race: i18n.t("patient.form.errors.race"),
  tribalAffiliation: i18n.t("patient.form.errors.tribalAffiliation"),
  ethnicity: i18n.t("patient.form.errors.ethnicity"),
  gender: i18n.t("patient.form.errors.gender"),
  residentCongregateSetting: i18n.t(
    "patient.form.errors.residentCongregateSetting"
  ),
  employedInHealthcare: i18n.t("patient.form.errors.employedInHealthcare"),
  preferredLanguage: i18n.t("patient.form.errors.preferredLanguage"),
  testResultDelivery: i18n.t("patient.form.errors.testResultDelivery"),
};

export type PhoneNumberErrors = Partial<Record<keyof PhoneNumber, string>>;

export const allPhoneNumberErrors: Required<PhoneNumberErrors> = {
  number: i18n.t("patient.form.errors.telephone"),
  type: "Phone type is missing or invalid",
};
