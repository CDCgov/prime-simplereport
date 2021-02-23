import React from "react";
import classnames from "classnames";
import useUniqueId from "./useUniqueIds";
import Required from "./Required";
import Optional from "./Optional";

type OptionsKeys = { [label: string]: string };
type OptionsArray = {
  label: React.ReactNode;
  value: string;
  disabled?: boolean;
}[];
type Options = OptionsKeys | OptionsArray;

interface Props {
  id?: string;
  name: string;
  legend?: React.ReactNode;
  legendSrOnly?: boolean;
  buttons: Options;
  className?: string;
  required?: boolean;
  selectedRadio?: string | null;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
  variant?: "default" | "tile" | "horizontal";
  hintText?: string;
  hideOptional?: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}

type InputProps = JSX.IntrinsicElements["input"];

const RadioGroup = ({
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
  onChange,
  ...inputProps
}: Props & InputProps): React.ReactElement => {
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
  const choices: OptionsArray = Array.isArray(buttons)
    ? buttons
    : Object.keys(buttons).map((k) => ({
        label: k,
        value: buttons[k],
        disabled: false,
      }));

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
        {choices.map((c, i) => {
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
                disabled={c.disabled || false}
                className={inputClass}
                checked={c.value === selectedRadio}
                onChange={onChange}
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
