import React from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";
import classnames from "classnames";

import Required from "../commonComponents/Required";

const RadioGroup = ({
  onChange,
  buttons,
  name,
  disabled,
  horizontal, // should only be used for radio buttons with two options. 3+ options should be vertically stacked
  selectedRadio, // for checkboxes that only support one checked item, use this. Otherwise, add a `checked: Boolean` property to each button in the buttons prop
  type,
  legend,
  displayLegend = false,
  required = false
}) => {
  // Note: list Affirmations before negations: Yes before No.
  const radioGroupItems = buttons.map((button) => {
    const uuid = uuidv4();
    let classNames = classnames({
      "prime-radio__container": true,
      "prime-radio--horizontal__container": horizontal,
      "prime-radio--success": button.value === selectedRadio && button.success,
      "prime-radio--failure": button.value === selectedRadio && button.failure,
    });
    return (
      <li className={classNames} key={button.value}>
        <input
          className={`usa-${type || "radio"}__input`}
          checked={button.value === selectedRadio || button.checked || false}
          id={uuid}
          key={button.value}
          name={name}
          onChange={onChange}
          type={type || "radio"}
          value={button.value}
          disabled={button.disabled || disabled || false}
        />
        <label
          className={`usa-${type || "radio"}__label prime-radio__label`}
          htmlFor={uuid}
        >
          {button.label}
        </label>
      </li>
    );
  });

  return (
    <fieldset className="usa-fieldset prime-radios">
      <legend className={displayLegend ? "usa-legend" : "usa-sr-only"}>
        {legend}{required ? (
        <span>
          {" "}
          <Required />
        </span>
      ) : null}
      </legend>
      <ul
        className={
          horizontal
            ? "usa-list--unstyled prime-radio--horizontal"
            : "usa-list--unstyled"
        }
      >
        {radioGroupItems}
      </ul>
    </fieldset>
  );
};

RadioGroup.propTypes = {
  onChange: PropTypes.func,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
      disabled: PropTypes.bool,
    })
  ),
  name: PropTypes.string,
  disabled: PropTypes.bool,
  horizontal: PropTypes.bool,
  selectedRadio: PropTypes.string,
  legend: PropTypes.string,
};

export default RadioGroup;
