import * as yup from "yup";
import { PhoneNumberUtil } from "google-libphonenumber";

import { liveJurisdictions } from "../../../config/constants";
import {
  isValidCLIANumber,
  stateRequiresCLIANumberValidation,
} from "../../utils/clia";

const phoneUtil = PhoneNumberUtil.getInstance();

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFacilityFields = PartialBy<
  Facility,
  "id" | "email" | "streetTwo" | "city" | "orderingProvider"
>;

type RequiredProviderFields = Nullable<Partial<Provider>>;

const providerSchema: yup.SchemaOf<RequiredProviderFields> = yup.object({
  firstName: yup.string().nullable(),
  middleName: yup.string().nullable(),
  lastName: yup.string().nullable(),
  suffix: yup.string().nullable(),
  NPI: yup.string().nullable(),
  phone: yup.string().nullable(),
  street: yup.string().nullable(),
  streetTwo: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  zipCode: yup.string().nullable(),
});

export const facilitySchema: yup.SchemaOf<RequiredFacilityFields> = yup.object({
  name: yup.string().required(),
  cliaNumber: yup
    .string()
    .required()
    .test((input, facility) => {
      if (!stateRequiresCLIANumberValidation(facility.parent.state)) {
        return true;
      }

      if (!input) {
        return false;
      }

      return isValidCLIANumber(input);
    }),
  street: yup.string().required(),
  zipCode: yup.string().required(),
  deviceTypes: yup.array().of(yup.string().required()).min(1).required(),
  defaultDevice: yup.string().required(),
  orderingProvider: providerSchema.nullable(),
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
  state: yup
    .string()
    .test(function (input) {
      if (!input) {
        return false;
      }

      return liveJurisdictions.includes(input);
    })
    .required(),
  id: yup.string(),
  email: yup.string().email().nullable(),
  streetTwo: yup.string().nullable(),
  city: yup.string().nullable(),
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

export type FacilityErrors = Partial<
  Record<FacilityErrorKeys, React.ReactNode>
>;

const orderingProviderFormatError = (field: string) =>
  `"Ordering provider ${field} is incorrectly formatted"`;

export const allFacilityErrors: Required<FacilityErrors> = {
  id: "ID is missing",
  email: "Email is incorrectly formatted",
  city: "City is incorrectly formatted",
  cliaNumber: "CLIA number should be 10 characters (##D#######)",
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
