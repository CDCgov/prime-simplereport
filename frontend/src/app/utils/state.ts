import { states } from "../../config/constants";

interface States {
  [key: string]: string;
}

export function getStateNameFromCode(stateCode: keyof States): string {
  return (states as States)[stateCode];
}
