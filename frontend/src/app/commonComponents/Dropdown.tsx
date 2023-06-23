import React from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";
import { UseFormRegisterReturn } from "react-hook-form";

import Required from "../commonComponents/Required";

import Optional from "./Optional";

export interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  options: Option[];
  label?: string | React.ReactNode;
  name?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedValue: string;
  disabled?: boolean;
  defaultOption?: string;
  className?: string;
  defaultSelect?: boolean;
  required?: boolean;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
  selectClassName?: string;
  hintText?: string | React.ReactNode;
  registrationProps?: UseFormRegisterReturn<any>;
}

type SelectProps = JSX.IntrinsicElements["select"];

const Dropdown: React.FC<Props & SelectProps> = ({
  options,
  label,
  name,
  onChange,
  disabled,
  className,
  defaultOption = "- Select -", // value of the default option
  selectedValue,
  defaultSelect,
  required,
  validationStatus,
  errorMessage,
  selectClassName,
  hintText,
  registrationProps,
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
            <label
              className={classnames(
                "usa-label",
                validationStatus === "error" && "usa-label--error"
              )}
              htmlFor={id}
            >
              {required ? (
                <Required label={label} />
              ) : (
                <Optional label={label} />
              )}
            </label>
          )}
          {validationStatus === "error" && (
            <div className="usa-error-message" id={`error_${id}`} role="alert">
              <span className="usa-sr-only">Error: </span>
              {errorMessage}
            </div>
          )}
          {hintText && <span className="usa-hint">{hintText}</span>}
          <select
            className={classnames(
              selectClassName,
              "usa-select",
              validationStatus === "error" && "usa-input--error"
            )}
            name={name}
            id={id}
            aria-required={required || "false"}
            onChange={onChange}
            value={selectedValue || defaultOption || ""}
            disabled={disabled}
            {...inputProps}
            {...(validationStatus === "error"
              ? { "aria-describedby": `error_${id}`, "aria-invalid": true }
              : null)}
            {...registrationProps}
          >
            {defaultSelect && <option value="">{defaultOption}</option>}
            {options.map(({ value, label, disabled }) => (
              <option
                key={value}
                value={value}
                disabled={disabled}
                aria-selected={selectedValue === value}
              >
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
