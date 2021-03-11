import React from "react";
import classnames from "classnames";

import useUniqueId from "./useUniqueIds";
import Required from "./Required";
import Optional from "./Optional";

type Options<T> = {
  label: React.ReactNode;
  value: T;
  disabled?: boolean;
}[];

interface Props<T> {
  id?: string;
  name: string;
  legend?: React.ReactNode;
  legendSrOnly?: boolean;
  buttons: Options<T>;
  className?: string;
  required?: boolean;
  selectedRadio?: string | null;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
  variant?: "default" | "tile" | "horizontal";
  hintText?: string;
  hideOptional?: boolean;
  onChangeHandler: (value: T) => void;
}

type InputProps = JSX.IntrinsicElements["input"];

const RadioGroup = <T extends string>({
  id,
  name,
  legend,
  legendSrOnly,
  selectedRadio,
  validationStatus,
  errorMessage,
  buttons,
  className,
  required,
  variant,
  hintText,
  hideOptional,
  onChangeHandler,
  ...inputProps
}: Props<T> & InputProps): React.ReactElement => {
  const [autoId] = useUniqueId("radio", 1);
  const widgetId = id || autoId;
  const inputClass = classnames(
    "usa-radio__input",
    variant === "tile" && "usa-radio__input--tile"
  );
  const groupClass = classnames(
    "usa-radio",
    variant === "horizontal" && "prime-radio--horizontal__container"
  );

  return (
    <fieldset className={classnames("usa-fieldset prime-radios", className)}>
      {legend && (
        <legend
          className={classnames("usa-legend", legendSrOnly && "usa-sr-only")}
        >
          {required ? (
            <Required label={legend} />
          ) : (
            <Optional
              className={hideOptional ? "display-none" : ""}
              label={legend}
            />
          )}
        </legend>
      )}
      {hintText && <span className="usa-hint text-ls-1">{hintText}</span>}
      {validationStatus === "error" && (
        <div className="usa-error-message" role="alert">
          <span className="usa-sr-only">Error: </span>
          {errorMessage}
        </div>
      )}
      <div
        className={classnames(
          "usa-form-group",
          variant === "horizontal" && "prime-radio--horizontal",
          validationStatus === "error" && "usa-form-group--error"
        )}
      >
        {buttons.map((c, i) => {
          const labelClasses = classnames(
            "usa-radio__label",
            (c.disabled || inputProps.disabled) && "text-base"
          );
          return (
            <div className={groupClass} key={c.value}>
              <input
                type="radio"
                id={`${widgetId}_${c.value}_${i}`}
                name={name}
                value={c.value}
                data-required={required || "false"}
                disabled={c.disabled || false}
                className={inputClass}
                checked={c.value === selectedRadio}
                onChange={() => onChangeHandler(c.value)}
                {...inputProps}
              />
              <label
                className={labelClasses}
                htmlFor={`${widgetId}_${c.value}_${i}`}
              >
                {c.label}
              </label>
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
