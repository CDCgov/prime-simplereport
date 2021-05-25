import { states, noCLIAValidationStates } from "../../config/constants";

export function stateRequiresCLIANumberValidation(
  state: keyof typeof states
): boolean {
  return !noCLIAValidationStates.includes(state);
}

export function isValidCLIANumber(input: string): boolean {
  const cliaNumberValidator = /^\d{2}D\d{7}$/;

  return cliaNumberValidator.test(input);
}
