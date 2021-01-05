import React from "react";
import classnames from "classnames";
import useUniqueIds from "./useUniqueIds";

// Checkbox objects need a value and label but also can have intrinsic `input`
// DOM properties such as `disabled`, `readonly`, `aria-xxx` etc.
export type CheckboxProps = {
  value: string;
  label: string;
};
type InputProps = JSX.IntrinsicElements["input"];
type Checkbox = CheckboxProps & InputProps;
interface Props {
  boxes: Checkbox[];
  checkedValues?: { [key: string]: boolean | undefined };
  legend: React.ReactNode;
  legendSrOnly?: boolean;
  name: string;
  disabled?: boolean;
  className?: string;
  errorMessage?: string;
  validationStatus?: "error" | "success";
  onChange: React.ChangeEventHandler;
}

const Checkboxes = (props: Props) => {
  const {
    boxes,
    name,
    legend,
    checkedValues = {},
    onChange,
    legendSrOnly,
    validationStatus,
    errorMessage,
  } = props;
  const checkboxIds = useUniqueIds("check", boxes.length);

  return (
    <fieldset
      className={classnames("usa-fieldset prime-checkboxes", props.className)}
    >
      <legend
        className={classnames("usa-legend", legendSrOnly && "usa-sr-only")}
      >
        {legend}
      </legend>
      {validationStatus === "error" && (
        <div role="alert" className="usa-error-message">
          {errorMessage}
        </div>
      )}
      <div
        className={classnames(
          "usa-form-group",
          validationStatus === "error" && "usa-form-group--error"
        )}
      >
        {boxes.map(({ value, label, disabled, checked, ...inputProps }, i) => (
          <div className="usa-checkbox" key={checkboxIds[i]}>
            <input
              className="usa-checkbox__input"
              checked={checked || checkedValues?.[value] || false}
              id={checkboxIds[i]}
              onChange={onChange}
              type="checkbox"
              value={value}
              name={name}
              disabled={disabled || props.disabled}
              {...inputProps}
            />
            <label className="usa-checkbox__label" htmlFor={checkboxIds[i]}>
              {label}
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
};

export default Checkboxes;
