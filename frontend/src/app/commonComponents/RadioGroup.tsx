import React from "react";
import classnames from "classnames";
import useUniqueId from "./useUniqueIds";
import Required from "./Required";

type OptionsKeys = { [label: string]: string };
type OptionsArray = { label: string; value: string; disabled?: boolean }[];
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
  const choices = Array.isArray(buttons)
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
          {required ? <Required label={legend} /> : legend}
        </legend>
      )}
      {validationStatus === "error" && (
        <div role="alert" className="usa-error-message">
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
        {choices.map((c, i) => (
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
              className="usa-radio__label"
              htmlFor={`${widgetId}_${c.value}_${i}`}
            >
              {c.label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default RadioGroup;
