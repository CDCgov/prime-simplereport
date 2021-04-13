import * as yup from "yup";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type RequiredAdminFields = PartialBy<FacilityAdmin, "middleName" | "suffix">;

export const facilityAdminSchema: yup.SchemaOf<RequiredAdminFields> = yup.object(
  {
    firstName: yup.string().required(),
    middleName: yup.string().nullable(),
    lastName: yup.string().required(),
    suffix: yup.string().nullable(),
    email: yup.string().email().required(),
  }
);

type FacilityAdminErrorKeys = keyof FacilityAdmin;

export type FacilityAdminErrors = Partial<
  Record<FacilityAdminErrorKeys, string>
>;

export const allFacilityAdminErrors: Required<FacilityAdminErrors> = {
  firstName: "First name is missing",
  middleName: "Middle name is missing",
  lastName: "Last name is missing",
  suffix: "Suffix is missing",
  email: "Email is incorrectly formatted",
};
