import * as yup from "yup";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFacilityFields = PartialBy<
  Facility,
  "id" | "email" | "streetTwo" | "city"
>;

type RequiredProviderFields = PartialBy<
  Provider,
  "middleName" | "suffix" | "phone" | "streetTwo" | "city"
>;

const providerSchema: yup.SchemaOf<RequiredProviderFields> = yup.object({
  firstName: yup.string().required("Ordering provider first name is missing"),
  middleName: yup.string(),
  lastName: yup.string().required("Ordering provider last name is missing"),
  suffix: yup.string(),
  NPI: yup.string().required("Ordering provider NPI is missing"),
  phone: yup.string(),
  street: yup.string().required("Ordering provider street is missing"),
  streetTwo: yup.string(),
  city: yup.string(),
  state: yup.string().required("Ordering provider state is missing"),
  zipCode: yup.string().required("Ordering provider zip code is missing"),
});

export const facilitySchema: yup.SchemaOf<RequiredFacilityFields> = yup.object({
  name: yup.string().required("Facility name is missing"),
  cliaNumber: yup.string().required("Facility CLIA number is missing"),
  street: yup.string().required("Facility street is missing"),
  zipCode: yup.string().required("Facility zip code is missing"),
  deviceTypes: yup
    .array()
    .of(yup.string().required())
    .min(1)
    .required("Facility must have at least one device"),
  defaultDevice: yup.string().required("Facility must have a default device"),
  orderingProvider: providerSchema.required(),
  phone: yup.string().required("Facility phone number is missing"),
  state: yup.string().required("Facility state is missing"),
  id: yup.string(),
  email: yup.string(),
  streetTwo: yup.string(),
  city: yup.string(),
});
