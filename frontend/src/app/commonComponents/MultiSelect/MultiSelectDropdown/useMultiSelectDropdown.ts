import React, { useReducer } from "react";

import type { MultiSelectDropdownOption } from "./MultiSelectDropdown";
import { FocusMode } from "./MultiSelectDropdown";

export enum ActionTypes {
  SELECT_OPTION,
  CLEAR,
  OPEN_LIST,
  CLOSE_LIST,
  FOCUS_OPTION,
  UPDATE_FILTER,
  BLUR,
}

export type Action =
  | {
      type: ActionTypes.SELECT_OPTION;
    }
  | {
      type: ActionTypes.CLEAR;
    }
  | {
      type: ActionTypes.OPEN_LIST;
    }
  | {
      type: ActionTypes.CLOSE_LIST;
    }
  | {
      type: ActionTypes.FOCUS_OPTION;
      option: MultiSelectDropdownOption;
    }
  | {
      type: ActionTypes.UPDATE_FILTER;
      value: string;
    }
  | {
      type: ActionTypes.BLUR;
    };
export interface State {
  isOpen: boolean;
  focusedOption?: MultiSelectDropdownOption;
  focusMode: FocusMode;
  filter?: string;
  filteredOptions: MultiSelectDropdownOption[];
  inputValue: string;
}

export const useMultiSelectDropdown = (
  initialState: State,
  optionsList: MultiSelectDropdownOption[]
): [State, React.Dispatch<Action>] => {
  const isPartialMatch = (
    needle: string
  ): ((event: MultiSelectDropdownOption) => boolean) => {
    return (option: MultiSelectDropdownOption): boolean =>
      option.label.toLowerCase().includes(needle.toLowerCase());
  };

  function reducer(state: State, action: Action): State {
    switch (action.type) {
      case ActionTypes.SELECT_OPTION:
        return {
          ...state,
          isOpen: false,
          focusMode: FocusMode.Input,
          inputValue: "",
          filter: undefined,
          filteredOptions: optionsList.filter(isPartialMatch("")),
        };
      case ActionTypes.UPDATE_FILTER: {
        return {
          ...state,
          isOpen: true,
          filter: action.value,
          filteredOptions: optionsList.filter(isPartialMatch(action.value)),
          inputValue: action.value,
        };
      }
      case ActionTypes.OPEN_LIST:
        return {
          ...state,
          isOpen: true,
          focusMode: FocusMode.Input,
          focusedOption: undefined,
          filteredOptions: optionsList,
        };
      case ActionTypes.CLOSE_LIST: {
        const newState = {
          ...state,
          isOpen: false,
          focusMode: FocusMode.Input,
          focusedOption: undefined,
        };

        if (state.filteredOptions.length === 0) {
          newState.filteredOptions = optionsList.filter(isPartialMatch(""));
          newState.inputValue = "";
        }

        return newState;
      }

      case ActionTypes.FOCUS_OPTION:
        return {
          ...state,
          isOpen: true,
          focusedOption: action.option,
          focusMode: FocusMode.Item,
        };
      case ActionTypes.CLEAR:
        return {
          ...state,
          inputValue: "",
          isOpen: false,
          focusMode: FocusMode.Input,
          filter: undefined,
          filteredOptions: optionsList.filter(isPartialMatch("")),
        };
      case ActionTypes.BLUR: {
        const newState = {
          ...state,
          isOpen: false,
          inputValue: "",
          focusMode: FocusMode.None,
          focusedOption: undefined,
        };

        if (state.filteredOptions.length === 0) {
          newState.filteredOptions = optionsList.filter(isPartialMatch(""));
        }

        return newState;
      }
      default:
        throw new Error();
    }
  }

  return useReducer(reducer, initialState);
};
