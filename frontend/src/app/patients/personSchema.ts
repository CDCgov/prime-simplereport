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

  try {
    const number = phoneUtil.parseAndKeepRawInput(input, "US");
    return phoneUtil.isValidNumber(number);
  } catch (e) {
    return false;
  }
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
  number: yup
    .string()
    .test(
      "phone-number",
      i18n.t("patient.form.errors.telephone"),
      phoneNumberIsValid
    )
    .required(),
  type: yup
    .mixed()
    .oneOf(getValues(PHONE_TYPE_VALUES), "Phone type is missing or invalid"),
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

export type PhoneNumberErrors = Partial<Record<keyof PhoneNumber, string>>;
