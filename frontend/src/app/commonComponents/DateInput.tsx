import classnames from "classnames";
import { DateInput as TrussworksDateInput, DateInputGroup } from "@trussworks/react-uswds";

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
    label: string;
    className?: string;
    validationStatus?: "error" | "success";
    errorMessage?: React.ReactNode;
    labelSrOnly?: boolean;
    labelClassName?: string;
    required?: boolean;
    defaultValue?: string;
    noHint?: boolean;
    type?: HTMLInputElementType;
}

export const DateInput = ({ 
    name,
    label,
    type,
    className,
    validationStatus,
    errorMessage,
    labelSrOnly,
    labelClassName,
    required,
    defaultValue,
    noHint,
}: Props) => {
    return (
        <div
      className={classnames("usa-form-group", className, {
        "usa-form-group--error": validationStatus === "error",
      })}
    >
      <label
        className={classnames("usa-label", labelClassName, {
          "usa-sr-only": labelSrOnly,
          "usa-label--error": validationStatus === "error",
        })}
        htmlFor={name}
      >
        {label}
      </label>
      {noHint ? null : <span className="usa-hint">For example: 4 28 1986</span>}
      {validationStatus === "error" && (
        <span className="usa-error-message" id={`error_${name}`} role="alert">
          <span className="usa-sr-only">Error: </span>
          {errorMessage}
        </span>
      )}
      <DateInputGroup>
      <TrussworksDateInput
        id={name}
        name={name}
        required={true}
        defaultValue={defaultValue}
        label={"Month"}
        unit={"month"}
        maxLength={2}
        type={type || "text"}
      />
      <TrussworksDateInput
        id={name}
        name={name}
        required={true}
        defaultValue={defaultValue}
        label={"Day"}
        unit={"day"}
        maxLength={2}
        type={type || "text"}
      />
      <TrussworksDateInput
        id={name}
        name={name}
        required={true}
        defaultValue={defaultValue}
        label={"Year"}
        unit={"year"}
        maxLength={4}
        type={type || "text"}
      />
      </DateInputGroup>
    </div>
    );
}