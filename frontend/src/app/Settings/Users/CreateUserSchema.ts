import * as yup from "yup";

import { getValues } from "../../patients/personSchema";
import { Role } from "../../permissions";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  {
    value: "ENTRY_ONLY",
    label: "Entry only (conduct tests)",
  },
  {
    value: "USER",
    label: "Standard user (manage results and profiles)",
  },
  {
    value: "ADMIN",
    label: "Admin (full permissions)",
  },
];

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

export type CreateUserErrors = Record<keyof CreateUser, string>;

export const initCreateUserErrors = (): CreateUserErrors => ({
  firstName: "",
  lastName: "",
  email: "",
  role: "",
});

export const createUserSchema: yup.SchemaOf<CreateUser> = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup
    .string()
    .email("Email must be a valid email address")
    .required("Email is required"),
  role: yup
    .mixed()
    .oneOf(getValues(ROLE_OPTIONS), "Phone type is missing or invalid"),
});
