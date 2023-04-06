import * as yup from "yup";

type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type RequiredAdminFields = PartialBy<FacilityAdmin, "middleName" | "suffix">;

export const facilityAdminSchema: yup.SchemaOf<RequiredAdminFields> =
  yup.object({
    firstName: yup.string().required("First name is missing"),
    middleName: yup.string().nullable(),
    lastName: yup.string().required("Last name is missing"),
    suffix: yup.string().nullable(),
    email: yup
      .string()
      .email("Email is incorrectly formatted")
      .required("Email is incorrectly formatted"),
  });

type FacilityAdminErrorKeys = keyof FacilityAdmin;

export type FacilityAdminErrors = Partial<
  Record<FacilityAdminErrorKeys, string>
>;
