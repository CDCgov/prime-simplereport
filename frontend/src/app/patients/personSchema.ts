import * as yup from "yup";
import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredPersonFields = PartialBy<
  Nullable<PersonFormData>,
  | "middleName"
  | "lookupId"
  | "role"
  | "email"
  | "streetTwo"
  | "city"
  | "county"
  | "race"
  | "ethnicity"
  | "gender"
  | "residentCongregateSetting"
  | "employedInHealthcare"
>;

export const personSchema: yup.SchemaOf<RequiredPersonFields> = yup.object({
  firstName: yup.string().required(),
  middleName: yup.string().nullable(),
  lastName: yup.string().required(),
  lookupId: yup.string().nullable(),
  role: yup.string().nullable() as any,
  birthDate: yup.string().required(),
  facilityId: yup.string().nullable().min(1) as any,
  telephone: yup
    .string()
    .test(function (input) {
      if (!input) {
        return false;
      }
      const number = phoneUtil.parseAndKeepRawInput(input, "US");
      return phoneUtil.isValidNumber(number);
    })
    .required(),
  email: yup.string().email().nullable(),
  street: yup.string().required(),
  streetTwo: yup.string().nullable(),
  city: yup.string().nullable(),
  county: yup.string().nullable(),
  state: yup.string().required(),
  zipCode: yup.string().required(),
  race: yup.string().nullable() as any,
  ethnicity: yup.string().nullable() as any,
  gender: yup.string().nullable() as any,
  residentCongregateSetting: yup.bool().required() as any,
  employedInHealthcare: yup.bool().required() as any,
});

export type PersonErrors = Partial<Record<keyof PersonFormData, string>>;

export const allPersonErrors: Required<PersonErrors> = {
  firstName: "First name is required",
  middleName: "Middle name is incorrectly formatted",
  lastName: "Last name is required",
  lookupId: "Lookup ID is incorrectly formatted",
  role: "Role is incorrectly formatted",
  facilityId: "Facility is required",
  birthDate: "Date of birth is missing or incorrectly formatted",
  telephone: "Phone number is missing or invalid",
  email: "Email is missing or incorrectly formatted",
  street: "Street is missing",
  streetTwo: "Street Two is incorrectly formatted",
  zipCode: "Zip code is missing or incorrectly formatted",
  state: "State is missing or incorrectly formatted",
  city: "City is incorrectly formatted",
  county: "County is incorrectly formatted",
  race: "Race is incorrectly formatted",
  ethnicity: "Ethnicity is incorrectly formatted",
  gender: "Biological Sex is incorrectly formatted",
  residentCongregateSetting:
    "Resident in congregate care/living setting? is required",
  employedInHealthcare: "Work in Healthcare? is required",
};
