import { OktaUserStatus } from "../../utils/user";

import { SettingsUser } from "./ManageUsersContainer";

export const isUserActive = (user: SettingsUser) =>
  user.status !== OktaUserStatus.SUSPENDED &&
  user.status !== OktaUserStatus.PROVISIONED &&
  user.status !== OktaUserStatus.UPDATING &&
  !user.isDeleted;
export const isUserSelf = (
  user: { id: string },
  loggedInUser: { id: string }
) => user.id === loggedInUser.id;
