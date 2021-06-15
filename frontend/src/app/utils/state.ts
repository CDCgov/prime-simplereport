import {
  states,
  orderingProviderNotRequiredStates,
} from "../../config/constants";

interface States {
  [key: string]: string;
}

export function getStateNameFromCode(stateCode: keyof States): string {
  return (states as States)[stateCode];
}

export function requiresOrderProvider(state: string) {
  return !orderingProviderNotRequiredStates.includes(state);
}
