export const emailIsValid = (emailAddress = "") => {
  return emailRegex.test(String(emailAddress).toLowerCase());
};

export const emailRegex =
  /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
