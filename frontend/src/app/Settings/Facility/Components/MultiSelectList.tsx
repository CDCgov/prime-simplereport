import React, { useCallback, useRef } from "react";
import { useMergeReducer, useOutsideClick } from "../../../utils/hooks";

export interface MultiSelectDropdownOption {
  value: string;
  label: string;
}

export interface DropdownProps {
  items: any[];
  setSelectedItem: (option: MultiSelectDropdownOption) => void;
  shouldShowSuggestions: boolean;
  queryString: string;
  multiSelect: boolean;
  dropdownRef: React.MutableRefObject<any>;
}

enum FocusMode {
  None = "none",
  Input = "input",
  Item = "item",
}

interface State {
  isOpen: boolean;
  focusedOption?: MultiSelectDropdownOption;
  focusMode: FocusMode;
  filter?: string;
  filteredOptions: MultiSelectDropdownOption[];
  inputValue: string;
}

interface Props {
  id: string;
  label: string;
  options: MultiSelectDropdownOption[];
  DropdownComponent: (props: DropdownProps) => JSX.Element;
  getItems: (queryString: string) => any[];
  onOptionSelect?: (option: MultiSelectDropdownOption) => void;
  placeholder?: string;
  disabled?: boolean;
}

const isPartialMatch = (
  needle: string
): ((event: MultiSelectDropdownOption) => boolean) => {
  return (option: MultiSelectDropdownOption): boolean =>
    option.label.toLowerCase().includes(needle.toLowerCase());
};

const createInitialState = (options: MultiSelectDropdownOption[]): State => {
  return {
    isOpen: false,
    focusedOption: undefined,
    focusMode: FocusMode.None,
    filteredOptions: options,
    filter: undefined,
    inputValue: "",
  };
};

const MultiSelectList = (props: Props) => {
  const { options, DropdownComponent } = props;
  const [state, dispatch] = useMergeReducer<State>(options, createInitialState);

  const dropdownRef = useRef(null);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredOptions = options.filter(isPartialMatch(value));

    dispatch({
      inputValue: value,
      filter: value,
      isOpen: true,
      filteredOptions,
    });
  };

  const onInputClick = () => {
    dispatch({
      isOpen: true,
      focusMode: FocusMode.Input,
      focusedOption: undefined,
      filteredOptions: options,
    });
  };

  const onSelectOption = useCallback(
    (option: MultiSelectDropdownOption) => {
      if (props.onOptionSelect) props.onOptionSelect(option);

      dispatch({
        isOpen: false,
        focusMode: FocusMode.Input,
        inputValue: "",
        filter: undefined,
        filteredOptions: options.filter(isPartialMatch("")),
      });
    },
    [dispatch, props.onOptionSelect, options]
  );

  const openList = () => {
    dispatch({
      isOpen: true,
      focusMode: FocusMode.Input,
      focusedOption: undefined,
      filteredOptions: options,
    });
  };

  const closeList = () => {
    let filteredOptions = options;
    let inputValue = state.inputValue;

    if (state.isOpen && state.filteredOptions.length === 0) {
      filteredOptions = options.filter(isPartialMatch(""));
      inputValue = "";
    }

    dispatch({
      isOpen: false,
      focusMode: FocusMode.Input,
      focusedOption: undefined,
      filteredOptions,
      inputValue,
    });
  };

  const onToggleClick = () => {
    if (state.isOpen) closeList();
    else openList();
  };

  const onOutsideClick = useCallback(onToggleClick, [state.isOpen]);
  useOutsideClick(dropdownRef, onOutsideClick);

  return (
    <div className="usa-form-group">
      <label className="usa-label" htmlFor={props.id}>
        {props.label}
      </label>

      <div className="usa-combo-box usa-combo-box--pristine maxw-none">
        <input
          id={props.id}
          type="text"
          className="usa-combo-box__input"
          autoCapitalize="off"
          autoComplete="off"
          role="combobox"
          placeholder={props.placeholder}
          value={state.inputValue}
          disabled={props.disabled}
          onChange={onInputChange}
          onClick={onInputClick}
        />

        <span className="usa-combo-box__input-button-separator">&nbsp;</span>
        <span className="usa-combo-box__toggle-list__wrapper" tabIndex={-1}>
          <button
            type="button"
            className="usa-combo-box__toggle-list"
            tabIndex={-1}
            aria-hidden={"true"}
            onClick={onToggleClick}
            disabled={props.disabled}
          >
            &nbsp;
          </button>
        </span>
        <DropdownComponent
          items={props.getItems(state.inputValue)}
          setSelectedItem={onSelectOption}
          shouldShowSuggestions={state.isOpen}
          queryString={state.inputValue}
          multiSelect={true}
          dropdownRef={dropdownRef}
        />
      </div>
    </div>
  );
};

export default MultiSelectList;
