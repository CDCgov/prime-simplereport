import { states, noCLIAValidationStates } from "../../config/constants";

export function stateRequiresCLIANumberValidation(
  state: keyof typeof states
): boolean {
  return !noCLIAValidationStates.includes(state);
}

export function isValidCLIANumber(input: string, state: string): boolean {
  let cliaNumberValidator;
  if (state === "WA") {
    cliaNumberValidator = /^\d{2}[DZ]\d{7}$/;
  } else {
    cliaNumberValidator = /^\d{2}D\d{7}$/;
  }

  return cliaNumberValidator.test(input);
}
