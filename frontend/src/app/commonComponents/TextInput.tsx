import React from "react";
import classnames from "classnames";
import useUniqueId from "./useUniqueIds";
import Required from "./Required";
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
    | "week";
  label: React.ReactNode;
  labelSrOnly?: boolean;
  value?: string | null;
  errorMessage?: React.ReactNode;
  groupClassName?: string;
  validationStatus?: "error" | "success";
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
      >
        {required ? <Required label={label} /> : label}
      </label>
      {validationStatus === "error" && (
        <span role="alert" className="usa-error-message" id={errorId}>
          {errorMessage}
        </span>
      )}
      <input
        className={classnames(
          "usa-input",
          validationStatus === "error" && "usa-input-error"
        )}
        id={widgetId}
        name={name}
        value={value || ""}
        type={type || "text"}
        onChange={onChange}
        {...inputProps}
        {...(validationStatus === "error"
          ? { "aria-describedby": errorId }
          : null)}
      />
    </div>
  );
};

export default TextInput;
