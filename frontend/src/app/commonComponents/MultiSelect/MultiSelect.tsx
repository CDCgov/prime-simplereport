import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import _ from "lodash";

import Required from "../Required";
import Optional from "../Optional";

import MultiSelectDropdown, {
  MultiSelectDropdownOption,
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
  onChange: (selectedItems: string[]) => void;
  labelClassName?: string;
  options: MultiSelectDropdownOption[];
  className?: string;
  initalSelectedOptions?: Array<string>;
  disabled?: boolean;
  inputProps?: JSX.IntrinsicElements["input"];
};

type PillProps = {
  option: MultiSelectDropdownOption;
  onDelete: (option: MultiSelectDropdownOption) => void;
};

const Pill = (props: PillProps) => (
  <div className="pill">
    {props.option.label}
    <div
      className="close-button"
      data-testid={`${props.option.label}-pill-delete`}
      onClick={() => props.onDelete(props.option)}
    >
      <FontAwesomeIcon fontSize={24} icon={"times"} />
    </div>
  </div>
);

const getSortedOptions = (options: MultiSelectDropdownOption[]) =>
  _.orderBy(options, ["label"], ["asc"]);

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
  onChange,
  labelClassName,
  options,
  disabled,
}: MultiSelectProps): React.ReactElement => {
  const isDisabled = !!disabled;

  const [availableOptions, setAvailableOptions] = useState<
    MultiSelectDropdownOption[]
  >(getSortedOptions(options));
  const [selectedItems, setSelectedItems] = useState<string[] | undefined>(
    undefined
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

  const onItemUnSelected = (option: MultiSelectDropdownOption) => {
    const selectedItemsSet = new Set(selectedItems);
    selectedItemsSet.delete(option.value);
    setSelectedItems(Array.from(selectedItemsSet));
    const sortedOptions = getSortedOptions([...availableOptions, option]);
    setAvailableOptions(sortedOptions);
  };

  useEffect(() => {
    const sortedOptions = getSortedOptions([...options]);
    setAvailableOptions(sortedOptions);
  }, [options, setAvailableOptions]);

  useEffect(() => {
    if (selectedItems) {
      onChange(selectedItems);
    }
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

  const getHintText = () => (
    <>{hintText && <span className="usa-hint">{hintText}</span>}</>
  );

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
            onChange={onItemSelected}
            className="multi-select-dropdown"
            disabled={isDisabled}
          />
          <div className="pill-container" data-testid="pill-container">
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
          </div>
        </div>
      )}
    </UIDConsumer>
  );
};

export default MultiSelect;
