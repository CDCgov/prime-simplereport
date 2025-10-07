import { noCLIAValidationStates } from "../../config/constants";

export function stateRequiresCLIANumberValidation(state: string): boolean {
  return !noCLIAValidationStates.includes(state);
}

export function isValidCLIANumber(input: string, state: string): boolean {
  let cliaNumberValidator;
  if (state === "WA") {
    cliaNumberValidator = /^\d{2}[DZ]\d{7}$/;
  } else if (state === "CA") {
    cliaNumberValidator = /^\w{2}[D]\w{1}\d{6}$/;
  } else if (state === "NM" && input.substring(0, 3) === "32Z") {
    cliaNumberValidator = /^32Z\d{7}$/;
  } else if (state === "VT" && input.substring(0, 3) === "47Z") {
    cliaNumberValidator = /^47Z\d{7}$/;
  } else if (state === "IL" && input === "14DISBE123") {
    return true;
  } else if (state === "WY" && input === "12Z3456789") {
    return true;
  } else if (input.substring(0, 3) === "DOD") {
    cliaNumberValidator = /^DOD\d{7}$/;
  } else {
    cliaNumberValidator = /^\d{2}D\d{7}$/;
  }
  return cliaNumberValidator.test(input);
}
