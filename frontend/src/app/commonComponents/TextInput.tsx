import React from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";

import Required from "./Required";
import Optional from "./Optional";

export type HTMLInputElementType =
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

interface Props {
  name: string;
  idString?: string;
  type?: HTMLInputElementType;
  label?: React.ReactNode;
  labelSrOnly?: boolean;
  value?: string | null;
  required?: boolean;
  errorMessage?: React.ReactNode;
  groupClassName?: string;
  validationStatus?: "error" | "success";
  autoComplete?: "on" | "off";
  size?: number;
  pattern?: string;
  inputMode?: string;
  ariaDescribedBy?: string;
  hintText?: string | React.ReactNode;
  inputRef?: React.RefObject<HTMLInputElement>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  format?: string;
  formatMessage?: string;
  labelClassName?: string;
  min?: number | string;
  max?: number | string;
}

type InputProps = JSX.IntrinsicElements["input"];

export const TextInput = ({
  name,
  idString,
  type,
  label,
  labelSrOnly,
  value,
  errorMessage,
  className,
  required,
  disabled,
  validationStatus,
  autoComplete,
  size,
  pattern,
  inputMode,
  ariaDescribedBy,
  hintText,
  inputRef,
  onChange,
  format,
  formatMessage,
  labelClassName,
  min,
  max,
  ...inputProps
}: Props & InputProps): React.ReactElement => {
  return (
    <UIDConsumer>
      {(id) => (
        <div
          className={classnames(
            "usa-form-group",
            className,
            validationStatus === "error" && "usa-form-group--error"
          )}
          id={idString}
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
          <input
            className={classnames(
              "usa-input",
              validationStatus === "error" && "usa-input--error"
            )}
            id={id}
            data-testid={idString}
            name={name}
            value={value || ""}
            type={type || "text"}
            aria-required={required || "false"}
            disabled={disabled}
            aria-disabled={disabled}
            onChange={onChange}
            autoComplete={autoComplete}
            size={size}
            pattern={pattern}
            min={min}
            max={max}
            inputMode={inputMode}
            ref={inputRef}
            data-format={format}
            data-format-message={formatMessage}
            {...inputProps}
            {...(validationStatus === "error"
              ? { "aria-describedby": `error_${id}`, "aria-invalid": true }
              : null)}
          />
        </div>
      )}
    </UIDConsumer>
  );
};

export default TextInput;
