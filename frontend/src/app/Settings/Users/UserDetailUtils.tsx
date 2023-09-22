import { OktaUserStatus } from "../../utils/user";
import { User } from "../../../generated/graphql";

import { SettingsUser } from "./ManageUsersContainer";

export const isUserActive = (user: SettingsUser | User) =>
  user.status !== OktaUserStatus.SUSPENDED &&
  user.status !== OktaUserStatus.PROVISIONED &&
  !user.isDeleted;
export const isUserSelf = (
  user: { id: string },
  loggedInUser: { id: string }
) => user.id === loggedInUser.id;
