import { Role } from "../../permissions";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  {
    value: "ENTRY_ONLY",
    label: "Testing only (report tests)",
  },
  {
    value: "USER",
    label:
      "Standard user (report tests, manage test results and patient profiles)",
  },
  {
    value: "ADMIN",
    label: "Admin (full access)",
  },
];

export interface CreateUser {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  facilityIds: string[];
}
