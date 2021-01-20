import React from "react";
import classnames from "classnames";
import useUniqueId from "./useUniqueIds";
import Required from "./Required";
import Optional from "./Optional";

interface Props {
  id?: string;
  name: string;
  type?:
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
    | "week"
    | "bday";
  label: React.ReactNode;
  labelSrOnly?: boolean;
  value?: string | null;
  required?: boolean;
  errorMessage?: React.ReactNode;
  groupClassName?: string;
  validationStatus?: "error" | "success";
  autoComplete?: string;
  size?: number;
  pattern?: string;
  inputMode?: string;
  ariaDescribedBy?: string;
  hintText?: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

type InputProps = JSX.IntrinsicElements["input"];

export const TextInput = ({
  id,
  name,
  type,
  label,
  labelSrOnly,
  value,
  errorMessage,
  className,
  required,
  validationStatus,
  autoComplete,
  size,
  pattern,
  inputMode,
  ariaDescribedBy,
  hintText,
  onChange,
  ...inputProps
}: Props & InputProps): React.ReactElement => {
  const [autoId] = useUniqueId("text", 1);
  const widgetId = id || autoId;
  const errorId = `${widgetId}__error`;

  return (
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
          validationStatus === "error" && "usa-label--error"
        )}
        htmlFor={widgetId}
        aria-describedby={ariaDescribedBy}
      >
        {required ? <Required label={label} /> : <Optional label={label} />}
      </label>
      {validationStatus === "error" && (
        <span role="alert" className="usa-error-message" id={errorId}>
          {errorMessage}
        </span>
      )}
      {hintText && <span className="usa-hint text-ls-1">{hintText}</span>}
      <input
        className={classnames(
          "usa-input",
          validationStatus === "error" && "usa-input-error"
        )}
        id={widgetId}
        name={name}
        value={value || ""}
        type={type || "text"}
        aria-required={required || "false"}
        onChange={onChange}
        autoComplete={autoComplete}
        size={size}
        pattern={pattern}
        inputMode={inputMode}
        {...inputProps}
        {...(validationStatus === "error"
          ? { "aria-describedby": errorId }
          : null)}
      />
    </div>
  );
};

export default TextInput;
