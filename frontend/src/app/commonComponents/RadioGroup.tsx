import React from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";

import Required from "./Required";
import Optional from "./Optional";

type Options<T> = {
  label: React.ReactNode;
  value: T;
  labelDescription?: string;
  labelTag?: string;
  disabled?: boolean;
  className?: string;
}[];

interface Props<T> {
  name?: string;
  legend?: React.ReactNode;
  legendSrOnly?: boolean;
  buttons: Options<T>;
  className?: string;
  required?: boolean;
  selectedRadio?: T | null;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
  variant?: "default" | "tile" | "horizontal";
  hintText?: string;
  disabled?: boolean;
  onChange: (value: T) => void;
  onClick?: (value: T) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
}

const RadioGroup = <T extends string>({
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
  onChange,
  onBlur,
  onClick,
  disabled,
}: Props<T>): React.ReactElement => {
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
          {required ? <Required label={legend} /> : <Optional label={legend} />}
        </legend>
      )}
      {hintText && <span className="usa-hint">{hintText}</span>}
      {validationStatus === "error" && (
        <div className="usa-error-message" role="alert">
          <span className="usa-sr-only">Error: </span>
          {errorMessage}
        </div>
      )}
      <UIDConsumer>
        {(_, uid) => (
          <div
            className={classnames(
              "usa-form-group",
              variant === "horizontal" && "prime-radio--horizontal",
              validationStatus === "error" && "usa-form-group--error"
            )}
          >
            {buttons.map((c) => {
              const labelClasses = classnames(
                "usa-radio__label",
                (c.disabled || disabled) && "text-base"
              );
              const className = classnames(groupClass, c.className);
              return (
                <div className={className} key={uid(c.value)}>
                  <input
                    type="radio"
                    id={uid(c.value)}
                    name={name}
                    value={c.value}
                    data-required={required || "false"}
                    disabled={disabled || c.disabled || false}
                    className={inputClass}
                    checked={c.value === selectedRadio}
                    onClick={onClick ? () => onClick(c.value) : undefined}
                    onChange={() => onChange(c.value)}
                    onBlur={onBlur}
                  />
                  <label className={labelClasses} htmlFor={uid(c.value)}>
                    {c.label}
                    {c.labelDescription && (
                      <span className="usa-checkbox__label-description text-base-dark">
                        {c.labelDescription}
                      </span>
                    )}
                    {c.labelTag && (
                      <div className="display-block margin-left-4 margin-top-1">
                        <span className="usa-tag bg-primary-darker">
                          {c.labelTag}
                        </span>
                      </div>
                    )}
                  </label>
                </div>
              );
            })}
          </div>
        )}
      </UIDConsumer>
    </fieldset>
  );
};

export default RadioGroup;
