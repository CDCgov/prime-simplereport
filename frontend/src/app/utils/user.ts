type OptionalString = string | undefined | null;

type RequiredUserFields = {
  firstName?: OptionalString;
  middleName?: OptionalString;
  lastName?: OptionalString;
  suffix?: OptionalString;
};

export const formatFullName = <T extends RequiredUserFields>(user: T) => {
  // this trick will not include spaces if middlename is blank.
  let result = user.firstName;
  result += user.middleName ? ` ${user.middleName}` : "";
  result += user.lastName ? ` ${user.lastName}` : "";
  result += user.suffix ? `, ${user.suffix}` : "";
  return result;
};

export const formatRole = (role: string) => {
  let result = "";
  role = role.toLowerCase();
  if (role.includes("admin")) {
    result = "Admin";
  } else if (role.includes("standard")) {
    result = "Standard user";
  } else {
    result = "Testing only";
  }
  return result;
};

export enum OktaUserStatus {
  ACTIVE = "ACTIVE",
  PROVISIONED = "PROVISIONED",
  SUSPENDED = "SUSPENDED",
}
