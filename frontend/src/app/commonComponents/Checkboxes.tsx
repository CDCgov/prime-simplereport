import React from "react";
import classnames from "classnames";
import { UIDConsumer } from "react-uid";

import Required from "../commonComponents/Required";
import Optional from "../commonComponents/Optional";

// Checkbox objects need a value and label but also can have intrinsic `input`
// DOM properties such as `disabled`, `readonly`, `aria-xxx` etc.
export type CheckboxProps = {
  value: string;
  label: string | JSX.Element;
};
type InputProps = JSX.IntrinsicElements["input"];
type Checkbox = CheckboxProps & InputProps;
interface Props {
  boxes: Checkbox[];
  legend: React.ReactNode;
  legendSrOnly?: boolean;
  name: string;
  disabled?: boolean;
  className?: string;
  errorMessage?: string;
  validationStatus?: "error" | "success";
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

const Checkboxes = (props: Props) => {
  const {
    boxes,
    name,
    legend,
    onChange,
    legendSrOnly,
    validationStatus,
    errorMessage,
    required,
    inputRef,
  } = props;

  return (
    <div
      className={classnames(
        "usa-form-group",
        validationStatus === "error" && "usa-form-group--error"
      )}
    >
      <fieldset
        className={classnames("usa-fieldset prime-checkboxes", props.className)}
      >
        <legend
          className={classnames(
            "usa-legend",
            validationStatus === "error" && "usa-label--error",
            legendSrOnly && "usa-sr-only"
          )}
        >
          {required ? <Required label={legend} /> : <Optional label={legend} />}
        </legend>
        {validationStatus === "error" && (
          <div className="usa-error-message" role="alert">
            <span className="usa-sr-only">Error: </span>
            {errorMessage}
          </div>
        )}
        <UIDConsumer>
          {(_, uid) => (
            <div className="checkboxes">
              {boxes.map(
                ({ value, label, disabled, checked, ...inputProps }, i) => (
                  <div className="usa-checkbox" key={uid(i)}>
                    <input
                      className="usa-checkbox__input"
                      checked={checked}
                      id={uid(i)}
                      onChange={onChange}
                      type="checkbox"
                      value={value}
                      name={name}
                      ref={inputRef}
                      disabled={disabled || props.disabled}
                      {...inputProps}
                    />
                    <label className="usa-checkbox__label" htmlFor={uid(i)}>
                      {label}
                    </label>
                  </div>
                )
              )}
            </div>
          )}
        </UIDConsumer>
      </fieldset>
    </div>
  );
};

export default Checkboxes;
