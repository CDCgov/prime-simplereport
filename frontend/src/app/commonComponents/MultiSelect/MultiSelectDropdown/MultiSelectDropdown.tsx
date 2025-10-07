import React, {
  KeyboardEvent,
  FocusEvent,
  useEffect,
  useRef,
  Ref,
  useCallback,
} from "react";
import classnames from "classnames";

import { useOutsideClick } from "../../../utils/hooks";

import {
  ActionTypes,
  Action,
  State,
  useMultiSelectDropdown,
} from "./useMultiSelectDropdown";

/*

  This component is Based on ComboBox from the TrussWorks react-uswds library: https://github.com/trussworks/react-uswds
  It is licensed under Apache 2.0: https://github.com/trussworks/react-uswds/blob/main/LICENSE

*/

export interface MultiSelectDropdownOption {
  value: string;
  label: string;
}

enum Direction {
  Previous = -1,
  Next = 1,
}

export enum FocusMode {
  None,
  Input,
  Item,
}
export interface RegistrationProps {
  inputTextRef?: Ref<any>;
  setFocus: Function;
}

interface MultiSelectDropDownProps {
  id: string;
  name: string;
  className?: string;
  options: MultiSelectDropdownOption[];
  disabled?: boolean;
  onChange: (option: MultiSelectDropdownOption) => void;
  noResults?: string;
  inputProps?: JSX.IntrinsicElements["input"];
  placeholder?: string;
  ariaInvalid?: boolean;
  registrationProps?: RegistrationProps;
  DropdownComponent?: (props: any) => JSX.Element;
  getFilteredDropdownComponentItems?: (query: string) => any[];
}

interface InputProps {
  focused: boolean;
  registrationProps?: RegistrationProps;
}

const MultiSelectInput = ({
  registrationProps,
  focused,
  ...inputProps
}: InputProps & JSX.IntrinsicElements["input"]): React.ReactElement => {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (focused && registrationProps?.inputTextRef) {
      registrationProps.setFocus();
    } else if (focused && inputRef.current) {
      inputRef.current.focus();
    }
  });

  return (
    <input
      type="text"
      className="usa-combo-box__input"
      data-testid="multi-select-input"
      {...inputProps}
      autoCapitalize="off"
      autoComplete="off"
      ref={
        registrationProps?.inputTextRef
          ? registrationProps.inputTextRef
          : inputRef
      }
    />
  );
};

const focusSibling = (
  dispatch: React.Dispatch<Action>,
  state: State,
  change: Direction
): void => {
  const currentIndex = state.focusedOption
    ? state.filteredOptions.indexOf(state.focusedOption)
    : -1;
  const firstOption = state.filteredOptions[0];
  const lastOption = state.filteredOptions[state.filteredOptions.length - 1];

  if (currentIndex === -1) {
    dispatch({ type: ActionTypes.FOCUS_OPTION, option: firstOption });
  } else {
    const newIndex = currentIndex + change;
    if (newIndex < 0) {
      dispatch({ type: ActionTypes.FOCUS_OPTION, option: firstOption });
    } else if (newIndex >= state.filteredOptions.length) {
      dispatch({ type: ActionTypes.FOCUS_OPTION, option: lastOption });
    } else {
      const newOption = state.filteredOptions[newIndex];
      dispatch({ type: ActionTypes.FOCUS_OPTION, option: newOption });
    }
  }
};

const handleInputKeyDown =
  (
    dispatch: React.Dispatch<Action>,
    state: State,
    selectOption: (option: MultiSelectDropdownOption) => void
  ) =>
  (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      dispatch({ type: ActionTypes.CLOSE_LIST });
    } else if (["ArrowDown", "Down"].includes(event.key)) {
      event.preventDefault();
      dispatch({
        type: ActionTypes.FOCUS_OPTION,
        option: state.filteredOptions[0],
      });
    } else if (event.key === "Tab") {
      // Clear button is not visible in this case so manually handle focus
      if (state.isOpen) {
        // If there are filtered options, prevent default for basic dropdown body
        // If there are "No Results Found", tab over to prevent a keyboard trap
        if (!state.isExtended) {
          if (state.filteredOptions.length > 0) {
            event.preventDefault();
            dispatch({
              type: ActionTypes.FOCUS_OPTION,
              option: state.filteredOptions[0],
            });
          } else {
            dispatch({
              type: ActionTypes.BLUR,
            });
          }
        }
      }

      if (!state.isOpen) {
        dispatch({
          type: ActionTypes.BLUR,
        });
      }
    } else if (event.key === "Enter") {
      event.preventDefault();
      const selectedOptions = state.filteredOptions.find(
        (option) =>
          option.label.toLowerCase() === state.inputValue.toLowerCase()
      );
      if (selectedOptions) {
        selectOption(selectedOptions);
      } else {
        dispatch({ type: ActionTypes.CLEAR });
      }
    }
  };

const handleListItemKeyDown =
  (
    dispatch: React.Dispatch<Action>,
    state: State,
    selectOption: (option: MultiSelectDropdownOption) => void
  ) =>
  (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      dispatch({ type: ActionTypes.CLOSE_LIST });
    } else if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
      if (state.focusedOption) {
        selectOption(state.focusedOption);
      }
    } else if (event.key === "ArrowDown" || event.key === "Down") {
      event.preventDefault();
      focusSibling(dispatch, state, Direction.Next);
    } else if (event.key === "ArrowUp" || event.key === "Up") {
      event.preventDefault();
      focusSibling(dispatch, state, Direction.Previous);
    }
  };

