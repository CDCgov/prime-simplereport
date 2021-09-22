import * as yup from "yup";
import { PhoneNumberUtil } from "google-libphonenumber";

import { liveJurisdictions } from "../../../config/constants";
import {
  isValidCLIANumber,
  stateRequiresCLIANumberValidation,
} from "../../utils/clia";
import { isEmptyString } from "../../utils";

import { DeviceSpecimenType } from "./FacilityForm";

const phoneUtil = PhoneNumberUtil.getInstance();

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFacilityFields = PartialBy<
  Facility,
  "id" | "email" | "streetTwo" | "city" | "orderingProvider"
>;

function orderingProviderIsRequired(
  this: yup.TestContext<Record<string, any>>,
  input = ""
): boolean {
  if (this?.options?.context?.orderingProviderIsRequired) {
    return !isEmptyString(input);
  }
  return true;
}

type RequiredProviderFields = Nullable<Partial<Provider>>;

const orderingProviderFormatError = (field: string) =>
  `Ordering provider ${field} is incorrectly formatted`;

const providerSchema: yup.SchemaOf<RequiredProviderFields> = yup.object({
  firstName: yup
    .string()
    .test(
      "ordering-provider-first-name",
      orderingProviderFormatError("first name"),
      orderingProviderIsRequired
    ),
  middleName: yup.string().nullable(),
  lastName: yup
    .string()
    .test(
      "ordering-provider-last-name",
      orderingProviderFormatError("last name"),
      orderingProviderIsRequired
    ),
  suffix: yup.string().nullable(),
  NPI: yup
    .string()
    .test(
      "ordering-provider-npi",
      orderingProviderFormatError("NPI"),
      orderingProviderIsRequired
    ),
  phone: yup
    .string()
    .test(
      "ordering-provider-phone",
      orderingProviderFormatError("phone"),
      orderingProviderIsRequired
    ),
  street: yup.string().nullable(),
  streetTwo: yup.string().nullable(),
  city: yup.string().nullable(),
  state: yup.string().nullable(),
  zipCode: yup.string().nullable(),
});

export const deviceSchema: yup.SchemaOf<DeviceSpecimenType> = yup.object({
  deviceType: yup.string().required(),
  specimenType: yup.string().required(),
});

export const facilitySchema: yup.SchemaOf<RequiredFacilityFields> = yup.object({
  name: yup.string().required("Facility name is missing"),
  cliaNumber: yup
    .string()
    .required("CLIA number should be 10 characters (##D#######)")
    .test(
      "facility-clia",
      ({ value }) => {
        if (value[2] === "Z" && value.length === 10) {
          return "Special Z CLIAs are only valid in WA";
        }
        return "CLIA number should be 10 characters (##D#######)";
      },
      (input, facility) => {
        if (!stateRequiresCLIANumberValidation(facility.parent.state)) {
          return true;
        }

        if (!input) {
          return false;
        }

        return isValidCLIANumber(input, facility.parent.state);
      }
    ),
  street: yup.string().required("Facility street is missing"),
  zipCode: yup.string().required("Facility zip code is missing"),
  deviceTypes: yup
    .array()
    .of(yup.string().required())
    .min(1, "There must be at least one device")
    .required("There must be at least one device"),
  deviceSpecimenTypes: yup.array().of(deviceSchema),
  defaultDevice: yup.mixed().test(function (input) {
    if (!input) {
      return this.createError({ message: "A default device must be selected" });
    }
    return true;
  }),
  orderingProvider: providerSchema.nullable(),
  phone: yup
    .string()
    .test(
      "facility-phone",
      "Facility phone number is missing or invalid",
      function (input) {
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
    )
    .required("Facility phone number is missing or invalid"),
  state: yup
    .string()
    .test("facility-state", "Facility state is missing", function (input) {
      if (!input) {
        return false;
      }

      return liveJurisdictions.includes(input);
    })
    .required("Facility state is missing"),
  id: yup.string(),
  email: yup.string().email("Email is incorrectly formatted").nullable(),
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
