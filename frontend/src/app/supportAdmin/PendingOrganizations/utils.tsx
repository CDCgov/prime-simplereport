import * as yup from "yup";

import { phoneNumberIsValid } from "../../patients/personSchema";

export interface PendingOrganizationFormValues {
  name: string;
  adminName: string | undefined;
  adminEmail: string | undefined;
  adminPhone: string | undefined;
}

const phoneNumberIsValidOrEmpty = (input: any) =>
  input === "" || phoneNumberIsValid(input);

export const pendingOrganizationSchema: yup.SchemaOf<PendingOrganizationFormValues> = yup
  .object()
  .shape({
    name: yup.string().required("Organization name is required"),
    adminName: yup.string(),
    adminEmail: yup.string().email("A valid email address is required"),
    adminPhone: yup
      .mixed()
      .test("", "A valid phone number is required", phoneNumberIsValidOrEmpty),
  });
