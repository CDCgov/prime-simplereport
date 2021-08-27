import classnames from "classnames";
import { DatePicker as TrussworksDatePicker } from "@trussworks/react-uswds";

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
  defaultValue?: string;
  minDate?: string; // TODO: pass minDate and maxDate to yup object for validation
  maxDate?: string;
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
  defaultValue,
  minDate,
  maxDate,
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
      <span className="usa-hint">mm/dd/yyyy</span>
      {validationStatus === "error" && (
        <span className="usa-error-message" id={`error_${name}`} role="alert">
          <span className="usa-sr-only">Error: </span>
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
        defaultValue={defaultValue}
        minDate={minDate}
        maxDate={maxDate}
      />
    </div>
  );
};