export const MultiSelectDropdown = ({
  id,
  name,
  className,
  options,
  disabled,
  onChange,
  noResults,
  inputProps,
  placeholder,
  ariaInvalid,
  registrationProps,
  DropdownComponent,
  getFilteredDropdownComponentItems,
}: MultiSelectDropDownProps): React.ReactElement => {
  const isDisabled = !!disabled;

  const initialState: State = {
    isOpen: false,
    focusedOption: undefined,
    focusMode: FocusMode.None,
    filteredOptions: options,
    filter: undefined,
    inputValue: "",
    isExtended: !!DropdownComponent,
  };

  const [state, dispatch] = useMultiSelectDropdown(initialState, options);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLLIElement>(null);

  const selectOption = (option: MultiSelectDropdownOption) => {
    onChange(option);
    dispatch({
      type: ActionTypes.SELECT_OPTION,
    });
  };

  useEffect(() => {
    if (
      state.focusMode === FocusMode.Item &&
      state.focusedOption &&
      itemRef.current
    ) {
      itemRef.current.focus();
    }
  }, [state.focusMode, state.focusedOption]);

  // If the focused element (activeElement) is outside of the combo box,
  // make sure the focusMode is BLUR
  useEffect(() => {
    if (state.focusMode !== FocusMode.None) {
      if (!containerRef.current?.contains(window.document.activeElement)) {
        dispatch({
          type: ActionTypes.BLUR,
        });
      }
    }
  });

  const handleInputBlur = (event: FocusEvent<HTMLInputElement>): void => {
    const { relatedTarget: newTarget } = event;
    const newTargetIsOutside =
      !newTarget ||
      (newTarget instanceof Node && !containerRef.current?.contains(newTarget));

    if (newTargetIsOutside) {
      dispatch({ type: ActionTypes.BLUR });
    }
  };

  const handleListItemBlur = (event: FocusEvent<HTMLLIElement>): void => {
    const { relatedTarget: newTarget } = event;

    if (
      !newTarget ||
      (newTarget instanceof Node && !containerRef.current?.contains(newTarget))
    ) {
      dispatch({ type: ActionTypes.BLUR });
    }
  };

  const containerClasses = classnames(
    "usa-combo-box usa-combo-box--pristine",
    className
  );
  const listID = `multi-select-${name}-list`;
  const dropDownRef = useRef(null);
  const hideOnOutsideClick = useCallback(() => {
    dispatch({
      type: state.isOpen ? ActionTypes.CLOSE_LIST : ActionTypes.OPEN_LIST,
    });
  }, [dispatch, state.isOpen]);

  useOutsideClick(dropDownRef, hideOnOutsideClick);

  return (
    <div
      data-testid="multi-select"
      className={containerClasses}
      id={id}
      ref={containerRef}
    >
      <MultiSelectInput
        onChange={(e): void =>
          dispatch({ type: ActionTypes.UPDATE_FILTER, value: e.target.value })
        }
        onClick={(): void => dispatch({ type: ActionTypes.OPEN_LIST })}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown(dispatch, state, selectOption)}
        value={state.inputValue}
        focused={state.focusMode === FocusMode.Input}
        role="combobox"
        aria-label={placeholder}
        aria-labelledby={`label-for-${id}`}
        aria-owns={listID}
        aria-controls={listID}
        aria-expanded={state.isOpen}
        aria-invalid={ariaInvalid}
        disabled={isDisabled}
        placeholder={placeholder}
        registrationProps={registrationProps}
        {...inputProps}
      />
      <span className="usa-combo-box__input-button-separator">&nbsp;</span>
      <span className="usa-combo-box__toggle-list__wrapper" tabIndex={-1}>
        <button
          data-testid="multi-select-toggle"
          type="button"
          className="usa-combo-box__toggle-list"
          tabIndex={-1}
          aria-hidden={"true"}
          onClick={(): void =>
            dispatch({
              type: state.isOpen
                ? ActionTypes.CLOSE_LIST
                : ActionTypes.OPEN_LIST,
            })
          }
          disabled={isDisabled}
        >
          &nbsp;
        </button>
      </span>
      {DropdownComponent && getFilteredDropdownComponentItems ? (
        <>
          <DropdownComponent
            items={getFilteredDropdownComponentItems(state.inputValue)}
            setSelectedItem={selectOption}
            shouldShowSuggestions={state.isOpen}
            queryString={state.inputValue}
            multiSelect={true}
            dropDownRef={dropDownRef}
          />
        </>
      ) : (
        <ul
          data-testid="multi-select-option-list"
          tabIndex={-1}
          id={listID}
          className="usa-combo-box__list"
          role="listbox"
          hidden={!state.isOpen}
        >
          {state.filteredOptions.map((option, index) => {
            const focused = option === state.focusedOption;
            const itemClasses = classnames("usa-combo-box__list-option", {
              "usa-combo-box__list-option--focused": focused,
            });

            return (
              <li
                ref={focused ? itemRef : null}
                value={option.value}
                key={option.value}
                className={itemClasses}
                tabIndex={focused ? 0 : -1}
                role="option"
                aria-selected={focused}
                aria-setsize={64}
                aria-posinset={index + 1}
                id={listID + `--option-${index}`}
                onKeyDown={handleListItemKeyDown(dispatch, state, selectOption)}
                onBlur={handleListItemBlur}
                data-testid={`multi-select-option-${option.value}`}
                onMouseMove={(): void =>
                  dispatch({ type: ActionTypes.FOCUS_OPTION, option: option })
                }
                onClick={(): void => {
                  selectOption(option);
                }}
              >
                {option.label}
              </li>
            );
          })}
          {state.filteredOptions.length === 0 && (
            <li className="usa-combo-box__list-option--no-results">
              {noResults || "No results found"}
            </li>
          )}
        </ul>
      )}
      <div className="usa-combo-box__status usa-sr-only" role="status"></div>
    </div>
  );
};

export default MultiSelectDropdown;
