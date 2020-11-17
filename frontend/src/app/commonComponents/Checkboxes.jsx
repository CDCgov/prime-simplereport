import React from "react";
import classnames from "classnames";
import useUniqueIds from "./useUniqueIds";

/*
export type Checkbox = {
  value: string;
  label: string;
  "aria-label"?: string;
  disabled?: boolean;
  checked?: boolean;
};

interface CheckboxesProps {
  checkboxes: Checkbox[];
  checkedValues?: { [key: string]: boolean | undefined };
  legend: React.ReactNode;
  displayLegend?: boolean;
  name: string;
  disabled?: boolean;
  addClass?: string;
  onChange: React.ChangeEventHandler;
}
*/

const Checkboxes /*: React.FC<CheckboxesProps>*/ = (props) => {
  const {
    checkboxes,
    name,
    legend,
    checkedValues = {},
    onChange,
    displayLegend,
  } = props;
  const checkboxIds = useUniqueIds("checkbox", checkboxes.length);

  const checkboxListItems = checkboxes.map(
    ({ value, label, disabled, checked, ...rest }, i) => (
      <div className="usa-checkbox" key={checkboxIds[i]}>
        <input
          className="usa-checkbox__input"
          checked={checked || checkedValues[value] || false}
          id={checkboxIds[i]}
          onChange={onChange}
          type="checkbox"
          value={value}
          name={name}
          disabled={disabled || props.disabled}
          {...rest}
        />
        <label className="usa-checkbox__label" htmlFor={checkboxIds[i]}>
          {label}
        </label>
      </div>
    )
  );

  return (
    <fieldset
      className={classnames("usa-fieldset prime-checkboxes", props.addClass)}
    >
      <legend className={displayLegend ? "usa-legend" : "usa-sr-only"}>
        {legend}
      </legend>
      {checkboxListItems}
    </fieldset>
  );
};

export default Checkboxes;
