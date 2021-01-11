export const formatFullName = (user: User) => {
  // this trick will not include spaces if middlename is blank.
  let result = user.firstName;
  result += user.middleName ? ` ${user.middleName}` : "";
  result += user.lastName ? ` ${user.lastName}` : "";
  result += user.suffix ? `, ${user.suffix}` : "";
  return result;
};
