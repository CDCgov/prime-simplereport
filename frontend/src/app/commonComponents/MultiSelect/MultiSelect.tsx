import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";

import Required from "../Required";
import Optional from "../Optional";
import Button from "../Button/Button";

import MultiSelectDropdown, {
  MultiSelectDropdownOption,
  RegistrationProps,
} from "./MultiSelectDropdown/MultiSelectDropdown";

import "./MultiSelect.scss";

export type MultiSelectProps = {
  name: string;
  label: React.ReactNode;
  labelSrOnly?: boolean;
  required?: boolean;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
  ariaDescribedBy?: string;
  hintText?: string | React.ReactNode;
  hintTextClassName?: string;
  onChange: (selectedItems: string[]) => void;
  labelClassName?: string;
  options: MultiSelectDropdownOption[];
  className?: string;
  dropdownClassName?: string;
  initialSelectedValues?: string[];
  disabled?: boolean;
  inputProps?: JSX.IntrinsicElements["input"];
  placeholder?: string;
  registrationProps?: RegistrationProps;
  DropdownComponent?: (props: any) => JSX.Element;
  getFilteredDropdownComponentItems?: (inputValue: string) => any[];
};

type PillProps = {
  option: MultiSelectDropdownOption;
  onDelete: (option: MultiSelectDropdownOption) => void;
};

const Pill = (props: PillProps) => (
  <div className="pill">
    {props.option.label}
    <Button
      className="close-button usa-button--unstyled margin-top-0"
      onClick={() => props.onDelete(props.option)}
    >
      <FontAwesomeIcon
        aria-hidden={false}
        fontSize={24}
        icon={"times"}
        aria-label={`Delete ${props.option.label}`}
      />
    </Button>
  </div>
);

export const MultiSelect = ({
  name,
  label,
  labelSrOnly,
  errorMessage,
  className,
  required,
  validationStatus,
  ariaDescribedBy,
  hintText,
  hintTextClassName,
  onChange,
  labelClassName,
  dropdownClassName,
  options,
  disabled,
  initialSelectedValues,
  placeholder,
  registrationProps,
  DropdownComponent,
  getFilteredDropdownComponentItems,
}: MultiSelectProps): React.ReactElement => {
  const isDisabled = !!disabled;

  const getInitialOptions = (options: MultiSelectDropdownOption[]) => {
    const alreadySelected = initialSelectedValues || [];

    return options.filter((option) => {
      return !alreadySelected.includes(option.value);
    });
  };

  const getSortedOptions = (options: MultiSelectDropdownOption[]) => {
    const sortedOptions = _.orderBy(options, ["label"], ["asc"]);
    return _.uniqBy(sortedOptions, "value");
  };

  const [availableOptions, setAvailableOptions] = useState<
    MultiSelectDropdownOption[]
  >(getSortedOptions(getInitialOptions(options)));

  const [selectedItems, setSelectedItems] = useState<string[] | undefined>(
    initialSelectedValues
  );

  const onItemSelected = (option: MultiSelectDropdownOption) => {
    const newSelectedItems = selectedItems
      ? [...selectedItems, option.value]
      : [option.value];
    setSelectedItems(Array.from(new Set(newSelectedItems)));
    setAvailableOptions(
      availableOptions.filter((_option) => _option.value !== option.value)
    );
  };

  const onItemAdded = (option: any) => {
    const newSelectedItems = selectedItems
      ? [...selectedItems, option.internalId]
      : [option.internalId];
    setSelectedItems(Array.from(new Set(newSelectedItems)));
    setAvailableOptions(
      availableOptions.filter((_option) => _option.value !== option.internalId)
    );
  };

  const onItemUnSelected = (option: MultiSelectDropdownOption) => {
    const selectedItemsSet = new Set(selectedItems);
    selectedItemsSet.delete(option.value);
    setSelectedItems(Array.from(selectedItemsSet));

    const sortedOptions = getSortedOptions([...availableOptions, option]);
    setAvailableOptions(sortedOptions);
  };

  useEffect(() => {
    if (selectedItems) {
      onChange(selectedItems);
    }
    // adding onChange to dependency list will cause an infinite loop of state updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

  const getLabel = (id: string) => (
    <label
      className={classnames(
        "usa-label",
        labelSrOnly && "usa-sr-only",
        validationStatus === "error" && "usa-label--error",
        labelClassName
      )}
      htmlFor={id}
      id={`label-for-${id}`}
      aria-describedby={ariaDescribedBy}
    >
      {required ? <Required label={label} /> : <Optional label={label} />}
    </label>
  );

  const getErrorMessage = (id: string) => (
    <>
      {validationStatus === "error" && (
        <span className="usa-error-message" id={`error_${id}`} role="alert">
          <span className="usa-sr-only">Error: </span>
          {errorMessage}
        </span>
      )}
    </>
  );

  const getHintText = () => {
    const hintTextClasses = hintTextClassName ?? "usa-hint";

    return (
      <>{hintText && <span className={hintTextClasses}>{hintText}</span>}</>
    );
  };

  return (
    <UIDConsumer>
      {(id) => (
        <div
          className={classnames(
            "usa-form-group",
            className,
            validationStatus === "error" && "usa-form-group--error"
          )}
        >
          {getLabel(id)}
          {getErrorMessage(id)}
          {getHintText()}
          <MultiSelectDropdown
            id={id}
            name={name}
            options={availableOptions}
            onChange={DropdownComponent ? onItemAdded : onItemSelected}
            className={dropdownClassName ?? "multi-select-dropdown"}
            disabled={isDisabled}
            placeholder={placeholder}
            inputProps={{ "aria-required": required }}
            ariaInvalid={validationStatus === "error"}
            registrationProps={registrationProps}
            DropdownComponent={DropdownComponent}
            getFilteredDropdownComponentItems={
              getFilteredDropdownComponentItems
            }
          />
          <fieldset
            className={`fieldset--unstyled pill-container${
              selectedItems && selectedItems.length < 1
                ? " pill-container--hidden"
                : ""
            }`}
            data-testid="pill-container"
          >
            <legend className="usa-sr-only">{`Selected ${label}`}</legend>
            {selectedItems &&
              selectedItems.map((value) => {
                const option = options.find((item) => item.value === value);
                return (
                  option && (
                    <Pill
                      key={option.value}
                      option={option}
                      onDelete={onItemUnSelected}
                    />
                  )
                );
              })}
          </fieldset>
        </div>
      )}
    </UIDConsumer>
  );
};

export default MultiSelect;
