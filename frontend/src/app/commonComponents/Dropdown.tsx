import React from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";

import Required from "../commonComponents/Required";

import Optional from "./Optional";

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  options: Option[];
  label?: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedValue: string;
  disabled?: boolean;
  defaultOption?: string;
  className?: string;
  defaultSelect?: boolean;
  required?: boolean;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
}

type SelectProps = JSX.IntrinsicElements["select"];

const Dropdown: React.FC<Props & SelectProps> = ({
  options,
  label,
  name,
  onChange,
  disabled,
  className,
  defaultOption, // value of the default option
  selectedValue,
  defaultSelect,
  required,
  validationStatus,
  errorMessage,
  ...inputProps
}) => {
  return (
    <UIDConsumer>
      {(id) => (
        <div
          className={classnames(
            "usa-form-group prime-dropdown ",
            validationStatus === "error" && "usa-form-group--error",
            className
          )}
        >
          {label && (
            <label className="usa-label" htmlFor={id}>
              {required ? (
                <Required label={label} />
              ) : (
                <Optional label={label} />
              )}
            </label>
          )}
          {validationStatus === "error" && (
            <div className="usa-error-message" role="alert">
              <span className="usa-sr-only">Error: </span>
              {errorMessage}
            </div>
          )}
          <select
            className="usa-select"
            name={name}
            id={id}
            aria-required={required || "false"}
            onChange={onChange}
            value={selectedValue || defaultOption || ""}
            disabled={disabled}
            {...inputProps}
          >
            {defaultSelect && <option value="">- Select -</option>}
            {options.map(({ value, label, disabled }) => (
              <option key={value} value={value} disabled={disabled} data-testid={`dropdown-option`}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
    </UIDConsumer>
  );
};

export default Dropdown;
