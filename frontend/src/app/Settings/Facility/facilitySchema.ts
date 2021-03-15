import * as yup from "yup";
import { PhoneNumberUtil } from "google-libphonenumber";

const phoneUtil = PhoneNumberUtil.getInstance();

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFacilityFields = PartialBy<
  Facility,
  "id" | "email" | "streetTwo" | "city" | "orderingProvider"
>;

type RequiredProviderFields = Partial<Provider>;

const providerSchema: yup.SchemaOf<RequiredProviderFields> = yup.object({
  firstName: yup.string(),
  middleName: yup.string(),
  lastName: yup.string(),
  suffix: yup.string(),
  NPI: yup.string(),
  phone: yup.string(),
  street: yup.string(),
  streetTwo: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zipCode: yup.string(),
});

export const facilitySchema: yup.SchemaOf<RequiredFacilityFields> = yup.object({
  name: yup.string().required(),
  cliaNumber: yup.string().required(),
  street: yup.string().required(),
  zipCode: yup.string().required(),
  deviceTypes: yup.array().of(yup.string().required()).min(1).required(),
  defaultDevice: yup.string().required(),
  orderingProvider: providerSchema.required(),
  phone: yup
    .string()
    .test(function (input) {
      if (!input) {
        return false;
      }
      const number = phoneUtil.parseAndKeepRawInput(input, "US");
      return phoneUtil.isValidNumber(number);
    })
    .required(),
  state: yup.string().required(),
  id: yup.string(),
  email: yup.string().email(),
  streetTwo: yup.string(),
  city: yup.string(),
});

type FacilityErrorKeys =
  | keyof Facility
  | "orderingProvider.firstName"
  | "orderingProvider.middleName"
  | "orderingProvider.lastName"
  | "orderingProvider.suffix"
  | "orderingProvider.NPI"
  | "orderingProvider.phone"
  | "orderingProvider.street"
  | "orderingProvider.streetTwo"
  | "orderingProvider.city"
  | "orderingProvider.state"
  | "orderingProvider.zipCode";

export type FacilityErrors = Partial<Record<FacilityErrorKeys, string>>;

const orderingProviderFormatError = (field: string) =>
  `"Ordering provider ${field} is incorrectly formatted"`;

export const allFacilityErrors: Required<FacilityErrors> = {
  id: "ID is missing",
  email: "Email is missing or incorrectly formatted",
  city: "City is incorrectly formatted",
  cliaNumber: "CLIA number is missing",
  defaultDevice: "A default device must be selected",
  deviceTypes: "There must be at least one device",
  name: "Facility name is missing",
  phone: "Facility phone number is missing or invalid",
  street: "Facility street is missing",
  streetTwo: "Facility street is incorrectly formatted",
  zipCode: "Facility zip code is missing",
  state: "Facility state is missing",
  orderingProvider: "Ordering provider is incorrectly formatted",
  "orderingProvider.NPI": orderingProviderFormatError("NPI"),
  "orderingProvider.city": orderingProviderFormatError("city"),
  "orderingProvider.firstName": orderingProviderFormatError("first name"),
  "orderingProvider.lastName": orderingProviderFormatError("last name"),
  "orderingProvider.middleName": orderingProviderFormatError("middle name"),
  "orderingProvider.phone": orderingProviderFormatError("phone"),
  "orderingProvider.state": orderingProviderFormatError("state"),
  "orderingProvider.street": orderingProviderFormatError("street"),
  "orderingProvider.streetTwo": orderingProviderFormatError("street"),
  "orderingProvider.suffix": orderingProviderFormatError("suffix"),
  "orderingProvider.zipCode": orderingProviderFormatError("zip code"),
};
