import classnames from "classnames";
import { DatePicker as TrussworksDatePicker } from "@trussworks/react-uswds";
import React from "react";

import Required from "./Required";
import Optional from "./Optional";

interface Props {
  name: string;
  label: string;
  className?: string;
  onChange?: (val?: string | undefined) => void;
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLDivElement>
  ) => void;
  validationStatus?: "error" | "success";
  errorMessage?: React.ReactNode;
  labelSrOnly?: boolean;
  labelClassName?: string;
  required?: boolean;
  disabled?: boolean;
  defaultValue?: string;
  minDate?: string; // TODO: pass minDate and maxDate to yup object for validation
  maxDate?: string;
  noHint?: boolean;
  ariaHidden?: boolean;
}

export const DatePicker = ({
  name,
  label,
  className,
  onChange,
  onBlur,
  validationStatus,
  errorMessage,
  labelSrOnly,
  labelClassName,
  required,
  disabled,
  defaultValue,
  minDate,
  maxDate,
  noHint,
  ariaHidden,
}: Props) => {
  return (
    <div
      className={classnames("usa-form-group", className, {
        "usa-form-group--error": validationStatus === "error",
      })}
    >
      <label
        aria-hidden={ariaHidden}
        className={classnames("usa-label", labelClassName, {
          "usa-sr-only": labelSrOnly,
          "usa-label--error": validationStatus === "error",
        })}
        htmlFor={name}
      >
        {required ? <Required label={label} /> : <Optional label={label} />}
      </label>
      {noHint ? null : (
        <span className="usa-hint" aria-hidden={ariaHidden}>
          mm/dd/yyyy
        </span>
      )}
      {validationStatus === "error" && (
        <span
          className="usa-error-message"
          id={`error_${name}`}
          role="alert"
          aria-hidden={ariaHidden}
        >
          <span className="usa-sr-only" aria-hidden={ariaHidden}>
            Error:{" "}
          </span>
          {errorMessage}
        </span>
      )}
      <TrussworksDatePicker
        id={name}
        data-testid={name}
        name={name}
        onChange={onChange}
        onBlur={onBlur}
        required={required}
        disabled={disabled}
        defaultValue={defaultValue}
        minDate={minDate}
        maxDate={maxDate}
        aria-hidden={ariaHidden}
        {...(validationStatus === "error"
          ? { "aria-describedby": `error_${name}`, "aria-invalid": true }
          : null)}
      />
    </div>
  );
};
