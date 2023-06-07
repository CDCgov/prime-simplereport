import { Role } from "../../permissions";
import { Maybe, UserPermission } from "../../../generated/graphql";

import { UserFacilitySetting } from "./ManageUsersContainer";

export const ROLE_OPTIONS: { value: Role; label: string }[] = [
  {
    value: "ENTRY_ONLY",
    label: "Testing only (conduct tests)",
  },
  {
    value: "USER",
    label:
      "Standard user (conduct tests, manage test results and patient profiles)",
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
  organization?: Maybe<{
    testingFacility: UserFacilitySetting[];
  }>;
  permissions: UserPermission[];
}
