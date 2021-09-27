import React, { useEffect, useState } from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Required from "./Required";
import Optional from "./Optional";
import ComboBox from "./ComboBox";
import { ComboBoxOption } from "./ComboBox/ComboBox";

import "./MultiSelect.scss";

type Props = {
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
  options: ComboBoxOption[];
  className?: string;
};

type PillProps = {
  option: ComboBoxOption;
  onDelete: (value: string) => void;
};

const Pill = (props: PillProps) => (
  <div className="pill">
    {props.option.label}
    <div
      className="close-button"
      onClick={() => props.onDelete(props.option.value)}
    >
      <FontAwesomeIcon fontSize={24} icon={"times"} />
    </div>
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
  onChange,
  labelClassName,
  options,
}: Props): React.ReactElement => {
  const [selectedItems, setSelectedItems] = useState<Array<string>>([]);

  const onItemSelected = (value: string | undefined) => {
    if (value) {
      setSelectedItems(Array.from(new Set([...selectedItems, value])));
    }
  };

  const onItemUnSelected = (value: string | undefined) => {
    if (value) {
      const selectedItemsSet = new Set(selectedItems);
      selectedItemsSet.delete(value);
      setSelectedItems(Array.from(selectedItemsSet));
    }
  };

  useEffect(() => {
    onChange(selectedItems);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedItems]);

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
          {validationStatus === "error" && (
            <span className="usa-error-message" id={`error_${id}`} role="alert">
              <span className="usa-sr-only">Error: </span>
              {errorMessage}
            </span>
          )}
          {hintText && <span className="usa-hint">{hintText}</span>}
          <ComboBox
            id={id}
            name={name}
            options={options}
            onChange={onItemSelected}
            className="combo-box"
            showSelectedValue={false}
          />

          <div className="pill-container">
            {selectedItems.map((value) => {
              const option = options.find((option) => option.value === value);
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
