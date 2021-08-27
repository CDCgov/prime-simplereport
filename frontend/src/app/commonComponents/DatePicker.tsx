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
  minDate?: string;
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
