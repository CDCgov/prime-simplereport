type OptionalString = string | undefined | null;

type RequiredUserFields = {
  firstName: OptionalString;
  middleName: OptionalString;
  lastName: OptionalString;
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
